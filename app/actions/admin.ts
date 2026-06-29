"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { deleteObject } from "@/lib/r2";
import { ok, fail, type ActionResult } from "./_helpers";

export async function adminDeleteIdea(ideaId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return fail("forbidden");

  const docs = await db.document.findMany({
    where: { ideaId },
    select: { storageKey: true },
  });
  for (const d of docs) await deleteObject(d.storageKey).catch(() => {});

  await db.idea.delete({ where: { id: ideaId } });
  revalidatePath("/admin");
  revalidatePath("/idete");
  return ok();
}

export async function adminDeleteComment(commentId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return fail("forbidden");
  await db.comment.delete({ where: { id: commentId } }).catch(() => {});
  revalidatePath("/admin");
  return ok();
}

export async function adminResolveReport(reportId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return fail("forbidden");
  await db.report.update({ where: { id: reportId }, data: { resolved: true } });
  revalidatePath("/admin");
  return ok();
}

/** Delete the idea referenced by a report (the moderation penalty path). */
export async function adminDeleteReportedIdea(reportId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return fail("forbidden");
  const report = await db.report.findUnique({
    where: { id: reportId },
    select: { ideaId: true },
  });
  if (report?.ideaId) {
    const docs = await db.document.findMany({
      where: { ideaId: report.ideaId },
      select: { storageKey: true },
    });
    for (const d of docs) await deleteObject(d.storageKey).catch(() => {});
    await db.idea.delete({ where: { id: report.ideaId } }).catch(() => {});
  }
  await db.report.update({ where: { id: reportId }, data: { resolved: true } });
  revalidatePath("/admin");
  return ok();
}

export async function adminSetBan(userId: string, banned: boolean): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return fail("forbidden");
  if (userId === admin.id) return fail("Nuk mund të pezullosh veten.");
  await db.user.update({ where: { id: userId }, data: { isBanned: banned } });
  revalidatePath("/admin");
  return ok();
}

export async function adminDeleteUser(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return fail("forbidden");
  if (userId === admin.id) return fail("Nuk mund të fshish llogarinë tënde nga këtu.");

  const docs = await db.document.findMany({
    where: { idea: { authorId: userId } },
    select: { storageKey: true },
  });
  for (const d of docs) await deleteObject(d.storageKey).catch(() => {});

  await db.user.delete({ where: { id: userId } }).catch(() => {});
  revalidatePath("/admin");
  return ok();
}

export async function adminApproveExpert(expertId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return fail("forbidden");
  await db.expertProfile.update({
    where: { id: expertId },
    data: { status: "CONFIRMED", confirmToken: null, confirmTokenExpires: null },
  });
  revalidatePath("/admin");
  revalidatePath("/ekspertet");
  return ok();
}

export async function adminRejectExpert(expertId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return fail("forbidden");
  await db.expertProfile.update({
    where: { id: expertId },
    data: { status: "REJECTED", confirmToken: null, confirmTokenExpires: null },
  });
  revalidatePath("/admin");
  revalidatePath("/ekspertet");
  return ok();
}

export async function adminDeleteExpert(expertId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return fail("forbidden");
  const expert = await db.expertProfile.findUnique({
    where: { id: expertId },
    select: { cvStorageKey: true },
  });
  if (expert?.cvStorageKey) await deleteObject(expert.cvStorageKey).catch(() => {});
  await db.expertProfile.delete({ where: { id: expertId } }).catch(() => {});
  revalidatePath("/admin");
  revalidatePath("/ekspertet");
  return ok();
}
