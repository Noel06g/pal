"use server";

import { db } from "@/lib/db";
import { getActiveUser } from "@/lib/session";
import { reportSchema } from "@/lib/validation";
import { checkRate } from "@/lib/ratelimit";
import { t } from "@/lib/strings";
import { ok, fail, type ActionResult } from "./_helpers";

export async function submitReport(formData: FormData): Promise<ActionResult> {
  const user = await getActiveUser();
  if (!user) return fail(t.common.loginRequired);
  if (!(await checkRate("general", user.id))) return fail(t.toast.rateLimited);

  const parsed = reportSchema.safeParse({
    ideaId: formData.get("ideaId") || undefined,
    commentId: formData.get("commentId") || undefined,
    reason: formData.get("reason"),
  });
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? t.common.error);
  const { ideaId, commentId, reason } = parsed.data;

  // The reported content must actually exist; snapshot its title so the
  // report survives a later deletion. Report.ideaId is a real FK, so only
  // store ids we verified — otherwise report.create throws P2003.
  let ideaTitle = "—";
  let verifiedIdeaId: string | null = null;
  let verifiedCommentId: string | null = null;
  if (ideaId) {
    const idea = await db.idea.findUnique({
      where: { id: ideaId },
      select: { title: true },
    });
    if (!idea) return fail(t.common.error);
    ideaTitle = idea.title;
    verifiedIdeaId = ideaId;
  } else if (commentId) {
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      select: { idea: { select: { title: true } } },
    });
    if (!comment) return fail(t.common.error);
    ideaTitle = `Koment në «${comment.idea.title}»`;
    verifiedCommentId = commentId;
  }

  const reporter = await db.user.findUnique({
    where: { id: user.id },
    select: { email: true },
  });

  await db.report.create({
    data: {
      ideaId: verifiedIdeaId,
      commentId: verifiedCommentId,
      ideaTitle,
      reason,
      reporterId: user.id,
      reporterEmail: reporter?.email ?? "—",
    },
  });

  return ok();
}
