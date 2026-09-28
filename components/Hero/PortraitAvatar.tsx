"use client";

import type { CSSProperties, MouseEvent } from "react";

import styles from "./PortraitAvatar.module.css";

export type PortraitPart =
  | "bracket-left"
  | "bracket-right"
  | "head"
  | "hair"
  | "glasses"
  | "beard"
  | "eye-left"
  | "eye-right"
  | "sparks";

type PortraitAvatarProps = {
  src: string;
  pointer: { x: number; y: number };
  hovered: boolean;
  activePart: PortraitPart | null;
  onPartEnter?: (part: PortraitPart) => void;
  onPartLeave?: () => void;
  onPartClick?: (part: PortraitPart) => void;
  className?: string;
};

/**
 * High-fidelity sticker image + layered SVG hit targets / motion overlays
 * so each feature can react without redrawing the whole portrait.
 */
export function PortraitAvatar({
  src,
  pointer,
  hovered,
  activePart,
  onPartEnter,
  onPartLeave,
  onPartClick,
  className,
}: PortraitAvatarProps) {
  const dx = (pointer.x - 0.5) * 2;
  const dy = (pointer.y - 0.5) * 2;
  const hover = hovered ? 1 : 0;

  const style = {
    "--head-tilt": `${dx * 2.4 * hover}deg`,
    "--head-x": `${dx * 3 * hover}px`,
    "--head-y": `${dy * 2.5 * hover}px`,
    "--eye-x": `${dx * 3.4}px`,
    "--eye-y": `${dy * 2.8}px`,
    "--bracket-left-x": `${-4 - hover * 8 + dx * -2}px`,
    "--bracket-right-x": `${4 + hover * 8 + dx * 2}px`,
    "--bracket-scale":
      activePart === "bracket-left" || activePart === "bracket-right"
        ? 1.06
        : 1,
    "--spark-opacity":
      hovered || activePart === "sparks" || activePart === "hair" ? 1 : 0,
    "--glass-shine":
      activePart === "glasses" || activePart === "eye-left" || activePart === "eye-right"
        ? 0.35
        : hover * 0.12,
  } as CSSProperties;

  const partProps = (part: PortraitPart, extraClass = "") => ({
    className: `${styles.hit} ${extraClass} ${
      activePart === part ? styles.hitActive : ""
    }`.trim(),
    onPointerEnter: () => onPartEnter?.(part),
    onPointerLeave: () => onPartLeave?.(),
    onClick: (event: MouseEvent) => {
      event.stopPropagation();
      onPartClick?.(part);
    },
  });

  return (
    <div
      className={`${styles.wrap} ${className ?? ""}`}
      style={style}
      data-active={activePart ?? undefined}
    >
      <img
        className={styles.sticker}
        src={src}
        alt=""
        draggable={false}
        aria-hidden="true"
      />

      <svg
        className={styles.overlay}
        viewBox="0 0 445 430"
        role="presentation"
      >
        {/* Motion: brackets glow / push */}
        <g className={styles.bracketLeftMotion} transform="translate(40 110)">
          <path
            className={styles.bracketGlow}
            d="M70 10 L14 105 L70 200"
            fill="none"
            strokeWidth="34"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <g className={styles.bracketRightMotion} transform="translate(330 110)">
          <path
            className={styles.bracketGlow}
            d="M10 10 L66 105 L10 200"
            fill="none"
            strokeWidth="34"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Eyes that follow the pointer (drawn over the sticker pupils) */}
        <g className={styles.eyes} style={{ pointerEvents: "none" }}>
          <g className={styles.eyeLeft}>
            <circle cx="188" cy="198" r="5.5" className={styles.pupil} />
            <circle cx="190" cy="196" r="1.5" className={styles.glint} />
          </g>
          <g className={styles.eyeRight}>
            <circle cx="256" cy="198" r="5.5" className={styles.pupil} />
            <circle cx="258" cy="196" r="1.5" className={styles.glint} />
          </g>
        </g>

        {/* Glass shine sweep */}
        <g className={styles.glassShine} style={{ pointerEvents: "none" }}>
          <rect x="170" y="180" width="42" height="30" rx="8" />
          <rect x="238" y="180" width="42" height="30" rx="8" />
        </g>

        {/* Extra spark flash on hover */}
        <g className={styles.sparkFlash} style={{ pointerEvents: "none" }}>
          <line x1="318" y1="78" x2="340" y2="56" />
          <line x1="328" y1="94" x2="354" y2="78" />
          <line x1="336" y1="112" x2="360" y2="106" />
        </g>

        {/* Hit targets */}
        <path
          {...partProps("bracket-left")}
          d="M40 110 L110 110 L70 205 L110 300 L40 300 L10 205 Z"
          fill="transparent"
        />
        <path
          {...partProps("bracket-right")}
          d="M335 110 L405 110 L435 205 L405 300 L335 300 L365 205 Z"
          fill="transparent"
        />
        <ellipse
          {...partProps("hair")}
          cx="222"
          cy="120"
          rx="95"
          ry="55"
          fill="transparent"
        />
        <ellipse
          {...partProps("head")}
          cx="222"
          cy="210"
          rx="70"
          ry="78"
          fill="transparent"
        />
        <rect
          {...partProps("glasses")}
          x="165"
          y="175"
          width="115"
          height="45"
          rx="10"
          fill="transparent"
        />
        <ellipse
          {...partProps("beard")}
          cx="222"
          cy="275"
          rx="72"
          ry="48"
          fill="transparent"
        />
        <circle
          {...partProps("eye-left")}
          cx="188"
          cy="198"
          r="18"
          fill="transparent"
        />
        <circle
          {...partProps("eye-right")}
          cx="256"
          cy="198"
          r="18"
          fill="transparent"
        />
        <circle
          {...partProps("sparks")}
          cx="340"
          cy="90"
          r="36"
          fill="transparent"
        />
      </svg>
    </div>
  );
}
