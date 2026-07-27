"use client";

import { useCallback, useEffect, useState } from "react";

import {
  KONAMI_CODE,
  MYSPACE_CHEAT_CODE,
  type EasterEggId,
} from "@/lib/easterEggs/codes";
import { useCheatCode } from "@/hooks/useCheatCode";
import { useKeySequence } from "@/hooks/useKeySequence";

import { BrokenUxSimulator } from "./BrokenUxSimulator";
import { EasterEggPrompts } from "./EasterEggPrompts";
import { Y2kMySpace } from "./Y2kMySpace";

export function EasterEggManager() {
  const [activeEgg, setActiveEgg] = useState<EasterEggId | null>(null);

  const toggleEgg = useCallback((egg: EasterEggId) => {
    setActiveEgg((current) => (current === egg ? null : egg));
  }, []);

  useKeySequence({
    sequence: KONAMI_CODE,
    onMatch: () => toggleEgg("broken-ux"),
  });

  useCheatCode({
    code: MYSPACE_CHEAT_CODE,
    onMatch: () => toggleEgg("myspace"),
  });

  useEffect(() => {
    const root = document.documentElement;

    if (activeEgg) {
      root.dataset.easterEgg = activeEgg;
    } else {
      delete root.dataset.easterEgg;
    }

    return () => {
      delete root.dataset.easterEgg;
    };
  }, [activeEgg]);

  useEffect(() => {
    if (!activeEgg) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveEgg(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [activeEgg]);

  return (
    <>
      <EasterEggPrompts paused={activeEgg !== null} />
      {activeEgg === "broken-ux" ? (
        <BrokenUxSimulator onExit={() => setActiveEgg(null)} />
      ) : null}
      {activeEgg === "myspace" ? (
        <Y2kMySpace onExit={() => setActiveEgg(null)} />
      ) : null}
    </>
  );
}
