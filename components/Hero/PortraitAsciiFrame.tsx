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
const COLS = 22;
const ROWS = 16;
const GLITCH_BARS = 5;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function pickGlyph(seed: number) {
  return GLYPHS[(seed * 17 + 3) % GLYPHS.length] ?? "0";
}

export function PortraitAsciiFrame({ isHovered = false }: PortraitAsciiFrameProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const cells = useMemo(
    () =>
      Array.from({ length: COLS * ROWS }, (_, index) => {
        const col = index % COLS;
        const row = Math.floor(index / COLS);
        const nx = (col + 0.5) / COLS - 0.5;
        const ny = (row + 0.5) / ROWS - 0.5;
        const radius = Math.hypot(nx * 1.15, ny * 1.05);
        // Keep the portrait face readable — denser at the rim.
        const ring = radius > 0.28 && radius < 0.52;
        const edge = radius >= 0.52;
        return {
          key: `${col}-${row}`,
          col,
          row,
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

      const glyphs = root.querySelectorAll<HTMLElement>("[data-glyph]");
      const bars = root.querySelectorAll<HTMLElement>("[data-glitch]");
      const scan = root.querySelector<HTMLElement>("[data-scan]");
      const veil = root.querySelector<HTMLElement>("[data-veil]");
      const hud = root.querySelectorAll<HTMLElement>("[data-hud]");
      const status = root.querySelector<HTMLElement>("[data-status]");

      gsap.set(glyphs, { opacity: 0 });
      gsap.set(bars, { opacity: 0, xPercent: 0 });
      gsap.set(veil, { opacity: 0.35 });
      gsap.set(hud, { opacity: 0 });
      gsap.set(status, { opacity: 0 });

      if (prefersReducedMotion()) {
        gsap.set(glyphs, {
          opacity: (index, el) => {
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
            opacity: (index, el) => {
              const tone = el.getAttribute("data-tone");
              if (tone === "core") return 0.1;
              if (tone === "mid") return 0.7;
              return 0.35;
            },
            duration: 0.55,
            stagger: { each: 0.008, from: "edges" },
          },
          0.05,
        )
        .to(hud, { opacity: 0.95, duration: 0.4, stagger: 0.06 }, 0.25)
        .to(status, { opacity: 0.8, duration: 0.35 }, 0.4);

      const loop = gsap.timeline({ repeat: -1 });

      loop.to(
        glyphs,
        {
          opacity: (index, el) => {
            const tone = el.getAttribute("data-tone");
            const pulse = 0.15 + Math.random() * 0.55;
            if (tone === "core") return 0.05 + pulse * 0.12;
            if (tone === "mid") return 0.35 + pulse * 0.55;
            return 0.18 + pulse * 0.35;
          },
          duration: 0.35,
          stagger: { each: 0.01, from: "random" },
          ease: "steps(2)",
        },
        0,
      );

      // Matrix rain: cascade opacity down columns.
      for (let col = 0; col < COLS; col += 1) {
        const column = root.querySelectorAll<HTMLElement>(`[data-col='${col}']`);
        gsap.to(column, {
          opacity: (index) => 0.15 + ((index + col) % 5) * 0.14,
          duration: 1.1 + (col % 5) * 0.15,
          stagger: { each: 0.08, from: "start", yoyo: true, repeat: -1 },
          ease: "sine.inOut",
          delay: (col % 7) * 0.12,
        });
      }

      // Occasional glyph swaps to sell the “live stream” feel.
      const glyphNodes = Array.from(glyphs);
      const swap = () => {
        for (let i = 0; i < 18; i += 1) {
          const node = gsap.utils.random(glyphNodes);
          node.textContent = pickGlyph(Math.floor(Math.random() * 200));
        }
      };
      const swapInterval = window.setInterval(swap, 140);

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

      timelineRef.current = loop;

      return () => {
        window.clearInterval(swapInterval);
      };
    },
    { scope: rootRef },
  );

  useGSAP(
    () => {
      const root = rootRef.current;
      const loop = timelineRef.current;
      if (!root || prefersReducedMotion()) return;

      gsap.to(root, {
        scale: isHovered ? 1.04 : 1,
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

      const matrix = root.querySelector<HTMLElement>("[data-matrix]");
      if (matrix) {
        gsap.to(matrix, {
          x: isHovered ? 2 : 0,
          duration: 0.08,
          ease: "steps(1)",
          yoyo: true,
          repeat: isHovered ? 3 : 0,
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
