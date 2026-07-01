"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { deleteObject } from "@/lib/r2";
import { sendProfileDecisionEmail } from "@/lib/email";
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
  const expert = await db.expertProfile.update({
    where: { id: expertId },
    data: { status: "PUBLISHED", confirmToken: null, confirmTokenExpires: null },
    select: { name: true, contactEmail: true, owner: { select: { email: true } } },
  });
  const to = expert.owner?.email ?? expert.contactEmail;
  if (to) sendProfileDecisionEmail(to, expert.name, true).catch(() => {});
  revalidatePath("/admin");
  revalidatePath("/ekspertet");
  return ok();
}

export async function adminRejectExpert(expertId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return fail("forbidden");
  const expert = await db.expertProfile.update({
    where: { id: expertId },
    data: { status: "REJECTED", confirmToken: null, confirmTokenExpires: null },
    select: { name: true, contactEmail: true, owner: { select: { email: true } } },
  });
  const to = expert.owner?.email ?? expert.contactEmail;
  if (to) sendProfileDecisionEmail(to, expert.name, false).catch(() => {});
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

/** Apply a proposer-suggested edit to the live profile. */
export async function adminApproveEdit(editId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return fail("forbidden");
  const edit = await db.expertEdit.findUnique({ where: { id: editId } });
  if (!edit) return fail("not found");
  const changes = (edit.changes ?? {}) as Record<string, unknown>;
  const data: { name?: string; areas?: string[]; bio?: string } = {};
  if (typeof changes.name === "string") data.name = changes.name;
  if (Array.isArray(changes.areas)) data.areas = changes.areas.map(String).slice(0, 3);
  if (typeof changes.bio === "string") data.bio = changes.bio;
  await db.expertProfile.update({ where: { id: edit.expertId }, data });
  await db.expertEdit.update({ where: { id: editId }, data: { status: "APPROVED" } });
  revalidatePath("/admin");
  revalidatePath("/ekspertet");
  return ok();
}

export async function adminRejectEdit(editId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return fail("forbidden");
  await db.expertEdit.update({ where: { id: editId }, data: { status: "REJECTED" } });
  revalidatePath("/admin");
  return ok();
}

/** Merge two duplicate profiles into `keepId`; move links/edits, cap areas at 3, delete the other. */
export async function adminMergeExperts(keepId: string, dropId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return fail("forbidden");
  if (keepId === dropId) return fail("Zgjidh dy profile të ndryshme.");
  const [keep, drop] = await Promise.all([
    db.expertProfile.findUnique({ where: { id: keepId }, select: { id: true, areas: true } }),
    db.expertProfile.findUnique({ where: { id: dropId }, select: { id: true, areas: true, cvStorageKey: true } }),
  ]);
  if (!keep || !drop) return fail("not found");

  const dropLinks = await db.ideaExpert.findMany({ where: { expertId: dropId } });
  for (const l of dropLinks) {
    const clash = await db.ideaExpert.findUnique({
      where: { ideaId_expertId: { ideaId: l.ideaId, expertId: keepId } },
    });
    if (clash) await db.ideaExpert.delete({ where: { id: l.id } });
    else await db.ideaExpert.update({ where: { id: l.id }, data: { expertId: keepId } });
  }
  await db.expertEdit.updateMany({ where: { expertId: dropId }, data: { expertId: keepId } });

  const merged = Array.from(new Set([...keep.areas, ...drop.areas])).slice(0, 3);
  await db.expertProfile.update({ where: { id: keepId }, data: { areas: merged } });

  if (drop.cvStorageKey) await deleteObject(drop.cvStorageKey).catch(() => {});
  await db.expertProfile.delete({ where: { id: dropId } }).catch(() => {});

  revalidatePath("/admin");
  revalidatePath("/ekspertet");
  return ok();
}
