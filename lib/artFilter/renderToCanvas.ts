import { ASCII_CHARSET, BAYER_4X4 } from "./charset";

type Rgb = { r: number; g: number; b: number };

type Palette = {
  dark: string;
  light: string;
};

function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function luminance(r: number, g: number, b: number) {
  return (r * 0.299 + g * 0.587 + b * 0.114) / 255;
}

export function renderDitheredImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  width: number,
  height: number,
  palette: Palette = { dark: "#0f0f0f", light: "#fdfdfd" },
) {
  const canvas = ctx.canvas;
  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(image, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const dark = hexToRgb(palette.dark);
  const light = hexToRgb(palette.light);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const lum = luminance(
        imageData.data[index],
        imageData.data[index + 1],
        imageData.data[index + 2],
      );
      const threshold = BAYER_4X4[y % 4][x % 4];
      const on = lum > threshold;
      const color = on ? light : dark;

      imageData.data[index] = color.r;
      imageData.data[index + 1] = color.g;
      imageData.data[index + 2] = color.b;
      imageData.data[index + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

export function renderAsciiImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  width: number,
  height: number,
  cellSize = 7,
) {
  const canvas = ctx.canvas;
  canvas.width = width;
  canvas.height = height;

  const cols = Math.max(1, Math.floor(width / cellSize));
  const rows = Math.max(1, Math.floor(height / cellSize));

  const sample = document.createElement("canvas");
  sample.width = cols;
  sample.height = rows;
  const sampleCtx = sample.getContext("2d");
  if (!sampleCtx) return;

  sampleCtx.drawImage(image, 0, 0, cols, rows);
  const pixels = sampleCtx.getImageData(0, 0, cols, rows).data;

  ctx.fillStyle = "#0f0f0f";
  ctx.fillRect(0, 0, width, height);
  ctx.font = `${cellSize}px var(--font-mono, monospace)`;
  ctx.textBaseline = "top";

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = (row * cols + col) * 4;
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const lum = luminance(r, g, b);
      const charIndex = Math.min(
        ASCII_CHARSET.length - 1,
        Math.floor(lum * ASCII_CHARSET.length),
      );
      const character = ASCII_CHARSET[ASCII_CHARSET.length - 1 - charIndex];

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillText(character, col * cellSize, row * cellSize);
    }
  }
}
