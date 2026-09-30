/** Segment / circle collision helpers for destroy projectiles. */

export type HitPoint = { t: number; x: number; y: number };

/** Closest intersection of segment (x0,y0)→(x1,y1) with circle (cx,cy,r), or null. */
export function segmentCircleHit(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  cx: number,
  cy: number,
  r: number,
): HitPoint | null {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const fx = x0 - cx;
  const fy = y0 - cy;
  const a = dx * dx + dy * dy;
  const rr = r * r;

  if (a < 1e-8) {
    if (fx * fx + fy * fy <= rr) return { t: 0, x: x0, y: y0 };
    return null;
  }

  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - rr;
  let disc = b * b - 4 * a * c;
  if (disc < 0) return null;
  disc = Math.sqrt(disc);
  const inv = 0.5 / a;
  const t1 = (-b - disc) * inv;
  const t2 = (-b + disc) * inv;
  const t =
    t1 >= 0 && t1 <= 1 ? t1 : t2 >= 0 && t2 <= 1 ? t2 : Number.NaN;
  if (!Number.isFinite(t)) return null;
  return { t, x: x0 + dx * t, y: y0 + dy * t };
}

export type CircleTarget = {
  x: number;
  y: number;
  radius: number;
};

/** Earliest circle hit along a segment. */
export function earliestCircleHit(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  targets: readonly CircleTarget[],
  pad = 0,
): HitPoint | null {
  let best: HitPoint | null = null;
  for (const target of targets) {
    const hit = segmentCircleHit(
      x0,
      y0,
      x1,
      y1,
      target.x,
      target.y,
      target.radius + pad,
    );
    if (!hit) continue;
    if (!best || hit.t < best.t) best = hit;
  }
  return best;
}

/** Evenly spaced sample points along a segment (excludes start by default). */
export function sampleSegment(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  count: number,
): { x: number; y: number; t: number }[] {
  const n = Math.max(1, Math.floor(count));
  const out: { x: number; y: number; t: number }[] = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    out.push({
      t,
      x: x0 + (x1 - x0) * t,
      y: y0 + (y1 - y0) * t,
    });
  }
  return out;
}
