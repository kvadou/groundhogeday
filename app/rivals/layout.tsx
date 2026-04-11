import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rival Token Intelligence — Groundhoge Day Economic Authority",
  description:
    "Competitive analysis of rival groundhog tokens. Threat level: negligible. $HOGE remains the sole weather-dependent deflationary asset.",
};

export default function RivalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
