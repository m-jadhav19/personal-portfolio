"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useMemo, useRef } from "react";

import styles from "./Hero.module.css";

gsap.registerPlugin(useGSAP);

type PortraitAsciiFrameProps = {
  isHovered?: boolean;
};

const GLYPHS = "01アイウエオラリルレロ$#@%&*+=<>|/\\░▒▓█▄▀▌▐¦∴";
const COLS = 26;
const ROWS = 20;
const GLITCH_BARS = 5;

/** Permanent wrap radius around the portrait face (normalized 0–1). */
const PORTRAIT_RADIUS = 0.3;
const PORTRAIT_PUSH = 42;
/** Moving wrap radius around the cursor. */
const CURSOR_RADIUS = 0.34;
const CURSOR_PUSH = 56;
const CURSOR_SWIRL = 18;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function pickGlyph(seed: number) {
  return GLYPHS[(seed * 17 + 3) % GLYPHS.length] ?? "0";
}

function falloff(distance: number, radius: number) {
  if (distance >= radius || distance < 0.0001) return 0;
  const t = 1 - distance / radius;
  return t * t * (3 - 2 * t);
}

export function PortraitAsciiFrame({ isHovered = false }: PortraitAsciiFrameProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const cells = useMemo(
    () =>
      Array.from({ length: COLS * ROWS }, (_, index) => {
        const col = index % COLS;
        const row = Math.floor(index / COLS);
        const nx = (col + 0.5) / COLS;
        const ny = (row + 0.5) / ROWS;
        const dx = nx - 0.5;
        const dy = ny - 0.48;
        const radius = Math.hypot(dx * 1.12, dy * 1.05);
        const ring = radius > 0.26 && radius < 0.5;
        const edge = radius >= 0.5;
        return {
          key: `${col}-${row}`,
          col,
          row,
          nx,
          ny,
          glyph: pickGlyph(index + col * 3),
          tone: ring ? "mid" : edge ? "edge" : "core",
          delay: (col * 0.04 + row * 0.02) % 1.4,
        };
      }),
    [],
  );

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const matrix = root.querySelector<HTMLElement>("[data-matrix]");
      const glyphs = root.querySelectorAll<HTMLElement>("[data-glyph]");
      const bars = root.querySelectorAll<HTMLElement>("[data-glitch]");
      const scan = root.querySelector<HTMLElement>("[data-scan]");
      const veil = root.querySelector<HTMLElement>("[data-veil]");
      const hud = root.querySelectorAll<HTMLElement>("[data-hud]");
      const status = root.querySelector<HTMLElement>("[data-status]");
      const glyphNodes = Array.from(glyphs);

      gsap.set(glyphs, { opacity: 0, x: 0, y: 0, scale: 1 });
      gsap.set(bars, { opacity: 0, xPercent: 0 });
      gsap.set(veil, { opacity: 0.35 });
      gsap.set(hud, { opacity: 0 });
      gsap.set(status, { opacity: 0 });

      if (prefersReducedMotion()) {
        gsap.set(glyphs, {
          opacity: (_index, el) => {
            const tone = el.getAttribute("data-tone");
            if (tone === "core") return 0.08;
            if (tone === "mid") return 0.45;
            return 0.28;
          },
        });
        gsap.set(hud, { opacity: 0.85 });
        gsap.set(status, { opacity: 0.7 });
        gsap.set(veil, { opacity: 0.45 });
        return;
      }

      const intro = gsap.timeline({ defaults: { ease: "power2.out" } });

      intro
        .to(veil, { opacity: 0.55, duration: 0.7 }, 0)
        .to(
          glyphs,
          {
            opacity: (_index, el) => {
              const tone = el.getAttribute("data-tone");
              if (tone === "core") return 0.12;
              if (tone === "mid") return 0.72;
              return 0.38;
            },
            duration: 0.55,
            stagger: { each: 0.006, from: "edges" },
          },
          0.05,
        )
        .to(hud, { opacity: 0.95, duration: 0.4, stagger: 0.06 }, 0.25)
        .to(status, { opacity: 0.8, duration: 0.35 }, 0.4);

      const loop = gsap.timeline({ repeat: -1 });
      loop.to(
        glyphs,
        {
          opacity: (_index, el) => {
            const tone = el.getAttribute("data-tone");
            const pulse = 0.15 + Math.random() * 0.45;
            if (tone === "core") return 0.06 + pulse * 0.1;
            if (tone === "mid") return 0.4 + pulse * 0.45;
            return 0.2 + pulse * 0.3;
          },
          duration: 0.4,
          stagger: { each: 0.012, from: "random" },
          ease: "steps(2)",
        },
        0,
      );

      const swap = () => {
        for (let i = 0; i < 22; i += 1) {
          const node = gsap.utils.random(glyphNodes);
          node.textContent = pickGlyph(Math.floor(Math.random() * 200));
        }
      };
      const swapInterval = window.setInterval(swap, 150);

      bars.forEach((bar, index) => {
        gsap.fromTo(
          bar,
          { opacity: 0, xPercent: -8, scaleY: 0.6 },
          {
            opacity: () => 0.35 + Math.random() * 0.55,
            xPercent: () => gsap.utils.random(-18, 18),
            scaleY: () => gsap.utils.random(0.5, 1.4),
            duration: 0.12,
            ease: "steps(1)",
            repeat: -1,
            repeatDelay: 1.4 + index * 0.55,
            yoyo: true,
          },
        );
      });

      if (scan) {
        gsap.fromTo(
          scan,
          { yPercent: -30, opacity: 0 },
          {
            yPercent: 380,
            opacity: 0.9,
            duration: 2.4,
            ease: "none",
            repeat: -1,
            repeatDelay: 0.9,
          },
        );
      }

      gsap.to(status, {
        opacity: 0.35,
        duration: 0.08,
        ease: "steps(1)",
        repeat: -1,
        yoyo: true,
        repeatDelay: 2.6,
      });

      // Cursor + portrait wrap field (screen-relative, lerped).
      const target = { x: 0.5, y: 0.5, strength: 0 };
      const pointer = { x: 0.5, y: 0.5, strength: 0 };
      const setters = glyphNodes.map((node) => ({
        x: gsap.quickSetter(node, "x", "px"),
        y: gsap.quickSetter(node, "y", "px"),
        scale: gsap.quickSetter(node, "scale"),
        node,
      }));

      const syncPointerFromEvent = (event: PointerEvent | MouseEvent) => {
        if (!matrix) return;
        const rect = matrix.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) return;

        const nx = (event.clientX - rect.left) / rect.width;
        const ny = (event.clientY - rect.top) / rect.height;
        // Stay responsive across the hero — fall off outside the matrix.
        const outside =
          nx < -0.2 || nx > 1.2 || ny < -0.25 || ny > 1.25
            ? 0
            : 1 - Math.max(0, Math.max(-nx, nx - 1, -ny, ny - 1) * 1.6);

        target.x = gsap.utils.clamp(-0.15, 1.15, nx);
        target.y = gsap.utils.clamp(-0.15, 1.15, ny);
        target.strength = gsap.utils.clamp(0, 1, outside);
      };

      const onPointerMove = (event: PointerEvent) => {
        syncPointerFromEvent(event);
      };

      const onPointerLeave = () => {
        target.strength = 0;
      };

      const applyWrapField = () => {
        pointer.x += (target.x - pointer.x) * 0.14;
        pointer.y += (target.y - pointer.y) * 0.14;
        pointer.strength += (target.strength - pointer.strength) * 0.12;

        const matrixWidth = matrix?.clientWidth ?? 1;
        const matrixHeight = matrix?.clientHeight ?? 1;
        const pushScale = Math.min(matrixWidth, matrixHeight) / 320;

        for (let i = 0; i < cells.length; i += 1) {
          const cell = cells[i];
          const setter = setters[i];
          if (!cell || !setter) continue;

          let ox = 0;
          let oy = 0;
          let scale = 1;

          // Wrap around the portrait face (always on).
          const pdx = cell.nx - 0.5;
          const pdy = cell.ny - 0.48;
          const pDist = Math.hypot(pdx, pdy);
          const pForce = falloff(pDist, PORTRAIT_RADIUS);
          if (pForce > 0) {
            const inv = 1 / pDist;
            ox += pdx * inv * pForce * PORTRAIT_PUSH * pushScale;
            oy += pdy * inv * pForce * PORTRAIT_PUSH * pushScale;
            // Tangential swirl so glyphs flow around the cutout.
            ox += -pdy * inv * pForce * 10 * pushScale;
            oy += pdx * inv * pForce * 10 * pushScale;
            scale += pForce * 0.15;
          }

          // Moving wrap field around the cursor.
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
              scale += cForce * 0.35;
              if (cForce > 0.55) {
                setter.node.dataset.hot = "1";
              } else {
                delete setter.node.dataset.hot;
              }
            } else {
              delete setter.node.dataset.hot;
            }
          } else {
            delete setter.node.dataset.hot;
          }

          setter.x(ox);
          setter.y(oy);
          setter.scale(scale);
        }
      };

      gsap.ticker.add(applyWrapField);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave);

      timelineRef.current = loop;

      return () => {
        window.clearInterval(swapInterval);
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
      const loop = timelineRef.current;
      if (!root || prefersReducedMotion()) return;

      gsap.to(root, {
        filter: isHovered
          ? "drop-shadow(0 0 22px rgba(14,165,233,0.35))"
          : "drop-shadow(0 0 0 rgba(14,165,233,0))",
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });

      if (loop) {
        gsap.to(loop, {
          timeScale: isHovered ? 2.2 : 1,
          duration: 0.35,
          ease: "power2.out",
          overwrite: true,
        });
      }
    },
    { dependencies: [isHovered], scope: rootRef },
  );

  return (
    <div ref={rootRef} className={styles.portraitBackdrop} aria-hidden="true">
      <div className={styles.asciiVeil} data-veil />
      <div className={styles.asciiGrain} />

      <div className={styles.asciiMatrix} data-matrix>
        {cells.map((cell) => (
          <span
            key={cell.key}
            className={styles.asciiCell}
            data-glyph
            data-tone={cell.tone}
            data-col={cell.col}
            style={{
              gridColumn: cell.col + 1,
              gridRow: cell.row + 1,
              animationDelay: `${cell.delay}s`,
            }}
          >
            {cell.glyph}
          </span>
        ))}
      </div>

      <div className={styles.asciiScan}>
        <span className={styles.asciiScanBeam} data-scan />
      </div>

      <div className={styles.asciiGlitchLayer}>
        {Array.from({ length: GLITCH_BARS }, (_, index) => (
          <span
            key={index}
            className={styles.asciiGlitchBar}
            data-glitch
            style={{ top: `${12 + index * 16}%` }}
          />
        ))}
      </div>

      <div className={styles.asciiHud} data-hud>
        <span className={styles.asciiBracket}>⌜</span>
        <span className={styles.asciiBracket}>⌝</span>
        <span className={styles.asciiBracket}>⌞</span>
        <span className={styles.asciiBracket}>⌟</span>
      </div>

      <p className={styles.asciiStatus} data-status>
        SYS://LINK_OK · MATRIX.FEED
      </p>
    </div>
  );
}
