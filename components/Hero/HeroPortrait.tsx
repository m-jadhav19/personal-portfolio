"use client";

import type { Ref } from "react";

import { portfolio } from "@/content/portfolio";

import { PortraitSticker } from "./portrait/PortraitSticker";
import styles from "./Hero.module.css";

type HeroPortraitProps = {
  portraitRef?: Ref<HTMLDivElement>;
  driftRef?: Ref<HTMLDivElement>;
  floatRef?: Ref<HTMLDivElement>;
};

export function HeroPortrait({ portraitRef, driftRef, floatRef }: HeroPortraitProps) {
  return (
    <div
      ref={portraitRef}
      className={styles.portraitStage}
      data-intro="portrait"
      data-destroy-ignore
      data-cursor="hide"
    >
      <div ref={driftRef} className={styles.portraitDrift}>
        <div ref={floatRef} className={styles.portraitFloat}>
          <PortraitSticker
            label={`Sticker portrait of ${portfolio.headerTaglineTwo}. Its face follows your pointer. Hold left-click (or your finger) for 2 seconds on the spot you want to peel, then click or let go anywhere to stick it, or poke the brackets, glasses, hair and sparks.`}
          />
        </div>
      </div>
    </div>
  );
}
