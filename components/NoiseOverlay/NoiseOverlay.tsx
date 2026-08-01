"use client";

import { useTypoMode } from "@/hooks/useTypoMode";

export function NoiseOverlay() {
  const isTypoMode = useTypoMode();
  if (!isTypoMode) return null;
  return <div className="noise-overlay" aria-hidden="true" />;
}
