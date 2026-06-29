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
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? t.common.error);
  const { ideaId, commentId, reason } = parsed.data;

  // Snapshot the post title + reporter email so the report survives deletion.
  let ideaTitle = "—";
  if (ideaId) {
    const idea = await db.idea.findUnique({
      where: { id: ideaId },
      select: { title: true },
    });
    if (idea) ideaTitle = idea.title;
  } else if (commentId) {
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      select: { idea: { select: { title: true } } },
    });
    if (comment) ideaTitle = `Koment në «${comment.idea.title}»`;
  }

  const reporter = await db.user.findUnique({
    where: { id: user.id },
    select: { email: true },
  });

  await db.report.create({
    data: {
      ideaId: ideaId ?? null,
      commentId: commentId ?? null,
      ideaTitle,
      reason,
      reporterId: user.id,
      reporterEmail: reporter?.email ?? "—",
    },
  });

  return ok();
}
