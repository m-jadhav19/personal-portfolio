import styles from "./Hero.module.css";

type PortraitFigureProps = {
  clipId: string;
  portraitSrc: string;
};

export function PortraitFigure({ clipId, portraitSrc }: PortraitFigureProps) {
  return (
    <div
      className={styles.portraitFigureSlot}
      style={{ clipPath: `url(#${clipId})` }}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={portraitSrc}
        alt=""
        className={styles.portraitCutout}
        draggable={false}
      />
    </div>
  );
}
