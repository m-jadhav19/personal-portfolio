"use client";

import { useTypoMode } from "@/hooks/useTypoMode";

import { DefaultHero } from "./DefaultHero";
import { TypoHero } from "./TypoHero";

export function Hero() {
  const isTypoMode = useTypoMode();
  return isTypoMode ? <TypoHero /> : <DefaultHero />;
}
