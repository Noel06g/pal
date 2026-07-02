"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getActiveUser } from "@/lib/session";
import { commentSchema } from "@/lib/validation";
import { checkRate } from "@/lib/ratelimit";
import { createNotification } from "@/lib/notify";
import { sendNewCommentEmail } from "@/lib/email";
import { t } from "@/lib/strings";
import { ok, fail, type ActionResult } from "./_helpers";

export async function addComment(formData: FormData): Promise<ActionResult> {
  const user = await getActiveUser();
  if (!user) return fail(t.common.loginRequired);

  if (!(await checkRate("comment", user.id))) return fail(t.toast.rateLimited);

  const parsed = commentSchema.safeParse({
    ideaId: formData.get("ideaId"),
    body: formData.get("body"),
    stance: formData.get("stance"),
    isSolution: formData.get("isSolution") === "on" || formData.get("isSolution") === "true",
  });
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? t.common.error);
  }
  const input = parsed.data;

  const idea = await db.idea.findUnique({
    where: { id: input.ideaId },
    select: { id: true, title: true, status: true, authorId: true },
  });
  if (!idea) return fail(t.common.error);
  if (idea.status === "ARCHIVED") return fail(t.ideas.archivedNote);

  await db.comment.create({
    data: {
      ideaId: input.ideaId,
      authorId: user.id,
      body: input.body,
      stance: input.stance,
      isSolution: input.isSolution,
    },
  });

  // Notify the idea author (in-app + email), unless commenting on own idea.
  if (idea.authorId !== user.id) {
    const author = await db.user.findUnique({
      where: { id: idea.authorId },
      select: { email: true },
    });
    await createNotification({
      userId: idea.authorId,
      type: "COMMENT",
      message: `Koment i ri në idenë tënde «${idea.title}»`,
      link: `/idete/${idea.id}`,
    });
    if (author?.email) {
      sendNewCommentEmail(author.email, idea.title, idea.id).catch(() => {});
    }
  }

  revalidatePath(`/idete/${input.ideaId}`);
  return ok();
}

export async function deleteComment(commentId: string): Promise<ActionResult> {
  const user = await getActiveUser();
  if (!user) return fail(t.common.loginRequired);

  const comment = await db.comment.findUnique({
    where: { id: commentId },
    select: { id: true, ideaId: true, authorId: true, idea: { select: { authorId: true } } },
  });
  if (!comment) return fail(t.common.error);

  // The comment's own author, the idea's author, or an admin may delete it.
  if (comment.authorId !== user.id && comment.idea.authorId !== user.id && !user.isAdmin) {
    return fail(t.common.error);
  }

  await db.comment.delete({ where: { id: commentId } });
  revalidatePath(`/idete/${comment.ideaId}`);
  return ok();
}
