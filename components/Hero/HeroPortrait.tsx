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
      data-destroy-ignore
      data-cursor="hide"
    >
      <PortraitSticker
        label={`Sticker portrait of ${portfolio.headerTaglineTwo}. Its face follows your pointer. Hold left-click (or your finger) for 2 seconds to grab it, then click or let go anywhere to stick it, or poke the brackets, glasses, hair and sparks.`}
      />
    </div>
  );
}
