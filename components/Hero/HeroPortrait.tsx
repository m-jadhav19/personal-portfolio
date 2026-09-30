"use client";

import { portfolio } from "@/content/portfolio";

import { PortraitSticker } from "./portrait/PortraitSticker";
import styles from "./Hero.module.css";

type HeroPortraitProps = {
  portraitRef?: React.Ref<HTMLDivElement>;
};

export function HeroPortrait({ portraitRef }: HeroPortraitProps) {
  return (
    <div
      ref={portraitRef}
      className={styles.portraitStage}
      data-intro="portrait"
      data-cursor="hide"
    >
      <PortraitSticker
        label={`Sticker portrait of ${portfolio.headerTaglineTwo}. Its face follows your pointer. Right-click or long-press it to peel it off, then click or drag anywhere to stick it, or poke the brackets, glasses, hair and sparks.`}
      />
    </div>
  );
}
