export const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
] as const;

export const KONAMI_DISPLAY = "↑ ↑ ↓ ↓ ← → ← → B A";

/** GTA San Andreas cheat — spawns a pink custom car. Perfect for Y2K chaos. */
export const MYSPACE_CHEAT_CODE = "PIMPMYRIDE";

/** Flash-era site destruction — cursor sprite + chaos weapons. */
export const DESTROY_CHEAT_CODE = "DESTROY";

export type EasterEggId = "broken-ux" | "myspace" | "destroy";
