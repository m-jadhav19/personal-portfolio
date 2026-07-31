import type { ReactNode, Ref } from "react";

import styles from "./Hero.module.css";

const REPEAT_COUNT = 8;

type HeroMarqueeProps = {
  lines: string[];
  lineRefs?: Ref<HTMLDivElement>[];
  portraitBlob?: ReactNode;
  portraitFigure?: ReactNode;
};

function MarqueeTrack({ text }: { text: string }) {
  const items = Array.from({ length: REPEAT_COUNT }, (_, index) => (
    <span key={index}>{text}</span>
  ));

  return <div className={styles.track} data-marquee-track>{items}</div>;
}

export function HeroMarquee({
  lines,
  lineRefs,
  portraitBlob,
  portraitFigure,
}: HeroMarqueeProps) {
  const [backLine, middleLine, frontLine] = lines;

  return (
    <div className={styles.marquee} aria-label="Roles marquee" data-marquee>
      {backLine ? (
        <div
          ref={lineRefs?.[0]}
          className={`${styles.marqueeRow} ${styles.marqueeRowBack}`}
          data-intro="marquee-line"
          style={{ gridRow: 1 }}
        >
          <MarqueeTrack text={backLine} />
        </div>
      ) : null}

      {portraitBlob}

      {middleLine ? (
        <div
          ref={lineRefs?.[1]}
          className={`${styles.marqueeRow} ${styles.marqueeRowMiddle}`}
          data-intro="marquee-line"
          style={{ gridRow: 2 }}
        >
          <MarqueeTrack text={middleLine} />
        </div>
      ) : null}

      {portraitFigure}

      {frontLine ? (
        <div
          ref={lineRefs?.[2]}
          className={`${styles.marqueeRow} ${styles.marqueeRowFront}`}
          data-intro="marquee-line"
          style={{ gridRow: 3 }}
        >
          <MarqueeTrack text={frontLine} />
        </div>
      ) : null}
    </div>
  );
}
