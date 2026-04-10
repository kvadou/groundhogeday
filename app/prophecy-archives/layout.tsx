import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Prophecy Archives — Groundhoge Day Economic Authority",
  description:
    "Official dispatches, decrees, and bulletins from the Groundhoge Day Economic Authority. For public distribution.",
};

export default function ProphecyArchivesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
