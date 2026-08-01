"use client";

import { useTypoMode } from "@/hooks/useTypoMode";

import { DefaultNavigation } from "./DefaultNavigation";
import { TypoNavigation } from "./TypoNavigation";

export function Navigation() {
  const isTypoMode = useTypoMode();
  return isTypoMode ? <TypoNavigation /> : <DefaultNavigation />;
}
