export type Prediction = {
  year: number;
  shadow: boolean | null; // null for 1943 (no ceremony)
  accuracy: "correct" | "incorrect" | "pending" | "no-record";
};

const noShadowYears = new Set([
  1902, 1934, 1942, 1950, 1970, 1975, 1983, 1986, 1988, 1990, 1995, 1997,
  1999, 2007, 2011, 2013, 2016, 2019, 2020, 2024, 2025,
]);

// Known accuracy for recent years (based on actual weather verification)
const knownAccuracy: Record<number, "correct" | "incorrect"> = {
  2015: "incorrect",
  2016: "correct",
  2017: "incorrect",
  2018: "incorrect",
  2019: "incorrect",
  2020: "correct",
  2021: "incorrect",
  2022: "incorrect",
  2023: "incorrect",
  2024: "correct",
  2025: "incorrect",
};

function buildPredictions(): Prediction[] {
  const predictions: Prediction[] = [];

  for (let year = 1887; year <= 2026; year++) {
    if (year === 1943) {
      predictions.push({ year, shadow: null, accuracy: "no-record" });
      continue;
    }

    if (year === 2026) {
      predictions.push({ year, shadow: true, accuracy: "pending" });
      continue;
    }

    const shadow = !noShadowYears.has(year);
    const accuracy = knownAccuracy[year] ?? "no-record";
    predictions.push({ year, shadow, accuracy });
  }

  return predictions;
}

export const predictions: Prediction[] = buildPredictions();

export function getMarketImpact(shadow: boolean | null): string {
  if (shadow === null) return "NO CEREMONY \u2014 WAR CLOUDS";
  if (shadow) return "WOULD HAVE BURNED 6%";
  return "WOULD HAVE MINTED 3.9%";
}
