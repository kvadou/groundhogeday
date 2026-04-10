import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shareable Cards — Groundhoge Day Economic Authority",
  description:
    "Screenshot-ready infographic cards for social media. The Oracle's data, formatted for maximum engagement.",
};

export default function CardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
