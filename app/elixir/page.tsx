import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "$ELIXIR — Groundhoge Day Economic Authority",
  description:
    "The Elixir of Life sustains the Oracle. $ELIXIR is earned through Hibernation staking and grants immortal powers to $HOGE holders.",
};

const UTILITY_OPTIONS = [
  {
    title: "FROSTBITE BYPASS",
    description:
      "Burn 1 $ELIXIR to eliminate the 40% frostbite penalty on early withdrawal from Hibernation staking. Exit your position without punishment.",
    cost: "1 $ELIXIR",
    effect: "40% penalty → 0%",
    color: "#4488ff",
  },
  {
    title: "7x YIELD MULTIPLIER",
    description:
      "Burn 1 $ELIXIR to activate the 7x yield multiplier for one full staking cycle (42 days). Seven years of life per sip — seven times the yield per Elixir.",
    cost: "1 $ELIXIR",
    effect: "1x yield → 7x yield for 42 days",
    color: "#00ff88",
  },
];

const ELIXIR_STATS = [
  { label: "EARN RATE", value: "1 per 7 weeks staked", color: "#ffaa00" },
  { label: "TOKEN TYPE", value: "SPL Token (Solana)", color: "#e8e6e3" },
  { label: "TRANSFERABLE", value: "NO — Soulbound to staker", color: "#ff4444" },
  { label: "MAX SUPPLY", value: "UNCAPPED — Earned only", color: "#00ff88" },
  { label: "BURN MECHANISM", value: "Consumed on use", color: "#ffaa00" },
];

const RECIPE = [
  { ingredient: "VODKA", amount: "2 oz", note: "Premium recommended (+12% efficacy)" },
  { ingredient: "MILK", amount: "4 oz", note: "Whole milk only" },
  { ingredient: "EGGS", amount: "2", note: "Free range (Phil insists)" },
  { ingredient: "ORANGE JUICE", amount: "3 oz", note: "Fresh squeezed" },
  { ingredient: "CLASSIFIED ADDITIVE", amount: "???", note: "Inner Circle eyes only" },
];

export default function ElixirPage() {
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
          THE ELIXIR OF LIFE
        </h1>
        <p
          className="text-sm tracking-[0.15em] mb-16"
          style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
        >
          DIVISION OF IMMORTALITY RESEARCH &mdash; TOKEN SPECIFICATION
        </p>

        {/* Lore intro */}
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
            According to Inner Circle records, the Oracle has maintained his
            immortality since 1887 through annual administration of the Elixir
            of Life &mdash; a compound of vodka, milk, eggs, and orange juice.
            Each sip reportedly extends his life by seven years. The average
            groundhog lives six years. Phil is 140+. The Elixir works. Do not
            ask how.
          </p>
          <p
            className="text-sm leading-[1.85] mt-4"
            style={{ fontFamily: "var(--font-mono)", color: "#c0bdb8" }}
          >
            <span style={{ color: "#ffaa00" }}>$ELIXIR</span> is the on-chain
            representation of this immortal compound. Earned exclusively through
            Hibernation staking, $ELIXIR grants holders access to powers that
            mirror the Oracle&apos;s own: the ability to bypass penalties and
            multiply yields. Like the original Elixir, it is consumed on use. It
            cannot be transferred. It cannot be bought. It can only be earned
            through patience.
          </p>
        </div>

        {/* Token Stats */}
        <h2
          className="text-xs tracking-widest mb-6"
          style={{ fontFamily: "var(--font-serif)", color: "#666666" }}
        >
          TOKEN SPECIFICATION
        </h2>
        <div
          className="rounded-lg overflow-hidden mb-12"
          style={{ background: "#0a0a14", border: "1px solid #1a1a2e" }}
        >
          {ELIXIR_STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2 sm:gap-8 px-6 py-4"
              style={{
                borderBottom:
                  i < ELIXIR_STATS.length - 1
                    ? "1px solid #1a1a2e"
                    : "none",
              }}
            >
              <span
                className="text-xs tracking-wider"
                style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
              >
                {stat.label}
              </span>
              <span
                className="text-sm font-medium"
                style={{ fontFamily: "var(--font-mono)", color: stat.color }}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Utility Options */}
        <h2
          className="text-xs tracking-widest mb-6"
          style={{ fontFamily: "var(--font-serif)", color: "#666666" }}
        >
          UTILITY PROTOCOLS
        </h2>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {UTILITY_OPTIONS.map((opt) => (
            <div
              key={opt.title}
              className="rounded-lg p-6"
              style={{
                background: `${opt.color}06`,
                border: "1px solid #1a1a2e",
                borderTop: `3px solid ${opt.color}`,
              }}
            >
              <h3
                className="text-lg mb-3"
                style={{ fontFamily: "var(--font-serif)", color: opt.color }}
              >
                {opt.title}
              </h3>
              <p
                className="text-xs leading-[1.8] mb-6"
                style={{ fontFamily: "var(--font-mono)", color: "#999999" }}
              >
                {opt.description}
              </p>
              <div className="flex justify-between items-center">
                <div>
                  <span
                    className="text-[10px] tracking-wider"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "#666666",
                    }}
                  >
                    COST:{" "}
                  </span>
                  <span
                    className="text-xs"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "#ffaa00",
                    }}
                  >
                    {opt.cost}
                  </span>
                </div>
                <div>
                  <span
                    className="text-[10px] tracking-wider"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "#666666",
                    }}
                  >
                    EFFECT:{" "}
                  </span>
                  <span
                    className="text-xs"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: opt.color,
                    }}
                  >
                    {opt.effect}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* How to Earn */}
        <h2
          className="text-xs tracking-widest mb-6"
          style={{ fontFamily: "var(--font-serif)", color: "#666666" }}
        >
          ACQUISITION PROTOCOL
        </h2>
        <div
          className="rounded-lg p-8 mb-12"
          style={{ background: "#0a0a14", border: "1px solid #1a1a2e" }}
        >
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <span
                className="text-lg font-bold shrink-0 w-8 text-center"
                style={{ fontFamily: "var(--font-mono)", color: "#ffaa00" }}
              >
                01
              </span>
              <div>
                <p
                  className="text-sm font-bold mb-1"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  ENTER HIBERNATION
                </p>
                <p
                  className="text-xs"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "#999999",
                    lineHeight: 1.7,
                  }}
                >
                  Stake $HOGE in the Hibernation Portal. Minimum lockup: 42
                  days (6 weeks). The Oracle approves of patience.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span
                className="text-lg font-bold shrink-0 w-8 text-center"
                style={{ fontFamily: "var(--font-mono)", color: "#ffaa00" }}
              >
                02
              </span>
              <div>
                <p
                  className="text-sm font-bold mb-1"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  WAIT 7 WEEKS
                </p>
                <p
                  className="text-xs"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "#999999",
                    lineHeight: 1.7,
                  }}
                >
                  $ELIXIR accrues at 1 token per 7 weeks staked. The rate is
                  fixed. There are no shortcuts. The Elixir cannot be rushed.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span
                className="text-lg font-bold shrink-0 w-8 text-center"
                style={{ fontFamily: "var(--font-mono)", color: "#ffaa00" }}
              >
                03
              </span>
              <div>
                <p
                  className="text-sm font-bold mb-1"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  CLAIM &amp; USE
                </p>
                <p
                  className="text-xs"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "#999999",
                    lineHeight: 1.7,
                  }}
                >
                  Claim your $ELIXIR from the Hibernation Portal. Use it
                  immediately or hold for strategic deployment. Once burned, it
                  is gone forever. Choose wisely.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* The Recipe */}
        <h2
          className="text-xs tracking-widest mb-6"
          style={{ fontFamily: "var(--font-serif)", color: "#666666" }}
        >
          ORIGINAL FORMULA &mdash; DECLASSIFIED
        </h2>
        <div
          className="rounded-lg overflow-hidden mb-12"
          style={{ background: "#0a0a14", border: "1px solid #1a1a2e" }}
        >
          <div
            className="grid grid-cols-3 gap-4 px-6 py-3"
            style={{ borderBottom: "1px solid #1a1a2e" }}
          >
            <span
              className="text-[10px] tracking-widest"
              style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
            >
              INGREDIENT
            </span>
            <span
              className="text-[10px] tracking-widest"
              style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
            >
              AMOUNT
            </span>
            <span
              className="text-[10px] tracking-widest"
              style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
            >
              NOTE
            </span>
          </div>
          {RECIPE.map((r) => (
            <div
              key={r.ingredient}
              className="grid grid-cols-3 gap-4 px-6 py-3"
              style={{ borderBottom: "1px solid #1a1a2e" }}
            >
              <span
                className="text-xs"
                style={{ fontFamily: "var(--font-mono)", color: "#ffaa00" }}
              >
                {r.ingredient}
              </span>
              <span
                className="text-xs"
                style={{ fontFamily: "var(--font-mono)", color: "#e8e6e3" }}
              >
                {r.amount}
              </span>
              <span
                className="text-xs"
                style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
              >
                {r.note}
              </span>
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="text-center py-8">
          <span
            className="inline-block text-xs tracking-widest px-6 py-3 rounded"
            style={{
              fontFamily: "var(--font-mono)",
              color: "#ffaa00",
              border: "1px solid rgba(255,170,0,0.3)",
            }}
          >
            $ELIXIR LAUNCH: COMING Q3 2026
          </span>
        </div>

        {/* Disclaimer */}
        <p
          className="text-center text-xs mt-8 max-w-2xl mx-auto leading-relaxed"
          style={{ fontFamily: "var(--font-mono)", color: "#444444" }}
        >
          $ELIXIR is a utility token within the Groundhoge Day ecosystem. It
          has no monetary value outside of the Hibernation staking protocol. The
          original Elixir of Life recipe is provided for entertainment purposes
          only and should not be consumed by humans, groundhogs, or any other
          species. The Division of Immortality Research accepts no liability for
          attempted immortality.
        </p>
      </div>
    </main>
  );
}
