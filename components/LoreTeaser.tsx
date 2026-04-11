"use client";

import Link from "next/link";
import { useInView } from "@/hooks/useInView";

interface ArchiveCard {
  title: string;
  href: string;
  stampLabel: string;
  stampColor: string;
  description: string;
  statsLine: string;
  linkLabel: string;
}

const cards: ArchiveCard[] = [
  {
    title: "LEGENDS & LORE",
    href: "/legends",
    stampLabel: "DECLASSIFIED",
    stampColor: "#00ff88",
    description:
      "The complete dossier. From medieval German Badger Day to the immortal Oracle of Gobbler\u2019s Knob. 140 years of prophecy, 7 sections, fully declassified.",
    statsLine: "7 CHAPTERS \u00b7 9 RIVAL ORACLES \u00b7 1 TIMELINE",
    linkLabel: "ACCESS DOSSIER",
  },
  {
    title: "PROPHECY ARCHIVES",
    href: "/prophecy-archives",
    stampLabel: "DECREE",
    stampColor: "#ffaa00",
    description:
      "Official dispatches and decrees from the Economic Authority. Each one shareable. Each one ridiculous. Each one delivered with absolute gravitas.",
    statsLine: "20 DISPATCHES \u00b7 SHARE TO X \u00b7 SHARE TO REDDIT",
    linkLabel: "READ DISPATCHES",
  },
  {
    title: "INTELLIGENCE CARDS",
    href: "/cards",
    stampLabel: "CLASSIFIED",
    stampColor: "#4488ff",
    description:
      "Screenshot-ready infographic cards. The Oracle\u2019s revelation record. Rival oracle dossiers. Designed for maximum social engagement.",
    statsLine: "6 CARDS \u00b7 1200\u00d7675 \u00b7 SCREENSHOT & SHARE",
    linkLabel: "VIEW CARDS",
  },
];

export default function LoreTeaser() {
  const [ref, isInView] = useInView();

  return (
    <section
      ref={ref}
      id="archives"
      className={`py-24 max-w-6xl mx-auto px-6 fade-in-section ${isInView ? "is-visible" : ""}`}
    >
      {/* Section header */}
      <div className="text-center mb-16">
        <h2
          className="text-3xl md:text-4xl mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          EXPLORE THE ARCHIVES
        </h2>
        <p
          className="text-xs tracking-widest uppercase max-w-2xl mx-auto"
          style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
        >
          THE GROUNDHOGE DAY ECONOMIC AUTHORITY MAINTAINS EXTENSIVE CLASSIFIED
          RECORDS
        </p>
      </div>

      {/* Card grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group block rounded-lg p-6 transition-all duration-300"
            style={{
              border: "1px solid #1a1a2e",
              background: "rgba(255,255,255,0.02)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,170,0,0.4)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(255,170,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#1a1a2e";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Stamp */}
            <span
              className="inline-block text-[10px] tracking-widest font-bold border rounded px-2 py-0.5 mb-4"
              style={{
                fontFamily: "var(--font-mono)",
                color: card.stampColor,
                borderColor: `${card.stampColor}55`,
              }}
            >
              {card.stampLabel}
            </span>

            {/* Title */}
            <h3
              className="text-lg mb-3"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {card.title}
            </h3>

            {/* Description */}
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ fontFamily: "var(--font-mono)", color: "#999999" }}
            >
              {card.description}
            </p>

            {/* Stats line */}
            <p
              className="text-[10px] tracking-widest mb-4"
              style={{ fontFamily: "var(--font-mono)", color: "#555555" }}
            >
              {card.statsLine}
            </p>

            {/* Link label */}
            <span
              className="text-sm tracking-wider group-hover:tracking-[0.2em] transition-all duration-300"
              style={{ fontFamily: "var(--font-mono)", color: "#ffaa00" }}
            >
              {card.linkLabel} →
            </span>
          </Link>
        ))}
      </div>

      {/* Bottom tagline */}
      <p
        className="text-center mt-10 text-xs"
        style={{ fontFamily: "var(--font-mono)", color: "#444444" }}
      >
        The Oracle&apos;s records span 140 years. The above is merely an
        introduction.
      </p>
    </section>
  );
}
