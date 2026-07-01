"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { getActiveUser } from "@/lib/session";
import {
  selfRegisterSchema,
  nominateNewSchema,
  proposeExistingSchema,
  expertEditSchema,
} from "@/lib/validation";
import { checkRate } from "@/lib/ratelimit";
import { buildKey, putObject, validatePdf } from "@/lib/r2";
import { createNotification } from "@/lib/notify";
import { normalizeEmail } from "@/lib/normalize";
import {
  sendIdeaInviteEmail,
  sendNomineeConfirmEmail,
  sendExpertProposedToAuthorEmail,
  sendExpertResponseToAuthorEmail,
  sendAuthorContactToExpertEmail,
  sendTakeoverConfirmEmail,
} from "@/lib/email";
import { t } from "@/lib/strings";
import { ok, fail, type ActionResult } from "./_helpers";

const newToken = () => randomBytes(32).toString("hex");
const in30Days = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

type PreparedCv =
  | { ok: true; name: string; type: string; bytes: Buffer }
  | { ok: false; error: string }
  | null;

async function prepareCv(formData: FormData): Promise<PreparedCv> {
  const file = formData.get("cv");
  if (!(file instanceof File) || file.size === 0) return null;
  const bytes = Buffer.from(await file.arrayBuffer());
  const check = validatePdf({ type: file.type, size: file.size, bytes });
  if (!check.ok) {
    return { ok: false, error: check.reason === "size" ? t.toast.fileTooBig : t.toast.fileNotPdf };
  }
  return { ok: true, name: file.name, type: file.type, bytes };
}

async function storeCv(expertId: string, cv: { name: string; type: string; bytes: Buffer }) {
  const key = buildKey("expert-cv", expertId, cv.name);
  await putObject(key, cv.bytes, cv.type);
  await db.expertProfile.update({
    where: { id: expertId },
    data: { cvFileName: cv.name, cvStorageKey: key, cvContentType: cv.type, cvSize: cv.bytes.length },
  });
}

function areasFrom(formData: FormData): string[] {
  return formData.getAll("areas").map((a) => String(a)).filter(Boolean);
}

/** Vetëpropozohu — an account owner registers their own profile (CV required). */
export async function selfRegisterExpert(formData: FormData): Promise<ActionResult> {
  const user = await getActiveUser();
  if (!user) return fail(t.common.loginRequired);
  if (!(await checkRate("general", user.id))) return fail(t.toast.rateLimited);

  const existing = await db.expertProfile.findUnique({ where: { ownerUserId: user.id } });
  if (existing) return fail("Ke tashmë një profil eksperti.");

  const parsed = selfRegisterSchema.safeParse({
    name: formData.get("name"),
    areas: areasFrom(formData),
    bio: formData.get("bio"),
    reason: formData.get("reason"),
    contact: formData.get("contact"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? t.common.error);

  const cv = await prepareCv(formData);
  if (cv && !cv.ok) return fail(cv.error);
  if (!cv) return fail("CV (PDF) është e detyrueshme.");

  const expert = await db.expertProfile.create({
    data: {
      name: parsed.data.name,
      areas: parsed.data.areas,
      bio: parsed.data.bio,
      reason: parsed.data.reason,
      contact: parsed.data.contact,
      contactEmail: normalizeEmail(parsed.data.contact) ?? normalizeEmail(user.email ?? "") ?? null,
      status: "PENDING_REVIEW",
      source: "SELF",
      ownerUserId: user.id,
    },
  });
  await storeCv(expert.id, cv);

  revalidatePath("/admin");
  revalidatePath("/llogaria");
  return ok();
}

/** Typeahead used when proposing an expert: find existing people (dedup). */
export async function searchExperts(
  query: string,
): Promise<ActionResult<{ results: { id: string; name: string; areas: string[]; bio: string }[] }>> {
  const user = await getActiveUser();
  if (!user) return fail(t.common.loginRequired);
  const q = query.trim();
  if (q.length < 2) return ok({ results: [] });

  const rows = await db.expertProfile.findMany({
    where: { status: { not: "REJECTED" }, name: { contains: q, mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, name: true, areas: true, bio: true },
  });
  return ok({ results: rows.map((r) => ({ ...r, bio: r.bio.slice(0, 140) })) });
}

/** Propose an EXISTING expert for an idea → a new link needing the expert's approval. */
export async function proposeExistingExpert(formData: FormData): Promise<ActionResult> {
  const user = await getActiveUser();
  if (!user) return fail(t.common.loginRequired);
  if (!(await checkRate("general", user.id))) return fail(t.toast.rateLimited);

  const parsed = proposeExistingSchema.safeParse({
    ideaId: formData.get("ideaId"),
    expertId: formData.get("expertId"),
    suggestBio: formData.get("suggestBio"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? t.common.error);
  const { ideaId, expertId, suggestBio } = parsed.data;

  const [idea, expert] = await Promise.all([
    db.idea.findUnique({ where: { id: ideaId }, select: { id: true, title: true, authorId: true } }),
    db.expertProfile.findUnique({
      where: { id: expertId },
      select: { id: true, name: true, contactEmail: true, ownerUserId: true },
    }),
  ]);
  if (!idea || !expert) return fail(t.common.error);

  const dup = await db.ideaExpert.findUnique({
    where: { ideaId_expertId: { ideaId, expertId } },
  });
  if (dup) return fail("Ky ekspert është propozuar tashmë për këtë ide.");

  const token = newToken();
  await db.ideaExpert.create({
    data: {
      ideaId,
      expertId,
      proposedById: user.id,
      status: "AWAITING_EXPERT",
      approveToken: token,
      approveTokenExpires: in30Days(),
    },
  });

  // Optional bio suggestion → admin edit queue (never touches the live profile).
  if (suggestBio && suggestBio.length >= 10) {
    await db.expertEdit.create({
      data: { expertId, proposedById: user.id, changes: { bio: suggestBio }, status: "PENDING" },
    });
  }

  // Ping the expert (in-app if they own an account; email if we have one).
  if (expert.ownerUserId) {
    await createNotification({
      userId: expert.ownerUserId,
      type: "EXPERT_INVITE",
      message: `Je propozuar si ekspert për idenë «${idea.title}»`,
      link: `/llogaria`,
    });
  }
  if (expert.contactEmail) {
    sendIdeaInviteEmail(expert.contactEmail, expert.name, idea.title, token).catch(() => {});
  }

  // Notify the author their proposal is pending the expert's reply.
  await createNotification({
    userId: idea.authorId,
    type: "EXPERT_PROPOSED",
    message: `Propozimi i ekspertit për «${idea.title}» është në pritje të përgjigjes.`,
    link: `/idete/${idea.id}`,
  });
  const author = await db.user.findUnique({ where: { id: idea.authorId }, select: { email: true } });
  if (author?.email) sendExpertProposedToAuthorEmail(author.email, idea.title, idea.id).catch(() => {});

  revalidatePath(`/idete/${idea.id}`);
  return ok();
}

/** Propose a BRAND-NEW person from an idea → AWAITING_NOMINEE profile + pending link. */
export async function proposeNewExpert(formData: FormData): Promise<ActionResult> {
  const user = await getActiveUser();
  if (!user) return fail(t.common.loginRequired);
  if (!(await checkRate("general", user.id))) return fail(t.toast.rateLimited);

  const parsed = nominateNewSchema.safeParse({
    ideaId: formData.get("ideaId"),
    areas: areasFrom(formData),
    name: formData.get("name"),
    bio: formData.get("bio"),
    reason: formData.get("reason"),
    contact: formData.get("contact"),
    proposerName: formData.get("proposerName"),
    proposerContact: formData.get("proposerContact"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? t.common.error);
  const input = parsed.data;

  const idea = await db.idea.findUnique({
    where: { id: input.ideaId },
    select: { id: true, title: true, authorId: true },
  });
  if (!idea) return fail(t.common.error);

  const cv = await prepareCv(formData);
  if (cv && !cv.ok) return fail(cv.error);

  const confirmToken = newToken();
  const expert = await db.expertProfile.create({
    data: {
      name: input.name,
      areas: input.areas,
      bio: input.bio,
      reason: input.reason,
      contact: input.contact,
      contactEmail: normalizeEmail(input.contact),
      proposerName: input.proposerName,
      proposerContact: input.proposerContact,
      status: "AWAITING_NOMINEE",
      source: "NOMINATED",
      confirmToken,
      confirmTokenExpires: in30Days(),
    },
  });
  if (cv && cv.ok) await storeCv(expert.id, cv);

  await db.ideaExpert.create({
    data: { ideaId: idea.id, expertId: expert.id, proposedById: user.id, status: "AWAITING_EXPERT" },
  });

  const nomineeEmail = normalizeEmail(input.contact);
  if (nomineeEmail) sendNomineeConfirmEmail(nomineeEmail, input.name, confirmToken).catch(() => {});

  await createNotification({
    userId: idea.authorId,
    type: "EXPERT_PROPOSED",
    message: `U propozua një ekspert për idenë «${idea.title}»; në pritje të përgjigjes.`,
    link: `/idete/${idea.id}`,
  });
  const author = await db.user.findUnique({ where: { id: idea.authorId }, select: { email: true } });
  if (author?.email) sendExpertProposedToAuthorEmail(author.email, idea.title, idea.id).catch(() => {});

  revalidatePath(`/idete/${idea.id}`);
  return ok();
}

/** Mutual, consent-based contact exchange scoped to ONE approved link. */
async function exchangeContacts(linkId: string): Promise<void> {
  const link = await db.ideaExpert.findUnique({
    where: { id: linkId },
    include: {
      idea: { select: { id: true, title: true, author: { select: { id: true, email: true, name: true } } } },
      expert: { select: { id: true, name: true, contact: true, contactEmail: true, ownerUserId: true } },
    },
  });
  if (!link) return;

  await db.ideaExpert.update({
    where: { id: linkId },
    data: { status: "APPROVED", contactsSharedAt: new Date(), approveToken: null, approveTokenExpires: null },
  });

  const authorContact = link.idea.author.email ?? "";
  // → author receives the expert's contact
  await createNotification({
    userId: link.idea.author.id,
    type: "CONTACT_SHARED",
    message: `Eksperti pranoi për «${link.idea.title}». Kontakti: ${link.expert.contact}`,
    link: `/idete/${link.idea.id}`,
  });
  if (link.idea.author.email) {
    sendExpertResponseToAuthorEmail(link.idea.author.email, link.idea.title, link.idea.id, true, link.expert.contact).catch(() => {});
  }
  // → expert receives the author's contact
  if (link.expert.ownerUserId) {
    await createNotification({
      userId: link.expert.ownerUserId,
      type: "CONTACT_SHARED",
      message: `Ke pranuar për «${link.idea.title}». Kontakti i autorit: ${authorContact}`,
      link: `/llogaria`,
    });
  }
  if (link.expert.contactEmail) {
    sendAuthorContactToExpertEmail(link.expert.contactEmail, link.idea.title, link.idea.id, authorContact).catch(() => {});
  }
}

/** Nominee accepts/rejects a brand-new nomination (from the token page). */
export async function confirmNominee(
  token: string,
  decision: "prano" | "refuzo",
  formData?: FormData,
): Promise<ActionResult<{ outcome: "accepted" | "rejected" | "invalid" | "already" }>> {
  const expert = await db.expertProfile.findUnique({ where: { confirmToken: token } });
  if (!expert) return ok({ outcome: "invalid" });
  if (expert.status !== "AWAITING_NOMINEE") return ok({ outcome: "already" });
  if (expert.confirmTokenExpires && expert.confirmTokenExpires < new Date()) return ok({ outcome: "invalid" });

  if (decision === "refuzo") {
    await db.expertProfile.update({
      where: { id: expert.id },
      data: { status: "REJECTED", confirmToken: null, confirmTokenExpires: null },
    });
    await db.ideaExpert.updateMany({ where: { expertId: expert.id }, data: { status: "REJECTED" } });
    return ok({ outcome: "rejected" });
  }

  // Accept: CV required (existing or uploaded now).
  if (formData) {
    const cv = await prepareCv(formData);
    if (cv && !cv.ok) return fail(cv.error);
    if (cv && cv.ok) await storeCv(expert.id, cv);
  }
  const fresh = await db.expertProfile.findUnique({ where: { id: expert.id }, select: { cvStorageKey: true } });
  if (!fresh?.cvStorageKey) return fail("CV (PDF) është e detyrueshme për të vazhduar.");

  // Optionally claim/link an account when the signed-in user's email matches.
  const user = await getActiveUser();
  const ownerUserId =
    user && normalizeEmail(user.email ?? "") && normalizeEmail(user.email ?? "") === expert.contactEmail
      ? user.id
      : undefined;

  await db.expertProfile.update({
    where: { id: expert.id },
    data: {
      status: "PENDING_REVIEW",
      confirmToken: null,
      confirmTokenExpires: null,
      ...(ownerUserId ? { ownerUserId } : {}),
    },
  });

  // First idea-link is approved on acceptance → contact exchange fires.
  const firstLink = await db.ideaExpert.findFirst({
    where: { expertId: expert.id, status: "AWAITING_EXPERT" },
    orderBy: { createdAt: "asc" },
  });
  if (firstLink) await exchangeContacts(firstLink.id);

  revalidatePath("/admin");
  return ok({ outcome: "accepted" });
}

/** Shared approve/refuse of a single idea-link. */
async function decideLink(linkId: string, decision: "prano" | "refuzo"): Promise<void> {
  if (decision === "prano") {
    await exchangeContacts(linkId);
  } else {
    const link = await db.ideaExpert.update({
      where: { id: linkId },
      data: { status: "REJECTED", approveToken: null, approveTokenExpires: null },
      include: { idea: { select: { id: true, title: true, author: { select: { id: true, email: true } } } } },
    });
    await createNotification({
      userId: link.idea.author.id,
      type: "EXPERT_RESPONSE",
      message: `Eksperti nuk pranoi propozimin për «${link.idea.title}».`,
      link: `/idete/${link.idea.id}`,
    });
    if (link.idea.author.email) {
      sendExpertResponseToAuthorEmail(link.idea.author.email, link.idea.title, link.idea.id, false).catch(() => {});
    }
  }
}

/** In-app: an account-owning expert approves/refuses a link from their account. */
export async function respondToLink(linkId: string, decision: "prano" | "refuzo"): Promise<ActionResult> {
  const user = await getActiveUser();
  if (!user) return fail(t.common.loginRequired);
  const link = await db.ideaExpert.findUnique({
    where: { id: linkId },
    include: { expert: { select: { ownerUserId: true } } },
  });
  if (!link || link.expert.ownerUserId !== user.id) return fail(t.common.error);
  if (link.status !== "AWAITING_EXPERT") return fail("Ky propozim është trajtuar tashmë.");
  await decideLink(linkId, decision);
  revalidatePath("/llogaria");
  return ok();
}

/** By email token: a no-account expert approves/refuses a specific link. */
export async function respondToLinkByToken(
  token: string,
  decision: "prano" | "refuzo",
): Promise<ActionResult<{ outcome: "accepted" | "rejected" | "invalid" | "already" }>> {
  const link = await db.ideaExpert.findUnique({ where: { approveToken: token } });
  if (!link) return ok({ outcome: "invalid" });
  if (link.status !== "AWAITING_EXPERT") return ok({ outcome: "already" });
  if (link.approveTokenExpires && link.approveTokenExpires < new Date()) return ok({ outcome: "invalid" });
  await decideLink(link.id, decision);
  return ok({ outcome: decision === "prano" ? "accepted" : "rejected" });
}

/** Claim an unclaimed profile whose contact email matches the signed-in user. */
export async function claimProfile(expertId: string): Promise<ActionResult> {
  const user = await getActiveUser();
  if (!user) return fail(t.common.loginRequired);
  const expert = await db.expertProfile.findUnique({
    where: { id: expertId },
    select: { id: true, ownerUserId: true, contactEmail: true },
  });
  if (!expert) return fail(t.common.error);
  if (expert.ownerUserId) return fail("Ky profil është i lidhur tashmë me një llogari.");
  const mine = normalizeEmail(user.email ?? "");
  if (!mine || mine !== expert.contactEmail) return fail("Email-i nuk përputhet me këtë profil.");
  await db.expertProfile.update({ where: { id: expertId }, data: { ownerUserId: user.id } });
  revalidatePath("/llogaria");
  return ok();
}

/** Owner edits their own profile → goes live immediately. */
export async function ownerEditProfile(formData: FormData): Promise<ActionResult> {
  const user = await getActiveUser();
  if (!user) return fail(t.common.loginRequired);
  const mine = await db.expertProfile.findUnique({ where: { ownerUserId: user.id }, select: { id: true } });
  if (!mine) return fail(t.common.error);

  const parsed = expertEditSchema.safeParse({
    name: formData.get("name"),
    areas: areasFrom(formData),
    bio: formData.get("bio"),
    contact: formData.get("contact"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? t.common.error);

  const cv = await prepareCv(formData);
  if (cv && !cv.ok) return fail(cv.error);

  await db.expertProfile.update({
    where: { id: mine.id },
    data: {
      name: parsed.data.name,
      areas: parsed.data.areas,
      bio: parsed.data.bio,
      contact: parsed.data.contact,
      contactEmail: normalizeEmail(parsed.data.contact),
    },
  });
  if (cv && cv.ok) await storeCv(mine.id, cv);

  revalidatePath("/llogaria");
  revalidatePath("/ekspertet");
  return ok();
}

/** Account-owning expert signals "po e marr përsipër" on an approved link. */
export async function markTakeover(linkId: string): Promise<ActionResult> {
  const user = await getActiveUser();
  if (!user) return fail(t.common.loginRequired);
  const link = await db.ideaExpert.findUnique({
    where: { id: linkId },
    include: {
      expert: { select: { ownerUserId: true } },
      idea: { select: { id: true, title: true, author: { select: { id: true, email: true } } } },
    },
  });
  if (!link || link.expert.ownerUserId !== user.id) return fail(t.common.error);
  if (link.status !== "APPROVED") return fail(t.common.error);

  await db.ideaExpert.update({ where: { id: linkId }, data: { takenOn: true } });
  await createNotification({
    userId: link.idea.author.id,
    type: "TAKEOVER",
    message: `Një ekspert po e merr përsipër idenë «${link.idea.title}». Konfirmo për ta arkivuar.`,
    link: `/idete/${link.idea.id}`,
  });
  if (link.idea.author.email) sendTakeoverConfirmEmail(link.idea.author.email, link.idea.title, link.idea.id).catch(() => {});

  revalidatePath(`/idete/${link.idea.id}`);
  revalidatePath("/llogaria");
  return ok();
}

/** Idea author confirms the takeover → idea auto-archives. */
export async function authorConfirmTakeover(linkId: string): Promise<ActionResult> {
  const user = await getActiveUser();
  if (!user) return fail(t.common.loginRequired);
  const link = await db.ideaExpert.findUnique({
    where: { id: linkId },
    include: {
      idea: { select: { id: true, title: true, authorId: true } },
      expert: { select: { ownerUserId: true } },
    },
  });
  if (!link || link.idea.authorId !== user.id) return fail(t.common.error);
  if (!link.takenOn) return fail(t.common.error);

  await db.ideaExpert.update({ where: { id: linkId }, data: { authorConfirmed: true } });
  await db.idea.update({ where: { id: link.idea.id }, data: { status: "ARCHIVED" } });
  if (link.expert.ownerUserId) {
    await createNotification({
      userId: link.expert.ownerUserId,
      type: "TAKEOVER_CONFIRM",
      message: `Autori konfirmoi marrjen përsipër të «${link.idea.title}». Ideja u arkivua.`,
      link: `/idete/${link.idea.id}`,
    });
  }
  revalidatePath(`/idete/${link.idea.id}`);
  return ok();
}
