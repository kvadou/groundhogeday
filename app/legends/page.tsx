import type { Metadata } from "next";
import LegendsContent from "./LegendsContent";

export const metadata: Metadata = {
  title: "Legends & Lore — Groundhoge Day Economic Authority",
  description:
    "The complete dossier on groundhog prophecy traditions, from medieval German Badger Day to the immortal Oracle of Gobbler's Knob.",
};

export default function LegendsPage() {
  return <LegendsContent />;
}
