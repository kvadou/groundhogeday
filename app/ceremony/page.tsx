"use client";

import { useState, useCallback } from "react";

type CeremonyResult = {
  success: boolean;
  action: string;
  description: string;
  signature: string;
  supplyBefore: number;
  supplyAfter: number;
  explorerUrl: string;
};

// Groundhog Day live streams — updated each year
const LIVE_FEEDS = [
  {
    label: "Official Punxsutawney Phil Stream",
    // Replace with the actual live stream ID each year
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCFMnMk0bNoA7FWZGmOlauSg",
  },
  {
    label: "Weather Channel Coverage",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UC7yvTfntUwOhMKrUBJGmB2A",
  },
];

export default function CeremonyPage() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [phase, setPhase] = useState<"watch" | "confirm" | "executing" | "done">("watch");
  const [selectedAction, setSelectedAction] = useState<"shadow" | "no-shadow" | null>(null);
  const [result, setResult] = useState<CeremonyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFeed, setActiveFeed] = useState(0);

  const handleAuth = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (secret.trim()) setAuthenticated(true);
  }, [secret]);

  const handleSelect = useCallback((action: "shadow" | "no-shadow") => {
    setSelectedAction(action);
    setPhase("confirm");
    setError(null);
  }, []);

  const handleCancel = useCallback(() => {
    setSelectedAction(null);
    setPhase("watch");
  }, []);

  const handleExecute = useCallback(async () => {
    if (!selectedAction) return;
    setPhase("executing");
    setError(null);

    try {
      const res = await fetch("/api/ceremony", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: selectedAction, secret }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ceremony failed");
        setPhase("confirm");
        return;
      }

      setResult(data);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setPhase("confirm");
    }
  }, [selectedAction, secret]);

  // ── Auth Gate ──────────────────────────────────────────────────────

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <form onSubmit={handleAuth} className="text-center space-y-6 max-w-md px-6">
          <div className="text-6xl mb-4">🦫</div>
          <h1 className="font-[family-name:var(--font-serif)] text-3xl font-bold" style={{ color: "var(--amber)" }}>
            Shadow Ceremony
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Authorized personnel only. Enter ceremony access code.
          </p>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Ceremony access code"
            className="w-full px-4 py-3 rounded-lg text-center font-[family-name:var(--font-mono)] text-lg"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--card-border)",
              color: "var(--text)",
            }}
            autoFocus
          />
          <button
            type="submit"
            className="w-full py-3 rounded-lg font-bold text-lg transition-all hover:scale-[1.02]"
            style={{ background: "var(--amber)", color: "var(--bg)" }}
          >
            Enter Ceremony Chamber
          </button>
        </form>
      </div>
    );
  }

  // ── Ceremony Complete ─────────────────────────────────────────────

  if (phase === "done" && result) {
    const isShadow = result.action === "shadow";
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-center space-y-8 max-w-lg px-6">
          <div className="text-8xl">{isShadow ? "🌑" : "☀️"}</div>
          <h1
            className="font-[family-name:var(--font-serif)] text-4xl font-bold"
            style={{ color: isShadow ? "#ff4444" : "var(--green)" }}
          >
            {isShadow ? "THE ORACLE SEES HIS SHADOW" : "NO SHADOW — EARLY SPRING!"}
          </h1>
          <p className="text-xl" style={{ color: "var(--text)" }}>{result.description}</p>

          <div
            className="rounded-xl p-6 space-y-3 text-left font-[family-name:var(--font-mono)] text-sm"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--card-border)" }}
          >
            <div className="flex justify-between">
              <span style={{ color: "var(--muted)" }}>Supply Before</span>
              <span>{result.supplyBefore.toLocaleString()} $HOGE</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--muted)" }}>Supply After</span>
              <span style={{ color: isShadow ? "#ff4444" : "var(--green)" }}>
                {result.supplyAfter.toLocaleString()} $HOGE
              </span>
            </div>
            <div className="pt-3" style={{ borderTop: "1px solid var(--card-border)" }}>
              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
                style={{ color: "var(--blue)" }}
              >
                View on Solana Explorer →
              </a>
            </div>
          </div>

          <p className="text-xs" style={{ color: "var(--muted)" }}>
            The Oracle has spoken. This transaction is immutable and recorded on-chain.
          </p>
        </div>
      </div>
    );
  }

  // ── Live Ceremony View ────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <header className="p-4 text-center" style={{ borderBottom: "1px solid var(--card-border)" }}>
        <h1 className="font-[family-name:var(--font-serif)] text-2xl font-bold" style={{ color: "var(--amber)" }}>
          🦫 Shadow Ceremony — LIVE
        </h1>
        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
          Watch the ceremony, then make your determination
        </p>
      </header>

      {/* Live Feed */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Video Panel */}
        <div className="flex-1 flex flex-col">
          {/* Feed selector */}
          <div className="flex gap-2 p-3" style={{ borderBottom: "1px solid var(--card-border)" }}>
            {LIVE_FEEDS.map((feed, i) => (
              <button
                key={i}
                onClick={() => setActiveFeed(i)}
                className="px-3 py-1.5 rounded text-xs font-[family-name:var(--font-mono)] transition-all"
                style={{
                  background: activeFeed === i ? "var(--amber)" : "rgba(255,255,255,0.05)",
                  color: activeFeed === i ? "var(--bg)" : "var(--muted)",
                  border: "1px solid var(--card-border)",
                }}
              >
                {feed.label}
              </button>
            ))}
            <input
              type="text"
              placeholder="Paste YouTube URL..."
              className="flex-1 px-3 py-1.5 rounded text-xs font-[family-name:var(--font-mono)]"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--card-border)",
                color: "var(--text)",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const url = (e.target as HTMLInputElement).value;
                  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
                  if (match) {
                    LIVE_FEEDS.push({
                      label: "Custom Stream",
                      embedUrl: `https://www.youtube.com/embed/${match[1]}?autoplay=1`,
                    });
                    setActiveFeed(LIVE_FEEDS.length - 1);
                    (e.target as HTMLInputElement).value = "";
                  }
                }
              }}
            />
          </div>

          {/* Embed */}
          <div className="flex-1 relative min-h-[300px] lg:min-h-0">
            <iframe
              src={LIVE_FEEDS[activeFeed].embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* Control Panel */}
        <div
          className="lg:w-[400px] p-6 flex flex-col items-center justify-center gap-6"
          style={{ borderLeft: "1px solid var(--card-border)" }}
        >
          {phase === "watch" && (
            <>
              <p
                className="text-center text-sm font-[family-name:var(--font-mono)]"
                style={{ color: "var(--muted)" }}
              >
                What does the Oracle see?
              </p>

              {/* SHADOW Button */}
              <button
                onClick={() => handleSelect("shadow")}
                className="w-full py-6 rounded-xl text-2xl font-[family-name:var(--font-serif)] font-bold transition-all hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #1a0000 0%, #330000 100%)",
                  border: "2px solid #ff4444",
                  color: "#ff4444",
                  boxShadow: "0 0 30px rgba(255,68,68,0.15)",
                }}
              >
                🌑 SHADOW
                <div className="text-xs mt-1 font-normal font-[family-name:var(--font-mono)]" style={{ color: "#ff8888" }}>
                  6% supply burn — 6 more weeks of winter
                </div>
              </button>

              {/* NO SHADOW Button */}
              <button
                onClick={() => handleSelect("no-shadow")}
                className="w-full py-6 rounded-xl text-2xl font-[family-name:var(--font-serif)] font-bold transition-all hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #001a00 0%, #003300 100%)",
                  border: "2px solid var(--green)",
                  color: "var(--green)",
                  boxShadow: "0 0 30px rgba(0,255,136,0.15)",
                }}
              >
                ☀️ NO SHADOW
                <div className="text-xs mt-1 font-normal font-[family-name:var(--font-mono)]" style={{ color: "#88ffbb" }}>
                  3.9% supply mint — early spring!
                </div>
              </button>
            </>
          )}

          {phase === "confirm" && selectedAction && (
            <div className="text-center space-y-6 w-full">
              <div className="text-6xl">{selectedAction === "shadow" ? "🌑" : "☀️"}</div>
              <h2
                className="font-[family-name:var(--font-serif)] text-2xl font-bold"
                style={{ color: selectedAction === "shadow" ? "#ff4444" : "var(--green)" }}
              >
                Confirm: {selectedAction === "shadow" ? "SHADOW (6% Burn)" : "NO SHADOW (3.9% Mint)"}
              </h2>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                This will execute an irreversible on-chain transaction.
                <br />
                The Oracle's word is final.
              </p>

              {error && (
                <div
                  className="p-3 rounded-lg text-sm font-[family-name:var(--font-mono)]"
                  style={{ background: "rgba(255,0,0,0.1)", border: "1px solid #ff4444", color: "#ff4444" }}
                >
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 rounded-lg font-bold transition-all hover:scale-[1.02]"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--card-border)",
                    color: "var(--muted)",
                  }}
                >
                  Go Back
                </button>
                <button
                  onClick={handleExecute}
                  className="flex-1 py-3 rounded-lg font-bold transition-all hover:scale-[1.02]"
                  style={{
                    background: selectedAction === "shadow" ? "#ff4444" : "var(--green)",
                    color: "var(--bg)",
                  }}
                >
                  Execute Ceremony
                </button>
              </div>
            </div>
          )}

          {phase === "executing" && (
            <div className="text-center space-y-4">
              <div className="text-6xl animate-pulse-subtle">🦫</div>
              <h2 className="font-[family-name:var(--font-serif)] text-xl font-bold" style={{ color: "var(--amber)" }}>
                The Oracle is deliberating...
              </h2>
              <p className="text-xs font-[family-name:var(--font-mono)]" style={{ color: "var(--muted)" }}>
                Submitting transaction to Solana devnet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
