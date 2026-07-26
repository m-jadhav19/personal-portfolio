import type { ReactNode, Ref } from "react";

import styles from "./Hero.module.css";

const REPEAT_COUNT = 8;

type HeroMarqueeProps = {
  lines: string[];
  lineRefs?: Ref<HTMLDivElement>[];
  portrait?: ReactNode;
};

function MarqueeTrack({ text }: { text: string }) {
  const items = Array.from({ length: REPEAT_COUNT }, (_, index) => (
    <span key={index}>{text}</span>
  ));

  return <div className={styles.track}>{items}</div>;
}

export function HeroMarquee({ lines, lineRefs, portrait }: HeroMarqueeProps) {
  const backLines = lines.slice(0, 2);
  const frontLines = lines.slice(2);

  return (
    <div className={styles.marquee} aria-label="Roles marquee">
      {backLines.map((line, index) => (
        <div
          key={line}
          ref={lineRefs?.[index]}
          className={`${styles.marqueeRow} ${styles.marqueeRowBack}`}
          data-intro="marquee-line"
          style={{ gridRow: index + 1 }}
        >
          <MarqueeTrack text={line} />
        </div>
      ))}

      <div className={styles.portraitBackdrop} aria-hidden="true" />

      {frontLines.map((line, index) => (
        <div
          key={line}
          ref={lineRefs?.[index + 2]}
          className={`${styles.marqueeRow} ${styles.marqueeRowFront}`}
          data-intro="marquee-line"
          style={{ gridRow: index + 3 }}
        >
          <MarqueeTrack text={line} />
        </div>
      ))}

      {portrait}
    </div>
  );
}
