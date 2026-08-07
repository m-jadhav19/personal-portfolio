export function expInterp(a: number, b: number, t: number): number {
  return a * Math.pow(b / a, t);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
