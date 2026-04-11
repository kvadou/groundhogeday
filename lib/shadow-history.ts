export type Prediction = {
  year: number;
  shadow: boolean | null; // null for 1943 (suspended)
  status: "revealed" | "pending" | "suspended";
};

const noShadowYears = new Set([
  1902, 1934, 1942, 1950, 1970, 1975, 1983, 1986, 1988, 1990, 1995, 1997,
  1999, 2007, 2011, 2013, 2016, 2019, 2020, 2024, 2025,
]);

function buildPredictions(): Prediction[] {
  const predictions: Prediction[] = [];

  for (let year = 1887; year <= 2026; year++) {
    if (year === 1943) {
      predictions.push({ year, shadow: null, status: "suspended" });
      continue;
    }

    if (year === 2026) {
      predictions.push({ year, shadow: true, status: "pending" });
      continue;
    }

    const shadow = !noShadowYears.has(year);
    predictions.push({ year, shadow, status: "revealed" });
  }

  return predictions;
}

export const predictions: Prediction[] = buildPredictions();

export function getSupplyEvent(shadow: boolean | null): string {
  if (shadow === null) return "CEREMONY SUSPENDED";
  if (shadow) return "SUPPLY \u22126.00%";
  return "SUPPLY +3.90%";
}

// Legacy alias for backwards compatibility
export const getMarketImpact = getSupplyEvent;
