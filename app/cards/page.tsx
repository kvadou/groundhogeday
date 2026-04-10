"use client";

import Link from "next/link";
import { CARDS } from "@/lib/card-data";

export default function CardsPage() {
  return (
    <main
      style={{
        background: "#0a0a0f",
        minHeight: "100vh",
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              color: "#666666",
              fontSize: 12,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            SHAREABLE INTELLIGENCE CARDS
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              color: "#ffaa00",
              fontSize: 11,
              letterSpacing: "0.1em",
            }}
          >
            SCREENSHOT &mdash; SHARE &mdash; SPREAD THE WORD
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              color: "#444444",
              fontSize: 10,
              marginTop: 12,
              lineHeight: 1.6,
            }}
          >
            Each card is sized for social media (1200x675). Open a card, screenshot
            it, post it.
          </p>
        </div>

        {/* Card Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {CARDS.map((card) => (
            <Link
              key={card.slug}
              href={`/cards/${card.slug}`}
              style={{
                display: "block",
                background: "#0a0a14",
                border: "1px solid #1a1a2e",
                borderRadius: 8,
                padding: 24,
                textDecoration: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#ffaa00";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 0 20px rgba(255, 170, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#1a1a2e";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Preview box */}
              <div
                style={{
                  background: "#060610",
                  border: "1px solid #1a1a2e",
                  borderRadius: 4,
                  height: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "#ffaa00",
                    fontSize: 10,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  1200 x 675
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "#e8e6e3",
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 6,
                  letterSpacing: "0.05em",
                }}
              >
                {card.title}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "#666666",
                  fontSize: 10,
                  lineHeight: 1.5,
                }}
              >
                {card.subtitle}
              </p>
            </Link>
          ))}
        </div>

        {/* Back link */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-mono)",
              color: "#666666",
              fontSize: 11,
              textDecoration: "none",
              letterSpacing: "0.1em",
            }}
          >
            &larr; RETURN TO MAIN TERMINAL
          </Link>
        </div>
      </div>
    </main>
  );
}
