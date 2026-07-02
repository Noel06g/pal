import { ImageResponse } from "next/og";
import { t } from "@/lib/strings";

export const alt = `${t.site.name} — ${t.site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded Open Graph card shown when links are shared (social, WhatsApp…). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0E4D49 0%, #13615C 55%, #1B7A73 100%)",
          color: "#FFFFFF",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 28,
            color: "#CFE3DD",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 9999,
              background: "#CFE3DD",
            }}
          />
          {t.site.footerNote}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: "-3px",
            lineHeight: 1.05,
          }}
        >
          {t.site.name}
        </div>
        <div style={{ marginTop: 26, fontSize: 40, color: "#E6EFEC" }}>{t.site.tagline}</div>
        <div style={{ marginTop: 70, fontSize: 26, color: "#9CC2BC" }}>
          platformashqiptare.com
        </div>
      </div>
    ),
    { ...size },
  );
}
