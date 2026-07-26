"use client";

import { useRef } from "react";

import { portfolio } from "@/content/portfolio";

import styles from "./Hero.module.css";

type HeroPortraitProps = {
  portraitRef?: React.Ref<HTMLDivElement>;
};

export function HeroPortrait({ portraitRef }: HeroPortraitProps) {
  const localRef = useRef<HTMLDivElement>(null);

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
    >
      <div
        className={styles.portrait}
        style={{ ["--portrait-src" as string]: `url(${portraitSrc})` }}
      >
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
