"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { Capability } from "@/lib/types";

import styles from "./Capabilities.module.css";

type CapabilityRowProps = {
  capability: Capability;
  index: number;
  align: "left" | "right";
  indent: boolean;
  isInView: boolean;
  isActive: boolean;
  onToggle: () => void;
};

export function CapabilityRow({
  capability,
  index,
  align,
  indent,
  isInView,
  isActive,
  onToggle,
}: CapabilityRowProps) {
  const [displayText, setDisplayText] = useState("");
  const itemsText = capability.items.join("  ·  ");

  useEffect(() => {
    if (!isActive) {
      setDisplayText("");
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setDisplayText(itemsText);
      return;
    }

    let charIndex = 0;
    const interval = window.setInterval(() => {
      charIndex += 1;
      setDisplayText(itemsText.slice(0, charIndex));
      if (charIndex >= itemsText.length) {
        window.clearInterval(interval);
      }
    }, 18);

    return () => window.clearInterval(interval);
  }, [isActive, itemsText]);

  return (
    <div
      className={`${styles.row} ${align === "right" ? styles.rowRight : styles.rowLeft} ${
        indent ? styles.rowIndent : ""
      } ${isInView ? styles.rowVisible : ""}`}
      style={{ transitionDelay: `${index * 0.12}s` }}
    >
      <div className={styles.rowInner}>
        <button
          type="button"
          className={styles.trigger}
          aria-expanded={isActive}
          aria-controls={`capability-panel-${capability.id}`}
          onClick={onToggle}
          data-cursor="interactive"
        >
          <span className={styles.title}>
            <span className={styles.index}>
              {String(index + 1).padStart(2, "0")}
            </span>{" "}
            {capability.title}{" "}
            <span className={styles.thumbnailWrap}>
              (
              <span className={styles.thumbnail}>
                <Image
                  src={capability.imageSrc}
                  alt=""
                  fill
                  sizes="96px"
                  className={styles.thumbnailImage}
                />
              </span>
              )
            </span>
          </span>
          <span className={styles.hint} aria-hidden="true">
            {isActive
              ? "(close)"
              : align === "left"
                ? "→ click me"
                : "click me ←"}
          </span>
        </button>

        <div
          id={`capability-panel-${capability.id}`}
          className={`${styles.panel} ${isActive ? styles.panelOpen : ""}`}
          aria-hidden={!isActive}
        >
          <p className={styles.items}>{displayText}</p>
        </div>
      </div>
    </div>
  );
}
