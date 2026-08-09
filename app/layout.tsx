import type { Metadata, Viewport } from "next";
import { Monoton, Open_Sans, Orbitron, Share_Tech_Mono, Syncopate } from "next/font/google";

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

/** Neon display — PIMPMYRIDE marquee and panel titles */
const monoton = Monoton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-monoton",
  display: "swap",
  preload: false,
});

/** Geometric sans — PIMPMYRIDE body copy */
const syncopate = Syncopate({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-syncopate",
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  themeColor: "#0a1428",
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
      className={`theme-dark ${orbitron.variable} ${shareTechMono.variable} ${openSans.variable} ${monoton.variable} ${syncopate.variable}`}
      data-theme="dark"
      data-mode="default"
    >
      <body className={shareTechMono.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
