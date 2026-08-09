import type { EasterEggId } from "@/lib/easterEggs/codes";

export type SystemMode = "default" | "vice" | "konami";

export function eggToMode(egg: EasterEggId | null): SystemMode {
  if (egg === "myspace") return "vice";
  if (egg === "broken-ux") return "konami";
  return "default";
}

export function modeToEgg(mode: SystemMode): EasterEggId | null {
  if (mode === "vice") return "myspace";
  if (mode === "konami") return "broken-ux";
  return null;
}

export const MODE_META: Record<
  SystemMode,
  { modeLabel: string; extra: string | null }
> = {
  default: {
    modeLabel: "MODE / DEFAULT",
    extra: null,
  },
  vice: {
    modeLabel: "MODE / VICE CITY",
    extra: "RADIO / ON AIR",
  },
  konami: {
    modeLabel: "MODE / CORRUPTED",
    extra: "THREATS / 47",
  },
};

export type ModeCursorConfig = {
  /** Idle glyph when data-cursor is default */
  glyph: string;
  /** Rare Konami interruption glyphs */
  interruptions?: readonly string[];
};

export const MODE_CURSOR: Record<SystemMode, ModeCursorConfig> = {
  default: {
    glyph: "+",
  },
  vice: {
    glyph: "✦",
  },
  konami: {
    glyph: "[!]",
    interruptions: ["...", "ERROR"],
  },
};

export const SYSTEM_IDENTITY = "MJ / SYSTEM 01";
export const SYSTEM_CATALOG = "PORTFOLIO / 2026";
