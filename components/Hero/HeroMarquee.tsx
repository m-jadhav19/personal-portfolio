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
  return (
    <div className={styles.marquee} aria-label="Roles marquee">
      {lines.map((line, index) => (
        <div
          key={line}
          ref={lineRefs?.[index]}
          className={`${styles.marqueeRow} ${
            index === 1 ? styles.marqueeRowBehind : styles.marqueeRowFront
          }`}
          data-intro="marquee-line"
        >
          <MarqueeTrack text={line} />
        </div>
      ))}
      {portrait}
    </div>
  );
}
