"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useMemo, useRef } from "react";

import styles from "./Hero.module.css";

gsap.registerPlugin(useGSAP, ScrambleTextPlugin);

type PortraitAsciiFrameProps = {
  isHovered?: boolean;
};

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+=<>/\\|{}[]~^._";
const COLS = 28;
const ROWS = 22;

const PORTRAIT_RADIUS = 0.3;
const PORTRAIT_PUSH = 16;
const CURSOR_RADIUS = 0.22;
const CURSOR_PUSH = 20;
const CURSOR_SWIRL = 5;

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
  const scrambleScaleRef = useRef({ value: 1 });

  const cells = useMemo(
    () =>
      Array.from({ length: COLS * ROWS }, (_, index) => {
        const col = index % COLS;
        const row = Math.floor(index / COLS);
        const nx = (col + 0.5) / COLS;
        const ny = (row + 0.5) / ROWS;
        const dx = nx - 0.5;
        const dy = ny - 0.48;
        const radius = Math.hypot(dx * 1.05, dy * 0.95);
        // Wider, denser ring around the portrait.
        const visible = radius > 0.22 && radius < 0.58 && (index * 11) % 7 !== 0;
        const depth = 1 - Math.min(1, Math.max(0, (radius - 0.22) / 0.36));
        return {
          key: `${col}-${row}`,
          col,
          row,
          nx,
          ny,
          depth,
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
      const cellByKey = new Map(cells.map((cell) => [`${cell.col}-${cell.row}`, cell]));

      gsap.set(nodes, { opacity: 0, x: 0, y: 0, scale: 1 });

      if (prefersReducedMotion()) {
        gsap.set(nodes, { opacity: 0.35 });
        return;
      }

      nodes.forEach((node) => {
        const cell = cellByKey.get(`${node.dataset.col}-${node.dataset.row}`);
        const depth = cell?.depth ?? 0.5;
        gsap.set(node, {
          opacity: 0.18 + depth * 0.42,
          scale: 0.82 + depth * 0.28,
        });
      });

      const intro = gsap.to(nodes, {
        opacity: (index) => {
          const node = nodes[index];
          const cell = cellByKey.get(`${node?.dataset.col}-${node?.dataset.row}`);
          const depth = cell?.depth ?? 0.5;
          return 0.22 + depth * 0.48 + Math.random() * 0.12;
        },
        duration: 0.55,
        stagger: { each: 0.01, from: "random" },
        ease: "power1.out",
      });

      // GSAP-driven scramble loop (ScrambleTextPlugin + delayedCall).
      let scrambleAlive = true;
      const scrambleBurst = () => {
        if (!scrambleAlive) return;

        const batchSize = gsap.utils.random(3, 9, 1);
        const batch = gsap.utils.shuffle(nodes.slice()).slice(0, batchSize);
        const speed = scrambleScaleRef.current.value;

        batch.forEach((node) => {
          gsap.to(node, {
            duration: gsap.utils.random(0.28, 0.55) / speed,
            opacity: gsap.utils.random(0.22, 0.62),
            scrambleText: {
              text: pickChar(),
              chars: CHARS,
              speed: 1.1 * speed,
              delimiter: "",
            },
            ease: "none",
            overwrite: "auto",
          });
        });

        gsap.delayedCall(gsap.utils.random(0.14, 0.32) / speed, scrambleBurst);
      };

      gsap.delayedCall(0.55, scrambleBurst);

      const target = { x: 0.5, y: 0.5, strength: 0 };
      const pointer = { x: 0.5, y: 0.5, strength: 0 };
      const setters = nodes.map((node) => ({
        x: gsap.quickSetter(node, "x", "px"),
        y: gsap.quickSetter(node, "y", "px"),
        scale: gsap.quickSetter(node, "scale"),
      }));

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

          const depth = cell.depth;
          const depthInfluence = 0.35 + depth * 0.65;

          let ox = (pointer.x - 0.5) * depth * 18 * pushScale;
          let oy = (pointer.y - 0.5) * depth * 18 * pushScale;

          const pdx = cell.nx - 0.5;
          const pdy = cell.ny - 0.48;
          const pDist = Math.hypot(pdx, pdy);
          const pForce = falloff(pDist, PORTRAIT_RADIUS);
          if (pForce > 0) {
            const inv = 1 / pDist;
            ox += pdx * inv * pForce * PORTRAIT_PUSH * pushScale * depthInfluence;
            oy += pdy * inv * pForce * PORTRAIT_PUSH * pushScale * depthInfluence;
            ox += -pdy * inv * pForce * 4 * pushScale * depthInfluence;
            oy += pdx * inv * pForce * 4 * pushScale * depthInfluence;
          }

          if (pointer.strength > 0.01) {
            const cdx = cell.nx - pointer.x;
            const cdy = cell.ny - pointer.y;
            const cDist = Math.hypot(cdx, cdy);
            const cForce = falloff(cDist, CURSOR_RADIUS) * pointer.strength;
            if (cForce > 0) {
              const inv = 1 / cDist;
              ox += cdx * inv * cForce * CURSOR_PUSH * pushScale * depthInfluence;
              oy += cdy * inv * cForce * CURSOR_PUSH * pushScale * depthInfluence;
              ox += -cdy * inv * cForce * CURSOR_SWIRL * pushScale * depthInfluence;
              oy += cdx * inv * cForce * CURSOR_SWIRL * pushScale * depthInfluence;
            }
          }

          setter.x(ox);
          setter.y(oy);
          setter.scale(0.82 + depth * 0.28 + pointer.strength * depth * 0.08);
        }
      };

      gsap.ticker.add(applyWrapField);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave);

      return () => {
        scrambleAlive = false;
        intro.kill();
        gsap.killTweensOf(nodes);
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

      gsap.to(scrambleScaleRef.current, {
        value: isHovered ? 1.25 : 1,
        duration: 0.35,
        ease: "power2.out",
        overwrite: true,
      });

      gsap.to(root, {
        opacity: isHovered ? 1 : 0.88,
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
