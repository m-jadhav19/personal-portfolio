"use client";

import { useEffect, useRef } from "react";

import { bindIdleAwareTicker } from "@/lib/animationPerf";

import styles from "./PortraitGlitchField.module.css";

type PortraitGlitchFieldProps = {
  hovered?: boolean;
  /** Normalized pointer inside the portrait stage */
  pointer?: { x: number; y: number };
};

/**
 * Soft CRT / signal-noise field behind the portrait — replaces the
 * scramble-character grid with something that reads as glitch without
 * competing with the marquee type.
 */
export function PortraitGlitchField({
  hovered = false,
  pointer = { x: 0.5, y: 0.5 },
}: PortraitGlitchFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoveredRef = useRef(hovered);
  const pointerRef = useRef(pointer);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    pointerRef.current = pointer;
  }, [pointer]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let sliceY = 0.35;
    let sliceH = 0.04;
    let sliceOffset = 0;
    let flash = 0;
    let t = 0;

    const resize = () => {
      const rect = root.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0);
    };

    const draw = (dt: number) => {
      t += dt;
      ctx.clearRect(0, 0, width, height);

      // Soft radial vignette
      const grd = ctx.createRadialGradient(
        width * 0.5,
        height * 0.48,
        width * 0.12,
        width * 0.5,
        height * 0.5,
        width * 0.62,
      );
      grd.addColorStop(0, "rgba(36, 87, 255, 0.08)");
      grd.addColorStop(0.55, "rgba(36, 87, 255, 0.03)");
      grd.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);

      // Scanlines
      ctx.globalAlpha = hoveredRef.current ? 0.16 : 0.1;
      ctx.fillStyle = "rgba(200, 218, 255, 0.35)";
      for (let y = 0; y < height; y += 3) {
        ctx.fillRect(0, y, width, 1);
      }
      ctx.globalAlpha = 1;

      // Slow drifting horizontal tear
      if (!reducedMotion) {
        sliceY = (sliceY + dt * 0.04) % 1;
        if (Math.random() < (hoveredRef.current ? 0.04 : 0.012)) {
          sliceH = 0.02 + Math.random() * 0.06;
          sliceOffset = (Math.random() - 0.5) * width * 0.08;
          flash = 1;
        }
        flash = Math.max(0, flash - dt * 3);

        const y = Math.floor(sliceY * height);
        const h = Math.max(2, Math.floor(sliceH * height));
        ctx.globalAlpha = 0.22 + flash * 0.35;
        ctx.fillStyle = "rgba(36, 87, 255, 0.55)";
        ctx.fillRect(sliceOffset, y, width, h);
        ctx.globalAlpha = 0.12 + flash * 0.2;
        ctx.fillStyle = "rgba(245, 240, 224, 0.35)";
        ctx.fillRect(-sliceOffset * 0.5, y + 1, width, Math.max(1, h - 2));
        ctx.globalAlpha = 1;
      }

      // Pointer-reactive noise motes
      const px = pointerRef.current.x * width;
      const py = pointerRef.current.y * height;
      const moteCount = hoveredRef.current ? 48 : 28;
      ctx.fillStyle = "rgba(200, 218, 255, 0.55)";
      for (let i = 0; i < moteCount; i += 1) {
        const seed = i * 97.13 + t * (hoveredRef.current ? 40 : 12);
        const x = (Math.sin(seed) * 0.5 + 0.5) * width;
        const y = (Math.cos(seed * 0.73) * 0.5 + 0.5) * height;
        const dist = Math.hypot(x - px, y - py);
        const boost = hoveredRef.current ? Math.max(0, 1 - dist / 120) : 0;
        const size = 1 + boost * 2;
        ctx.globalAlpha = 0.15 + boost * 0.55;
        ctx.fillRect(x, y, size, size);
      }
      ctx.globalAlpha = 1;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(root);

    let last = performance.now();
    const stop = reducedMotion
      ? () => {}
      : bindIdleAwareTicker(root, () => {
          const now = performance.now();
          draw((now - last) / 1000);
          last = now;
        });

    return () => {
      stop();
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`${styles.field} ${hovered ? styles.fieldHot : ""}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.ring} />
    </div>
  );
}
