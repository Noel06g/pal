import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getObjectStream } from "@/lib/r2";

/**
 * Stream a PUBLIC idea supporting document. The file lives in a PRIVATE R2
 * bucket and is never exposed by a direct bucket URL — it is served only here,
 * after looking the record up by id. (Idea docs are public per spec §9.)
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const doc = await db.document.findUnique({ where: { id } });
  if (!doc) return new NextResponse("Not found", { status: 404 });

  try {
    const obj = await getObjectStream(doc.storageKey);
    const body = obj.Body?.transformToWebStream();
    if (!body) return new NextResponse("Not found", { status: 404 });

    return new NextResponse(body, {
      headers: {
        "Content-Type": doc.contentType || "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(doc.fileName)}"`,
        "Content-Length": String(doc.size),
        "Cache-Control": "private, max-age=0, no-store",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
