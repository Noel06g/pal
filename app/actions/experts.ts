"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getActiveUser } from "@/lib/session";
import { selfNominateSchema, nominateSchema, nominateGeneralSchema } from "@/lib/validation";
import { checkRate } from "@/lib/ratelimit";
import { buildKey, putObject, validatePdf } from "@/lib/r2";
import { createNotification } from "@/lib/notify";
import { sendExpertProposedEmail } from "@/lib/email";
import { t } from "@/lib/strings";
import { ok, fail, type ActionResult } from "./_helpers";

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

/** Self-nomination → PENDING for admin review (not public until approved). */
export async function selfNominateExpert(formData: FormData): Promise<ActionResult> {
  const user = await getActiveUser();
  if (!user) return fail(t.common.loginRequired);
  if (!(await checkRate("general", user.id))) return fail(t.toast.rateLimited);

  const parsed = selfNominateSchema.safeParse({
    name: formData.get("name"),
    fieldKey: formData.get("fieldKey"),
    bio: formData.get("bio"),
    reason: formData.get("reason"),
    contact: formData.get("contact"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? t.common.error);

  const cv = await prepareCv(formData);
  if (cv && !cv.ok) return fail(cv.error);

  const expert = await db.expertProfile.create({
    data: {
      name: parsed.data.name,
      fieldKey: parsed.data.fieldKey,
      bio: parsed.data.bio,
      reason: parsed.data.reason,
      contact: parsed.data.contact,
      status: "PENDING",
      source: "SELF",
    },
  });

  if (cv && cv.ok) {
    const key = buildKey("expert-cv", expert.id, cv.name);
    await putObject(key, cv.bytes, cv.type);
    await db.expertProfile.update({
      where: { id: expert.id },
      data: {
        cvFileName: cv.name,
        cvStorageKey: key,
        cvContentType: cv.type,
        cvSize: cv.bytes.length,
      },
    });
  }

  revalidatePath("/admin");
  return ok();
}

/** Nomination from an idea → PENDING; emails the proposed person + idea author. */
export async function proposeExpert(formData: FormData): Promise<ActionResult> {
  const user = await getActiveUser();
  if (!user) return fail(t.common.loginRequired);
  if (!(await checkRate("general", user.id))) return fail(t.toast.rateLimited);

  const parsed = nominateSchema.safeParse({
    fieldKey: formData.get("fieldKey"),
    name: formData.get("name"),
    bio: formData.get("bio"),
    reason: formData.get("reason"),
    contact: formData.get("contact"),
    proposerName: formData.get("proposerName"),
    proposerContact: formData.get("proposerContact"),
    fromIdeaId: formData.get("fromIdeaId"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? t.common.error);
  const input = parsed.data;

  const idea = await db.idea.findUnique({
    where: { id: input.fromIdeaId },
    select: { id: true, title: true, authorId: true, status: true },
  });
  if (!idea) return fail(t.common.error);

  const cv = await prepareCv(formData);
  if (cv && !cv.ok) return fail(cv.error);

  // Proposed experts stay PENDING for admin review (no nominee email).
  const expert = await db.expertProfile.create({
    data: {
      name: input.name,
      fieldKey: input.fieldKey,
      bio: input.bio,
      reason: input.reason,
      contact: input.contact,
      proposerName: input.proposerName,
      proposerContact: input.proposerContact,
      status: "PENDING",
      source: "NOMINATED",
      fromIdeaId: idea.id,
    },
  });

  if (cv && cv.ok) {
    const key = buildKey("expert-cv", expert.id, cv.name);
    await putObject(key, cv.bytes, cv.type);
    await db.expertProfile.update({
      where: { id: expert.id },
      data: {
        cvFileName: cv.name,
        cvStorageKey: key,
        cvContentType: cv.type,
        cvSize: cv.bytes.length,
      },
    });
  }

  // Notify the idea author (in-app + email).
  await createNotification({
    userId: idea.authorId,
    type: "EXPERT_PROPOSED",
    message: `U propozua një ekspert për idenë tënde «${idea.title}»`,
    link: `/idete/${idea.id}`,
  });
  const author = await db.user.findUnique({
    where: { id: idea.authorId },
    select: { email: true },
  });
  if (author?.email) {
    sendExpertProposedEmail(author.email, idea.title, idea.id).catch(() => {});
  }

  revalidatePath(`/idete/${idea.id}`);
  return ok();
}

/** Nomination from the experts page (not tied to an idea) → PENDING for admin review. */
export async function proposeExpertGeneral(formData: FormData): Promise<ActionResult> {
  const user = await getActiveUser();
  if (!user) return fail(t.common.loginRequired);
  if (!(await checkRate("general", user.id))) return fail(t.toast.rateLimited);

  const parsed = nominateGeneralSchema.safeParse({
    fieldKey: formData.get("fieldKey"),
    name: formData.get("name"),
    bio: formData.get("bio"),
    reason: formData.get("reason"),
    contact: formData.get("contact"),
    proposerName: formData.get("proposerName"),
    proposerContact: formData.get("proposerContact"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? t.common.error);
  const input = parsed.data;

  const cv = await prepareCv(formData);
  if (cv && !cv.ok) return fail(cv.error);

  const expert = await db.expertProfile.create({
    data: {
      name: input.name,
      fieldKey: input.fieldKey,
      bio: input.bio,
      reason: input.reason,
      contact: input.contact,
      proposerName: input.proposerName,
      proposerContact: input.proposerContact,
      status: "PENDING",
      source: "NOMINATED",
    },
  });

  if (cv && cv.ok) {
    const key = buildKey("expert-cv", expert.id, cv.name);
    await putObject(key, cv.bytes, cv.type);
    await db.expertProfile.update({
      where: { id: expert.id },
      data: {
        cvFileName: cv.name,
        cvStorageKey: key,
        cvContentType: cv.type,
        cvSize: cv.bytes.length,
      },
    });
  }

  return ok();
}

/** Accept / reject a nomination via the emailed token. */
export async function confirmExpert(
  token: string,
  decision: "prano" | "refuzo",
): Promise<ActionResult<{ outcome: "accepted" | "rejected" | "invalid" | "already" }>> {
  const expert = await db.expertProfile.findUnique({ where: { confirmToken: token } });
  if (!expert) return ok({ outcome: "invalid" });

  if (expert.status !== "PENDING") return ok({ outcome: "already" });
  if (expert.confirmTokenExpires && expert.confirmTokenExpires < new Date()) {
    return ok({ outcome: "invalid" });
  }

  if (decision === "prano") {
    await db.expertProfile.update({
      where: { id: expert.id },
      data: { status: "CONFIRMED", confirmToken: null, confirmTokenExpires: null },
    });
    revalidatePath("/ekspertet");
    return ok({ outcome: "accepted" });
  } else {
    await db.expertProfile.update({
      where: { id: expert.id },
      data: { status: "REJECTED", confirmToken: null, confirmTokenExpires: null },
    });
    return ok({ outcome: "rejected" });
  }
}
