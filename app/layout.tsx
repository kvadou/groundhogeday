import type { Metadata } from "next";
import { Playfair_Display, JetBrains_Mono } from "next/font/google";
import WalletProvider from "@/components/WalletProvider";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://groundhogeday.com"),
  title: "Groundhoge Day ($HOGE) — The World's First Weather-Dependent Deflationary Asset",
  description: "Supply determined annually by one rodent. Shadow burns 6%. No shadow mints 3.9%. The Oracle has spoken.",
  openGraph: {
    title: "Groundhoge Day ($HOGE)",
    description: "The world's first weather-dependent deflationary asset. Supply determined annually by one rodent.",
    siteName: "Groundhoge Day Economic Authority",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Groundhoge Day ($HOGE)",
    description: "The world's first weather-dependent deflationary asset.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
