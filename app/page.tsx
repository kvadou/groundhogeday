import Hero from "@/components/Hero";
import Prophecy from "@/components/Prophecy";
import OracleTerminal from "@/components/OracleTerminal";
import LoreTeaser from "@/components/LoreTeaser";
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
      <LoreTeaser />
      <ChainStats />
      <SwapPanel />
      <Community />
      <Footer />
    </>
  );
}
