"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getActiveUser } from "@/lib/session";
import { signOut } from "@/auth";
import { deleteObject } from "@/lib/r2";
import { t } from "@/lib/strings";
import { ok, fail, type ActionResult } from "./_helpers";

/**
 * GDPR account deletion. Cascades remove ideas, comments, supports, sessions,
 * accounts and notifications (see schema onDelete: Cascade). Idea documents in
 * R2 are removed first so no orphan private files remain.
 */
export async function deleteAccount(): Promise<ActionResult> {
  const user = await getActiveUser();
  if (!user) return fail(t.common.loginRequired);

  // Delete this user's idea documents from R2.
  const docs = await db.document.findMany({
    where: { idea: { authorId: user.id } },
    select: { storageKey: true },
  });
  for (const d of docs) {
    await deleteObject(d.storageKey).catch(() => {});
  }

  // Also remove their expert profile (contact + CV are personal data; the
  // schema's onDelete: SetNull would otherwise leave them behind).
  const profile = await db.expertProfile.findUnique({
    where: { ownerUserId: user.id },
    select: { id: true, cvStorageKey: true },
  });
  if (profile) {
    if (profile.cvStorageKey)
      await deleteObject(profile.cvStorageKey).catch(() => {});
    await db.expertProfile
      .delete({ where: { id: profile.id } })
      .catch(() => {});
  }

  await db.user.delete({ where: { id: user.id } });

  await signOut({ redirect: false });
  revalidatePath("/");
  revalidatePath("/ekspertet");
  return ok();
}
