"use client";

import { usePathname } from "next/navigation";

import { BarOverlay } from "@/components/BarOverlay";
import { Cursor } from "@/components/Cursor/Cursor";
import { DynamicFavicon } from "@/components/DynamicFavicon";
import { SystemModeProvider } from "@/components/EasterEggs/SystemModeProvider";
import { Loader } from "@/components/Loader/Loader";
import { Navigation } from "@/components/Navigation";
import { ShapeOverlay } from "@/components/ShapeOverlay";
import { useLenis } from "@/hooks/useLenis";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const pathname = usePathname();
  const isResume = pathname?.startsWith("/resume");

  useLenis();

  return (
    <SystemModeProvider>
      {!isResume ? (
        <>
          <ShapeOverlay />
          <BarOverlay />
          <Loader />
          <Navigation />
          <Cursor />
          <DynamicFavicon />
        </>
      ) : null}
      {children}
    </SystemModeProvider>
  );
}
