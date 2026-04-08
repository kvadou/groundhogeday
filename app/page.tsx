import TickerBar from "@/components/TickerBar";

export default function Home() {
  return (
    <>
      <TickerBar />
      <div className="flex flex-col flex-1 items-center justify-center min-h-screen pt-7">
        <h1 className="text-5xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>
          GROUNDHOGE DAY
        </h1>
      </div>
    </>
  );
}
