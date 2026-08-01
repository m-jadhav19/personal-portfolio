"use client";

import { useEffect, useRef } from "react";

import { bindPrinterScroll } from "@/animations/printer";

import styles from "./PrinterText.module.css";

const LINE_COUNT = 9;

export function PrinterText() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const lines = Array.from(
      root.querySelectorAll<HTMLElement>("[data-printer-line]"),
    );

    return bindPrinterScroll({ root, lines });
  }, []);

  return (
    <div ref={rootRef} className={styles.printer} aria-hidden="true">
      <p className={styles.word}>MANDAR</p>
      <div className={styles.lines}>
        {Array.from({ length: LINE_COUNT }, (_, index) => (
          <span key={index} data-printer-line className={styles.line} />
        ))}
      </div>
    </div>
  );
}
