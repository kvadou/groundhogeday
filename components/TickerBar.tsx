"use client";

import WalletButton from "./WalletButton";

export default function TickerBar() {
  const lastEmergence = new Date("2026-02-02");
  const now = new Date();
  const daysInBurrow = Math.floor(
    (now.getTime() - lastEmergence.getTime()) / (1000 * 60 * 60 * 24)
  );

  const content = `$HOGE 0.000000 ▲ 0.00%  ·  SHADOW PROBABILITY: 61%  ·  DAYS IN BURROW: ${daysInBurrow}  ·  ELIXIR RESERVES: CLASSIFIED  ·  ORACLE STATUS: HIBERNATING  ·  INNER CIRCLE ALERT: NONE`;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center"
      style={{
        height: 36,
        background: "#0a0a0f",
        borderBottom: "1px solid #1a1a2e",
        fontFamily: "var(--font-mono)",
      }}
    >
      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden h-full">
        <div className="ticker-track flex items-center h-full whitespace-nowrap text-xs" style={{ color: "#ffaa00" }}>
          <span className="px-4">{content}</span>
          <span className="px-4">{content}</span>
        </div>
      </div>

      {/* Wallet button — right side */}
      <div className="flex-shrink-0 px-3">
        <WalletButton />
      </div>

      <style jsx>{`
        .ticker-track {
          animation: ticker-scroll 30s linear infinite;
          width: max-content;
        }
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
