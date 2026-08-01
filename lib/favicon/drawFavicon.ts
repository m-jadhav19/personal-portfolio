import { faviconColors as c } from "./colors";
import type { FaviconMode } from "./types";

const SIZE = 32;

function clear(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, SIZE, SIZE);
}

function drawMonogram(
  ctx: CanvasRenderingContext2D,
  offsetX = 0,
  offsetY = 0,
  color: string = c.foreground,
  lineWidth = 2.4,
) {
  const x = 7 + offsetX;
  const top = 6 + offsetY;
  const bottom = 24 + offsetY;
  const midX = 16 + offsetX;
  const midY = 15 + offsetY;
  const right = 25 + offsetX;

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "square";
  ctx.lineJoin = "miter";

  ctx.beginPath();
  ctx.moveTo(x, bottom);
  ctx.lineTo(x, top);
  ctx.lineTo(midX, midY);
  ctx.lineTo(right, top);
  ctx.lineTo(right, bottom);
  ctx.stroke();
}

function drawAccentBar(
  ctx: CanvasRenderingContext2D,
  width: number,
  color: string = c.accent,
) {
  const barWidth = Math.min(18, Math.max(6, width));
  const x = 7 + (18 - barWidth) / 2;
  ctx.fillStyle = color;
  ctx.fillRect(x, 26, barWidth, 2);
}

function drawDefault(ctx: CanvasRenderingContext2D, frame: number) {
  clear(ctx);
  ctx.fillStyle = c.background;
  ctx.fillRect(0, 0, SIZE, SIZE);

  drawMonogram(ctx);
  const pulse = 0.5 + Math.sin(frame * 0.08) * 0.5;
  drawAccentBar(ctx, 10 + pulse * 8);

  ctx.fillStyle = c.accent;
  ctx.globalAlpha = 0.35 + pulse * 0.35;
  ctx.fillRect(24, 6, 2, 2);
  ctx.globalAlpha = 1;
}

function drawBrokenUx(ctx: CanvasRenderingContext2D, frame: number) {
  clear(ctx);

  const flash = Math.sin(frame * 0.35) > 0.85;
  ctx.fillStyle = flash ? "#1a0000" : c.background;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const glitchX = Math.sin(frame * 0.9) * 2.2;
  const glitchY = Math.cos(frame * 0.7) * 1.6;

  drawMonogram(ctx, glitchX - 1.5, 0, c.brokenRed, 2);
  drawMonogram(ctx, -glitchX + 1.5, 0, "#00ffff", 1.6);
  drawMonogram(ctx, 0, glitchY, c.foreground, 2.2);

  ctx.fillStyle = c.brokenYellow;
  for (let i = 0; i < 4; i += 1) {
    ctx.fillRect(20 + i * 3, 2 + i * 3, 3, 3);
  }

  if (frame % 16 < 8) {
    ctx.fillStyle = c.brokenRed;
    ctx.fillRect(0, 0, SIZE, 2);
  }

  drawAccentBar(ctx, 18, c.brokenRed);
}

function drawMyspace(ctx: CanvasRenderingContext2D, frame: number) {
  clear(ctx);

  const gradient = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  const shift = Math.sin(frame * 0.12) * 0.5 + 0.5;
  gradient.addColorStop(0, c.myspacePink);
  gradient.addColorStop(0.45 + shift * 0.1, c.myspaceCyan);
  gradient.addColorStop(1, c.myspaceYellow);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(2, 2, SIZE - 4, SIZE - 4);

  drawMonogram(ctx, 0, 0, "#ffffff", 2.2);

  const sparkles = [
    { x: 6, y: 7, glyph: "✦" },
    { x: 23, y: 9, glyph: "★" },
    { x: 8, y: 22, glyph: "♥" },
    { x: 24, y: 21, glyph: "✧" },
  ];

  ctx.font = '7px "Bitcount Single", sans-serif';
  ctx.textAlign = "center";
  sparkles.forEach((sparkle, index) => {
    const bob = Math.sin(frame * 0.2 + index) * 1.5;
    const blink = Math.sin(frame * 0.3 + index * 2) > -0.2;
    if (!blink) return;
    ctx.fillStyle = index % 2 === 0 ? "#ffffff" : "#ff0099";
    ctx.fillText(sparkle.glyph, sparkle.x, sparkle.y + bob);
  });

  if (frame % 20 < 10) {
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(4, 4, 4, 4);
  }
}

export function drawFavicon(
  ctx: CanvasRenderingContext2D,
  mode: FaviconMode,
  frame: number,
) {
  switch (mode) {
    case "broken-ux":
      drawBrokenUx(ctx, frame);
      break;
    case "myspace":
      drawMyspace(ctx, frame);
      break;
    default:
      drawDefault(ctx, frame);
  }
}

export const FAVICON_SIZE = SIZE;
