"use client";

import { useMemo } from "react";

import styles from "./Hero.module.css";

type PortraitPixelFrameProps = {
  isHovered?: boolean;
};

/** Bitcount-aligned pixel grid for the portrait halo. */
const GRID = 16;
const CELL = 100 / GRID;
const EDGE = 1;

type PixelCell = {
  key: string;
  x: number;
  y: number;
  kind: "frame" | "corner";
  delay: number;
};

function buildFrameCells(): PixelCell[] {
  const cells: PixelCell[] = [];
  const max = GRID - 1 - EDGE;

  for (let i = EDGE; i <= max; i += 1) {
    const positions = [
      { x: i, y: EDGE },
      { x: i, y: max },
      { x: EDGE, y: i },
      { x: max, y: i },
    ];

    for (const { x, y } of positions) {
      const key = `${x}-${y}`;
      if (cells.some((cell) => cell.key === key)) continue;

      const arm = 3;
      const isCorner =
        (x <= EDGE + arm && y === EDGE) ||
        (y <= EDGE + arm && x === EDGE) ||
        (x >= max - arm && y === EDGE) ||
        (y <= EDGE + arm && x === max) ||
        (x <= EDGE + arm && y === max) ||
        (y >= max - arm && x === EDGE) ||
        (x >= max - arm && y === max) ||
        (y >= max - arm && x === max);

      cells.push({
        key,
        x,
        y,
        kind: isCorner ? "corner" : "frame",
        delay: ((x * 3 + y * 5) % 14) * 0.1,
      });
    }
  }

  return cells;
}

export function PortraitPixelFrame({ isHovered = false }: PortraitPixelFrameProps) {
  const cells = useMemo(() => buildFrameCells(), []);

  return (
    <div
      className={`${styles.portraitBackdrop} ${isHovered ? styles.portraitBackdropHover : ""}`}
      aria-hidden="true"
    >
      <div className={styles.portraitPlate} />
      <div className={styles.portraitDotField} />
      <div className={styles.portraitScan} />

      <svg
        className={styles.portraitPixelSvg}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {cells.map((cell) => (
          <rect
            key={cell.key}
            className={cell.kind === "corner" ? styles.pixelCorner : styles.pixelFrame}
            x={cell.x * CELL + CELL * 0.2}
            y={cell.y * CELL + CELL * 0.2}
            width={CELL * 0.6}
            height={CELL * 0.6}
            style={{ animationDelay: `${cell.delay}s` }}
          />
        ))}
      </svg>

      <span className={`${styles.pixelTraveler} ${styles.pixelTravelerTop}`} />
      <span className={`${styles.pixelTraveler} ${styles.pixelTravelerRight}`} />
      <span className={`${styles.pixelTraveler} ${styles.pixelTravelerBottom}`} />
      <span className={`${styles.pixelTraveler} ${styles.pixelTravelerLeft}`} />
    </div>
  );
}
