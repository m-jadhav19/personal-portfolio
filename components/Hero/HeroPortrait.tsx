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
        label={`Sticker portrait of ${portfolio.headerTaglineTwo}. Its face follows your pointer. Drag it to peel it off and let go anywhere to stick it (right-click or long-press works too), or poke the brackets, glasses, hair and sparks.`}
      />
    </div>
  );
}
