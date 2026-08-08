export type ThemeTransitionDirection = "enter-myspace" | "exit-myspace";

export const VICE_CITY_LOADER_MESSAGES: Record<
  ThemeTransitionDirection,
  { text: string; weight: number }[]
> = {
  "enter-myspace": [
    { text: "Tuning into Flash FM…", weight: 3 },
    { text: "Loading Vice City skyline…", weight: 3 },
    { text: "Applying neon paint job to portfolio…", weight: 2 },
    { text: "Syncing Wave 103 radio stream…", weight: 2 },
    { text: "PIMPMYRIDE cheat activated — welcome to 1986", weight: 1 },
  ],
  "exit-myspace": [
    { text: "Leaving Vice City…", weight: 3 },
    { text: "Restoring default theme…", weight: 3 },
    { text: "Powering down neon signs…", weight: 2 },
    { text: "Switching radio back to the future…", weight: 2 },
    { text: "See you on the mainland", weight: 1 },
  ],
};

export function pickThemeLoaderMessage(direction: ThemeTransitionDirection) {
  const messages = VICE_CITY_LOADER_MESSAGES[direction];
  const total = messages.reduce((sum, message) => sum + message.weight, 0);
  let roll = Math.random() * total;

  for (const message of messages) {
    roll -= message.weight;
    if (roll <= 0) return message.text;
  }

  return messages[0]?.text ?? "";
}
