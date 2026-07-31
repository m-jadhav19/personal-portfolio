"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

import {
  MERCURY_CORE,
  MERCURY_DEEP,
  MERCURY_MID,
  createPortraitBlobController,
} from "@/animations/portraitBlob";
import { createMercuryParticleSystem } from "@/animations/portraitBlobParticles";
import { subscribeLenisScroll } from "@/hooks/useLenis";

import styles from "./Hero.module.css";

type PortraitBlobProps = {
  clipId: string;
  isHovered?: boolean;
};

export function PortraitBlob({ clipId, isHovered = false }: PortraitBlobProps) {
  const clipPathRef = useRef<SVGPathElement>(null);
  const outlinePathRef = useRef<SVGPathElement>(null);
  const fillPathRef = useRef<SVGPathElement>(null);
  const highlightPathRef = useRef<SVGPathElement>(null);
  const particleGroupRef = useRef<SVGGElement>(null);
  const particleSvgRef = useRef<SVGSVGElement>(null);
  const controllerRef = useRef<ReturnType<typeof createPortraitBlobController> | null>(
    null,
  );

  useLayoutEffect(() => {
    const clipPath = clipPathRef.current;
    if (!clipPath) return;

    const controller = createPortraitBlobController({
      clipPath,
      outlinePath: outlinePathRef.current,
      fillPath: fillPathRef.current,
      highlightPath: highlightPathRef.current,
    });

    controllerRef.current = controller;
    controller.start();

    let destroyParticles: (() => void) | undefined;
    if (particleSvgRef.current && particleGroupRef.current) {
      destroyParticles = createMercuryParticleSystem(
        particleSvgRef.current,
        particleGroupRef.current,
      );
    }

    return () => {
      destroyParticles?.();
      controller.destroy();
      controllerRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    controllerRef.current?.setHover(isHovered);
  }, [isHovered]);

  useEffect(() => {
    const hero = document.getElementById("hero");
    let lastScrollY = -1;

    const unsubscribe = subscribeLenisScroll((scrollY) => {
      if (lastScrollY < 0) {
        lastScrollY = scrollY;
        return;
      }

      const delta = scrollY - lastScrollY;
      lastScrollY = scrollY;
      const effectiveDelta = Math.abs(delta) < 0.25 ? 0 : delta;
      const progress = hero
        ? Math.min(Math.max(scrollY / hero.offsetHeight, 0), 1)
        : 0;

      controllerRef.current?.setScroll(effectiveDelta, progress);
    });

    return unsubscribe;
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    controllerRef.current?.setPointer(x, y, true);
  };

  const handlePointerLeave = () => {
    controllerRef.current?.setPointer(50, 50, false);
  };

  return (
    <div
      className={styles.portraitBlobRoot}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <svg
        className={styles.portraitBlobGlow}
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`${clipId}-mercury`} cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#e0fbff" stopOpacity="0.95" />
            <stop offset="42%" stopColor={MERCURY_CORE} stopOpacity="0.82" />
            <stop offset="100%" stopColor={MERCURY_DEEP} stopOpacity="0.72" />
          </radialGradient>
          <linearGradient id={`${clipId}-sheen`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="100%" stopColor={MERCURY_MID} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          ref={fillPathRef}
          className={styles.portraitBlobFill}
          fill={`url(#${clipId}-mercury)`}
        />
        <path
          ref={highlightPathRef}
          className={styles.portraitBlobHighlight}
          fill={`url(#${clipId}-sheen)`}
        />
        <path ref={outlinePathRef} className={styles.portraitBlobOutline} />
      </svg>

      <svg
        ref={particleSvgRef}
        className={styles.portraitBlobParticles}
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <g ref={particleGroupRef} />
      </svg>

      <svg className={styles.portraitBlobDefs} viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path ref={clipPathRef} transform="scale(0.01)" />
          </clipPath>
        </defs>
      </svg>

      <div
        className={styles.portraitBlobWindow}
        style={{ clipPath: `url(#${clipId})` }}
      >
        <div className={styles.portraitMercury} aria-hidden="true" />
        <div className={styles.portraitMercurySheen} aria-hidden="true" />
      </div>
    </div>
  );
}
