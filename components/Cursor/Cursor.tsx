"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import styles from "./Cursor.module.css";

type CursorState =
  | "default"
  | "project"
  | "image"
  | "link"
  | "button"
  | "lab"
  | "nav"
  | "interactive";

const LABEL_BY_STATE: Partial<Record<CursorState, string>> = {
  project: "VIEW →",
  image: "EXPLORE",
  link: "OPEN ↗",
  button: "→",
  lab: "EXPERIMENT",
};

const FOLLOW_DOT = 0.42;
const FOLLOW_RING = 0.22;

function resolveCursor(element: Element | null): {
  state: CursorState;
  label: string;
} {
  if (!element) return { state: "default", label: "" };

  const target = element.closest("[data-cursor]");
  if (!target) return { state: "default", label: "" };

  const type = (target.getAttribute("data-cursor") || "default") as CursorState;
  if (type === "hide") return { state: "default", label: "" };

  const custom = target.getAttribute("data-cursor-text") || "";
  const label = custom || LABEL_BY_STATE[type] || "";

  return { state: type, label };
}

export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const position = useRef({ x: 0, y: 0 });
  const ringPosition = useRef({ x: 0, y: 0 });
  const [state, setState] = useState<CursorState>("default");
  const [label, setLabel] = useState("");
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;

    if (!isFinePointer || prefersReducedMotion) return;

    setActive(true);
    document.body.classList.add("custom-cursor-active");

    const applyTarget = (el: Element | null) => {
      const next = resolveCursor(el);
      setState((current) => (current === next.state ? current : next.state));
      setLabel((current) => (current === next.label ? current : next.label));
    };

    const onMove = (event: MouseEvent) => {
      mouse.current.x = event.clientX;
      mouse.current.y = event.clientY;

      const under = document.elementFromPoint(event.clientX, event.clientY);
      applyTarget(under);
    };

    let frame = 0;
    const animate = () => {
      position.current.x +=
        (mouse.current.x - position.current.x) * FOLLOW_DOT;
      position.current.y +=
        (mouse.current.y - position.current.y) * FOLLOW_DOT;
      ringPosition.current.x +=
        (mouse.current.x - ringPosition.current.x) * FOLLOW_RING;
      ringPosition.current.y +=
        (mouse.current.y - ringPosition.current.y) * FOLLOW_RING;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPosition.current.x}px, ${ringPosition.current.y}px, 0) translate(-50%, -50%)`;
      }

      frame = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
      document.body.classList.remove("custom-cursor-active");
      setActive(false);
    };
  }, [mounted]);

  if (!mounted || !active) return null;

  const showLabel = Boolean(label);

  return createPortal(
    <>
      <div
        ref={ringRef}
        className={`${styles.ring} ${styles[`ring_${state}`] ?? ""}`}
        aria-hidden="true"
      />
      <div
        ref={cursorRef}
        className={`${styles.main} ${styles[`main_${state}`] ?? ""} ${
          showLabel ? styles.mainLabeled : ""
        }`}
        aria-hidden="true"
      >
        {showLabel ? (
          <span className={styles.label}>{label}</span>
        ) : (
          <span className={styles.cross}>+</span>
        )}
      </div>
    </>,
    document.body,
  );
}
