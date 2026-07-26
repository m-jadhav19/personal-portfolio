"use client";

import { useEffect, useRef } from "react";

import { playHeroIntro } from "@/animations/hero";
import { bindMarqueeParallax } from "@/animations/marquee";
import { NAV_COMPLETE_EVENT } from "@/animations/navigation";
import { portfolio } from "@/content/portfolio";

import { HeroMarquee } from "./HeroMarquee";
import { HeroMeta } from "./HeroMeta";
import { HeroPortrait } from "./HeroPortrait";
import styles from "./Hero.module.css";

export function Hero() {
  const lineOneRef = useRef<HTMLDivElement>(null);
  const lineTwoRef = useRef<HTMLDivElement>(null);
  const lineThreeRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const hasPlayedIntro = useRef(false);

  const marqueeLines = portfolio.hero.roles;

  useEffect(() => {
    const rows = [lineOneRef, lineTwoRef, lineThreeRef]
      .map((ref) => ref.current)
      .filter((row): row is HTMLDivElement => Boolean(row));

    const unsubscribeParallax = bindMarqueeParallax(rows);

    const runIntro = () => {
      if (hasPlayedIntro.current && process.env.NODE_ENV !== "development") {
        return;
      }
      hasPlayedIntro.current = true;

      playHeroIntro({
        marqueeLines: rows,
        portrait: portraitRef.current,
      });
    };

    if (document.documentElement.classList.contains("intro-nav-only")) {
      runIntro();
    } else {
      window.addEventListener(NAV_COMPLETE_EVENT, runIntro, { once: true });
    }

    return () => {
      unsubscribeParallax();
      window.removeEventListener(NAV_COMPLETE_EVENT, runIntro);
    };
  }, []);

  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.stage}>
        <HeroMarquee
          lines={marqueeLines}
          lineRefs={[lineOneRef, lineTwoRef, lineThreeRef]}
          portrait={<HeroPortrait portraitRef={portraitRef} />}
        />
      </div>

      <div className={styles.footer}>
        <HeroMeta />
      </div>
      <span className={styles.scrollCue}>Scroll to explore</span>
    </section>
  );
}
