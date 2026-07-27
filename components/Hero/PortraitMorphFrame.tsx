"use client";

import { useLayoutEffect, useRef } from "react";

import { createPortraitFrameController } from "@/animations/portraitFrame";

import styles from "./Hero.module.css";

type PortraitMorphFrameProps = {
  isHovered?: boolean;
};

export function PortraitMorphFrame({ isHovered = false }: PortraitMorphFrameProps) {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const controllerRef = useRef<ReturnType<typeof createPortraitFrameController> | null>(
    null,
  );

  useLayoutEffect(() => {
    const paths = pathRefs.current.filter(
      (path): path is SVGPathElement => path !== null,
    );

    if (paths.length === 0) return;

    const controller = createPortraitFrameController(paths);
    controllerRef.current = controller;
    controller.start();

    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    controllerRef.current?.setHover(isHovered);
  }, [isHovered]);

  return (
    <svg
      className={styles.portraitMorphSvg}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="portrait-frame-gradient-1"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f5f4f0" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient
          id="portrait-frame-gradient-1-hover"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#f5f4f0" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient
          id="portrait-frame-gradient-2"
          x1="100%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#1a1a1a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0e0e0e" stopOpacity="0.75" />
        </linearGradient>
      </defs>
      <path
        ref={(element) => {
          pathRefs.current[0] = element;
        }}
        fill="url(#portrait-frame-gradient-2)"
      />
      <path
        ref={(element) => {
          pathRefs.current[1] = element;
        }}
        className={styles.portraitMorphPathAccent}
        fill="url(#portrait-frame-gradient-1)"
      />
    </svg>
  );
}
