"use client";

import { useEffect, useState } from "react";

import { useTypoMode } from "./useTypoMode";

export type TypoArtStyle = "photo" | "dither" | "ascii";

function readArtStyle(typoMode: boolean): TypoArtStyle {
  if (!typoMode) return "photo";

  const theme = document.documentElement.dataset.theme;
  return theme === "dark" ? "ascii" : "dither";
}

export function useTypoArtStyle(): TypoArtStyle {
  const typoMode = useTypoMode();
  const [style, setStyle] = useState<TypoArtStyle>("photo");

  useEffect(() => {
    const sync = () => {
      const next = readArtStyle(typoMode);
      setStyle(next);
      if (typoMode) {
        document.documentElement.dataset.artStyle = next;
      } else {
        delete document.documentElement.dataset.artStyle;
      }
    };

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-easter-egg", "data-theme", "class"],
    });

    return () => {
      observer.disconnect();
      delete document.documentElement.dataset.artStyle;
    };
  }, [typoMode]);

  return style;
}
