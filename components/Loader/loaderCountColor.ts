/** Muted blue → cobalt accent for the loader percentage. */
const FROM = { r: 107, g: 130, b: 176 }; // --muted #6b82b0
const TO = { r: 59, g: 111, b: 255 }; // --accent #3b6fff

export function loaderCountColor(progress: number): string {
  const t = Math.min(1, Math.max(0, progress / 100));
  const r = Math.round(FROM.r + (TO.r - FROM.r) * t);
  const g = Math.round(FROM.g + (TO.g - FROM.g) * t);
  const b = Math.round(FROM.b + (TO.b - FROM.b) * t);
  return `rgb(${r} ${g} ${b})`;
}
