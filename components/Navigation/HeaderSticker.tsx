"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";

import {
  PORTRAIT_BOXES as BOX,
  MOUTH_REST,
  PORTRAIT_COLORS as COLOR,
  PORTRAIT_PATHS as PATH,
  mouthPath,
} from "@/components/Hero/portrait/portraitPaths";

import styles from "./Navigation.module.css";

const PAD = 6;
const VIEWBOX = `${BOX.head.x - PAD} ${BOX.head.y - PAD} ${BOX.head.w + PAD * 2} ${BOX.head.h + PAD * 2}`;

type HeaderStickerProps = {
  docked: boolean;
  onClick: () => void;
};

/** Mini copy of the hero sticker that gets slapped onto the header once the hero portrait scrolls away. */
export function HeaderSticker({ docked, onClick }: HeaderStickerProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (firstRun.current || reduced) {
      firstRun.current = false;
      gsap.set(el, {
        autoAlpha: docked ? 1 : 0,
        scale: 1,
        rotation: docked ? -8 : 0,
        y: 0,
      });
      return;
    }

    if (docked) {
      gsap.fromTo(
        el,
        { autoAlpha: 0, scale: 1.9, rotation: -34, y: 18 },
        {
          autoAlpha: 1,
          scale: 1,
          rotation: -8,
          y: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.55)",
          overwrite: "auto",
        },
      );
    } else {
      gsap.to(el, {
        autoAlpha: 0,
        scale: 0.4,
        rotation: 20,
        y: 10,
        duration: 0.25,
        ease: "power2.in",
        overwrite: "auto",
      });
    }
  }, [docked]);

  return (
    <button
      ref={ref}
      type="button"
      className={styles.headerSticker}
      onClick={onClick}
      aria-label="Back to top"
      tabIndex={docked ? 0 : -1}
      aria-hidden={!docked}
      data-cursor="hide"
    >
      <svg className={styles.headerStickerArt} viewBox={VIEWBOX} aria-hidden="true">
        <path d={PATH.base} fill={COLOR.cream} />
        <path d={PATH.ear} fill={COLOR.cream} />
        <path d={PATH.hair} fill={COLOR.ink} />
        <path d={PATH.brows} fill={COLOR.ink} />
        <path d={PATH.beard} fill={COLOR.ink} />
        <path d={PATH.mouth} fill={COLOR.cream} />
        <path
          d={mouthPath(MOUTH_REST)}
          fill={COLOR.ink}
          stroke={COLOR.ink}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d={PATH.glasses} fill={COLOR.ink} />
        <path d={PATH.lensL} fill={COLOR.cream} />
        <path d={PATH.lensR} fill={COLOR.cream} />
        <path d={PATH.pupilL} fill={COLOR.ink} />
        <path d={PATH.pupilR} fill={COLOR.ink} />
      </svg>
    </button>
  );
}
