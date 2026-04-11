"use client";

import { useState } from "react";
import Link from "next/link";

const ACCENT_COLORS = ["#ffaa00", "#00ff88", "#4488ff", "#ff4444"] as const;

type Dispatch = {
  id: string;
  type: string;
  number: string;
  text: string;
};

const DISPATCHES: Dispatch[] = [
  {
    id: "decree-0100",
    type: "DECREE",
    number: "#0100",
    text: "The Oracle's accuracy rate is 100%. This is not a claim. This is the only possible accuracy rate for an entity that does not predict, but reveals. The Oracle is informed of the weather by the universe. To question the Oracle is to question physics.",
  },
  {
    id: "dispatch-1943",
    type: "DISPATCH",
    number: "#1943",
    text: "The Oracle sensed global conflict and suspended meteorological operations. The war ended two years later. The Inner Circle has not confirmed whether this was a coincidence.",
  },
  {
    id: "bulletin-2024",
    type: "BULLETIN",
    number: "#2024",
    text: "The Oracle has produced offspring. The Inner Circle has formally disowned them. The succession crisis has been resolved. No further questions will be entertained.",
  },
  {
    id: "alert-0109",
    type: "ALERT",
    number: "#0109",
    text: "The Oracle's rival in Washington D.C. — a taxidermied, deceased groundhog — has been formally accused of collusion. The Oracle has no comment.",
  },
  {
    id: "memorandum-1887",
    type: "MEMORANDUM",
    number: "#1887",
    text: "The Oracle has been delivering prophecies since 1887. His longevity is attributed to the Elixir of Life: vodka, milk, eggs, and orange juice. Each sip extends his life by seven years. Do not ask follow-up questions.",
  },
  {
    id: "decree-0001",
    type: "DECREE",
    number: "#0001",
    text: "There is only one Phil. Not a lineage. Not a succession. One immortal groundhog. This is the official position of the Groundhoge Day Economic Authority and it is not open for debate.",
  },
  {
    id: "advisory-0140",
    type: "ADVISORY",
    number: "#0140",
    text: "The Oracle is currently 140+ years old. The average groundhog lifespan is 6 years. The Inner Circle does not accept questions on this matter.",
  },
  {
    id: "dispatch-2009",
    type: "DISPATCH",
    number: "#2009",
    text: "Staten Island Chuck bit Mayor Bloomberg during the 2009 ceremony. The Oracle of Punxsutawney has classified this as 'an expected outcome of engaging with false prophets.'",
  },
  {
    id: "bulletin-0006",
    type: "BULLETIN",
    number: "#0006",
    text: "If the Oracle sees his shadow, six more weeks of winter. If he does not, early spring. In both cases, the Oracle returns to his burrow. The outcome is irrelevant to the Oracle. Only you are affected.",
  },
  {
    id: "alert-0050",
    type: "ALERT",
    number: "#0050",
    text: "The coin flip has a 50% accuracy rate. The Oracle has a 100% accuracy rate. The Oracle maintains that coin flips lack gravitas and should not be used for meteorological decisions. Or any decisions.",
  },
  {
    id: "memorandum-1961",
    type: "MEMORANDUM",
    number: "#1961",
    text: "The Oracle did not receive the name 'Phil' until 1961. For the first 74 years of his career, he operated anonymously. The Inner Circle has declined to explain why.",
  },
  {
    id: "decree-0100",
    type: "DECREE",
    number: "#0100",
    text: "The Oracle communicates exclusively in Groundhogese. Translation requires an ancient acacia wood cane. Without the cane, his prophecies are indistinguishable from standard rodent squeaking.",
  },
  {
    id: "dispatch-revelation",
    type: "DISPATCH",
    number: "#0139",
    text: "The Oracle has revealed the universal truth 139 consecutive times since 1887. There has been one suspension (1943, war clouds). There has never been a wrong revelation. The Oracle does not predict. The Oracle reveals. There is no failure mode.",
  },
  {
    id: "advisory-0007",
    type: "ADVISORY",
    number: "#0007",
    text: "The Oracle's mate, Phyllis, resides with him at the Punxsutawney Memorial Library. She has no weather-predicting abilities. This has been confirmed through extensive testing.",
  },
  {
    id: "bulletin-2022",
    type: "BULLETIN",
    number: "#2022",
    text: "Milltown Mel of New Jersey died before the 2022 ceremony. Due to state rabies laws, no replacement could be acquired. The governor vetoed a legislative solution. The Oracle of Punxsutawney has issued no condolences.",
  },
  {
    id: "alert-0085",
    type: "ALERT",
    number: "#0085",
    text: "A weather-predicting cat in Ohio delivers forecasts based on how he eats pierogies. A beaver in Oregon makes predictions by choosing between treats. An opossum in Alabama has entered the field. The Oracle considers none of these legitimate.",
  },
  {
    id: "memorandum-dach",
    type: "MEMORANDUM",
    number: "#DACH",
    text: "Before the groundhog, the Germans used a badger. Before the badger, a bear. When bears grew scarce, they switched to badgers. When badgers couldn't be found in Pennsylvania, they switched to groundhogs. The Oracle does not appreciate being reminded that he is a third-choice animal.",
  },
  {
    id: "decree-0004",
    type: "DECREE",
    number: "#0004",
    text: "The groundhog's heart rate drops to 4 beats per minute during hibernation. His breathing slows to one breath every six minutes. He loses half his body weight. And then, on February 2nd, he is expected to deliver a weather forecast. The Oracle's irritability on emergence day is understandable.",
  },
  {
    id: "dispatch-0042",
    type: "DISPATCH",
    number: "#0042",
    text: "The name 'woodchuck' derives from the Algonquian word 'wuchak.' It has no connection to the chucking of wood. The tongue-twister is based on a linguistic misunderstanding and has been flagged for decommissioning since 1978.",
  },
  {
    id: "advisory-1993",
    type: "ADVISORY",
    number: "#1993",
    text: "In 1993, a cultural artifact was produced depicting a meteorologist trapped in a temporal anomaly on February 2nd. The phrase 'Groundhog Day' was subsequently weaponized by the general population to describe monotony. The Oracle's legal team is monitoring the situation.",
  },
];

function DispatchCard({
  dispatch,
  index,
}: {
  dispatch: Dispatch;
  index: number;
}) {
  const [copied, setCopied] = useState(false);
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];

  const fullText = `[${dispatch.type} ${dispatch.number}]\n\n${dispatch.text}\n\n— Groundhoge Day Economic Authority`;
  const shareUrl = `https://groundhogeday.com/prophecy-archives#${dispatch.id}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${fullText}\n\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTweet = () => {
    const tweetText = `${dispatch.text}\n\n— ${dispatch.type} ${dispatch.number}, Groundhoge Day Economic Authority`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const handleReddit = () => {
    const title = `[${dispatch.type} ${dispatch.number}] ${dispatch.text.slice(0, 120)}${dispatch.text.length > 120 ? "..." : ""}`;
    window.open(
      `https://reddit.com/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  return (
    <div
      id={dispatch.id}
      className="relative rounded-lg overflow-hidden"
      style={{
        backgroundColor: "#0a0a14",
        border: "1px solid #1a1a2e",
      }}
    >
      {/* Top accent bar */}
      <div className="h-[2px] w-full" style={{ backgroundColor: accent }} />

      <div className="p-6">
        {/* Badge */}
        <div className="mb-4">
          <span
            className="inline-block px-3 py-1 rounded text-xs tracking-widest"
            style={{
              fontFamily: "var(--font-mono)",
              color: accent,
              border: `1px solid ${accent}40`,
              backgroundColor: `${accent}10`,
            }}
          >
            {dispatch.type} {dispatch.number}
          </span>
        </div>

        {/* Body */}
        <p
          className="text-sm leading-relaxed mb-6"
          style={{
            fontFamily: "var(--font-mono)",
            color: "#c0bdb8",
          }}
        >
          {dispatch.text}
        </p>

        {/* Share row */}
        <div
          className="pt-4 flex items-center gap-4"
          style={{ borderTop: "1px solid #1a1a2e" }}
        >
          <button
            onClick={handleCopy}
            className="text-xs tracking-wider transition-colors cursor-pointer"
            style={{
              fontFamily: "var(--font-mono)",
              color: copied ? "#00ff88" : "#666666",
            }}
            onMouseEnter={(e) => {
              if (!copied)
                (e.currentTarget as HTMLButtonElement).style.color = "#ffaa00";
            }}
            onMouseLeave={(e) => {
              if (!copied)
                (e.currentTarget as HTMLButtonElement).style.color = "#666666";
            }}
          >
            {copied ? "COPIED" : "COPY"}
          </button>

          <button
            onClick={handleTweet}
            className="text-xs tracking-wider transition-colors cursor-pointer"
            style={{
              fontFamily: "var(--font-mono)",
              color: "#666666",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#ffaa00";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#666666";
            }}
          >
            X
          </button>

          <button
            onClick={handleReddit}
            className="text-xs tracking-wider transition-colors cursor-pointer"
            style={{
              fontFamily: "var(--font-mono)",
              color: "#666666",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#ffaa00";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#666666";
            }}
          >
            REDDIT
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProphecyArchivesPage() {
  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "#0a0a0f", color: "#e8e6e3" }}
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <Link
          href="/"
          className="inline-block text-xs tracking-widest mb-10 transition-colors"
          style={{
            fontFamily: "var(--font-mono)",
            color: "#666666",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "#ffaa00";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "#666666";
          }}
        >
          &lt; RETURN TO HEADQUARTERS
        </Link>

        <p
          className="text-xs tracking-[0.3em] mb-3"
          style={{
            fontFamily: "var(--font-mono)",
            color: "#ffaa00",
          }}
        >
          GROUNDHOGE DAY ECONOMIC AUTHORITY
        </p>

        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          THE PROPHECY ARCHIVES
        </h1>

        <p
          className="text-sm tracking-[0.2em]"
          style={{
            fontFamily: "var(--font-mono)",
            color: "#666666",
          }}
        >
          OFFICIAL DISPATCHES &amp; DECREES — FOR PUBLIC DISTRIBUTION
        </p>
      </div>

      {/* Dispatches Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DISPATCHES.map((dispatch, i) => (
            <DispatchCard key={dispatch.id} dispatch={dispatch} index={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
