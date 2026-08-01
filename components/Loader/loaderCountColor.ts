/** Muted grey → accent blue for the loader percentage. */
const FROM = { r: 138, g: 138, b: 138 }; // --muted #8a8a8a
const TO = { r: 14, g: 165, b: 233 }; // --accent #0ea5e9

/** Bitcount Grid Single Ink ships with 29 CPAL entries. */
export const LOADER_INK_PALETTE_SIZE = 29;

export const LOADER_COUNT_PALETTE_NAME = "--LoaderCountPalette";

export function loaderCountColor(progress: number): string {
  const t = Math.min(1, Math.max(0, progress / 100));
  const r = Math.round(FROM.r + (TO.r - FROM.r) * t);
  const g = Math.round(FROM.g + (TO.g - FROM.g) * t);
  const b = Math.round(FROM.b + (TO.b - FROM.b) * t);
  return `rgb(${r} ${g} ${b})`;
}

export function buildLoaderCountPaletteCss(fontFamily: string, color: string) {
  const overrides = Array.from(
    { length: LOADER_INK_PALETTE_SIZE },
    (_, index) => `${index} ${color}`,
  ).join(",\n    ");

  return `@font-palette-values ${LOADER_COUNT_PALETTE_NAME} {
  font-family: ${fontFamily};
  override-colors:
    ${overrides};
}`;
}

export function resolveBitcountInkFamily(root: Element = document.documentElement) {
  const raw = getComputedStyle(root)
    .getPropertyValue("--font-bitcount-grid-single-ink")
    .trim();
  const primary = raw.split(",")[0]?.trim();
  return primary || '"Bitcount Grid Single Ink"';
}
