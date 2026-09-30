/** Floating portrait boss for destroy mode — DOOM-style billboard enemy. */

export const BOSS_NAME = "Mogambo";
export const BOSS_MAX_HP = 120;
export const BOSS_RADIUS = 52;
export const BOSS_DRAW_SIZE = 96;
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
  /** Spawn / home anchor — float & retreat seek this, never a fixed screen orbit. */
  homeX: number;
  homeY: number;
  /** Portrait pixel size at the moment of summon (for emerge shrink). */
  startSize: number;
  /** 0 → 1 DOOM emerge (shrink into gameplay size at home). */
  emerge: number;
  hp: number;
  maxHp: number;
  phase: number;
  hitFlash: number;
  /** emerge | float | charge | retreat */
  mode: "emerge" | "float" | "charge" | "retreat";
  modeTimer: number;
  attackTimer: number;
  facing: 1 | -1;
  radius: number;
  damage: number;
  alive: boolean;
};

export function createPortraitBoss(
  width: number,
  height: number,
  origin?: { x: number; y: number; size?: number },
): PortraitBoss {
  const x = origin?.x ?? width * 0.62;
  const y = origin?.y ?? height * 0.42;
  const startSize = Math.max(
    BOSS_DRAW_SIZE,
    origin?.size ?? BOSS_DRAW_SIZE * 2.4,
  );
  return {
    x,
    y,
    homeX: x,
    homeY: y,
    startSize,
    emerge: 0,
    hp: BOSS_MAX_HP,
    maxHp: BOSS_MAX_HP,
    phase: 0,
    hitFlash: 0,
    mode: "emerge",
    modeTimer: 0.95,
    attackTimer: 2.2,
    facing: 1,
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

function seek(
  boss: PortraitBoss,
  tx: number,
  ty: number,
  speed: number,
  dt: number,
) {
  const dx = tx - boss.x;
  const dy = ty - boss.y;
  const dist = Math.hypot(dx, dy) || 1;
  const step = Math.min(dist, speed * dt);
  boss.x += (dx / dist) * step;
  boss.y += (dy / dist) * step;
  return dist - step;
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

  // Billboard faces the player (classic DOOM left/right frames).
  if (Math.abs(target.x - boss.x) > 8) {
    boss.facing = target.x >= boss.x ? 1 : -1;
  }

  if (boss.mode === "emerge") {
    const duration = reducedMotion ? 0.35 : 0.95;
    boss.emerge = Math.min(1, boss.emerge + dt / duration);
    // Hold the spawn point — no teleport while transforming.
    const settle = 1 - (1 - boss.emerge) ** 2;
    boss.x = boss.homeX;
    boss.y = boss.homeY - settle * (reducedMotion ? 10 : 22);
    if (boss.emerge >= 1) {
      boss.x = boss.homeX;
      boss.y = boss.homeY;
      boss.mode = "float";
      boss.modeTimer = 2.2 + Math.random() * 1.2;
    }
    return shots;
  }

  if (boss.mode === "float") {
    // Soft strafe/bob around home — never hard-snap to a screen orbit.
    const strafe = reducedMotion ? 14 : 36;
    const bob = reducedMotion ? 6 : 14;
    const tx = boss.homeX + Math.cos(boss.phase * 0.85) * strafe;
    const ty =
      boss.homeY +
      Math.sin(boss.phase * 2.4) * bob +
      Math.sin(boss.phase * 0.55) * (strafe * 0.2);
    seek(boss, tx, ty, reducedMotion ? 70 : 120, dt);
    if (boss.modeTimer <= 0) {
      boss.mode = "charge";
      boss.modeTimer = reducedMotion ? 0.7 : 0.95;
    }
  } else if (boss.mode === "charge") {
    const left = seek(
      boss,
      target.x,
      target.y,
      reducedMotion ? 170 : 270,
      dt,
    );
    if (boss.modeTimer <= 0 || left < 36) {
      boss.mode = "retreat";
      boss.modeTimer = 1.0;
    }
  } else {
    // Retreat toward home (where the head tore out), then resume float.
    const left = seek(
      boss,
      boss.homeX,
      boss.homeY,
      reducedMotion ? 130 : 190,
      dt,
    );
    if (boss.modeTimer <= 0 || left < 20) {
      boss.mode = "float";
      boss.modeTimer = 2 + Math.random() * 1.6;
    }
  }

  boss.x = Math.min(width - 40, Math.max(40, boss.x));
  boss.y = Math.min(height - 60, Math.max(70, boss.y));

  // No shooting while emerging — wait until he is "in the arena".
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

export function bossDrawSize(boss: PortraitBoss): number {
  if (boss.emerge >= 1) return BOSS_DRAW_SIZE;
  const ease = 1 - (1 - boss.emerge) ** 3;
  // DOOM-ish squash: grow slightly then settle into gameplay size.
  const overshoot = Math.sin(ease * Math.PI) * 0.08;
  return (
    boss.startSize * (1 - ease) + BOSS_DRAW_SIZE * (ease + overshoot)
  );
}

export function hurtBoss(
  boss: PortraitBoss,
  damage: number,
): { killed: boolean; hit: boolean } {
  if (!boss.alive || boss.mode === "emerge") {
    return { killed: false, hit: false };
  }
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
  const size = bossDrawSize(boss);
  // Idle bob like a DOOM imp — quieter while emerging.
  const bobAmp = boss.mode === "emerge" ? 1.5 : 3.5;
  const bob = Math.sin(boss.phase * 3.2) * bobAmp;
  const pulse =
    boss.mode === "emerge"
      ? 1
      : 1 + Math.sin(boss.phase * 5) * 0.025;

  const drawW = size * pulse;
  const drawH = size * pulse;

  // Ground shadow scales with emerge so the handoff never "pops" size.
  ctx.fillStyle = `rgba(0,0,0,${0.2 + boss.emerge * 0.2})`;
  ctx.beginPath();
  ctx.ellipse(
    ox,
    oy + drawH * 0.52,
    drawW * 0.32,
    Math.max(6, drawH * 0.08),
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Charge tell ring (skip during emerge)
  if (boss.mode !== "emerge") {
    ctx.save();
    ctx.strokeStyle =
      boss.mode === "charge"
        ? "rgba(239, 68, 68, 0.85)"
        : "rgba(253, 186, 116, 0.55)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ox, oy + bob, drawW * 0.56, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  if (boss.hitFlash > 0) {
    const blink = Math.floor(boss.hitFlash * 24) % 2 === 0;
    ctx.globalAlpha = blink ? 0.4 : 1;
  }
  // Fade in slightly at the start of emerge so the DOM→canvas cut is soft.
  if (boss.emerge < 0.12) {
    ctx.globalAlpha = Math.min(ctx.globalAlpha, boss.emerge / 0.12);
  }

  const imgReady =
    portrait && portrait.complete && portrait.naturalWidth > 0;

  ctx.translate(ox, oy + bob);
  // Flip like DOOM directional sprites.
  ctx.scale(boss.facing, 1);
  ctx.imageSmoothingEnabled = false;

  if (imgReady) {
    ctx.beginPath();
    ctx.arc(0, 0, drawW * 0.5, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(portrait, -drawW / 2, -drawH / 2, drawW, drawH);
  } else {
    ctx.fillStyle = "#fdba74";
    ctx.beginPath();
    ctx.arc(0, 0, drawW * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.fillRect(-14, -8, 8, 8);
    ctx.fillRect(6, -8, 8, 8);
  }
  ctx.restore();

  // Brackets only once he has mostly shrunk into boss form.
  if (boss.emerge > 0.55) {
    const a = Math.min(1, (boss.emerge - 0.55) / 0.35);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    const bracketY = oy + bob;
    ctx.beginPath();
    ctx.moveTo(ox - drawW * 0.62, bracketY - 18);
    ctx.lineTo(ox - drawW * 0.72, bracketY);
    ctx.lineTo(ox - drawW * 0.62, bracketY + 18);
    ctx.moveTo(ox + drawW * 0.62, bracketY - 18);
    ctx.lineTo(ox + drawW * 0.72, bracketY);
    ctx.lineTo(ox + drawW * 0.62, bracketY + 18);
    ctx.stroke();
    ctx.restore();
  }

  if (boss.emerge >= 1) {
    drawBossHealthBar(ctx, boss, ox, oy + bob - drawH * 0.62);
  }
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
  ctx.fillText(BOSS_NAME.toUpperCase(), x, top - 3);
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
