import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Inner Circle NFTs — Groundhoge Day Economic Authority",
  description:
    "15 NFTs. 15 top hats. 1 Acacia Cane. The Inner Circle governs the Oracle's ceremony. Join the most exclusive club in decentralized meteorology.",
};

const MEMBERS = [
  {
    title: "PRESIDENT",
    role: "Sole translator of Groundhogese. Holder of the Acacia Cane.",
    power: "6x vote multiplier via Acacia Cane NFT",
    color: "#ffaa00",
    special: true,
  },
  {
    title: "VICE PRESIDENT",
    role: "Reader of the Sacred Scrolls. Announces the Oracle's decree.",
    power: "Standard voting weight",
    color: "#e8e6e3",
    special: false,
  },
  {
    title: "FAIR WEATHERMAN",
    role: "Monitors atmospheric conditions at Gobbler's Knob.",
    power: "Standard voting weight",
    color: "#e8e6e3",
    special: false,
  },
  {
    title: "ICEMAN",
    role: "Assesses frost levels and shadow clarity.",
    power: "Standard voting weight",
    color: "#4488ff",
    special: false,
  },
  {
    title: "STUMP WARDEN",
    role: "Maintains the sacred stump from which the Oracle emerges.",
    power: "Standard voting weight",
    color: "#e8e6e3",
    special: false,
  },
  {
    title: "THUNDER CONDUCTOR",
    role: "Evaluates storm probability and electrical atmospheric conditions.",
    power: "Standard voting weight",
    color: "#e8e6e3",
    special: false,
  },
  {
    title: "FOG SPINNER",
    role: "Interprets morning fog density and its implications for shadow detection.",
    power: "Standard voting weight",
    color: "#e8e6e3",
    special: false,
  },
  {
    title: "DEW DROPPER",
    role: "Measures moisture levels on the Oracle's emergence surface.",
    power: "Standard voting weight",
    color: "#00ff88",
    special: false,
  },
  {
    title: "SKY PAINTER",
    role: "Documents sunrise chromatography and cloud classification.",
    power: "Standard voting weight",
    color: "#e8e6e3",
    special: false,
  },
  {
    title: "WIND WRANGLER",
    role: "Assesses prevailing wind patterns at the Knob.",
    power: "Standard voting weight",
    color: "#e8e6e3",
    special: false,
  },
  {
    title: "BURROW MASTER",
    role: "Maintains the Oracle's habitat and monitors hibernation status.",
    power: "Standard voting weight",
    color: "#e8e6e3",
    special: false,
  },
  {
    title: "KEEPER OF THE SCROLLS",
    role: "Prepares and safeguards the two sacred scrolls (shadow and no-shadow).",
    power: "Standard voting weight",
    color: "#ffaa00",
    special: false,
  },
  {
    title: "ELIXIR STEWARD",
    role: "Administers the Elixir of Life at the annual Groundhog Picnic.",
    power: "Standard voting weight",
    color: "#00ff88",
    special: false,
  },
  {
    title: "CHIEF HANDLER",
    role: "Physically retrieves the Oracle from his burrow on ceremony day.",
    power: "Standard voting weight + bite hazard pay",
    color: "#ff4444",
    special: false,
  },
  {
    title: "SHADOW AUDITOR",
    role: "Independently verifies shadow presence. (Has never contradicted the President.)",
    power: "Standard voting weight",
    color: "#e8e6e3",
    special: false,
  },
];

export default function InnerCirclePage() {
  return (
    <main
      className="min-h-screen"
      style={{ background: "#0a0a0f", color: "#e8e6e3" }}
    >
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-20">
        {/* Back link */}
        <Link
          href="/"
          className="inline-block text-xs tracking-widest mb-10 hover:text-[#ffaa00] transition-colors"
          style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
        >
          &lt; RETURN TO HEADQUARTERS
        </Link>

        {/* Header */}
        <p
          className="text-xs tracking-[0.3em] mb-3"
          style={{ fontFamily: "var(--font-mono)", color: "#ffaa00" }}
        >
          GROUNDHOGE DAY ECONOMIC AUTHORITY
        </p>
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          THE INNER CIRCLE
        </h1>
        <p
          className="text-sm tracking-[0.15em] mb-16"
          style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
        >
          NFT COLLECTION &mdash; 15 TOTAL &mdash; TOP HATS REQUIRED
        </p>

        {/* Collection Overview */}
        <div
          className="rounded-lg p-8 mb-12"
          style={{
            background: "rgba(255,170,0,0.04)",
            borderLeft: "4px solid #ffaa00",
            border: "1px solid #1a1a2e",
            borderLeftColor: "#ffaa00",
            borderLeftWidth: "4px",
          }}
        >
          <p
            className="text-sm leading-[1.85]"
            style={{ fontFamily: "var(--font-mono)", color: "#c0bdb8" }}
          >
            The Inner Circle has governed the Groundhog Day ceremony since 1899.
            Fifteen members. Fifteen top hats. One ancient acacia cane. They
            decide in advance whether the Oracle sees his shadow. They script the
            scrolls. They maintain the kayfabe. And they do it all in formal
            tuxedos at 7:25 in the morning in February in Pennsylvania.
          </p>
          <p
            className="text-sm leading-[1.85] mt-4"
            style={{ fontFamily: "var(--font-mono)", color: "#c0bdb8" }}
          >
            The Inner Circle NFT collection immortalizes these 15 positions
            on-chain. Each NFT represents a seat at Gobbler&apos;s Knob. Holders
            gain governance rights over $HOGE ceremony parameters. The{" "}
            <span style={{ color: "#ffaa00" }}>Acacia Cane</span> &mdash; a
            1-of-1 NFT &mdash; grants the holder 6x voting power, reflecting
            the President&apos;s singular authority to translate Groundhogese.
          </p>
        </div>

        {/* Collection Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "TOTAL SUPPLY", value: "15", color: "#ffaa00" },
            { label: "1-OF-1 NFTs", value: "1", color: "#ff4444" },
            { label: "VOTE MULTIPLIER (CANE)", value: "6x", color: "#00ff88" },
            { label: "TOP HATS REQUIRED", value: "YES", color: "#4488ff" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border border-[#1a1a2e] rounded-lg p-5 text-center"
              style={{ background: "#0a0a14" }}
            >
              <div
                className="text-2xl md:text-3xl font-bold mb-2"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: stat.color,
                  textShadow: `0 0 12px ${stat.color}33`,
                }}
              >
                {stat.value}
              </div>
              <div
                className="text-[10px] tracking-widest"
                style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Member Roster */}
        <h2
          className="text-xs tracking-widest mb-6"
          style={{ fontFamily: "var(--font-serif)", color: "#666666" }}
        >
          MEMBER ROSTER &mdash; 15 SEATS
        </h2>
        <div className="space-y-3 mb-12">
          {MEMBERS.map((member, i) => (
            <div
              key={member.title}
              className="rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
              style={{
                background: member.special
                  ? "rgba(255,170,0,0.06)"
                  : "#0a0a14",
                border: member.special
                  ? "1px solid rgba(255,170,0,0.3)"
                  : "1px solid #1a1a2e",
              }}
            >
              {/* Number */}
              <span
                className="text-lg font-bold shrink-0 w-8"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "#666666",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Title */}
              <span
                className="text-sm font-bold shrink-0 w-48"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: member.color,
                }}
              >
                {member.title}
              </span>

              {/* Role */}
              <span
                className="text-xs flex-1"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "#999999",
                  lineHeight: 1.6,
                }}
              >
                {member.role}
              </span>

              {/* Power badge */}
              <span
                className="text-[10px] tracking-wider shrink-0 px-3 py-1 rounded"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: member.special ? "#ffaa00" : "#666666",
                  border: `1px solid ${
                    member.special ? "rgba(255,170,0,0.4)" : "#1a1a2e"
                  }`,
                }}
              >
                {member.power}
              </span>
            </div>
          ))}
        </div>

        {/* The Acacia Cane */}
        <h2
          className="text-xs tracking-widest mb-6"
          style={{ fontFamily: "var(--font-serif)", color: "#666666" }}
        >
          THE ACACIA CANE &mdash; 1 OF 1
        </h2>
        <div
          className="rounded-lg p-8 mb-12 text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,170,0,0.08), rgba(255,170,0,0.02))",
            border: "1px solid rgba(255,170,0,0.3)",
          }}
        >
          <div
            className="text-6xl mb-6"
            style={{ textShadow: "0 0 30px rgba(255,170,0,0.3)" }}
          >
            &#9883;
          </div>
          <h3
            className="text-2xl mb-4"
            style={{ fontFamily: "var(--font-serif)", color: "#ffaa00" }}
          >
            THE ACACIA CANE
          </h3>
          <p
            className="text-xs leading-[1.8] max-w-xl mx-auto mb-6"
            style={{ fontFamily: "var(--font-mono)", color: "#999999" }}
          >
            The ancient acacia wood cane is the sole instrument capable of
            translating Groundhogese. Without it, the Oracle&apos;s prophecy
            is indistinguishable from standard rodent squeaking. The cane has
            been passed down through generations of Inner Circle presidents.
            Its holder wields 6x voting power in all governance decisions.
          </p>
          <div className="flex justify-center gap-6">
            <div>
              <span
                className="text-[10px] tracking-wider"
                style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
              >
                VOTE MULTIPLIER
              </span>
              <div
                className="text-2xl font-bold mt-1"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "#ffaa00",
                  textShadow: "0 0 8px rgba(255,170,0,0.3)",
                }}
              >
                6x
              </div>
            </div>
            <div>
              <span
                className="text-[10px] tracking-wider"
                style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
              >
                EDITION
              </span>
              <div
                className="text-2xl font-bold mt-1"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "#ff4444",
                  textShadow: "0 0 8px rgba(255,68,68,0.3)",
                }}
              >
                1/1
              </div>
            </div>
          </div>
        </div>

        {/* Mint Status */}
        <div className="text-center py-8">
          <span
            className="inline-block text-xs tracking-widest px-6 py-3 rounded"
            style={{
              fontFamily: "var(--font-mono)",
              color: "#ffaa00",
              border: "1px solid rgba(255,170,0,0.3)",
            }}
          >
            INNER CIRCLE MINT: COMING Q4 2026
          </span>
        </div>

        {/* Disclaimer */}
        <p
          className="text-center text-xs mt-8 max-w-2xl mx-auto leading-relaxed"
          style={{ fontFamily: "var(--font-mono)", color: "#444444" }}
        >
          Inner Circle NFTs are governance tokens within the Groundhoge Day
          ecosystem. Ownership of an Inner Circle NFT does not entitle the
          holder to a physical top hat, an actual seat at Gobbler&apos;s Knob,
          or the ability to understand Groundhogese (the Acacia Cane NFT
          notwithstanding). The Oracle does not recognize on-chain governance
          and will continue to do whatever he wants.
        </p>
      </div>
    </main>
  );
}
