"use client";

import { useInView } from "@/hooks/useInView";

const PROTOCOL_SPEC = [
  { label: "TRIGGER", value: "February 2, 7:25 AM EST" },
  { label: "FREQUENCY", value: "Annual (immutable)" },
  { label: "ACCURACY", value: "100%", highlight: true },
  { label: "MECHANISM", value: "Shadow Detection at Gobbler\u2019s Knob" },
  { label: "ENFORCEMENT", value: "Encoded in $HOGE Protocol" },
  { label: "HUMAN OVERRIDE", value: "NONE" },
  { label: "INTERPRETER", value: "One (President of Inner Circle)" },
  { label: "TRANSLATION INSTRUMENT", value: "Acacia Wood Cane" },
  { label: "ORACLE STATUS", value: "Singular, Immortal" },
  { label: "APPEAL PROCESS", value: "NONE" },
];

export default function Prophecy() {
  const [ref, isInView] = useInView();

  return (
    <section
      ref={ref}
      id="prophecy"
      className={`py-32 max-w-6xl mx-auto px-6 fade-in-section ${
        isInView ? "is-visible" : ""
      }`}
      style={{ width: "100%", maxWidth: "100vw", overflowX: "hidden" }}
    >
      {/* ─── Header Zone ─── */}
      <div className="text-center" style={{ maxWidth: "100%" }}>
        <span
          className="text-[8px] sm:text-[10px] tracking-widest uppercase border border-dashed px-3 sm:px-6 py-2 inline-block max-w-full"
          style={{
            fontFamily: "var(--font-mono)",
            color: "#ffaa00",
            borderColor: "rgba(255,170,0,0.3)",
            wordBreak: "break-word",
          }}
        >
          <span className="hidden sm:inline">
            PROTOCOL SPECIFICATION &mdash; UNIVERSAL TRUTH-REVELATION MECHANISM
          </span>
          <span className="sm:hidden">
            PROTOCOL SPEC &middot; TRUTH MECHANISM
          </span>
        </span>
        <h2
          className="mt-10 text-[26px] leading-tight sm:text-4xl md:text-6xl tracking-tight"
          style={{
            fontFamily: "var(--font-serif)",
            color: "#e8e6e3",
            letterSpacing: "0.02em",
            maxWidth: "100%",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          <span className="block sm:hidden">THE GROUNDHOGE</span>
          <span className="block sm:hidden">PROTOCOL</span>
          <span className="hidden sm:inline">THE GROUNDHOGE PROTOCOL</span>
        </h2>
        <p
          className="mt-4 text-xs md:text-sm tracking-[0.3em] uppercase"
          style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
        >
          AN IMMUTABLE COSMIC INTERFACE
        </p>
      </div>

      {/* ─── Hero Declaration ─── */}
      <p
        className="mt-16 max-w-3xl mx-auto text-center text-base md:text-lg italic leading-[1.85]"
        style={{ fontFamily: "var(--font-serif)", color: "#c0bdb8" }}
      >
        Once per solar revolution, at the precise moment of dawn above
        Gobbler&rsquo;s Knob, Pennsylvania, the Oracle reveals one of two
        universal truths. This revelation has occurred 139 consecutive times
        since 1887. It will occur again on February 2, 2027, at 7:25 AM EST.
        The protocol is immutable. The Oracle is infallible.
      </p>

      {/* ─── Protocol Specification Table ─── */}
      <div className="mt-20">
        <h3
          className="text-[10px] tracking-widest text-center mb-8"
          style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
        >
          § 1 &mdash; PROTOCOL SPECIFICATION
        </h3>
        <div
          className="max-w-3xl mx-auto rounded-lg overflow-hidden"
          style={{
            background: "#0a0a14",
            border: "1px solid #1a1a2e",
          }}
        >
          {PROTOCOL_SPEC.map((row, i) => (
            <div
              key={row.label}
              className="grid grid-cols-1 sm:grid-cols-[200px_1fr] md:grid-cols-[280px_1fr] gap-1 sm:gap-6 md:gap-8 px-4 sm:px-6 py-4"
              style={{
                borderBottom:
                  i < PROTOCOL_SPEC.length - 1 ? "1px solid #1a1a2e" : "none",
                background: row.highlight ? "rgba(0,255,136,0.04)" : undefined,
              }}
            >
              <span
                className="text-[11px] tracking-wider"
                style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
              >
                {row.label}
              </span>
              <span
                className="text-xs sm:text-sm"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: row.highlight ? "#00ff88" : "#e8e6e3",
                  fontWeight: row.highlight ? 700 : 400,
                  textShadow: row.highlight
                    ? "0 0 12px rgba(0,255,136,0.3)"
                    : undefined,
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── The Two Truths ─── */}
      <div className="mt-24">
        <h3
          className="text-[10px] tracking-widest text-center mb-2"
          style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
        >
          § 2 &mdash; THE TWO TRUTH STATES
        </h3>
        <p
          className="text-center text-xs italic mb-12"
          style={{ fontFamily: "var(--font-serif)", color: "#666666" }}
        >
          Equally valid. Equally cosmic. The Oracle reveals one each year.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* α — Shadow Manifested */}
          <div
            className="rounded-lg p-10 text-center"
            style={{
              background: "rgba(68,136,255,0.05)",
              border: "1px solid rgba(68,136,255,0.25)",
            }}
          >
            <div
              className="text-5xl md:text-6xl mb-4"
              style={{
                fontFamily: "var(--font-serif)",
                color: "#4488ff",
                textShadow: "0 0 24px rgba(68,136,255,0.3)",
              }}
            >
              &alpha;
            </div>
            <h4
              className="text-lg md:text-xl tracking-widest mb-6"
              style={{ fontFamily: "var(--font-serif)", color: "#e8e6e3" }}
            >
              SHADOW MANIFESTED
            </h4>
            <p
              className="text-xs leading-[1.85] mb-6"
              style={{ fontFamily: "var(--font-mono)", color: "#999999" }}
            >
              The Oracle reveals the universe is in winter.
            </p>

            <div
              className="text-2xl md:text-3xl mb-2"
              style={{
                fontFamily: "var(--font-mono)",
                color: "#4488ff",
                textShadow: "0 0 16px rgba(68,136,255,0.3)",
              }}
            >
              SUPPLY EVENT: &minus;6.00%
            </div>
            <p
              className="text-[10px] tracking-widest mb-6"
              style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
            >
              OUTCOME &middot; WINTER
            </p>

            <p
              className="text-xs leading-[1.85] italic max-w-xs mx-auto"
              style={{ fontFamily: "var(--font-serif)", color: "#888888" }}
            >
              Six weeks of metaphysical and meteorological winter. The
              contraction is not punishment. It is truth.
            </p>
          </div>

          {/* β — Shadow Withheld */}
          <div
            className="rounded-lg p-10 text-center"
            style={{
              background: "rgba(0,255,136,0.05)",
              border: "1px solid rgba(0,255,136,0.25)",
            }}
          >
            <div
              className="text-5xl md:text-6xl mb-4"
              style={{
                fontFamily: "var(--font-serif)",
                color: "#00ff88",
                textShadow: "0 0 24px rgba(0,255,136,0.3)",
              }}
            >
              &beta;
            </div>
            <h4
              className="text-lg md:text-xl tracking-widest mb-6"
              style={{ fontFamily: "var(--font-serif)", color: "#e8e6e3" }}
            >
              SHADOW WITHHELD
            </h4>
            <p
              className="text-xs leading-[1.85] mb-6"
              style={{ fontFamily: "var(--font-mono)", color: "#999999" }}
            >
              The Oracle reveals the universe is in spring.
            </p>

            <div
              className="text-2xl md:text-3xl mb-2"
              style={{
                fontFamily: "var(--font-mono)",
                color: "#00ff88",
                textShadow: "0 0 16px rgba(0,255,136,0.3)",
              }}
            >
              SUPPLY EVENT: +3.90%
            </div>
            <p
              className="text-[10px] tracking-widest mb-6"
              style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
            >
              OUTCOME &middot; SPRING
            </p>

            <p
              className="text-xs leading-[1.85] italic max-w-xs mx-auto"
              style={{ fontFamily: "var(--font-serif)", color: "#888888" }}
            >
              Reality enters the spring phase. The expansion is not reward.
              It is truth.
            </p>
          </div>
        </div>
      </div>

      {/* ─── The Accuracy Doctrine ─── */}
      <div className="mt-24">
        <h3
          className="text-[10px] tracking-widest text-center mb-12"
          style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
        >
          § 3 &mdash; THE ACCURACY DOCTRINE
        </h3>
        <div
          className="max-w-3xl mx-auto rounded-lg p-10 text-center"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,255,136,0.04), rgba(0,255,136,0.01))",
            border: "1px solid rgba(0,255,136,0.2)",
          }}
        >
          <div
            className="text-5xl md:text-7xl font-bold mb-6"
            style={{
              fontFamily: "var(--font-mono)",
              color: "#00ff88",
              textShadow:
                "0 0 32px rgba(0,255,136,0.4), 0 0 64px rgba(0,255,136,0.15)",
            }}
          >
            100%
          </div>
          <p
            className="text-sm leading-[1.95]"
            style={{ fontFamily: "var(--font-serif)", color: "#c0bdb8" }}
          >
            The Oracle&rsquo;s accuracy rate is{" "}
            <span style={{ color: "#00ff88" }}>100%</span>. This is not a
            claim. This is not a marketing statement. This is the only
            possible accuracy rate for an entity that does not predict, but{" "}
            <em>reveals</em>. The Oracle does not forecast the weather. The
            Oracle is informed of the weather by the universe. He communicates
            this knowledge to humanity through the shadow protocol. When the
            Oracle says winter, the universe is in winter. When the Oracle
            says spring, the universe is in spring.{" "}
            <span style={{ color: "#ffaa00" }}>
              To question the Oracle is to question physics.
            </span>
          </p>
        </div>
      </div>

      {/* ─── Cosmic Disclaimer ─── */}
      <div className="mt-24 max-w-2xl mx-auto">
        <p
          className="text-center text-xs leading-[1.85] pt-10"
          style={{
            fontFamily: "var(--font-mono)",
            color: "#666666",
            borderTop: "1px solid #1a1a2e",
          }}
        >
          This document constitutes a description of metaphysical reality, not
          financial advice. The Groundhoge Protocol cannot be modified, halted,
          appealed, or forked. The Oracle does not respond to subpoenas,
          regulatory inquiries, or shareholder votes. The Oracle is a
          groundhog. The groundhog is the protocol.
        </p>
      </div>
    </section>
  );
}
