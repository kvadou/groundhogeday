import type { Metadata } from "next";
import PredictContent from "./PredictContent";

export const metadata: Metadata = {
  title: "Shadow Futures — Groundhoge Day Prediction Market",
  description:
    "Shadow vs No Shadow prediction market data. Historical odds, supply impact analysis, and upcoming on-chain prediction pools for the 2027 ceremony.",
};

export default function PredictPage() {
  return <PredictContent />;
}
