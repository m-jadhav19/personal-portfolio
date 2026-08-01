"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  KONAMI_CODE,
  MYSPACE_CHEAT_CODE,
  TYPO_CHEAT_CODE,
  type EasterEggId,
} from "@/lib/easterEggs/codes";
import { useCheatCode } from "@/hooks/useCheatCode";
import { useKeySequence } from "@/hooks/useKeySequence";

import { BrokenUxSimulator } from "./BrokenUxSimulator";
import { EasterEggPrompts } from "./EasterEggPrompts";
import { TypoTransition } from "./TypoTransition";
import { Y2kMySpace } from "./Y2kMySpace";

gsap.registerPlugin(ScrollTrigger);

const TYPO_STORAGE_KEY = "portfolio-typo-mode";

export function EasterEggManager() {
  const [activeEgg, setActiveEgg] = useState<EasterEggId | null>(null);
  const [pendingTypo, setPendingTypo] = useState(false);
  const activeEggRef = useRef<EasterEggId | null>(null);

  useEffect(() => {
    activeEggRef.current = activeEgg;
  }, [activeEgg]);

  const toggleEgg = useCallback((egg: EasterEggId) => {
    setActiveEgg((current) => (current === egg ? null : egg));
  }, []);

  const handleTypoMatch = useCallback(() => {
    if (activeEggRef.current === "typo") {
      setActiveEgg(null);
      return;
    }
    setPendingTypo(true);
  }, []);

  useKeySequence({
    sequence: KONAMI_CODE,
    onMatch: () => toggleEgg("broken-ux"),
  });

  useCheatCode({
    code: MYSPACE_CHEAT_CODE,
    onMatch: () => toggleEgg("myspace"),
  });

  useCheatCode({
    code: TYPO_CHEAT_CODE,
    onMatch: handleTypoMatch,
    enabled: activeEgg !== "broken-ux" && activeEgg !== "myspace",
  });

  const handleTypoComplete = useCallback(() => {
    setPendingTypo(false);
    setActiveEgg("typo");
    window.scrollTo({ top: 0, behavior: "auto" });
    ScrollTrigger.refresh();
    sessionStorage.setItem(TYPO_STORAGE_KEY, "1");
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem(TYPO_STORAGE_KEY) === "1") {
      setActiveEgg("typo");
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (activeEgg) {
      root.dataset.easterEgg = activeEgg;
    } else {
      delete root.dataset.easterEgg;
      sessionStorage.removeItem(TYPO_STORAGE_KEY);
    }
  }, [activeEgg]);

  useEffect(() => {
    if (!activeEgg) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveEgg(null);
        ScrollTrigger.refresh();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [activeEgg]);

  return (
    <>
      <EasterEggPrompts paused={activeEgg !== null || pendingTypo} />
      <TypoTransition active={pendingTypo} onComplete={handleTypoComplete} />
      {activeEgg === "broken-ux" ? (
        <BrokenUxSimulator onExit={() => setActiveEgg(null)} />
      ) : null}
      {activeEgg === "myspace" ? (
        <Y2kMySpace onExit={() => setActiveEgg(null)} />
      ) : null}
    </>
  );
}
