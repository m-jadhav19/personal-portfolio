"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { Service } from "@/lib/types";

import styles from "./Services.module.css";

type ServiceRowProps = {
  service: Service;
  index: number;
  align: "left" | "right";
  indent: boolean;
  isInView: boolean;
  isActive: boolean;
  onToggle: () => void;
};

export function ServiceRow({
  service,
  index,
  align,
  indent,
  isInView,
  isActive,
  onToggle,
}: ServiceRowProps) {
  const [displayText, setDisplayText] = useState("");
  const itemsText = service.items.join("  ·  ");

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
          aria-controls={`service-panel-${service.id}`}
          onClick={onToggle}
        >
          <span className={styles.title}>
            {service.title}{" "}
            <span className={styles.thumbnailWrap}>
              (
              <span className={styles.thumbnail}>
                <Image
                  src={service.imageSrc}
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
          id={`service-panel-${service.id}`}
          className={`${styles.panel} ${isActive ? styles.panelOpen : ""}`}
          aria-hidden={!isActive}
        >
          <p className={styles.items}>{displayText}</p>
        </div>
      </div>
    </div>
  );
}
