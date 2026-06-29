"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getActiveUser } from "@/lib/session";
import { checkRate } from "@/lib/ratelimit";
import { t } from "@/lib/strings";
import { ok, fail, type ActionResult } from "./_helpers";

export async function toggleSupport(
  ideaId: string,
): Promise<ActionResult<{ supported: boolean; count: number }>> {
  const user = await getActiveUser();
  if (!user) return fail(t.common.loginRequired);

  if (!(await checkRate("support", user.id))) return fail(t.toast.rateLimited);

  const idea = await db.idea.findUnique({
    where: { id: ideaId },
    select: { id: true, status: true },
  });
  if (!idea) return fail(t.common.error);
  if (idea.status === "ARCHIVED") return fail(t.ideas.archivedNote);

  const existing = await db.support.findUnique({
    where: { ideaId_userId: { ideaId, userId: user.id } },
  });

  let supported: boolean;
  if (existing) {
    await db.support.delete({ where: { id: existing.id } });
    supported = false;
  } else {
    // Unique constraint (ideaId,userId) guarantees one support per user.
    await db.support.create({ data: { ideaId, userId: user.id } });
    supported = true;
  }

  const count = await db.support.count({ where: { ideaId } });
  revalidatePath(`/idete/${ideaId}`);
  revalidatePath("/idete");
  return ok({ supported, count });
}
