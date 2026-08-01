"use client";

import { BarOverlay } from "@/components/BarOverlay";
import { Cursor } from "@/components/Cursor/Cursor";
import { DynamicFavicon } from "@/components/DynamicFavicon";
import { EasterEggManager } from "@/components/EasterEggs";
import { Loader } from "@/components/Loader/Loader";
import { Navigation } from "@/components/Navigation";
import { NoiseOverlay } from "@/components/NoiseOverlay";
import { ShapeOverlay } from "@/components/ShapeOverlay";
import { useLenis } from "@/hooks/useLenis";
import { useContactTheme } from "@/hooks/useContactTheme";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  useLenis();
  useContactTheme();

  return (
    <>
      <ShapeOverlay />
      <BarOverlay />
      <Loader />
      <Navigation />
      <Cursor />
      <EasterEggManager />
      <NoiseOverlay />
      <DynamicFavicon />
      {children}
    </>
  );
}
