"use client";

import { portfolio } from "@/content/portfolio";
import { SectionTitle } from "@/components/SectionTitle";
import { useTypoMode } from "@/hooks/useTypoMode";

import { ScrambleText } from "./ScrambleText";
import styles from "./About.module.css";

export function About() {
  const typoMode = useTypoMode();

  return (
    <section
      id="about"
      className={`${styles.about} ${typoMode ? "theme-light" : ""}`}
    >
      <div className={styles.inner}>
        {!typoMode ? (
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowIndex}>(01)</span>
            About
          </p>
        ) : null}

        {typoMode ? (
          <SectionTitle
            words={["Frontend", "Developer", "Based", "In", "Mumbai"]}
            variant="light"
            className={styles.typoHeading}
          />
        ) : (
          <ScrambleText as="h2" text="About" className={styles.heading} />
        )}

        <p className={styles.copy}>{portfolio.aboutCopy}</p>

        {typoMode ? (
          <div className={styles.subtitle}>
            {["Building", "Interfaces", "With", "Intention"].map((word) => (
              <span key={word}>{word}</span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
