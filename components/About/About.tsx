import { portfolio } from "@/content/portfolio";

import { ScrambleText } from "./ScrambleText";
import styles from "./About.module.css";

export function About() {
  return (
    <section id="about" className={styles.about}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowIndex}>(01)</span>
          About
        </p>

        <ScrambleText
          as="h2"
          text="About"
          className={styles.heading}
        />

        <p className={styles.copy}>{portfolio.aboutCopy}</p>
      </div>
    </section>
  );
}
