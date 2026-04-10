import { ImageResponse } from "next/og";

export const alt =
  "The Prophecy Archives — Groundhoge Day Economic Authority";
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
            fontSize: 68,
            fontWeight: 700,
            color: "#e8e6e3",
            fontFamily: "serif",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: "24px",
          }}
        >
          THE PROPHECY ARCHIVES
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: 20,
            letterSpacing: "0.15em",
            color: "#888888",
            fontFamily: "monospace",
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          Official Dispatches & Decrees — For Public Distribution
        </div>

        {/* Sample decree snippet */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "800px",
            padding: "20px 28px",
            borderRadius: "8px",
            backgroundColor: "#0a0a14",
            border: "1px solid #1a1a2e",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 12,
              letterSpacing: "0.2em",
              color: "#4488ff",
              fontFamily: "monospace",
              marginBottom: "10px",
            }}
          >
            DECREE #0001
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 16,
              color: "#c0bdb8",
              fontFamily: "monospace",
              lineHeight: 1.5,
            }}
          >
            There is only one Phil. Not a lineage. Not a succession. One immortal
            groundhog. This is not open for debate.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
