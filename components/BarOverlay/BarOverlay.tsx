"use client";

import { useLayoutEffect, useRef } from "react";

import {
  BAR_OVERLAY_COUNT,
  createBarOverlayController,
  registerBarOverlay,
} from "@/animations/barOverlay";

import styles from "./BarOverlay.module.css";

export function BarOverlay() {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const bars = barRefs.current.filter(
      (bar): bar is HTMLDivElement => bar !== null,
    );

    if (bars.length === 0) return;

    const controller = createBarOverlayController(bars);
    registerBarOverlay(controller);

    return () => {
      controller.destroy();
      registerBarOverlay(null);
    };
  }, []);

  return (
    <div className={styles.overlay} data-bar-overlay aria-hidden="true">
      {Array.from({ length: BAR_OVERLAY_COUNT }, (_, index) => (
        <div
          key={index}
          ref={(element) => {
            barRefs.current[index] = element;
          }}
          className={styles.bar}
        />
      ))}
    </div>
  );
}
