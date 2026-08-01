"use client";

import { portfolio } from "@/content/portfolio";
import { ArtFilterImage } from "@/components/ArtFilter";

import { HeroMeta } from "./HeroMeta";
import { PrinterText } from "./PrinterText";
import styles from "./TypoHero.module.css";

export function TypoHero() {
  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.reel}>
        <div className={styles.footage}>
          <ArtFilterImage
            src={portfolio.hero.portrait.src}
            alt={portfolio.headerTaglineTwo}
            className={styles.portrait}
            sizes="(max-width: 900px) 100vw, 70vw"
            priority
          />
        </div>        <div className={styles.text}>
          <PrinterText />
        </div>
      </div>

      <p className={styles.tagline}>
        {portfolio.headerTaglineThree} — {portfolio.hero.location}
      </p>

      <div className={styles.footer}>
        <HeroMeta />
      </div>
    </section>
  );
}
