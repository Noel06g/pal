"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getActiveUser } from "@/lib/session";
import { ideaSchema } from "@/lib/validation";
import { checkRate } from "@/lib/ratelimit";
import { buildKey, putObject, validatePdf } from "@/lib/r2";
import { OTHER_FIELD } from "@/lib/fields";
import { t } from "@/lib/strings";
import { ok, fail, type ActionResult } from "./_helpers";

export async function createIdea(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const user = await getActiveUser();
  if (!user) return fail(t.common.loginRequired);

  if (!(await checkRate("idea", user.id))) return fail(t.toast.rateLimited);

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
      return fail(check.reason === "size" ? t.toast.fileTooBig : t.toast.fileNotPdf);
    }
    prepared.push({ name: file.name, type: file.type, bytes });
  }

  const idea = await db.idea.create({
    data: {
      title: input.title,
      summary: input.summary,
      fieldKey: input.fieldKey,
      subfield: input.subfield ? input.subfield : null,
      otherText: input.fieldKey === OTHER_FIELD.key ? input.otherText : null,
      authorId: user.id,
    },
  });

  // Upload + record documents.
  for (const f of prepared) {
    const key = buildKey("idea-docs", idea.id, f.name);
    await putObject(key, f.bytes, f.type);
    await db.document.create({
      data: {
        ideaId: idea.id,
        fileName: f.name,
        storageKey: key,
        contentType: f.type,
        size: f.bytes.length,
      },
    });
  }

  revalidatePath("/idete");
  revalidatePath("/");
  return ok({ id: idea.id });
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
