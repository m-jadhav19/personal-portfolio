/** Tiny procedural 8-bit draw helpers for destroy mode. */

export function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/** Orange stick-figure mercenary with a directional gun arm. */
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: 1 | -1,
  aimAngle: number,
  walkPhase: number,
  scale = 2,
) {
  const s = scale;
  const ox = Math.round(x);
  const oy = Math.round(y);

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(ox, oy + 14 * s, 10 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  const body = "#e85d04";
  const dark = "#9a3412";
  const skin = "#fdba74";
  const boot = "#431407";

  // Legs (walk)
  const legSwing = Math.sin(walkPhase) * 3 * s;
  drawPixelRect(ctx, ox - 4 * s + (facing > 0 ? -legSwing : legSwing) * 0.2, oy + 4 * s, 3 * s, 8 * s, dark);
  drawPixelRect(ctx, ox + 1 * s + (facing > 0 ? legSwing : -legSwing) * 0.2, oy + 4 * s, 3 * s, 8 * s, dark);
  drawPixelRect(ctx, ox - 4 * s, oy + 11 * s, 4 * s, 2 * s, boot);
  drawPixelRect(ctx, ox + 1 * s, oy + 11 * s, 4 * s, 2 * s, boot);

  // Torso
  drawPixelRect(ctx, ox - 5 * s, oy - 6 * s, 10 * s, 11 * s, body);
  drawPixelRect(ctx, ox - 4 * s, oy - 4 * s, 8 * s, 2 * s, dark);

  // Head
  drawPixelRect(ctx, ox - 4 * s, oy - 14 * s, 8 * s, 8 * s, skin);
  drawPixelRect(ctx, ox - 4 * s, oy - 15 * s, 8 * s, 2 * s, body);
  // Eyes
  drawPixelRect(ctx, ox + (facing > 0 ? 1 : -3) * s, oy - 11 * s, 2 * s, 2 * s, "#111");
  drawPixelRect(ctx, ox + (facing > 0 ? 1 : -3) * s, oy - 11 * s, 1 * s, 1 * s, "#fff");

  // Gun arm toward aim
  const gunLen = 14 * s;
  const gx = ox + Math.cos(aimAngle) * (6 * s);
  const gy = oy - 2 * s + Math.sin(aimAngle) * (4 * s);
  ctx.save();
  ctx.translate(gx, gy);
  ctx.rotate(aimAngle);
  drawPixelRect(ctx, 0, -1.5 * s, gunLen, 3 * s, "#38bdf8");
  drawPixelRect(ctx, gunLen - 2 * s, -2.5 * s, 4 * s, 5 * s, "#e0f2fe");
  drawPixelRect(ctx, 2 * s, 1 * s, 3 * s, 3 * s, dark);
  ctx.restore();
}

export function drawBlasterBolt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.rotate(angle);
  drawPixelRect(ctx, -4, -1, 10, 2, "#fde047");
  drawPixelRect(ctx, 4, -2, 4, 4, "#fff");
  ctx.restore();
}

export function drawMissile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
) {
  const ox = Math.round(x);
  const oy = Math.round(y);
  drawPixelRect(ctx, ox - 3, oy - 10, 6, 16, "#64748b");
  drawPixelRect(ctx, ox - 2, oy - 14, 4, 5, "#ef4444");
  drawPixelRect(ctx, ox - 4, oy + 4, 3, 4, "#f97316");
  drawPixelRect(ctx, ox + 1, oy + 4, 3, 4, "#f97316");
}

export function drawBomb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fuse: number,
) {
  const ox = Math.round(x);
  const oy = Math.round(y);
  drawPixelRect(ctx, ox - 6, oy - 6, 12, 12, "#1e293b");
  drawPixelRect(ctx, ox - 4, oy - 4, 8, 8, "#334155");
  drawPixelRect(ctx, ox - 1, oy - 10, 2, 5, "#a3a3a3");
  if (Math.floor(fuse * 10) % 2 === 0) {
    drawPixelRect(ctx, ox - 2, oy - 14, 3, 3, "#fbbf24");
  }
}

export function drawRoach(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: 1 | -1,
  phase: number,
) {
  const ox = Math.round(x);
  const oy = Math.round(y);
  const bob = Math.sin(phase) * 1;
  drawPixelRect(ctx, ox - 5, oy - 2 + bob, 10, 5, "#78350f");
  drawPixelRect(ctx, ox + (facing > 0 ? 3 : -6), oy - 3 + bob, 3, 3, "#451a03");
  // Legs
  const kick = Math.sin(phase * 2) * 2;
  drawPixelRect(ctx, ox - 6, oy + 2 + kick, 2, 3, "#451a03");
  drawPixelRect(ctx, ox + 4, oy + 2 - kick, 2, 3, "#451a03");
}

export function drawExplosion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  life: number,
  maxLife: number,
) {
  const t = 1 - life / maxLife;
  const r = 8 + t * 28;
  const alpha = Math.max(0, 1 - t);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff7ed";
  ctx.beginPath();
  ctx.arc(x, y, r * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export type DebrisParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
};

export function spawnDebris(
  box: { left: number; top: number; width: number; height: number },
  count: number,
  colors: string[] = ["#fdba74", "#38bdf8", "#f4f4f0", "#e85d04"],
): DebrisParticle[] {
  const out: DebrisParticle[] = [];
  for (let i = 0; i < count; i++) {
    const x = box.left + Math.random() * box.width;
    const y = box.top + Math.random() * box.height;
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 160;
    out.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 40,
      life: 0.45 + Math.random() * 0.55,
      maxLife: 1,
      color: colors[i % colors.length],
      size: 2 + Math.floor(Math.random() * 4),
    });
  }
  return out;
}

export function drawDebris(
  ctx: CanvasRenderingContext2D,
  p: DebrisParticle,
) {
  const alpha = Math.max(0, p.life / p.maxLife);
  ctx.globalAlpha = alpha;
  drawPixelRect(ctx, p.x, p.y, p.size, p.size, p.color);
  ctx.globalAlpha = 1;
}
