/** Muted grey → accent blue for the loader percentage. */
const FROM = { r: 138, g: 138, b: 138 }; // --muted #8a8a8a
const TO = { r: 14, g: 165, b: 233 }; // --accent #0ea5e9

export function loaderCountColor(progress: number): string {
  const t = Math.min(1, Math.max(0, progress / 100));
  const r = Math.round(FROM.r + (TO.r - FROM.r) * t);
  const g = Math.round(FROM.g + (TO.g - FROM.g) * t);
  const b = Math.round(FROM.b + (TO.b - FROM.b) * t);
  return `rgb(${r} ${g} ${b})`;
}
