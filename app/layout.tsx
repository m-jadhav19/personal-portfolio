import type { Metadata, Viewport } from "next";
import { Bitcount_Prop_Single } from "next/font/google";

import "@/styles/globals.css";

import { portfolio } from "@/content/portfolio";
import { Providers } from "@/components/Providers";

const bitcountPropSingle = Bitcount_Prop_Single({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-bitcount-prop-single",
  display: "swap",
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
      className={`theme-dark ${bitcountPropSingle.variable}`}
      data-theme="dark"
    >
      <body className={bitcountPropSingle.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
