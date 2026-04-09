import TickerBar from "@/components/TickerBar";
import Hero from "@/components/Hero";
import Prophecy from "@/components/Prophecy";
import OracleTerminal from "@/components/OracleTerminal";
import ChainStats from "@/components/ChainStats";
import SwapPanel from "@/components/SwapPanel";
import Community from "@/components/Community";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <TickerBar />
      <Hero />
      <Prophecy />
      <OracleTerminal />
      <ChainStats />
      <SwapPanel />
      <Community />
      <Footer />
    </>
  );
}
