"use client";

import { useId, useRef, useState } from "react";

import { portfolio } from "@/content/portfolio";

import { PortraitBlob } from "./PortraitBlob";
import { PortraitFigure } from "./PortraitFigure";
import styles from "./Hero.module.css";

export function useHeroPortrait(portraitRef?: React.Ref<HTMLDivElement>) {
  const localRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const clipId = useId().replace(/:/g, "");

  const setRef = (node: HTMLDivElement | null) => {
    localRef.current = node;
    if (typeof portraitRef === "function") {
      portraitRef(node);
    } else if (portraitRef) {
      portraitRef.current = node;
    }
  };

  const blob = (
    <div
      ref={setRef}
      className={styles.portraitBlobSlot}
      data-intro="portrait"
      data-cursor="interactive"
      tabIndex={0}
      role="img"
      aria-label={`Portrait of ${portfolio.headerTaglineTwo}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <PortraitBlob clipId={clipId} isHovered={isHovered} />
    </div>
  );

  const figure = (
    <PortraitFigure
      clipId={clipId}
      portraitSrc={portfolio.hero.portrait.src}
    />
  );

  return { blob, figure };
}
