"use client";

import { useRef, useState } from "react";

import { portfolio } from "@/content/portfolio";

import { PortraitMorphFrame } from "./PortraitMorphFrame";
import styles from "./Hero.module.css";

type HeroPortraitProps = {
  portraitRef?: React.Ref<HTMLDivElement>;
};

export function HeroPortrait({ portraitRef }: HeroPortraitProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const setRef = (node: HTMLDivElement | null) => {
    localRef.current = node;
    if (typeof portraitRef === "function") {
      portraitRef(node);
    } else if (portraitRef) {
      portraitRef.current = node;
    }
  };

  const portraitSrc = portfolio.hero.portrait.src;

  return (
    <div
      ref={setRef}
      className={styles.portraitStage}
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
      <PortraitMorphFrame isHovered={isHovered} />
      <div className={styles.portrait}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={portraitSrc}
          alt=""
          className={styles.portraitCutout}
          draggable={false}
        />
      </div>
    </div>
  );
}
