// A minor pentatonic across 2 octaves: A, C, D, E, G × 2
const NOTES = [110, 131, 147, 165, 196, 220, 262, 294, 330, 392] as const;

const NOTE_NAMES = [
  "A2",
  "C3",
  "D3",
  "E3",
  "G3",
  "A3",
  "C4",
  "D4",
  "E4",
  "G4",
] as const;

export function zoneFromX(xNorm: number): number {
  return Math.min(NOTES.length - 1, Math.floor(xNorm * NOTES.length));
}

export function freqForZone(zone: number): number {
  return NOTES[zone] ?? NOTES[0];
}

export function noteNameForZone(zone: number): string {
  return NOTE_NAMES[zone] ?? NOTE_NAMES[0];
}

export function zoneCount(): number {
  return NOTES.length;
}
