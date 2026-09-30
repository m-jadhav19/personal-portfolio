/** Enemies, pickups, and player combat helpers for destroy mode. */

export type EnemyKind = "roach" | "drone" | "slime";
export type PickupKind = "health" | "shield" | "rapid";

export type Enemy = {
  kind: EnemyKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  damage: number;
  radius: number;
  facing: 1 | -1;
  phase: number;
  hitFlash: number;
};

export type Pickup = {
  kind: PickupKind;
  x: number;
  y: number;
  life: number;
  bob: number;
};

export const PLAYER_MAX_HP = 100;

export const ENEMY_STATS: Record<
  EnemyKind,
  { hp: number; damage: number; speed: number; radius: number }
> = {
  roach: { hp: 1, damage: 8, speed: 95, radius: 12 },
  drone: { hp: 2, damage: 12, speed: 70, radius: 14 },
  slime: { hp: 3, damage: 16, speed: 48, radius: 16 },
};

const ENEMY_KINDS: EnemyKind[] = ["roach", "drone", "slime"];
const PICKUP_KINDS: PickupKind[] = ["health", "shield", "rapid"];

export function randomEnemyKind(): EnemyKind {
  const roll = Math.random();
  if (roll < 0.5) return "roach";
  if (roll < 0.8) return "drone";
  return "slime";
}

export function randomPickupKind(): PickupKind {
  const roll = Math.random();
  if (roll < 0.55) return "health";
  if (roll < 0.8) return "shield";
  return "rapid";
}

/** Spawn just off a random screen edge, aimed inward. */
export function spawnEnemyAtEdge(
  width: number,
  height: number,
  kind: EnemyKind = randomEnemyKind(),
): Enemy {
  const stats = ENEMY_STATS[kind];
  const edge = Math.floor(Math.random() * 4);
  let x = 0;
  let y = 0;
  if (edge === 0) {
    x = Math.random() * width;
    y = -20;
  } else if (edge === 1) {
    x = width + 20;
    y = Math.random() * height;
  } else if (edge === 2) {
    x = Math.random() * width;
    y = height + 20;
  } else {
    x = -20;
    y = Math.random() * height;
  }
  return {
    kind,
    x,
    y,
    vx: 0,
    vy: 0,
    hp: stats.hp,
    damage: stats.damage,
    radius: stats.radius,
    facing: 1,
    phase: Math.random() * Math.PI * 2,
    hitFlash: 0,
  };
}

export function spawnPickupAt(
  x: number,
  y: number,
  kind: PickupKind = randomPickupKind(),
): Pickup {
  return {
    kind,
    x,
    y,
    life: 12,
    bob: Math.random() * Math.PI * 2,
  };
}

export function spawnPickupRandom(width: number, height: number): Pickup {
  return spawnPickupAt(
    60 + Math.random() * (width - 120),
    80 + Math.random() * (height - 160),
  );
}

export function steerEnemyToward(
  enemy: Enemy,
  tx: number,
  ty: number,
  dt: number,
) {
  const stats = ENEMY_STATS[enemy.kind];
  const dx = tx - enemy.x;
  const dy = ty - enemy.y;
  const dist = Math.hypot(dx, dy) || 1;
  const speed = stats.speed;
  // Slight wobble so paths feel alive
  const wobble = Math.sin(enemy.phase * 3) * 18;
  const nx = dx / dist;
  const ny = dy / dist;
  const px = -ny;
  const py = nx;
  enemy.vx = nx * speed + px * wobble;
  enemy.vy = ny * speed + py * wobble;
  enemy.x += enemy.vx * dt;
  enemy.y += enemy.vy * dt;
  enemy.facing = enemy.vx >= 0 ? 1 : -1;
  enemy.phase += dt;
  if (enemy.hitFlash > 0) enemy.hitFlash -= dt;
}

export function drawPixelEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
) {
  const ox = Math.round(enemy.x);
  const oy = Math.round(enemy.y);
  const flash = enemy.hitFlash > 0;
  ctx.save();
  if (flash) ctx.globalAlpha = 0.55 + Math.sin(enemy.hitFlash * 40) * 0.45;

  if (enemy.kind === "roach") {
    const bob = Math.sin(enemy.phase * 12) * 1.5;
    ctx.fillStyle = flash ? "#fef08a" : "#92400e";
    ctx.fillRect(ox - 7, oy - 3 + bob, 14, 7);
    ctx.fillStyle = flash ? "#fff" : "#451a03";
    ctx.fillRect(ox + (enemy.facing > 0 ? 5 : -8), oy - 4 + bob, 3, 3);
    ctx.fillStyle = "#78350f";
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(ox - 6 + i * 5, oy + 4 + bob, 2, 3);
    }
  } else if (enemy.kind === "drone") {
    ctx.fillStyle = flash ? "#fde047" : "#64748b";
    ctx.fillRect(ox - 8, oy - 4, 16, 8);
    ctx.fillStyle = flash ? "#fff" : "#38bdf8";
    ctx.fillRect(ox - 3, oy - 2, 6, 4);
    ctx.fillStyle = "#f97316";
    ctx.fillRect(ox - 10, oy + 2, 4, 2);
    ctx.fillRect(ox + 6, oy + 2, 4, 2);
  } else {
    // slime
    const squash = 1 + Math.sin(enemy.phase * 6) * 0.12;
    ctx.fillStyle = flash ? "#bbf7d0" : "#22c55e";
    ctx.beginPath();
    ctx.ellipse(ox, oy, 11 * squash, 8 / squash, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#052e16";
    ctx.fillRect(ox - 4, oy - 2, 2, 2);
    ctx.fillRect(ox + 2, oy - 2, 2, 2);
  }
  ctx.restore();
}

export function drawPickup(ctx: CanvasRenderingContext2D, pickup: Pickup) {
  const bob = Math.sin(pickup.bob) * 4;
  const ox = Math.round(pickup.x);
  const oy = Math.round(pickup.y + bob);
  ctx.save();
  if (pickup.kind === "health") {
    ctx.fillStyle = "#14532d";
    ctx.fillRect(ox - 9, oy - 9, 18, 18);
    ctx.fillStyle = "#4ade80";
    ctx.fillRect(ox - 2, oy - 7, 4, 14);
    ctx.fillRect(ox - 7, oy - 2, 14, 4);
  } else if (pickup.kind === "shield") {
    ctx.fillStyle = "#1e3a8a";
    ctx.beginPath();
    ctx.moveTo(ox, oy - 10);
    ctx.lineTo(ox + 9, oy - 4);
    ctx.lineTo(ox + 7, oy + 8);
    ctx.lineTo(ox, oy + 11);
    ctx.lineTo(ox - 7, oy + 8);
    ctx.lineTo(ox - 9, oy - 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#93c5fd";
    ctx.fillRect(ox - 2, oy - 4, 4, 8);
  } else {
    ctx.fillStyle = "#7c2d12";
    ctx.fillRect(ox - 9, oy - 9, 18, 18);
    ctx.fillStyle = "#fdba74";
    ctx.fillRect(ox - 6, oy - 2, 12, 4);
    ctx.fillRect(ox - 2, oy - 6, 4, 12);
  }
  ctx.restore();
}

export { ENEMY_KINDS, PICKUP_KINDS };
