"use client";

import { Magnetic } from "@/components/Cursor/Magnetic";
import { portfolio } from "@/content/portfolio";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

import styles from "./Hero.module.css";

export function HeroIdentity() {
  const scrollTo = useSmoothScroll();
  const fullName = `${portfolio.name} Jadhav`;

  return (
    <div className={styles.identity} data-intro="meta-item">
      <h1 className={styles.brand}>{fullName}</h1>
      <p className={styles.role}>Frontend Engineer</p>
      <p className={styles.pitch}>{portfolio.hero.pitch}</p>
      <div className={styles.ctas}>
        <Magnetic strength={0.18}>
          <a
            href="#projects"
            className={styles.ctaPrimary}
            data-cursor="button"
            onClick={(event) => {
              event.preventDefault();
              void scrollTo("projects");
            }}
          >
            View Selected Work
          </a>
        </Magnetic>
        <Magnetic strength={0.18}>
          <a
            href="#contact"
            className={styles.ctaSecondary}
            data-cursor="link"
            onClick={(event) => {
              event.preventDefault();
              void scrollTo("contact");
            }}
          >
            Contact Me
          </a>
        </Magnetic>
      </div>
    </div>
  );
}
