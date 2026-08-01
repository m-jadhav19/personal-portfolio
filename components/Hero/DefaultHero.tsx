"use client";

import { useEffect, useRef } from "react";

import { playHeroIntro } from "@/animations/hero";
import { bindMarqueeParallax } from "@/animations/marquee";
import { INTRO_COMPLETE_EVENT } from "@/animations/navigation";
import { portfolio } from "@/content/portfolio";

import { HeroMarquee } from "./HeroMarquee";
import { HeroMeta } from "./HeroMeta";
import { useHeroPortrait } from "./HeroPortrait";
import styles from "./Hero.module.css";

export function DefaultHero() {
  const lineOneRef = useRef<HTMLDivElement>(null);
  const lineTwoRef = useRef<HTMLDivElement>(null);
  const lineThreeRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const hasPlayedIntro = useRef(false);

  const marqueeLines = portfolio.hero.roles;
  const { blob: portraitBlob, figure: portraitFigure } =
    useHeroPortrait(portraitRef);

  useEffect(() => {
    const getRows = () =>
      [lineOneRef, lineTwoRef, lineThreeRef]
        .map((ref) => ref.current)
        .filter((row): row is HTMLDivElement => Boolean(row));

    let destroyMarquee: (() => void) | undefined;

    const initMarquee = () => {
      const rows = getRows();
      if (!rows.length) return;
      destroyMarquee?.();
      destroyMarquee = bindMarqueeParallax(rows);
    };

    const runIntro = () => {
      const rows = getRows();
      if (!rows.length) return;

      if (hasPlayedIntro.current && process.env.NODE_ENV !== "development") {
        return;
      }
      hasPlayedIntro.current = true;

      playHeroIntro({
        marqueeLines: rows,
        portrait: portraitRef.current,
      });
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(initMarquee);
    });

    const onIntroComplete = () => {
      runIntro();
    };

    if (document.documentElement.dataset.intro === "complete") {
      onIntroComplete();
    } else {
      window.addEventListener(INTRO_COMPLETE_EVENT, onIntroComplete, {
        once: true,
      });
    }

    return () => {
      destroyMarquee?.();
      window.removeEventListener(INTRO_COMPLETE_EVENT, onIntroComplete);
    };
  }, []);

  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.stage}>
        <HeroMarquee
          lines={marqueeLines}
          lineRefs={[lineOneRef, lineTwoRef, lineThreeRef]}
          portraitBlob={portraitBlob}
          portraitFigure={portraitFigure}
        />
      </div>

      <div className={styles.footer}>
        <HeroMeta />
      </div>
      <span className={styles.scrollCue}>Scroll to explore</span>
    </section>
  );
}
