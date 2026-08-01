"use client";

import { useEffect, useState } from "react";

import styles from "./TypoTransition.module.css";

type TypoTransitionProps = {
  active: boolean;
  onComplete: () => void;
};

export function TypoTransition({ active, onComplete }: TypoTransitionProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timer = window.setTimeout(() => {
      onComplete();
      setVisible(false);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [active, onComplete]);

  if (!visible) return null;

  return (
    <div className={styles.overlay} aria-hidden="true">
      <div className={styles.scanline} />
      <p className={styles.label}>typo detected</p>
      <div className={styles.lines}>
        {Array.from({ length: 9 }, (_, index) => (
          <span
            key={index}
            className={styles.line}
            style={{ animationDelay: `${index * 60}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
