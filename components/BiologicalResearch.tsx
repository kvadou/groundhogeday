"use client";

import { useInView } from "@/hooks/useInView";

const IDENTIFICATION = [
  { label: "SPECIES DESIGNATION:", value: "Marmota monax", color: "#e8e6e3" },
  {
    label: "COMMON ALIASES:",
    value: "Groundhog, Woodchuck, Whistle-pig, Land Beaver, Thickwood Badger",
    color: "#e8e6e3",
  },
  {
    label: "FRENCH-CANADIAN DESIGNATION:",
    value: "Siffleux",
    color: "#e8e6e3",
  },
  { label: "CODENAME:", value: "WHISTLE-PIG", color: "#00ff88", highlight: true },
  {
    label: "FAMILY:",
    value: "Sciuridae (Squirrel family \u2014 CLASSIFIED)",
    color: "#e8e6e3",
  },
  {
    label: "STATUS:",
    value: "NOT ENDANGERED \u2014 CONSIDERED ABUNDANT",
    color: "#00ff88",
  },
];

const VITAL_SIGNS = [
  {
    label: "CORE TEMPERATURE",
    value: "Drops from 99\u00b0F (37\u00b0C) to as low as 35\u00b0F (2\u00b0C)",
  },
  { label: "HEART RATE", value: "Drops from 80 BPM to 4\u201310 BPM" },
  { label: "RESPIRATION", value: "Drops to 1 breath every 6 minutes" },
  { label: "BODY MASS LOSS", value: "Approximately 50% by February" },
  {
    label: "DURATION",
    value: "October through February (varies by latitude)",
  },
];

const CAPABILITIES = [
  {
    label: "AQUATIC CAPABILITY:",
    text: "Confirmed. Subjects are accomplished swimmers.",
  },
  {
    label: "ARBOREAL CAPABILITY:",
    text: "Confirmed. Subjects will climb trees to evade terrestrial threats.",
  },
  {
    label: "EXCAVATION CAPABILITY:",
    text: "Extreme. A single burrow system can displace 35 cubic feet (1 cubic meter) of earth. Burrow networks include multiple chambers, exits, and a dedicated toilet room.",
  },
  {
    label: "DENTAL ARMAMENT:",
    text: "Ivory-white incisors (unique among rodents \u2014 most rodent incisors are yellow). Growth rate: 1.5mm per week. Weaponization potential: CLASSIFIED.",
  },
  {
    label: "DOCUMENTED ATTACKS:",
    text: "The subject has bitten multiple public officials including mayors and actors. See: Department of Cultural Affairs, Incident Report 1993.",
  },
];

const ALIASES = [
  { region: "Pennsylvania German:", name: "Grundsow" },
  { region: "Appalachian:", name: "Whistle-pig" },
  { region: "Canadian French:", name: "Siffleux" },
  { region: "Scientific:", name: "Marmota monax" },
  { region: "Colonial American:", name: "Land beaver" },
  { region: "British colonial:", name: "Thickwood badger" },
  { region: "Inner Circle:", name: "The Oracle" },
  { region: "$HOGE Community:", name: "The Seer" },
];

export default function BiologicalResearch() {
  const [ref, isInView] = useInView(0.1);

  return (
    <section
      ref={ref}
      className={`py-24 max-w-6xl mx-auto px-6 fade-in-section ${isInView ? "is-visible" : ""}`}
      style={{ background: "#060610", borderTop: "1px solid #1a1a2e" }}
    >
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2
          className="text-sm tracking-widest mb-3"
          style={{ fontFamily: "var(--font-serif)", color: "#666666" }}
        >
          BUREAU OF BIOLOGICAL RESEARCH
        </h2>
        <p
          className="text-xs tracking-wider"
          style={{ fontFamily: "var(--font-mono)", color: "#ffaa00" }}
        >
          SPECIES DOSSIER &mdash; MARMOTA MONAX &mdash; CLEARANCE LEVEL: OMEGA
        </p>
      </div>

      {/* Identification Panel */}
      <div
        className="mb-10 p-6 rounded"
        style={{
          background: "#0a0a14",
          border: "1px solid #1a1a2e",
          fontFamily: "var(--font-mono)",
        }}
      >
        <h3
          className="text-xs tracking-widest mb-5 pb-3"
          style={{
            fontFamily: "var(--font-serif)",
            color: "#e8e6e3",
            borderBottom: "1px solid #1a1a2e",
            letterSpacing: "0.2em",
          }}
        >
          IDENTIFICATION PANEL
        </h3>
        <div className="grid gap-3">
          {IDENTIFICATION.map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[220px_1fr] gap-4 text-xs items-baseline"
              style={{ lineHeight: 1.6 }}
            >
              <span style={{ color: "#666666" }}>{item.label}</span>
              <span
                style={{
                  color: item.color,
                  ...(item.highlight
                    ? {
                        background: "rgba(0, 255, 136, 0.08)",
                        padding: "2px 8px",
                        border: "1px solid rgba(0, 255, 136, 0.2)",
                        display: "inline-block",
                      }
                    : {}),
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Etymology Report */}
      <div
        className="mb-10 p-6 rounded"
        style={{
          background: "#0a0a14",
          borderLeft: "4px solid #00ff88",
          border: "1px solid #1a1a2e",
          borderLeftColor: "#00ff88",
          borderLeftWidth: "4px",
        }}
      >
        <h3
          className="text-xs tracking-widest mb-4"
          style={{
            fontFamily: "var(--font-serif)",
            color: "#e8e6e3",
            letterSpacing: "0.2em",
          }}
        >
          ETYMOLOGY REPORT
        </h3>
        <p
          className="text-xs mb-4"
          style={{
            fontFamily: "var(--font-mono)",
            color: "#c0bdb8",
            lineHeight: 1.8,
          }}
        >
          <span style={{ color: "#00ff88" }}>CRITICAL CORRECTION:</span> The
          name &ldquo;woodchuck&rdquo; has NO etymological connection to the
          chucking of wood. It derives from the Algonquian word
          &ldquo;wuchak.&rdquo; The popular tongue-twister is based on a
          linguistic misunderstanding and has been flagged for decommissioning
          since 1978. The request remains pending.
        </p>
        <p
          className="text-xs"
          style={{
            fontFamily: "var(--font-mono)",
            color: "#c0bdb8",
            lineHeight: 1.8,
          }}
        >
          <span style={{ color: "#ffaa00" }}>ADDITIONAL NOTE:</span> The name
          &ldquo;whistle-pig&rdquo; derives from the subject&apos;s alarm call
          &mdash; a high-pitched whistle used to warn colony members of incoming
          threats. The whistle is audible at considerable distance and has been
          described as &ldquo;surprisingly piercing for a creature of that
          girth.&rdquo;
        </p>
      </div>

      {/* Hibernation Protocol */}
      <div
        className="mb-10 p-6 rounded"
        style={{
          background: "#0a0a14",
          border: "1px solid #1a1a2e",
          borderLeftColor: "#4488ff",
          borderLeftWidth: "4px",
        }}
      >
        <h3
          className="text-xs tracking-widest mb-4"
          style={{
            fontFamily: "var(--font-serif)",
            color: "#e8e6e3",
            letterSpacing: "0.2em",
          }}
        >
          HIBERNATION PROTOCOL
        </h3>
        <p
          className="text-xs mb-6"
          style={{
            fontFamily: "var(--font-mono)",
            color: "#c0bdb8",
            lineHeight: 1.8,
          }}
        >
          The subject is one of few mammalian species that enters TRUE
          hibernation &mdash; not merely torpor or extended sleep.
        </p>

        {/* Vital Signs Monitor */}
        <div
          className="p-4 rounded mb-6"
          style={{
            background: "#050510",
            border: "1px solid #1a1a2e",
          }}
        >
          {VITAL_SIGNS.map((stat, i) => (
            <div
              key={stat.label}
              className="flex items-baseline gap-4 text-xs py-2"
              style={{
                fontFamily: "var(--font-mono)",
                borderBottom:
                  i < VITAL_SIGNS.length - 1
                    ? "1px solid rgba(26, 26, 46, 0.6)"
                    : "none",
              }}
            >
              <span
                className="shrink-0"
                style={{ color: "#666666", minWidth: "180px" }}
              >
                {stat.label}:
              </span>
              <span style={{ color: "#00ff88" }}>{stat.value}</span>
            </div>
          ))}
        </div>

        <p
          className="text-xs"
          style={{
            fontFamily: "var(--font-mono)",
            color: "#c0bdb8",
            lineHeight: 1.8,
          }}
        >
          <span style={{ color: "#4488ff" }}>NOTE:</span> The subject&apos;s
          hibernation biology has been classified as strategically significant.
          Military and medical researchers study groundhog hibernation to develop
          techniques for safely lowering human heart rates during complex
          surgeries and for understanding Hepatitis B-induced liver cancer.
        </p>
      </div>

      {/* Physical Capabilities Assessment */}
      <div
        className="mb-10 p-6 rounded"
        style={{
          background: "#0a0a14",
          border: "1px solid #1a1a2e",
          borderLeftColor: "#ffaa00",
          borderLeftWidth: "4px",
        }}
      >
        <h3
          className="text-xs tracking-widest mb-4"
          style={{
            fontFamily: "var(--font-serif)",
            color: "#e8e6e3",
            letterSpacing: "0.2em",
          }}
        >
          PHYSICAL CAPABILITIES ASSESSMENT
        </h3>
        <p
          className="text-xs mb-5"
          style={{
            fontFamily: "var(--font-mono)",
            color: "#c0bdb8",
            lineHeight: 1.8,
          }}
        >
          Despite a rotund physique that suggests limited mobility, the subject
          demonstrates unexpectedly advanced physical capabilities:
        </p>
        <div className="grid gap-3">
          {CAPABILITIES.map((cap) => (
            <div
              key={cap.label}
              className="flex gap-3 text-xs"
              style={{ fontFamily: "var(--font-mono)", lineHeight: 1.8 }}
            >
              <span style={{ color: "#666666", userSelect: "none" }}>&gt;</span>
              <p>
                <span style={{ color: "#ffaa00" }}>{cap.label}</span>{" "}
                <span style={{ color: "#c0bdb8" }}>{cap.text}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Aliases Database */}
      <div
        className="mb-10 p-6 rounded"
        style={{
          background: "#0a0a14",
          border: "1px solid #1a1a2e",
        }}
      >
        <h3
          className="text-xs tracking-widest mb-5"
          style={{
            fontFamily: "var(--font-serif)",
            color: "#e8e6e3",
            letterSpacing: "0.2em",
          }}
        >
          OPERATIONAL ALIASES DATABASE
        </h3>
        <p
          className="text-xs mb-5"
          style={{
            fontFamily: "var(--font-mono)",
            color: "#c0bdb8",
            lineHeight: 1.8,
          }}
        >
          The subject is known by different names in different regions. A partial
          registry:
        </p>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {ALIASES.map((alias) => (
            <div
              key={alias.region}
              className="flex gap-3 text-xs items-baseline"
            >
              <span
                className="shrink-0"
                style={{ color: "#666666", minWidth: "160px" }}
              >
                {alias.region}
              </span>
              <span style={{ color: "#e8e6e3" }}>{alias.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Classification Footer */}
      <div
        className="text-center pt-6"
        style={{ borderTop: "1px solid #1a1a2e" }}
      >
        <p
          className="text-xs"
          style={{
            fontFamily: "var(--font-mono)",
            color: "#666666",
            lineHeight: 1.8,
            maxWidth: "640px",
            margin: "0 auto",
          }}
        >
          This dossier is maintained by the Bureau of Biological Research, a
          division of the Groundhoge Day Economic Authority. All findings are
          considered preliminary pending the Oracle&apos;s review. The Oracle has
          not reviewed any findings since 1887.
        </p>
      </div>
    </section>
  );
}
