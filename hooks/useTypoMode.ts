"use client";

import { useEffect, useState } from "react";

const TYPO_EGG = "typo";

function readTypoMode() {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.easterEgg === TYPO_EGG;
}

export function useTypoMode() {
  const [isTypoMode, setIsTypoMode] = useState(false);

  useEffect(() => {
    setIsTypoMode(readTypoMode());

    const observer = new MutationObserver(() => {
      setIsTypoMode(readTypoMode());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-easter-egg"],
    });

    return () => observer.disconnect();
  }, []);

  return isTypoMode;
}
