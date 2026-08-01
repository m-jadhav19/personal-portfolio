"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useMemo, useRef } from "react";

import styles from "./Hero.module.css";

gsap.registerPlugin(useGSAP);

type PortraitAsciiFrameProps = {
  isHovered?: boolean;
};

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+=<>/\\|{}[]~^._";
const COLS = 20;
const ROWS = 16;

const PORTRAIT_RADIUS = 0.3;
const PORTRAIT_PUSH = 36;
const CURSOR_RADIUS = 0.32;
const CURSOR_PUSH = 48;
const CURSOR_SWIRL = 14;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function pickChar(seed = Math.floor(Math.random() * 1000)) {
  return CHARS[seed % CHARS.length] ?? "A";
}

function falloff(distance: number, radius: number) {
  if (distance >= radius || distance < 0.0001) return 0;
  const t = 1 - distance / radius;
  return t * t * (3 - 2 * t);
}

export function PortraitAsciiFrame({ isHovered = false }: PortraitAsciiFrameProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const cells = useMemo(
    () =>
      Array.from({ length: COLS * ROWS }, (_, index) => {
        const col = index % COLS;
        const row = Math.floor(index / COLS);
        const nx = (col + 0.5) / COLS;
        const ny = (row + 0.5) / ROWS;
        const dx = nx - 0.5;
        const dy = ny - 0.48;
        const radius = Math.hypot(dx * 1.1, dy);
        // Sparse ring only — leave face and far edges empty.
        const visible = radius > 0.28 && radius < 0.52 && (index * 7) % 5 !== 0;
        return {
          key: `${col}-${row}`,
          col,
          row,
          nx,
          ny,
          char: visible ? pickChar(index + 11) : "",
          visible,
        };
      }).filter((cell) => cell.visible),
    [],
  );

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const matrix = root.querySelector<HTMLElement>("[data-matrix]");
      const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-char]"));

      gsap.set(nodes, { opacity: 0, x: 0, y: 0 });

      if (prefersReducedMotion()) {
        gsap.set(nodes, { opacity: 0.35 });
        return;
      }

      gsap.to(nodes, {
        opacity: () => 0.18 + Math.random() * 0.35,
        duration: 0.6,
        stagger: { each: 0.01, from: "random" },
        ease: "power1.out",
      });

      // Random scramble — swap a few characters and flicker opacity.
      const scramble = () => {
        const count = 4 + Math.floor(Math.random() * 8);
        for (let i = 0; i < count; i += 1) {
          const node = gsap.utils.random(nodes);
          if (Math.random() > 0.35) {
            node.textContent = pickChar();
          }
          gsap.to(node, {
            opacity: 0.12 + Math.random() * 0.45,
            duration: 0.08,
            ease: "none",
            overwrite: "auto",
          });
        }
      };
      const scrambleInterval = window.setInterval(scramble, 220);

      const target = { x: 0.5, y: 0.5, strength: 0 };
      const pointer = { x: 0.5, y: 0.5, strength: 0 };
      const setters = nodes.map((node) => ({
        x: gsap.quickSetter(node, "x", "px"),
        y: gsap.quickSetter(node, "y", "px"),
        node,
      }));

      // Map DOM order back to cell data via data-col/data-row.
      const cellByKey = new Map(cells.map((cell) => [`${cell.col}-${cell.row}`, cell]));

      const onPointerMove = (event: PointerEvent) => {
        if (!matrix) return;
        const rect = matrix.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) return;

        const nx = (event.clientX - rect.left) / rect.width;
        const ny = (event.clientY - rect.top) / rect.height;
        const outside =
          nx < -0.2 || nx > 1.2 || ny < -0.25 || ny > 1.25
            ? 0
            : 1 - Math.max(0, Math.max(-nx, nx - 1, -ny, ny - 1) * 1.6);

        target.x = gsap.utils.clamp(-0.15, 1.15, nx);
        target.y = gsap.utils.clamp(-0.15, 1.15, ny);
        target.strength = gsap.utils.clamp(0, 1, outside);
      };

      const onPointerLeave = () => {
        target.strength = 0;
      };

      const applyWrapField = () => {
        pointer.x += (target.x - pointer.x) * 0.14;
        pointer.y += (target.y - pointer.y) * 0.14;
        pointer.strength += (target.strength - pointer.strength) * 0.12;

        const pushScale = Math.min(matrix?.clientWidth ?? 1, matrix?.clientHeight ?? 1) / 320;

        for (let i = 0; i < nodes.length; i += 1) {
          const node = nodes[i];
          const setter = setters[i];
          if (!node || !setter) continue;

          const cell = cellByKey.get(`${node.dataset.col}-${node.dataset.row}`);
          if (!cell) continue;

          let ox = 0;
          let oy = 0;

          const pdx = cell.nx - 0.5;
          const pdy = cell.ny - 0.48;
          const pDist = Math.hypot(pdx, pdy);
          const pForce = falloff(pDist, PORTRAIT_RADIUS);
          if (pForce > 0) {
            const inv = 1 / pDist;
            ox += pdx * inv * pForce * PORTRAIT_PUSH * pushScale;
            oy += pdy * inv * pForce * PORTRAIT_PUSH * pushScale;
            ox += -pdy * inv * pForce * 8 * pushScale;
            oy += pdx * inv * pForce * 8 * pushScale;
          }

          if (pointer.strength > 0.01) {
            const cdx = cell.nx - pointer.x;
            const cdy = cell.ny - pointer.y;
            const cDist = Math.hypot(cdx, cdy);
            const cForce = falloff(cDist, CURSOR_RADIUS) * pointer.strength;
            if (cForce > 0) {
              const inv = 1 / cDist;
              ox += cdx * inv * cForce * CURSOR_PUSH * pushScale;
              oy += cdy * inv * cForce * CURSOR_PUSH * pushScale;
              ox += -cdy * inv * cForce * CURSOR_SWIRL * pushScale;
              oy += cdx * inv * cForce * CURSOR_SWIRL * pushScale;
            }
          }

          setter.x(ox);
          setter.y(oy);
        }
      };

      gsap.ticker.add(applyWrapField);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave);

      return () => {
        window.clearInterval(scrambleInterval);
        gsap.ticker.remove(applyWrapField);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerleave", onPointerLeave);
      };
    },
    { scope: rootRef, dependencies: [cells] },
  );

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || prefersReducedMotion()) return;

      gsap.to(root, {
        opacity: isHovered ? 1 : 0.85,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    },
    { dependencies: [isHovered], scope: rootRef },
  );

  return (
    <div ref={rootRef} className={styles.portraitBackdrop} aria-hidden="true">
      <div className={styles.asciiMatrix} data-matrix>
        {cells.map((cell) => (
          <span
            key={cell.key}
            className={styles.asciiCell}
            data-char
            data-col={cell.col}
            data-row={cell.row}
            style={{
              gridColumn: cell.col + 1,
              gridRow: cell.row + 1,
            }}
          >
            {cell.char}
          </span>
        ))}
      </div>
    </div>
  );
}
