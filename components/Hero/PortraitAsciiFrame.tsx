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

const CHARS = "0123456789ABCDEF#%&*+=<>/\\|{}[]~^._";
const COLS = 22;
const ROWS = 16;

const PORTRAIT_RADIUS = 0.34;
const PORTRAIT_PUSH = 24;
const CURSOR_RADIUS = 0.26;
const CURSOR_PUSH = 30;
const CURSOR_SWIRL = 8;

const CHROMA_SHADOW =
  "3px 0 rgba(59,111,255,0.85), -3px 0 rgba(140,195,255,0.75)";

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
  return CHARS[seed % CHARS.length] ?? "0";
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
  const matrixRef = useRef<HTMLDivElement>(null);
  const scrambleScaleRef = useRef({ value: 1 });
  const moshIntensityRef = useRef({ value: 0.58 });

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
          radius > 0.18 && radius < 0.62 && (index * 11) % 5 !== 0;
        const depth = 1 - Math.min(1, Math.max(0, (radius - 0.18) / 0.44));

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
      const matrix = matrixRef.current;
      if (!root || !matrix) return;

      const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-char]"));
      const cellByKey = new Map(cells.map((cell) => [`${cell.col}-${cell.row}`, cell]));

      gsap.set(nodes, { opacity: 0, x: 0, y: 0, scale: 1, textShadow: "none" });

      if (prefersReducedMotion()) {
        gsap.set(nodes, { opacity: 0.35 });
        return;
      }

      nodes.forEach((node) => {
        const cell = cellByKey.get(`${node.dataset.col}-${node.dataset.row}`);
        const depth = cell?.depth ?? 0.5;
        gsap.set(node, {
          opacity: 0.28 + depth * 0.55,
          scale: 0.76 + depth * 0.38,
        });
      });

      const intro = gsap.to(nodes, {
        opacity: (index) => {
          const node = nodes[index];
          const cell = cellByKey.get(`${node?.dataset.col}-${node?.dataset.row}`);
          const depth = cell?.depth ?? 0.5;
          return 0.32 + depth * 0.58 + Math.random() * 0.14;
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

        const batchSize = gsap.utils.random(4, 7, 1);
        const batch = pickRandomNodes(nodes, batchSize);
        const speed = scrambleScaleRef.current.value;

        batch.forEach((node) => {
          gsap.to(node, {
            duration: gsap.utils.random(0.3, 0.55) / speed,
            opacity: gsap.utils.random(0.38, 0.78),
            scrambleText: {
              text: pickChar(),
              chars: CHARS,
              speed: 1.15 * speed,
              delimiter: "",
            },
            ease: "none",
            overwrite: "auto",
          });
        });

        gsap.delayedCall(gsap.utils.random(0.28, 0.55) / speed, scrambleBurst);
      };

      const nodesByRow = new Map<number, HTMLElement[]>();
      nodes.forEach((node) => {
        const row = Number(node.dataset.row);
        if (!nodesByRow.has(row)) nodesByRow.set(row, []);
        nodesByRow.get(row)?.push(node);
      });

      const datamoshBurst = () => {
        if (!scrambleAlive || !scrambleVisible || !isDocumentVisible()) {
          gsap.delayedCall(0.6, datamoshBurst);
          return;
        }

        const intensity = moshIntensityRef.current.value;
        const speed = scrambleScaleRef.current.value;
        const bandHeight = gsap.utils.random(3, 5, 1);
        const startRow = gsap.utils.random(0, ROWS - bandHeight, 1);
        const bandNodes: HTMLElement[] = [];

        for (let row = startRow; row < startRow + bandHeight; row += 1) {
          const rowNodes = nodesByRow.get(row);
          if (rowNodes) bandNodes.push(...rowNodes);
        }

        if (bandNodes.length > 0) {
          const tearX = gsap.utils.random(-30, 30) * intensity;
          const smearX = tearX * gsap.utils.random(0.35, 0.65);

          gsap
            .timeline({ defaults: { overwrite: "auto" } })
            .to(bandNodes, {
              x: `+=${tearX}`,
              duration: gsap.utils.random(0.04, 0.09) / speed,
              ease: "steps(3)",
              stagger: { each: 0.004, from: "random" },
            })
            .to(
              bandNodes,
              {
                x: `+=${smearX}`,
                duration: gsap.utils.random(0.12, 0.28) / speed,
                ease: "power4.out",
                stagger: { each: 0.003, from: "random" },
              },
              "-=0.02",
            )
            .to(bandNodes, {
              x: 0,
              duration: gsap.utils.random(0.2, 0.45) / speed,
              ease: "power2.inOut",
              stagger: { each: 0.002, from: "edges" },
            });
        }

        const corruptBatch = pickRandomNodes(
          nodes,
          gsap.utils.random(6, 11, 1),
        );
        corruptBatch.forEach((node) => {
          const blockX = gsap.utils.random(-16, 16) * intensity;
          const blockY = gsap.utils.random(-8, 8) * intensity;

          gsap
            .timeline({ defaults: { overwrite: "auto" } })
            .to(node, {
              x: `+=${blockX}`,
              y: `+=${blockY}`,
              textShadow: CHROMA_SHADOW,
              duration: 0.05,
              ease: "steps(2)",
            })
            .to(
              node,
              {
                scrambleText: {
                  text: pickChar(),
                  chars: CHARS,
                  speed: 1.4 * speed,
                  delimiter: "",
                },
                duration: 0.12 / speed,
                ease: "none",
              },
              0,
            )
            .to(node, {
              x: 0,
              y: 0,
              textShadow: "none",
              duration: gsap.utils.random(0.15, 0.35) / speed,
              ease: "power3.out",
            });
        });

        gsap
          .timeline()
          .to(matrix, {
            skewX: gsap.utils.random(-4, 4) * intensity,
            x: gsap.utils.random(-10, 10) * intensity,
            duration: 0.06,
            ease: "steps(2)",
          })
          .to(matrix, {
            skewX: 0,
            x: 0,
            duration: gsap.utils.random(0.18, 0.32) / speed,
            ease: "power2.out",
          });

        gsap.delayedCall(gsap.utils.random(0.3, 0.65) / speed, datamoshBurst);
      };

      gsap.delayedCall(0.55, scrambleBurst);
      gsap.delayedCall(0.7, datamoshBurst);

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
          baseScale: 0.76 + cell.depth * 0.38,
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

          let ox = sim.staticX + (pointer.x - 0.5) * sim.depth * 28 * pushScale;
          let oy = sim.staticY + (pointer.y - 0.5) * sim.depth * 28 * pushScale;

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
          setters[i]?.scale(sim.baseScale + pointer.strength * sim.depth * 0.14);
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
        gsap.killTweensOf(matrix);
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
      const matrix = matrixRef.current;
      if (!root || prefersReducedMotion()) return;

      gsap.to(scrambleScaleRef.current, {
        value: isHovered ? 1.55 : 1.15,
        duration: 0.35,
        ease: "power2.out",
        overwrite: true,
      });

      gsap.to(moshIntensityRef.current, {
        value: isHovered ? 1.2 : 0.58,
        duration: 0.35,
        ease: "power2.out",
        overwrite: true,
      });

      gsap.to(root, {
        opacity: isHovered ? 1 : 0.94,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });

      if (matrix) {
        gsap.to(matrix, {
          filter: isHovered
            ? "saturate(1.35) brightness(1.12)"
            : "saturate(1.1) brightness(1.04)",
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    },
    { dependencies: [isHovered], scope: rootRef },
  );

  return (
    <div ref={rootRef} className={styles.portraitBackdrop} aria-hidden="true">
      <div ref={matrixRef} className={styles.asciiMatrix} data-matrix>
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
