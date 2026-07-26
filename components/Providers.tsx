"use client";

import { Cursor } from "@/components/Cursor/Cursor";
import { Loader } from "@/components/Loader/Loader";
import { Navigation } from "@/components/Navigation";
import { ShapeOverlay } from "@/components/ShapeOverlay";
import { useLenis } from "@/hooks/useLenis";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  useLenis();

  return (
    <>
      <ShapeOverlay />
      <Loader />
      <Navigation />
      <Cursor />
      {children}
    </>
  );
}
