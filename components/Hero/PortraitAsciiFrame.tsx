"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useMemo, useRef, type RefObject } from "react";

import {
  bindIdleAwareTicker,
  isDocumentVisible,
  observeElementVisibility,
} from "@/lib/animationPerf";

import type { PortraitPointer } from "./PortraitRgbCanvas";
import styles from "./Hero.module.css";

gsap.registerPlugin(useGSAP, ScrambleTextPlugin);

type PortraitAsciiFrameProps = {
  isHovered?: boolean;
  pointerRef?: RefObject<PortraitPointer>;
};

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+=<>/\\|{}[]~^._";
const COLS = 22;
const ROWS = 16;

const PORTRAIT_RADIUS = 0.3;
const PORTRAIT_PUSH = 16;
const CURSOR_RADIUS = 0.22;
const CURSOR_PUSH = 20;
const CURSOR_SWIRL = 5;

type CellSim = {
  depth: number;
  depthInfluence: number;
  baseScale: number;
  staticX: number;
  staticY: number;
};

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

function pickRandomNodes(nodes: HTMLElement[], count: number) {
  const batch: HTMLElement[] = [];
  const used = new Set<number>();

  while (batch.length < count && used.size < nodes.length) {
    const index = Math.floor(Math.random() * nodes.length);
    if (used.has(index)) continue;
    used.add(index);
    const node = nodes[index];
    if (node) batch.push(node);
  }

  return batch;
}

function computePortraitOffset(
  cell: { nx: number; ny: number; depth: number },
  pushScale: number,
) {
  const depthInfluence = 0.35 + cell.depth * 0.65;
  const pdx = cell.nx - 0.5;
  const pdy = cell.ny - 0.48;
  const pDist = Math.hypot(pdx, pdy);
  const pForce = falloff(pDist, PORTRAIT_RADIUS);

  if (pForce <= 0) {
    return { ox: 0, oy: 0, depthInfluence };
  }

  const inv = 1 / pDist;
  const ox =
    pdx * inv * pForce * PORTRAIT_PUSH * pushScale * depthInfluence +
    -pdy * inv * pForce * 4 * pushScale * depthInfluence;
  const oy =
    pdy * inv * pForce * PORTRAIT_PUSH * pushScale * depthInfluence +
    pdx * inv * pForce * 4 * pushScale * depthInfluence;

  return { ox, oy, depthInfluence };
}

export function PortraitAsciiFrame({
  isHovered = false,
  pointerRef,
}: PortraitAsciiFrameProps) {
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
        const visible =
          radius > 0.22 && radius < 0.58 && (index * 11) % 4 !== 0;
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
        stagger: { each: 0.012, from: "random" },
        ease: "power1.out",
      });

      let scrambleAlive = true;
      let scrambleVisible = true;

      const scrambleBurst = () => {
        if (!scrambleAlive || !scrambleVisible || !isDocumentVisible()) {
          gsap.delayedCall(0.5, scrambleBurst);
          return;
        }

        const batchSize = gsap.utils.random(2, 4, 1);
        const batch = pickRandomNodes(nodes, batchSize);
        const speed = scrambleScaleRef.current.value;

        batch.forEach((node) => {
          gsap.to(node, {
            duration: gsap.utils.random(0.35, 0.6) / speed,
            opacity: gsap.utils.random(0.22, 0.58),
            scrambleText: {
              text: pickChar(),
              chars: CHARS,
              speed: 0.9 * speed,
              delimiter: "",
            },
            ease: "none",
            overwrite: "auto",
          });
        });

        gsap.delayedCall(gsap.utils.random(0.4, 0.75) / speed, scrambleBurst);
      };

      gsap.delayedCall(0.55, scrambleBurst);

      const pointer = { x: 0.5, y: 0.5, strength: 0 };
      const setters = nodes.map((node) => ({
        x: gsap.quickSetter(node, "x", "px"),
        y: gsap.quickSetter(node, "y", "px"),
        scale: gsap.quickSetter(node, "scale"),
      }));

      const sims: CellSim[] = nodes.map((node) => {
        const cell = cellByKey.get(`${node.dataset.col}-${node.dataset.row}`);
        if (!cell) {
          return {
            depth: 0.5,
            depthInfluence: 0.5,
            baseScale: 1,
            staticX: 0,
            staticY: 0,
          };
        }

        const { ox, oy, depthInfluence } = computePortraitOffset(cell, 1);

        return {
          depth: cell.depth,
          depthInfluence,
          baseScale: 0.82 + cell.depth * 0.28,
          staticX: ox,
          staticY: oy,
        };
      });

      let pushScale = 1;

      const applyStaticLayout = () => {
        pushScale =
          Math.min(root.clientWidth || 1, root.clientHeight || 1) / 320;

        for (let i = 0; i < nodes.length; i += 1) {
          const cell = cellByKey.get(`${nodes[i]?.dataset.col}-${nodes[i]?.dataset.row}`);
          if (!cell) continue;

          const { ox, oy } = computePortraitOffset(cell, pushScale);
          sims[i].staticX = ox;
          sims[i].staticY = oy;
          setters[i]?.x(ox);
          setters[i]?.y(oy);
          setters[i]?.scale(sims[i].baseScale);
        }
      };

      applyStaticLayout();

      const resizeObserver = new ResizeObserver(() => {
        applyStaticLayout();
      });
      resizeObserver.observe(root);

      const applyWrapField = () => {
        const ptr = pointerRef?.current;
        const targetX = ptr?.x ?? 0.5;
        const targetY = ptr?.y ?? 0.5;
        const targetStrength = ptr?.hovered ? 1 : 0;

        pointer.x += (targetX - pointer.x) * 0.14;
        pointer.y += (targetY - pointer.y) * 0.14;
        pointer.strength += (targetStrength - pointer.strength) * 0.12;

        const isDynamic =
          Math.abs(targetX - pointer.x) > 0.001 ||
          Math.abs(targetY - pointer.y) > 0.001 ||
          Math.abs(targetStrength - pointer.strength) > 0.01 ||
          pointer.strength > 0.01;

        if (!isDynamic) return;

        for (let i = 0; i < nodes.length; i += 1) {
          const sim = sims[i];
          const cell = cellByKey.get(`${nodes[i]?.dataset.col}-${nodes[i]?.dataset.row}`);
          if (!cell || !sim) continue;

          let ox = sim.staticX + (pointer.x - 0.5) * sim.depth * 18 * pushScale;
          let oy = sim.staticY + (pointer.y - 0.5) * sim.depth * 18 * pushScale;

          if (pointer.strength > 0.01) {
            const cdx = cell.nx - pointer.x;
            const cdy = cell.ny - pointer.y;
            const cDist = Math.hypot(cdx, cdy);
            const cForce = falloff(cDist, CURSOR_RADIUS) * pointer.strength;

            if (cForce > 0) {
              const inv = 1 / cDist;
              ox +=
                cdx * inv * cForce * CURSOR_PUSH * pushScale * sim.depthInfluence;
              oy +=
                cdy * inv * cForce * CURSOR_PUSH * pushScale * sim.depthInfluence;
              ox +=
                -cdy * inv * cForce * CURSOR_SWIRL * pushScale * sim.depthInfluence;
              oy +=
                cdx * inv * cForce * CURSOR_SWIRL * pushScale * sim.depthInfluence;
            }
          }

          setters[i]?.x(ox);
          setters[i]?.y(oy);
          setters[i]?.scale(sim.baseScale + pointer.strength * sim.depth * 0.08);
        }
      };

      const stopTicker = bindIdleAwareTicker(root, applyWrapField);
      const stopVisibility = observeElementVisibility(root, (visible) => {
        scrambleVisible = visible;
      });

      return () => {
        scrambleAlive = false;
        intro.kill();
        gsap.killTweensOf(nodes);
        stopTicker();
        stopVisibility();
        resizeObserver.disconnect();
      };
    },
    { scope: rootRef, dependencies: [cells, pointerRef] },
  );

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || prefersReducedMotion()) return;

      gsap.to(scrambleScaleRef.current, {
        value: isHovered ? 1.15 : 1,
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
