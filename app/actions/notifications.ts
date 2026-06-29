"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getActiveUser } from "@/lib/session";
import { ok, fail, type ActionResult } from "./_helpers";

export async function markNotificationRead(id: string): Promise<ActionResult> {
  const user = await getActiveUser();
  if (!user) return fail("unauthorized");
  // updateMany scoped to the user prevents reading/altering others' rows.
  await db.notification.updateMany({
    where: { id, userId: user.id },
    data: { read: true },
  });
  revalidatePath("/");
  return ok();
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const user = await getActiveUser();
  if (!user) return fail("unauthorized");
  await db.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  revalidatePath("/");
  return ok();
}
