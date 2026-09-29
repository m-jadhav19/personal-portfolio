import {
  HOLE_VARIANTS,
  drawSprite,
  type DestroySpriteAtlas,
  type HoleVariant,
} from "./spriteAtlas";

export type BulletHole = {
  x: number;
  y: number;
  variant: HoleVariant;
  rotation: number;
  scale: number;
  crack: boolean;
  /** Seconds remaining before the scar is fully covered */
  life: number;
  /** Full lifetime (hold + fade) */
  maxLife: number;
  /** Seconds of full opacity before fade/cover begins */
  hold: number;
};

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
  atlas?: DestroySpriteAtlas | null,
) {
  const ox = Math.round(x);
  const oy = Math.round(y);

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(ox, oy + 28, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const moving = Math.abs(Math.sin(walkPhase)) > 0.2;
  const frame =
    !moving
      ? "characterIdle"
      : Math.floor(walkPhase * 2) % 2 === 0
        ? "characterWalkA"
        : "characterWalkB";

  const body = atlas?.get(frame) ?? null;
  const drewBody = drawSprite(ctx, body, ox, oy, { facing, scale: 1 });

  if (!drewBody) {
    // Procedural fallback
    const s = 2;
    const bodyC = "#e85d04";
    const dark = "#9a3412";
    const skin = "#fdba74";
    const boot = "#431407";
    const legSwing = Math.sin(walkPhase) * 3 * s;
    drawPixelRect(
      ctx,
      ox - 4 * s + (facing > 0 ? -legSwing : legSwing) * 0.2,
      oy + 4 * s,
      3 * s,
      8 * s,
      dark,
    );
    drawPixelRect(
      ctx,
      ox + 1 * s + (facing > 0 ? legSwing : -legSwing) * 0.2,
      oy + 4 * s,
      3 * s,
      8 * s,
      dark,
    );
    drawPixelRect(ctx, ox - 4 * s, oy + 11 * s, 4 * s, 2 * s, boot);
    drawPixelRect(ctx, ox + 1 * s, oy + 11 * s, 4 * s, 2 * s, boot);
    drawPixelRect(ctx, ox - 5 * s, oy - 6 * s, 10 * s, 11 * s, bodyC);
    drawPixelRect(ctx, ox - 4 * s, oy - 14 * s, 8 * s, 8 * s, skin);
    drawPixelRect(
      ctx,
      ox + (facing > 0 ? 1 : -3) * s,
      oy - 11 * s,
      2 * s,
      2 * s,
      "#111",
    );
  }

  const gun = atlas?.get("gun") ?? null;
  const gx = ox + Math.cos(aimAngle) * 18;
  const gy = oy + Math.sin(aimAngle) * 6;
  const drewGun = drawSprite(ctx, gun, gx, gy, {
    rotation: aimAngle,
    scale: 1,
  });

  if (!drewGun) {
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(aimAngle);
    drawPixelRect(ctx, 0, -3, 28, 6, "#38bdf8");
    drawPixelRect(ctx, 24, -5, 8, 10, "#e0f2fe");
    ctx.restore();
  }
}

export function drawBlasterBolt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  atlas?: DestroySpriteAtlas | null,
) {
  if (
    drawSprite(ctx, atlas?.get("blasterBolt") ?? null, x, y, {
      rotation: angle,
      scale: 1,
    })
  ) {
    return;
  }
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
  atlas?: DestroySpriteAtlas | null,
) {
  if (drawSprite(ctx, atlas?.get("missile") ?? null, x, y, { scale: 1 })) {
    return;
  }
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
  atlas?: DestroySpriteAtlas | null,
) {
  if (drawSprite(ctx, atlas?.get("bomb") ?? null, x, y, { scale: 1 })) {
    if (Math.floor(fuse * 10) % 2 === 0) {
      drawPixelRect(ctx, x - 2, y - 18, 4, 4, "#fbbf24");
    }
    return;
  }
  const ox = Math.round(x);
  const oy = Math.round(y);
  drawPixelRect(ctx, ox - 6, oy - 6, 12, 12, "#1e293b");
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
  atlas?: DestroySpriteAtlas | null,
) {
  const bob = Math.sin(phase) * 1;
  if (
    drawSprite(ctx, atlas?.get("roach") ?? null, x, y + bob, {
      facing,
      scale: 1,
    })
  ) {
    return;
  }
  const ox = Math.round(x);
  const oy = Math.round(y + bob);
  drawPixelRect(ctx, ox - 5, oy - 2, 10, 5, "#78350f");
  drawPixelRect(ctx, ox + (facing > 0 ? 3 : -6), oy - 3, 3, 3, "#451a03");
}

export function drawExplosion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  life: number,
  maxLife: number,
  atlas?: DestroySpriteAtlas | null,
) {
  const t = 1 - life / maxLife;
  const scale = 0.6 + t * 1.4;
  const alpha = Math.max(0, 1 - t);
  ctx.save();
  ctx.globalAlpha = alpha;
  const drew = drawSprite(ctx, atlas?.get("explosion") ?? null, x, y, {
    scale,
  });
  if (!drew) {
    const r = 8 + t * 28;
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
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

export function createBulletHole(
  x: number,
  y: number,
  opts?: {
    scale?: number;
    crack?: boolean;
    /** Total lifetime in seconds (hold + fade). Default ~2s. */
    life?: number;
    /** Full-opacity hold before cover-up fade. Default ~55% of life. */
    hold?: number;
  },
): BulletHole {
  const variant =
    HOLE_VARIANTS[Math.floor(Math.random() * HOLE_VARIANTS.length)];
  const maxLife = Math.max(0.2, opts?.life ?? 2);
  const hold = Math.min(
    maxLife,
    Math.max(0, opts?.hold ?? maxLife * 0.55),
  );
  return {
    x,
    y,
    variant,
    rotation: Math.random() * Math.PI * 2,
    scale: opts?.scale ?? 0.85 + Math.random() * 0.55,
    crack: opts?.crack ?? Math.random() < 0.55,
    life: maxLife,
    maxLife,
    hold,
  };
}

/** 1 while holding, then ease out as the surface covers the scar. */
export function holeCoverAlpha(hole: BulletHole): number {
  const fadeSpan = Math.max(0.001, hole.maxLife - hole.hold);
  const age = hole.maxLife - hole.life;
  if (age <= hole.hold) return 1;
  const t = Math.min(1, (age - hole.hold) / fadeSpan);
  // Ease-in cover so the close happens a bit faster at the end.
  return Math.max(0, 1 - t * t);
}

export function drawBulletHole(
  ctx: CanvasRenderingContext2D,
  hole: BulletHole,
  atlas?: DestroySpriteAtlas | null,
) {
  const cover = holeCoverAlpha(hole);
  if (cover <= 0.01) return;

  // Shrink slightly while covering so it reads as the surface closing over.
  const scale = hole.scale * (0.72 + 0.28 * cover);
  const img = atlas?.get(hole.variant) ?? null;
  const drew = drawSprite(ctx, img, hole.x, hole.y, {
    rotation: hole.rotation,
    scale,
    alpha: cover,
  });

  if (!drew) {
    // Procedural jagged hole fallback
    ctx.save();
    ctx.globalAlpha = cover;
    ctx.translate(Math.round(hole.x), Math.round(hole.y));
    ctx.rotate(hole.rotation);
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath();
    const r = 7 * scale;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const jitter = r * (0.65 + Math.random() * 0.45);
      const px = Math.cos(a) * jitter;
      const py = Math.sin(a) * jitter;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3f3f46";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  if (hole.crack) {
    const crack = atlas?.get("crack") ?? null;
    drawSprite(ctx, crack, hole.x + 6, hole.y - 4, {
      rotation: hole.rotation + 0.4,
      scale: scale * 0.9,
      alpha: 0.85 * cover,
    });
  }
}
