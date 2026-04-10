import Hero from "@/components/Hero";
import Prophecy from "@/components/Prophecy";
import OracleTerminal from "@/components/OracleTerminal";
import SacredTexts from "@/components/SacredTexts";
import AccuracyReport from "@/components/AccuracyReport";
import CulturalAffairs from "@/components/CulturalAffairs";
import BiologicalResearch from "@/components/BiologicalResearch";
import ChainStats from "@/components/ChainStats";
import SwapPanel from "@/components/SwapPanel";
import Community from "@/components/Community";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <Prophecy />
      <OracleTerminal />
      <SacredTexts />
      <AccuracyReport />
      <CulturalAffairs />
      <BiologicalResearch />
      <ChainStats />
      <SwapPanel />
      <Community />
      <Footer />
    </>
  );
}
