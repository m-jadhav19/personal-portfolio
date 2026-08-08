/** Muted blue → cobalt accent for the loader percentage. */
const FROM = { r: 107, g: 130, b: 176 };
const TO = { r: 59, g: 111, b: 255 };

/** Lavender → cyan for Vice City theme transitions. */
const VICE_FROM = { r: 196, g: 161, b: 255 };
const VICE_TO = { r: 11, g: 211, b: 211 };

function interpolateColor(
  from: { r: number; g: number; b: number },
  to: { r: number; g: number; b: number },
  progress: number,
) {
  const t = Math.min(1, Math.max(0, progress / 100));
  const r = Math.round(from.r + (to.r - from.r) * t);
  const g = Math.round(from.g + (to.g - from.g) * t);
  const b = Math.round(from.b + (to.b - from.b) * t);
  return `rgb(${r} ${g} ${b})`;
}

export function loaderCountColor(progress: number): string {
  return interpolateColor(FROM, TO, progress);
}

export function viceCityLoaderCountColor(progress: number): string {
  return interpolateColor(VICE_FROM, VICE_TO, progress);
}
