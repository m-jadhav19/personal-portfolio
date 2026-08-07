import type { Metadata, Viewport } from "next";
import { Honk, Open_Sans, Orbitron, Share_Tech_Mono } from "next/font/google";

import "@/styles/globals.css";

import { portfolio } from "@/content/portfolio";
import { Providers } from "@/components/Providers";

/** Futuristic geometric display — marquee, headings, hero type */
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-orbitron",
  display: "swap",
});

/** Digital numeric mono — UI, labels, ascii field, body copy */
const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-share-tech-mono",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-open-sans",
  display: "swap",
});

/** Funky display face for the PIMPMYRIDE (MySpace) easter egg only. */
const honk = Honk({
  subsets: ["latin"],
  weight: "variable",
  axes: ["MORF", "SHLN"],
  variable: "--font-honk",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const viewport: Viewport = {
  themeColor: "#0e0e0e",
};

export const metadata: Metadata = {
  title: `${portfolio.name} | ${portfolio.headerTaglineThree}`,
  description: portfolio.aboutCopy,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`theme-dark ${orbitron.variable} ${shareTechMono.variable} ${openSans.variable} ${honk.variable}`}
      data-theme="dark"
    >
      <body className={shareTechMono.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
