import { gsap } from "gsap";

import type { CursorTracker } from "./cursor.ts";

type Point = {
  bx: number;
  by: number;
  seed: number;
};

export type ParticleField = {
  resize: () => void;
  setLevel: (level: number) => void;
  setTurbulence: (value: number) => void;
  addTurbulence: (delta: number) => void;
  decayTurbulence: () => void;
  destroy: () => void;
};

type FieldOptions = {
  canvas: HTMLCanvasElement;
  cursor: CursorTracker;
};

function hueForX(xNorm: number): number {
  return 225 - xNorm * 105;
}

export function createParticleField({
  canvas,
  cursor,
}: FieldOptions): ParticleField {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2d context");
  }

  let points: Point[] = [];
  let spacing = 16;
  let level = 0;
  let turbulence = 0;
  let visible = true;

  const clock = { t: 0 };
  gsap.to(clock, { t: 1000, duration: 1000, ease: "none", repeat: -1 });

  const buildField = () => {
    points = [];
    const cw = window.innerWidth;
    const ch = window.innerHeight;
    spacing = Math.max(11, Math.sqrt((cw * ch) / 6200));
    const cols = Math.ceil(cw / spacing) + 2;
    const rows = Math.ceil(ch / spacing) + 2;

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        points.push({
          bx: i * spacing,
          by: j * spacing,
          seed: Math.random() * Math.PI * 2,
        });
      }
    }
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildField();
  };

  const drawField = () => {
    if (!visible || document.visibilityState === "hidden") return;

    const { x: cursorX, y: cursorY } = cursor.getSmoothed();
    const t = clock.t;
    const turb = 1 + turbulence * 1.8;
    const cw = window.innerWidth;
    const ch = window.innerHeight;

    ctx.clearRect(0, 0, cw, ch);

    for (let k = 0; k < points.length; k++) {
      const p = points[k];
      const wave =
        Math.sin(p.bx * 0.01 + t * 0.55 + p.seed * 0.15) * 26 * turb +
        Math.sin(p.by * 0.016 - t * 0.35) * 10 * turb;

      const py = p.by + wave;
      const px = p.bx;

      const dx = px - cursorX;
      const dy = py - cursorY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const influence = Math.max(0, 1 - dist / 260);

      const pushX = px + (dx / dist) * influence * 26;
      const pushY = py + (dy / dist) * influence * 26;

      const shimmer = (Math.sin(p.bx * 0.05 + p.by * 0.05 + t * 0.8) + 1) / 2;
      const size = 0.9 + influence * 2.6 + shimmer * 0.6;
      const alpha = 0.1 + influence * 0.55 + shimmer * 0.12 + level * 0.15;

      const hue = hueForX(px / cw) + influence * 14;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${hue}, 90%, ${62 + influence * 10}%, ${Math.min(alpha, 0.95)})`;
      if (influence > 0.35) {
        ctx.shadowColor = `hsla(${hue}, 100%, 65%, 0.9)`;
        ctx.shadowBlur = 8;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.arc(pushX, pushY, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  };

  const onVisibilityChange = () => {
    visible = document.visibilityState !== "hidden";
  };

  gsap.ticker.add(drawField);
  gsap.ticker.fps(60);
  document.addEventListener("visibilitychange", onVisibilityChange);
  resize();

  return {
    resize,
    setLevel: (value) => {
      level = value;
    },
    setTurbulence: (value) => {
      turbulence = value;
    },
    addTurbulence: (delta) => {
      turbulence = Math.min(1, turbulence * 0.8 + delta);
    },
    decayTurbulence: () => {
      gsap.to(
        { v: turbulence },
        {
          v: 0,
          duration: 1.2,
          onUpdate() {
            turbulence = (this.targets()[0] as { v: number }).v;
          },
        },
      );
    },
    destroy: () => {
      gsap.ticker.remove(drawField);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    },
  };
}
