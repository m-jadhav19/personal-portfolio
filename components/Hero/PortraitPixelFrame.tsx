"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useMemo, useRef } from "react";

import styles from "./Hero.module.css";

gsap.registerPlugin(useGSAP);

type PortraitPixelFrameProps = {
  isHovered?: boolean;
};

const GRID = 18;
const CELL = 100 / GRID;
const EDGE = 1;

type PixelCell = {
  key: string;
  x: number;
  y: number;
  kind: "frame" | "corner" | "inner";
};

function buildFrameCells(): PixelCell[] {
  const cells: PixelCell[] = [];
  const max = GRID - 1 - EDGE;
  const inner = EDGE + 2;
  const innerMax = GRID - 1 - inner;

  const pushUnique = (x: number, y: number, kind: PixelCell["kind"]) => {
    const key = `${kind}-${x}-${y}`;
    if (cells.some((cell) => cell.key === key)) return;

    const arm = 4;
    const isCorner =
      kind !== "inner" &&
      ((x <= EDGE + arm && y === EDGE) ||
        (y <= EDGE + arm && x === EDGE) ||
        (x >= max - arm && y === EDGE) ||
        (y <= EDGE + arm && x === max) ||
        (x <= EDGE + arm && y === max) ||
        (y >= max - arm && x === EDGE) ||
        (x >= max - arm && y === max) ||
        (y >= max - arm && x === max));

    cells.push({
      key,
      x,
      y,
      kind: isCorner ? "corner" : kind,
    });
  };

  for (let i = EDGE; i <= max; i += 1) {
    pushUnique(i, EDGE, "frame");
    pushUnique(i, max, "frame");
    pushUnique(EDGE, i, "frame");
    pushUnique(max, i, "frame");
  }

  for (let i = inner; i <= innerMax; i += 1) {
    if (i % 2 === 0) {
      pushUnique(i, inner, "inner");
      pushUnique(i, innerMax, "inner");
      pushUnique(inner, i, "inner");
      pushUnique(innerMax, i, "inner");
    }
  }

  return cells;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PortraitPixelFrame({ isHovered = false }: PortraitPixelFrameProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const cells = useMemo(() => buildFrameCells(), []);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const framePixels = root.querySelectorAll<SVGRectElement>("[data-pixel='frame']");
      const cornerPixels = root.querySelectorAll<SVGRectElement>("[data-pixel='corner']");
      const innerPixels = root.querySelectorAll<SVGRectElement>("[data-pixel='inner']");
      const bloom = root.querySelector<HTMLElement>("[data-bloom]");
      const scan = root.querySelector<HTMLElement>("[data-scan]");
      const field = root.querySelector<HTMLElement>("[data-field]");
      const sparks = root.querySelectorAll<HTMLElement>("[data-spark]");
      const travelers = root.querySelectorAll<HTMLElement>("[data-traveler]");

      gsap.set([framePixels, cornerPixels, innerPixels], {
        transformOrigin: "50% 50%",
        scale: 0.2,
        opacity: 0,
      });
      gsap.set(bloom, { opacity: 0.25, scale: 0.92 });
      gsap.set(field, { opacity: 0.28 });
      gsap.set(sparks, { opacity: 0, scale: 0.4 });
      gsap.set(travelers, { opacity: 0 });

      if (prefersReducedMotion()) {
        gsap.set([framePixels, cornerPixels, innerPixels], { scale: 1, opacity: 0.7 });
        gsap.set(cornerPixels, { opacity: 1 });
        gsap.set(bloom, { opacity: 0.45, scale: 1 });
        gsap.set(field, { opacity: 0.4 });
        gsap.set(travelers, { opacity: 0.8 });
        return;
      }

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      intro
        .to(bloom, { opacity: 0.55, scale: 1, duration: 0.9 }, 0)
        .to(
          framePixels,
          {
            scale: 1,
            opacity: 0.55,
            duration: 0.55,
            stagger: { each: 0.012, from: "edges" },
          },
          0.08,
        )
        .to(
          cornerPixels,
          {
            scale: 1.15,
            opacity: 1,
            duration: 0.45,
            stagger: 0.03,
          },
          0.2,
        )
        .to(
          innerPixels,
          {
            scale: 1,
            opacity: 0.35,
            duration: 0.4,
            stagger: { each: 0.02, from: "center" },
          },
          0.28,
        )
        .to(travelers, { opacity: 0.95, duration: 0.35 }, 0.4)
        .to(
          sparks,
          {
            opacity: 0.85,
            scale: 1,
            duration: 0.5,
            stagger: 0.08,
          },
          0.35,
        );

      const loop = gsap.timeline({ repeat: -1 });

      loop
        .to(
          framePixels,
          {
            opacity: 0.85,
            duration: 1.1,
            stagger: { each: 0.03, from: "random", yoyo: true, repeat: 1 },
            ease: "sine.inOut",
          },
          0,
        )
        .to(
          cornerPixels,
          {
            scale: 1.35,
            opacity: 1,
            duration: 0.7,
            yoyo: true,
            repeat: 1,
            stagger: 0.08,
            ease: "sine.inOut",
          },
          0.2,
        )
        .to(
          bloom,
          {
            opacity: 0.85,
            scale: 1.08,
            duration: 1.6,
            yoyo: true,
            repeat: 1,
            ease: "sine.inOut",
          },
          0,
        )
        .to(
          field,
          {
            opacity: 0.5,
            duration: 1.8,
            yoyo: true,
            repeat: 1,
            ease: "sine.inOut",
          },
          0.1,
        )
        .to(
          sparks,
          {
            opacity: 1,
            scale: 1.35,
            x: (index) => (index % 2 === 0 ? 8 : -8),
            y: (index) => (index % 3 === 0 ? -10 : 6),
            duration: 1.4,
            stagger: 0.12,
            yoyo: true,
            repeat: 1,
            ease: "sine.inOut",
          },
          0.15,
        );

      if (scan) {
        gsap.fromTo(
          scan,
          { yPercent: -40, opacity: 0 },
          {
            yPercent: 420,
            opacity: 1,
            duration: 2.8,
            ease: "none",
            repeat: -1,
            repeatDelay: 1.1,
          },
        );
      }

      travelers.forEach((traveler, index) => {
        const edge = traveler.dataset.traveler;
        const duration = 4.2;
        const delay = index * -1.05;

        if (edge === "top") {
          gsap.fromTo(
            traveler,
            { left: "7%", top: "6.5%", opacity: 0.25 },
            {
              left: "88%",
              opacity: 1,
              duration,
              ease: "none",
              repeat: -1,
              delay,
            },
          );
        } else if (edge === "right") {
          gsap.fromTo(
            traveler,
            { left: "88.5%", top: "7%", opacity: 0.25 },
            {
              top: "88%",
              opacity: 1,
              duration,
              ease: "none",
              repeat: -1,
              delay,
            },
          );
        } else if (edge === "bottom") {
          gsap.fromTo(
            traveler,
            { left: "88%", top: "88.5%", opacity: 0.25 },
            {
              left: "7%",
              opacity: 1,
              duration,
              ease: "none",
              repeat: -1,
              delay,
            },
          );
        } else {
          gsap.fromTo(
            traveler,
            { left: "6.5%", top: "88%", opacity: 0.25 },
            {
              top: "7%",
              opacity: 1,
              duration,
              ease: "none",
              repeat: -1,
              delay,
            },
          );
        }
      });

      timelineRef.current = loop;
    },
    { scope: rootRef },
  );

  useGSAP(
    () => {
      const root = rootRef.current;
      const loop = timelineRef.current;
      if (!root || prefersReducedMotion()) return;

      gsap.to(root, {
        scale: isHovered ? 1.1 : 1,
        filter: isHovered
          ? "drop-shadow(0 0 28px rgba(14,165,233,0.45))"
          : "drop-shadow(0 0 0 rgba(14,165,233,0))",
        duration: 0.45,
        ease: "power2.out",
        overwrite: "auto",
      });

      if (loop) {
        gsap.to(loop, {
          timeScale: isHovered ? 2.4 : 1,
          duration: 0.4,
          ease: "power2.out",
          overwrite: true,
        });
      }

      const plate = root.querySelector<HTMLElement>("[data-plate]");
      if (plate) {
        gsap.to(plate, {
          borderColor: isHovered
            ? "rgba(14,165,233,0.55)"
            : "rgba(245,244,240,0.1)",
          boxShadow: isHovered
            ? "inset 0 0 0 1px rgba(14,165,233,0.28), 0 0 34px rgba(14,165,233,0.22)"
            : "inset 0 0 0 1px rgba(14,165,233,0.08), 0 0 0 1px rgba(0,0,0,0.4)",
          duration: 0.4,
          ease: "power2.out",
        });
      }
    },
    { dependencies: [isHovered], scope: rootRef },
  );

  return (
    <div ref={rootRef} className={styles.portraitBackdrop} aria-hidden="true">
      <div className={styles.portraitBloom} data-bloom />
      <div className={styles.portraitPlate} data-plate />
      <div className={styles.portraitDotField} data-field />
      <div className={styles.portraitGrain} />
      <div className={styles.portraitScan}>
        <span className={styles.portraitScanBeam} data-scan />
      </div>

      <svg
        className={styles.portraitPixelSvg}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="pixel-corner-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        {cells.map((cell) => (
          <rect
            key={cell.key}
            data-pixel={cell.kind}
            className={
              cell.kind === "corner"
                ? styles.pixelCorner
                : cell.kind === "inner"
                  ? styles.pixelInner
                  : styles.pixelFrame
            }
            x={cell.x * CELL + CELL * 0.18}
            y={cell.y * CELL + CELL * 0.18}
            width={CELL * 0.64}
            height={CELL * 0.64}
          />
        ))}
      </svg>

      <span className={styles.pixelTraveler} data-traveler="top" />
      <span className={styles.pixelTraveler} data-traveler="right" />
      <span className={styles.pixelTraveler} data-traveler="bottom" />
      <span className={styles.pixelTraveler} data-traveler="left" />

      <span className={`${styles.portraitSpark} ${styles.sparkA}`} data-spark />
      <span className={`${styles.portraitSpark} ${styles.sparkB}`} data-spark />
      <span className={`${styles.portraitSpark} ${styles.sparkC}`} data-spark />
      <span className={`${styles.portraitSpark} ${styles.sparkD}`} data-spark />
    </div>
  );
}
