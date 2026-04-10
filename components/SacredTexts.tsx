"use client";

import { useState } from "react";
import Link from "next/link";
import { useInView } from "@/hooks/useInView";

type Classification = "TOP SECRET" | "EYES ONLY" | "DECLASSIFIED" | "RESTRICTED";

interface DossierCard {
  title: string;
  classification: Classification;
  paragraphs: (string | string[])[];
}

const classificationColors: Record<Classification, string> = {
  "TOP SECRET": "#ff4444",
  "EYES ONLY": "#ffaa00",
  DECLASSIFIED: "#00ff88",
  RESTRICTED: "#4488ff",
};

const cards: DossierCard[] = [
  {
    title: "THE IMMORTAL ORACLE",
    classification: "TOP SECRET",
    paragraphs: [
      "According to the Punxsutawney Inner Circle, there is only one Phil. Not a lineage. Not a succession. A singular, immortal groundhog who has been delivering weather prophecies since 1887 \u2014 making him over 140 years old.",
      "His longevity is attributed to the \u2018Elixir of Life,\u2019 administered annually at the Groundhog Picnic. The Elixir \u2014 also known as \u2018groundhog punch\u2019 \u2014 is a mixture of vodka, milk, eggs, and orange juice. Each sip reportedly extends his life by seven years.",
      "Average groundhog lifespan in the wild: 6 years. Phil\u2019s claimed lifespan: 140+ years. The Inner Circle does not accept questions on this matter.",
    ],
  },
  {
    title: "THE SACRED LANGUAGE",
    classification: "EYES ONLY",
    paragraphs: [
      "The Oracle does not speak English. He delivers his prophecy in \u2018Groundhogese\u2019 \u2014 a sacred language understood by exactly one human being on Earth: the President of the Inner Circle.",
      "Translation requires physical possession of an ancient acacia wood cane, handed down through generations of Inner Circle presidents. Without the cane, Groundhogese is indistinguishable from standard rodent squeaking.",
      "The Inner Circle maintains a 100% accuracy rate for Phil\u2019s predictions. When meteorological data contradicts the forecast, the official position is that the president mistranslated the Groundhogese. The Oracle is never wrong. Only the interpreter fails.",
    ],
  },
  {
    title: "THE GERMAN CODEX",
    classification: "DECLASSIFIED",
    paragraphs: [
      "The tradition did not begin with a groundhog. In medieval Germany, February 2 was \u2018Badger Day\u2019 (Dachstag). If a badger emerged and cast a shadow in the sunlight, four more weeks of winter were predicted.",
      "Before the badger, the original weather-predicting animal was the bear. When bears grew scarce in settled Germany, the folklore shifted to badgers. When German immigrants arrived in Pennsylvania and found no badgers, they substituted the local groundhog \u2014 and increased the penalty from four weeks of winter to six.",
      "The date itself traces to the Christian festival of Candlemas. In Ireland and Scotland, the weather predictor on February 1 (Brigid\u2019s Day) was a hedgehog or a snake. In Croatia and Serbia, a bear wakes on February 2 \u2014 and if scared by its shadow, returns to sleep for 40 days.",
    ],
  },
  {
    title: "THE 1943 INCIDENT",
    classification: "RESTRICTED",
    paragraphs: [
      "In the entire recorded history of Groundhog Day \u2014 spanning from 1887 to the present \u2014 the ceremony has been canceled exactly once: 1943.",
      "The official record states: \u2018War clouds have blacked out parts of the shadow.\u2019 The Oracle sensed global conflict and suspended meteorological operations for the duration of hostilities.",
      "The war ended two years later. The Inner Circle has not confirmed whether this was a coincidence.",
    ],
  },
  {
    title: "THE DISPUTED HEIRS",
    classification: "TOP SECRET",
    paragraphs: [
      "In March 2024, the Inner Circle was stunned to discover that the immortal Oracle had produced offspring. Two baby groundhogs were born to Phil and his mate Phyllis \u2014 an event handlers assumed impossible in captivity.",
      "The Inner Circle moved swiftly. The babies were formally disowned and permanently barred from inheriting their father\u2019s weather-predicting title. The succession crisis was resolved in under 48 hours.",
      "Phil, Phyllis, and the disputed heirs have been relocated permanently to Gobbler\u2019s Knob. The Inner Circle has issued no further comment on the matter.",
    ],
  },
  {
    title: "THE FALSE PROPHETS",
    classification: "DECLASSIFIED",
    paragraphs: [
      "The Inner Circle recognizes only one true Oracle. All other weather-predicting animals are classified as \u2018impostors.\u2019 Their track record confirms the designation:",
      [
        "STATEN ISLAND CHUCK (New York) \u2014 Bit Mayor Bloomberg in 2009. Mayor de Blasio later dropped Chuck\u2019s daughter Charlotte during a ceremony. Charlotte died one week later. De Blasio refused to participate in subsequent events.",
        "CHUCKLES (Connecticut) \u2014 Predicted early spring in 2024. A massive winter storm arrived immediately. Local police issued an arrest warrant for \u2018Chuck the Liar.\u2019 Chuckles turned himself in and was released for community service.",
        "BUFFALO BERT (New York) \u2014 Engineered to always see his shadow. Claims 100% accuracy. The system is rigged. This is not disputed.",
        "POTOMAC PHIL (Washington D.C.) \u2014 A taxidermied, deceased groundhog who annually predicts six more months of \u2018political gridlock.\u2019 Has been formally accused of collusion.",
        "CONCORD CASIMIR (Ohio) \u2014 A weather-predicting cat. Delivers forecasts based on how he eats pierogies.",
        "STUMPTOWN FIL (Oregon) \u2014 A beaver. Predictions based on treat selection.",
      ],
    ],
  },
];

export default function SacredTexts() {
  const [ref, isInView] = useInView();
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggle = (index: number) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section
      ref={ref}
      id="sacred-texts"
      className={`py-24 max-w-6xl mx-auto px-6 fade-in-section ${isInView ? "is-visible" : ""}`}
    >
      {/* Section header */}
      <div className="text-center mb-16">
        <h2
          className="text-3xl md:text-4xl tracking-widest uppercase mb-4"
          style={{ fontFamily: "var(--font-serif)", color: "#e8e6e3" }}
        >
          The Sacred Texts
        </h2>
        <p
          className="text-xs tracking-widest uppercase"
          style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
        >
          Bureau of Historical Research &mdash; Classified Archives
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, i) => {
          const isOpen = !!expanded[i];
          const color = classificationColors[card.classification];

          return (
            <div
              key={i}
              className="relative rounded-lg p-6 transition-all duration-300"
              style={{
                border: `1px solid ${isOpen ? "rgba(255,170,0,0.4)" : "#1a1a2e"}`,
                background: "rgba(255,255,255,0.02)",
              }}
              onMouseEnter={(e) => {
                if (!isOpen) {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,170,0,0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isOpen) {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#1a1a2e";
                }
              }}
            >
              {/* Classification stamp */}
              <span
                className="absolute top-4 right-4 text-[10px] tracking-widest uppercase px-2 py-1 rounded"
                style={{
                  fontFamily: "var(--font-mono)",
                  color,
                  border: `1px solid ${color}`,
                  background: "rgba(0,0,0,0.4)",
                }}
              >
                {card.classification}
              </span>

              {/* Title */}
              <h3
                className="text-lg md:text-xl mb-4 pr-28"
                style={{ fontFamily: "var(--font-serif)", color: "#e8e6e3" }}
              >
                {card.title}
              </h3>

              {/* Body */}
              <div
                className="relative"
                style={{
                  maxHeight: isOpen ? "none" : "4.8em",
                  overflow: "hidden",
                }}
              >
                {card.paragraphs.map((p, j) => {
                  if (Array.isArray(p)) {
                    return (
                      <ul key={j} className="mt-3 space-y-3 pl-4">
                        {p.map((item, k) => (
                          <li
                            key={k}
                            className="text-sm leading-relaxed list-disc"
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: "#999999",
                            }}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p
                      key={j}
                      className="text-sm leading-relaxed mb-3"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "#999999",
                      }}
                    >
                      {p}
                    </p>
                  );
                })}

                {/* Fade overlay when collapsed */}
                {!isOpen && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-12"
                    style={{
                      background: "linear-gradient(transparent, rgba(10,10,15,0.95))",
                    }}
                  />
                )}
              </div>

              {/* Expand / collapse button */}
              <button
                onClick={() => toggle(i)}
                className="mt-4 text-xs tracking-widest uppercase px-4 py-2 rounded transition-colors duration-200"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "#ffaa00",
                  border: "1px solid rgba(255,170,0,0.3)",
                  background: "transparent",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,170,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                {isOpen ? "Seal Dossier" : "Expand Dossier"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Full Dossier Link */}
      <div className="mt-12 text-center">
        <Link
          href="/legends"
          className="inline-block text-xs tracking-widest uppercase px-6 py-3 rounded transition-colors duration-200"
          style={{
            fontFamily: "var(--font-mono)",
            color: "#ffaa00",
            border: "1px solid rgba(255,170,0,0.3)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,170,0,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
          }}
        >
          ACCESS FULL DOSSIER &rarr;
        </Link>
      </div>
    </section>
  );
}
