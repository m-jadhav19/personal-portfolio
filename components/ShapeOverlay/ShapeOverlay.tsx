"use client";

import { useLayoutEffect, useRef } from "react";

import {
  createShapeOverlayController,
  registerShapeOverlay,
} from "@/animations/shapeOverlay";

import styles from "./ShapeOverlay.module.css";

export function ShapeOverlay() {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useLayoutEffect(() => {
    const paths = pathRefs.current.filter(
      (path): path is SVGPathElement => path !== null,
    );

    if (paths.length === 0) return;

    const controller = createShapeOverlayController(paths);
    registerShapeOverlay(controller);

    return () => {
      controller.destroy();
      registerShapeOverlay(null);
    };
  }, []);

  return (
    <svg
      className={styles.overlay}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="shape-overlay-gradient-1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0e0e0e" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
        <linearGradient id="shape-overlay-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#f5f4f0" />
        </linearGradient>
      </defs>
      <path
        ref={(element) => {
          pathRefs.current[0] = element;
        }}
        fill="url(#shape-overlay-gradient-2)"
      />
      <path
        ref={(element) => {
          pathRefs.current[1] = element;
        }}
        fill="url(#shape-overlay-gradient-1)"
      />
    </svg>
  );
}
