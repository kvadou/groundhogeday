import { ImageResponse } from "next/og";

export const alt =
  "Legends & Lore — Groundhoge Day Economic Authority";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0f",
          padding: "60px",
        }}
      >
        {/* Top authority line */}
        <div
          style={{
            display: "flex",
            fontSize: 16,
            letterSpacing: "0.3em",
            color: "#ffaa00",
            fontFamily: "monospace",
            marginBottom: "40px",
          }}
        >
          GROUNDHOGE DAY ECONOMIC AUTHORITY
        </div>

        {/* Main title */}
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            color: "#e8e6e3",
            fontFamily: "serif",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: "24px",
          }}
        >
          LEGENDS & LORE
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#888888",
            fontFamily: "monospace",
            textAlign: "center",
            marginBottom: "48px",
          }}
        >
          The complete dossier on groundhog prophecy traditions
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            width: "120px",
            height: "2px",
            backgroundColor: "#ffaa00",
            marginBottom: "32px",
          }}
        />

        {/* Clearance badge */}
        <div
          style={{
            display: "flex",
            fontSize: 14,
            letterSpacing: "0.25em",
            color: "#00ff88",
            fontFamily: "monospace",
            border: "1px solid #00ff8840",
            padding: "8px 24px",
            borderRadius: "4px",
          }}
        >
          CLEARANCE LEVEL: PUBLIC
        </div>
      </div>
    ),
    { ...size }
  );
}
