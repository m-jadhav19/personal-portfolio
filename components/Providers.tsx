"use client";

import { Cursor } from "@/components/Cursor/Cursor";
import { Loader } from "@/components/Loader/Loader";
import { Navigation } from "@/components/Navigation";
import { useContactTheme } from "@/hooks/useContactTheme";
import { useLenis } from "@/hooks/useLenis";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  useLenis();
  useContactTheme();

  return (
    <>
      <Loader />
      <Navigation />
      <Cursor />
      {children}
    </>
  );
}
