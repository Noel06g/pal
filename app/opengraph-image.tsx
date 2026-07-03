import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { t } from "@/lib/strings";

export const alt = `${t.site.name} — ${t.site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Open Graph card: cream paper, the real logo lockup, tagline, domain —
 * matching the printed-document identity.
 */
export default async function OpengraphImage() {
  const logo = await readFile(path.join(process.cwd(), "public", "logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "88px",
          background: "#F4EFE6",
          color: "#1C1917",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="" width={464} height={200} />
        <div
          style={{
            marginTop: 56,
            fontSize: 46,
            fontWeight: 600,
            color: "#1C1917",
          }}
        >
          {t.site.tagline}
        </div>
        <div style={{ marginTop: 20, fontSize: 30, color: "#6B6459" }}>
          {t.site.footerNote}
        </div>
        <div
          style={{
            marginTop: 64,
            fontSize: 26,
            color: "#871D1D",
            textDecoration: "underline",
          }}
        >
          platformashqiptare.com
        </div>
      </div>
    ),
    { ...size },
  );
}
