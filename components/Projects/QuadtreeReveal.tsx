"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./QuadtreeReveal.module.css";

type QuadtreeRevealProps = {
  imageSrc: string;
  alt: string;
  active: boolean;
};

type Cell = {
  x: number;
  y: number;
  width: number;
  height: number;
  delay: number;
};

function buildCells(
  width: number,
  height: number,
  pointerX: number,
  pointerY: number,
  depth = 5,
): Cell[] {
  const cells: Cell[] = [];
  const threshold = 128;

  const walk = (
    x: number,
    y: number,
    w: number,
    h: number,
    level: number,
    delay: number,
  ) => {
    if (level >= depth || w < 24 || h < 24) {
      cells.push({ x, y, width: w, height: h, delay });
      return;
    }

    const centerX = x + w / 2;
    const centerY = y + h / 2;
    const distance = Math.hypot(centerX - pointerX, centerY - pointerY);
    const nextDelay = delay + distance / threshold / 40;

    walk(x, y, w / 2, h / 2, level + 1, nextDelay);
    walk(x + w / 2, y, w / 2, h / 2, level + 1, nextDelay + 0.03);
    walk(x, y + h / 2, w / 2, h / 2, level + 1, nextDelay + 0.06);
    walk(x + w / 2, y + h / 2, w / 2, h / 2, level + 1, nextDelay + 0.09);
  };

  walk(0, 0, width, height, 0, 0);
  return cells;
}

export function QuadtreeReveal({ imageSrc, alt, active }: QuadtreeRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const rafRef = useRef(0);

  useEffect(() => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      imageRef.current = image;
      setIsReady(true);
    };
  }, [imageSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!active || !isReady) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const image = imageRef.current;
    if (!image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cells = buildCells(rect.width, rect.height, rect.width / 2, rect.height / 2);
    const start = performance.now();
    const duration = 800;
    let cancelled = false;

    const draw = (now: number) => {
      if (cancelled) return;

      ctx.clearRect(0, 0, rect.width, rect.height);

      for (const cell of cells) {
        const progress = Math.min(
          1,
          Math.max(0, (now - start - cell.delay * 1000) / duration),
        );
        if (progress <= 0) continue;

        ctx.globalAlpha = progress;
        ctx.drawImage(
          image,
          (cell.x / rect.width) * image.width,
          (cell.y / rect.height) * image.height,
          (cell.width / rect.width) * image.width,
          (cell.height / rect.height) * image.height,
          cell.x,
          cell.y,
          cell.width,
          cell.height,
        );
      }

      ctx.globalAlpha = 1;
      if (now - start < duration + 200) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, rect.width, rect.height);
    };
  }, [active, isReady]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      data-active={active ? "true" : "false"}
      aria-hidden="true"
    />
  );
}
