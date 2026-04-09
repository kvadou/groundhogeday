"use client";

import { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const TARGET_DATE = new Date("2027-02-02T07:25:00-05:00");

function calculateTimeLeft(): TimeLeft | null {
  const now = new Date();
  const diff = TARGET_DATE.getTime() - now.getTime();

  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownClock() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null | "loading">(
    "loading"
  );

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (timeLeft === "loading") {
    return (
      <div
        className="flex items-center gap-2 md:gap-4"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {["DAYS", "HOURS", "MINUTES", "SECONDS"].map((label, i) => (
          <div key={label} className="flex items-center gap-2 md:gap-4">
            {i > 0 && (
              <span className="text-2xl md:text-4xl lg:text-6xl" style={{ color: "#666666" }}>
                :
              </span>
            )}
            <div className="flex flex-col items-center">
              <span
                className="text-4xl md:text-6xl lg:text-8xl font-bold"
                style={{
                  color: "#00ff88",
                  textShadow: "0 0 30px rgba(0,255,136,0.3)",
                }}
              >
                --
              </span>
              <span
                className="text-[10px] md:text-xs tracking-widest mt-1"
                style={{ color: "#666666" }}
              >
                {label}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (timeLeft === null) {
    return (
      <div
        className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-wider text-center"
        style={{
          fontFamily: "var(--font-serif)",
          color: "#00ff88",
          textShadow: "0 0 30px rgba(0,255,136,0.3)",
        }}
      >
        THE ORACLE HAS EMERGED
      </div>
    );
  }

  const segments: { value: number; label: string }[] = [
    { value: timeLeft.days, label: "DAYS" },
    { value: timeLeft.hours, label: "HOURS" },
    { value: timeLeft.minutes, label: "MINUTES" },
    { value: timeLeft.seconds, label: "SECONDS" },
  ];

  return (
    <div
      className="flex items-center gap-2 md:gap-4"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {segments.map((seg, i) => (
        <div key={seg.label} className="flex items-center gap-2 md:gap-4">
          {i > 0 && (
            <span
              className="text-2xl md:text-4xl lg:text-6xl font-light"
              style={{ color: "#666666" }}
            >
              :
            </span>
          )}
          <div className="flex flex-col items-center">
            <span
              className={`text-4xl md:text-6xl lg:text-8xl font-bold tabular-nums ${
                seg.label === "SECONDS" ? "animate-pulse-subtle" : ""
              }`}
              style={{
                color: "#00ff88",
                textShadow: "0 0 30px rgba(0,255,136,0.3)",
              }}
            >
              {String(seg.value).padStart(seg.label === "DAYS" ? 3 : 2, "0")}
            </span>
            <span
              className="text-[10px] md:text-xs tracking-widest mt-1"
              style={{ color: "#666666" }}
            >
              {seg.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
