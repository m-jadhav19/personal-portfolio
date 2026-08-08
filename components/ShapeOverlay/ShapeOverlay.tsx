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
      data-shape-overlay
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        ref={(element) => {
          pathRefs.current[0] = element;
        }}
        fill="var(--overlay-layer-primary)"
      />
      <path
        ref={(element) => {
          pathRefs.current[1] = element;
        }}
        fill="var(--overlay-layer-secondary)"
      />
    </svg>
  );
}
