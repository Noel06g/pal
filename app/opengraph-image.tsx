import { ImageResponse } from "next/og";
import { t } from "@/lib/strings";

export const alt = `${t.site.name} — ${t.site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Open Graph card in the document style: paper white, ink type, the blue
 * square stamp as the only graphic element.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "88px",
        background: "#FFFFFF",
        color: "#222222",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div
          style={{
            width: 72,
            height: 72,
            background: "#0000FF",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          PS
        </div>
        <div style={{ fontSize: 30, color: "#555555" }}>
          {t.site.footerNote}
        </div>
      </div>
      <div
        style={{
          marginTop: 48,
          fontSize: 88,
          fontWeight: 700,
          letterSpacing: "-2px",
          lineHeight: 1.1,
          color: "#222222",
        }}
      >
        {t.site.name}
      </div>
      <div style={{ marginTop: 24, fontSize: 40, color: "#222222" }}>
        {t.site.tagline}
      </div>
      <div
        style={{
          marginTop: 72,
          fontSize: 26,
          color: "#555ABF",
          textDecoration: "underline",
        }}
      >
        platformashqiptare.com
      </div>
    </div>,
    { ...size },
  );
}
