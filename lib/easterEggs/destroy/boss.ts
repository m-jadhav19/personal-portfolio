/** Floating portrait boss for destroy mode. */

export const BOSS_MAX_HP = 120;
export const BOSS_RADIUS = 52;
export const BOSS_PORTRAIT_SRC = "/images/mandar-portrait.png";

export type BossProjectile = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
};

export type PortraitBoss = {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  phase: number;
  hitFlash: number;
  /** charge | float | retreat */
  mode: "float" | "charge" | "retreat";
  modeTimer: number;
  attackTimer: number;
  radius: number;
  damage: number;
  alive: boolean;
};

export function createPortraitBoss(
  width: number,
  height: number,
): PortraitBoss {
  return {
    x: width * 0.62,
    y: height * 0.42,
    hp: BOSS_MAX_HP,
    maxHp: BOSS_MAX_HP,
    phase: 0,
    hitFlash: 0,
    mode: "float",
    modeTimer: 2.4,
    attackTimer: 1.6,
    radius: BOSS_RADIUS,
    damage: 18,
    alive: true,
  };
}

export function loadBossPortrait(): HTMLImageElement {
  const img = new Image();
  img.decoding = "async";
  img.src = BOSS_PORTRAIT_SRC;
  return img;
}

export function updatePortraitBoss(
  boss: PortraitBoss,
  dt: number,
  target: { x: number; y: number },
  width: number,
  height: number,
  reducedMotion: boolean,
): BossProjectile[] {
  const shots: BossProjectile[] = [];
  if (!boss.alive) return shots;

  boss.phase += dt;
  if (boss.hitFlash > 0) boss.hitFlash -= dt;
  boss.modeTimer -= dt;
  boss.attackTimer -= dt;

  const cx = width * 0.58;
  const cy = height * 0.4;

  if (boss.mode === "float") {
    const orbit = reducedMotion ? 28 : 54;
    boss.x = cx + Math.cos(boss.phase * 0.7) * orbit;
    boss.y = cy + Math.sin(boss.phase * 1.1) * (orbit * 0.55);
    if (boss.modeTimer <= 0) {
      boss.mode = "charge";
      boss.modeTimer = 0.85;
    }
  } else if (boss.mode === "charge") {
    const dx = target.x - boss.x;
    const dy = target.y - boss.y;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = reducedMotion ? 160 : 260;
    boss.x += (dx / dist) * speed * dt;
    boss.y += (dy / dist) * speed * dt;
    if (boss.modeTimer <= 0 || dist < 36) {
      boss.mode = "retreat";
      boss.modeTimer = 1.1;
    }
  } else {
    const dx = cx - boss.x;
    const dy = cy - boss.y;
    const dist = Math.hypot(dx, dy) || 1;
    boss.x += (dx / dist) * 140 * dt;
    boss.y += (dy / dist) * 140 * dt;
    if (boss.modeTimer <= 0 || dist < 24) {
      boss.mode = "float";
      boss.modeTimer = 2 + Math.random() * 1.6;
    }
  }

  // Keep on screen
  boss.x = Math.min(width - 40, Math.max(40, boss.x));
  boss.y = Math.min(height - 60, Math.max(70, boss.y));

  // Volley of ink shots toward the player
  if (boss.attackTimer <= 0) {
    const base = Math.atan2(target.y - boss.y, target.x - boss.x);
    const count = reducedMotion ? 2 : 3;
    for (let i = 0; i < count; i++) {
      const spread = (i - (count - 1) / 2) * 0.22;
      const ang = base + spread;
      const speed = 220 + Math.random() * 40;
      shots.push({
        x: boss.x,
        y: boss.y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        life: 2.2,
      });
    }
    boss.attackTimer = 1.8 + Math.random() * 1.4;
  }

  return shots;
}

export function hurtBoss(
  boss: PortraitBoss,
  damage: number,
): { killed: boolean; hit: boolean } {
  if (!boss.alive) return { killed: false, hit: false };
  boss.hp = Math.max(0, boss.hp - damage);
  boss.hitFlash = 0.22;
  if (boss.hp <= 0) {
    boss.alive = false;
    return { killed: true, hit: true };
  }
  return { killed: false, hit: true };
}

export function drawPortraitBoss(
  ctx: CanvasRenderingContext2D,
  boss: PortraitBoss,
  portrait: HTMLImageElement | null,
) {
  if (!boss.alive) return;
  const ox = Math.round(boss.x);
  const oy = Math.round(boss.y);
  const bob = Math.sin(boss.phase * 3) * 3;
  const pulse = 1 + Math.sin(boss.phase * 5) * 0.03;
  const size = 96 * pulse;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(ox, oy + size * 0.55, size * 0.34, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Aura ring (boss tell)
  ctx.save();
  ctx.strokeStyle =
    boss.mode === "charge"
      ? "rgba(239, 68, 68, 0.85)"
      : "rgba(253, 186, 116, 0.7)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(ox, oy + bob, size * 0.58, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  if (boss.hitFlash > 0) {
    const blink = Math.floor(boss.hitFlash * 24) % 2 === 0;
    ctx.globalAlpha = blink ? 0.4 : 1;
    ctx.filter = blink ? "brightness(1.8) saturate(0.3)" : "none";
  }

  const imgReady =
    portrait &&
    portrait.complete &&
    portrait.naturalWidth > 0;

  if (imgReady) {
    ctx.beginPath();
    ctx.arc(ox, oy + bob, size * 0.5, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      portrait,
      ox - size / 2,
      oy + bob - size / 2,
      size,
      size,
    );
  } else {
    // Fallback face blob
    ctx.fillStyle = "#fdba74";
    ctx.beginPath();
    ctx.arc(ox, oy + bob, size * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.fillRect(ox - 14, oy + bob - 8, 8, 8);
    ctx.fillRect(ox + 6, oy + bob - 8, 8, 8);
  }
  ctx.restore();

  // Floating brackets vibe
  ctx.save();
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ox - size * 0.62, oy + bob - 18);
  ctx.lineTo(ox - size * 0.72, oy + bob);
  ctx.lineTo(ox - size * 0.62, oy + bob + 18);
  ctx.moveTo(ox + size * 0.62, oy + bob - 18);
  ctx.lineTo(ox + size * 0.72, oy + bob);
  ctx.lineTo(ox + size * 0.62, oy + bob + 18);
  ctx.stroke();
  ctx.restore();

  drawBossHealthBar(ctx, boss, ox, oy + bob - size * 0.62);
}

export function drawBossHealthBar(
  ctx: CanvasRenderingContext2D,
  boss: PortraitBoss,
  x: number,
  y: number,
) {
  if (!boss.alive) return;
  const w = 110;
  const h = 10;
  const pct = Math.max(0, boss.hp / boss.maxHp);
  const left = Math.round(x - w / 2);
  const top = Math.round(y - 18);

  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(left - 1, top - 14, w + 2, h + 18);
  ctx.fillStyle = "#fdba74";
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  ctx.fillText("PORTRAIT BOSS", x, top - 3);
  ctx.fillStyle = "#3f3f46";
  ctx.fillRect(left, top + 2, w, h);
  ctx.fillStyle = pct < 0.3 ? "#ef4444" : "#e85d04";
  ctx.fillRect(left, top + 2, Math.round(w * pct), h);
  ctx.strokeStyle = "#fdba74";
  ctx.strokeRect(left, top + 2, w, h);
}

export function drawBossShot(
  ctx: CanvasRenderingContext2D,
  shot: BossProjectile,
) {
  const ox = Math.round(shot.x);
  const oy = Math.round(shot.y);
  ctx.fillStyle = "#7c3aed";
  ctx.beginPath();
  ctx.arc(ox, oy, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c084fc";
  ctx.fillRect(ox - 2, oy - 2, 4, 4);
}
