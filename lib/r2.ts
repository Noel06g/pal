import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

/**
 * Cloudflare R2 (S3-compatible) client. The bucket is PRIVATE: objects are
 * never public-by-URL. All downloads go through authenticated route handlers
 * that enforce access rules (lib §9).
 */
export const r2 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
export const PDF_MIME = "application/pdf";
const PDF_MAGIC = Buffer.from("%PDF-");

/** Validate that a file is a real PDF (MIME + magic bytes) and within size. */
export function validatePdf(file: {
  type: string;
  size: number;
  bytes: Buffer;
}): { ok: true } | { ok: false; reason: "size" | "type" } {
  if (file.size > MAX_FILE_BYTES || file.bytes.length > MAX_FILE_BYTES) {
    return { ok: false, reason: "size" };
  }
  if (file.type !== PDF_MIME) return { ok: false, reason: "type" };
  if (!file.bytes.subarray(0, 5).equals(PDF_MAGIC)) {
    return { ok: false, reason: "type" };
  }
  return { ok: true };
}

export async function putObject(
  key: string,
  body: Buffer,
  contentType: string,
) {
  await r2.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function getObjectStream(key: string) {
  const res = await r2.send(
    new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }),
  );
  return res;
}

export async function deleteObject(key: string) {
  await r2.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
}

/** Build a storage key namespaced by category. */
export function buildKey(
  category: "idea-docs" | "expert-cv",
  id: string,
  fileName: string,
) {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  return `${category}/${id}/${crypto.randomUUID()}-${safe}`;
}
