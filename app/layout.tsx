import type { Metadata, Viewport } from "next";
import { Bitcount_Grid_Single, Honk, Open_Sans } from "next/font/google";
import localFont from "next/font/local";

import "@/styles/globals.css";

import { portfolio } from "@/content/portfolio";
import { Providers } from "@/components/Providers";

const bitcountGridSingle = Bitcount_Grid_Single({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-bitcount-grid-single",
  display: "swap",
  adjustFontFallback: false,
});

const bitcountGridSingleInk = localFont({
  src: "./fonts/bitcount-grid-single-ink-latin.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-bitcount-grid-single-ink",
  display: "swap",
  adjustFontFallback: false,
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
      className={`theme-dark ${bitcountGridSingle.variable} ${bitcountGridSingleInk.variable} ${openSans.variable} ${honk.variable}`}
      data-theme="dark"
    >
      <body className={bitcountGridSingle.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
