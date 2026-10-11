"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef, type RefObject } from "react";

import {
  PORTRAIT_BOXES as BOX,
  MOUTH_REST,
  PORTRAIT_COLORS as COLOR,
  PORTRAIT_PATHS as PATH,
  mouthPath,
  type MouthShape,
} from "@/components/Hero/portrait/portraitPaths";
import { subscribeLenisScroll } from "@/hooks/useLenis";

import styles from "./Navigation.module.css";

gsap.registerPlugin(useGSAP);

const PAD = 6;
const VIEWBOX = `${BOX.head.x - PAD} ${BOX.head.y - PAD} ${BOX.head.w + PAD * 2} ${BOX.head.h + PAD * 2}`;
const GRIN: MouthShape = { smile: 1.45, open: 0.22, width: 1.05, round: 0, tilt: 0 };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

type HeaderStickerProps = {
  docked: boolean;
  onClick: () => void;
};

/** Mini copy of the hero sticker that gets slapped onto the header once the hero portrait scrolls away. */
export function HeaderSticker({ docked, onClick }: HeaderStickerProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const watchRef = useRef<HTMLDivElement>(null);
  const winkRef = useRef<(() => void) | null>(null);

  useEffectSlap(ref, docked);

  useGSAP(() => {
    const button = ref.current;
    const watch = watchRef.current;
    winkRef.current = null;
    if (!button || !watch || !docked) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pupils = [...watch.querySelectorAll<SVGGraphicsElement>("[data-part='pupil']")];
    const lids = [...watch.querySelectorAll<SVGGraphicsElement>("[data-part='lid']")];
    const brows = watch.querySelector<SVGGraphicsElement>("[data-part='brows']");
    const mouth = watch.querySelector<SVGPathElement>("[data-part='mouth-line']");

    gsap.set(pupils, { transformOrigin: "50% 50%" });
    gsap.set(lids, { scaleY: 0, transformOrigin: "50% 0%" });
    gsap.set(watch, { transformOrigin: "50% 42%" });

    const rotate = gsap.quickTo(watch, "rotation", { duration: 0.45, ease: "power3.out" });
    const shiftX = gsap.quickTo(watch, "x", { duration: 0.5, ease: "power3.out" });
    const shiftY = gsap.quickTo(watch, "y", { duration: 0.5, ease: "power3.out" });
    const pupilX = pupils.map((pupil) =>
      gsap.quickTo(pupil, "x", { duration: 0.35, ease: "power3.out" }),
    );
    const pupilY = pupils.map((pupil) =>
      gsap.quickTo(pupil, "y", { duration: 0.35, ease: "power3.out" }),
    );

    const pointer = { nx: 0, ny: 0.8, at: 0 };
    let kick = 0;
    let lastScroll = 0;
    let primed = false;

    const apply = (now: number) => {
      const idle = pointer.at === 0 || now - pointer.at > 700;
      const scan = Math.sin(now / 1100) * 0.72;
      const nx = idle ? scan : pointer.nx;
      const ny = clamp((idle ? 0.84 : pointer.ny) + kick, -1.15, 1.35);
      rotate(nx * 14 + kick * 12);
      shiftX(nx * 3.5);
      shiftY(ny * 2.4);
      pupilX.forEach((move) => move(nx * 10));
      pupilY.forEach((move) => move(ny * 6.5));
      kick *= 0.93;
    };

    let raf = 0;
    const loop = (now: number) => {
      apply(now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onPointerMove = (event: PointerEvent) => {
      const rect = button.getBoundingClientRect();
      pointer.nx = clamp(
        (event.clientX - (rect.left + rect.width / 2)) / (window.innerWidth * 0.42),
        -1,
        1,
      );
      pointer.ny = clamp(
        (event.clientY - (rect.top + rect.height / 2)) / (window.innerHeight * 0.46),
        -1,
        1,
      );
      pointer.at = performance.now();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const unsubscribe = subscribeLenisScroll((scroll) => {
      if (!primed) {
        primed = true;
        lastScroll = scroll;
        return;
      }
      const dy = scroll - lastScroll;
      lastScroll = scroll;
      if (Math.abs(dy) < 0.4) return;
      kick = clamp(kick + dy / 26, -1.45, 1.45);
    });

    let blinkTimer = 0;
    const blink = (targets: SVGGraphicsElement[] = lids) => {
      if (!targets.length) return;
      gsap
        .timeline()
        .to(targets, { scaleY: 1, duration: 0.07, ease: "power2.in", overwrite: "auto" })
        .to(targets, { scaleY: 0, duration: 0.12, ease: "power2.out" }, "+=0.05");
    };
    const scheduleBlink = () => {
      blinkTimer = window.setTimeout(() => {
        blink();
        scheduleBlink();
      }, 2200 + Math.random() * 2600);
    };
    scheduleBlink();
    const landBlink = window.setTimeout(() => blink(), 420);

    winkRef.current = () => blink(lids[0] ? [lids[0]] : []);

    const onEnter = () => {
      if (brows) gsap.to(brows, { y: -5, duration: 0.22, overwrite: "auto" });
      gsap.to(lids, { scaleY: 0.34, duration: 0.2, overwrite: "auto" });
      mouth?.setAttribute("d", mouthPath(GRIN));
    };
    const onLeave = () => {
      if (brows) gsap.to(brows, { y: 0, duration: 0.35, overwrite: "auto" });
      gsap.to(lids, { scaleY: 0, duration: 0.25, overwrite: "auto" });
      mouth?.setAttribute("d", mouthPath(MOUTH_REST));
    };
    button.addEventListener("pointerenter", onEnter);
    button.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.clearTimeout(blinkTimer);
      window.clearTimeout(landBlink);
      unsubscribe();
      button.removeEventListener("pointerenter", onEnter);
      button.removeEventListener("pointerleave", onLeave);
      winkRef.current = null;
      gsap.killTweensOf([watch, brows, ...lids, ...pupils]);
      mouth?.setAttribute("d", mouthPath(MOUTH_REST));
    };
  }, { dependencies: [docked], scope: ref, revertOnUpdate: true });

  return (
    <button
      ref={ref}
      type="button"
      className={styles.headerSticker}
      onClick={() => {
        winkRef.current?.();
        onClick();
      }}
      aria-label="Back to top"
      tabIndex={docked ? 0 : -1}
      aria-hidden={!docked}
      data-cursor="hide"
    >
      <div ref={watchRef} className={styles.headerStickerWatch}>
        <svg className={styles.headerStickerArt} viewBox={VIEWBOX} aria-hidden="true">
          <defs>
            <clipPath id="header-lens-left">
              <path d={PATH.lensL} />
            </clipPath>
            <clipPath id="header-lens-right">
              <path d={PATH.lensR} />
            </clipPath>
          </defs>
          <path d={PATH.base} fill={COLOR.cream} />
          <path d={PATH.ear} fill={COLOR.cream} />
          <path d={PATH.hair} fill={COLOR.ink} />
          <path data-part="brows" d={PATH.brows} fill={COLOR.ink} />
          <path d={PATH.beard} fill={COLOR.ink} />
          <path d={PATH.mouth} fill={COLOR.cream} />
          <path
            data-part="mouth-line"
            d={mouthPath(MOUTH_REST)}
            fill={COLOR.ink}
            stroke={COLOR.ink}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d={PATH.glasses} fill={COLOR.ink} />
          <g clipPath="url(#header-lens-left)">
            <path d={PATH.lensL} fill={COLOR.cream} />
            <path data-part="pupil" d={PATH.pupilL} fill={COLOR.ink} />
            <rect
              data-part="lid"
              x={BOX.lensL.x - 2}
              y={BOX.lensL.y - 2}
              width={BOX.lensL.w + 4}
              height={BOX.lensL.h + 4}
              fill={COLOR.ink}
            />
          </g>
          <g clipPath="url(#header-lens-right)">
            <path d={PATH.lensR} fill={COLOR.cream} />
            <path data-part="pupil" d={PATH.pupilR} fill={COLOR.ink} />
            <rect
              data-part="lid"
              x={BOX.lensR.x - 2}
              y={BOX.lensR.y - 2}
              width={BOX.lensR.w + 4}
              height={BOX.lensR.h + 4}
              fill={COLOR.ink}
            />
          </g>
        </svg>
      </div>
    </button>
  );
}

/** Slap the sticker onto the header, or tuck it away, without touching the watching transforms. */
function useEffectSlap(
  ref: RefObject<HTMLButtonElement | null>,
  docked: boolean,
) {
  const firstRun = useRef(true);

  useGSAP(() => {
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
  }, { dependencies: [docked], scope: ref, revertOnUpdate: true });
}
