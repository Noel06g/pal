"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getActiveUser } from "@/lib/session";
import { ideaSchema } from "@/lib/validation";
import { checkRate } from "@/lib/ratelimit";
import { buildKey, putObject, deleteObject, validatePdf } from "@/lib/r2";
import { OTHER_FIELD } from "@/lib/fields";
import { t } from "@/lib/strings";
import { ok, fail, type ActionResult } from "./_helpers";

export async function createIdea(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const user = await getActiveUser();
  if (!user) return fail(t.common.loginRequired);

  const parsed = ideaSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    fieldKey: formData.get("fieldKey"),
    subfield: formData.get("subfield") ?? "",
    otherText: formData.get("otherText") ?? "",
  });
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? t.common.error);
  }
  const input = parsed.data;

  // Validate optional PDF attachments up front (before any DB write).
  const files = formData
    .getAll("documents")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const prepared: Array<{ name: string; type: string; bytes: Buffer }> = [];
  for (const file of files) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const check = validatePdf({ type: file.type, size: file.size, bytes });
    if (!check.ok) {
      return fail(
        check.reason === "size" ? t.toast.fileTooBig : t.toast.fileNotPdf,
      );
    }
    prepared.push({ name: file.name, type: file.type, bytes });
  }

  // Rate-limit only well-formed submissions, so a validation round-trip
  // doesn't burn one of the user's 5 ideas/hour.
  if (!(await checkRate("idea", user.id))) return fail(t.toast.rateLimited);

  // Upload to R2 FIRST, then create the idea + documents atomically — a
  // failed upload can no longer leave a half-created idea behind.
  const ideaId = crypto.randomUUID();
  const uploaded: Array<{
    name: string;
    type: string;
    key: string;
    size: number;
  }> = [];
  try {
    for (const f of prepared) {
      const key = buildKey("idea-docs", ideaId, f.name);
      await putObject(key, f.bytes, f.type);
      uploaded.push({ name: f.name, type: f.type, key, size: f.bytes.length });
    }
  } catch {
    for (const u of uploaded) await deleteObject(u.key).catch(() => {});
    return fail(t.common.error);
  }

  try {
    await db.$transaction([
      db.idea.create({
        data: {
          id: ideaId,
          title: input.title,
          summary: input.summary,
          fieldKey: input.fieldKey,
          subfield:
            input.fieldKey !== OTHER_FIELD.key && input.subfield
              ? input.subfield
              : null,
          otherText:
            input.fieldKey === OTHER_FIELD.key ? input.otherText : null,
          authorId: user.id,
        },
      }),
      ...uploaded.map((u) =>
        db.document.create({
          data: {
            ideaId,
            fileName: u.name,
            storageKey: u.key,
            contentType: u.type,
            size: u.size,
          },
        }),
      ),
    ]);
  } catch {
    for (const u of uploaded) await deleteObject(u.key).catch(() => {});
    return fail(t.common.error);
  }

  revalidatePath("/idete");
  revalidatePath("/");
  return ok({ id: ideaId });
}

export async function archiveIdea(ideaId: string): Promise<ActionResult> {
  const user = await getActiveUser();
  if (!user) return fail(t.common.loginRequired);

  const idea = await db.idea.findUnique({
    where: { id: ideaId },
    select: { id: true, authorId: true, status: true },
  });
  if (!idea) return fail(t.common.error);

  // Only the author or an admin may archive.
  if (idea.authorId !== user.id && !user.isAdmin) {
    return fail(t.common.error);
  }
  if (idea.status === "ARCHIVED") return ok();

  await db.idea.update({ where: { id: ideaId }, data: { status: "ARCHIVED" } });
  revalidatePath(`/idete/${ideaId}`);
  revalidatePath("/idete");
  return ok();
}
