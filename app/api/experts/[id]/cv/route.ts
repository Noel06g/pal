import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getObjectStream } from "@/lib/r2";
import { requireAdmin } from "@/lib/session";

/**
 * Stream an expert's CV — ADMIN ONLY (spec §9). Private data is never exposed
 * to non-admins; the access check happens before any bucket read.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return new NextResponse("Forbidden", { status: 403 });

  const { id } = await params;
  const expert = await db.expertProfile.findUnique({
    where: { id },
    select: { cvStorageKey: true, cvFileName: true, cvContentType: true, cvSize: true },
  });
  if (!expert?.cvStorageKey) return new NextResponse("Not found", { status: 404 });

  try {
    const obj = await getObjectStream(expert.cvStorageKey);
    const body = obj.Body?.transformToWebStream();
    if (!body) return new NextResponse("Not found", { status: 404 });

    return new NextResponse(body, {
      headers: {
        "Content-Type": expert.cvContentType || "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(expert.cvFileName ?? "cv.pdf")}"`,
        ...(expert.cvSize ? { "Content-Length": String(expert.cvSize) } : {}),
        "Cache-Control": "private, max-age=0, no-store",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
