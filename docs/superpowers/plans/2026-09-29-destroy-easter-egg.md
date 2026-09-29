# Destroy Mode Easter Egg Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a typed `DESTROY` easter egg: cursor-following 8-bit character, chaos weapon kit, canvas overlay that damages real DOM, soft repair / leave mode / hard reload — desktop only.

**Architecture:** Extend `SystemModeProvider` with egg id `"destroy"` (overlay-only, `mode` stays `default`). `DestroySiteSimulator` owns HUD/pause UI; `lib/easterEggs/destroy/*` owns the rAF engine, weapons, target snapshot/restore, sprites, and audio.

**Tech Stack:** Next.js App Router, React 19, CSS modules, canvas 2D, WebAudio, existing `useCheatCode` / Lenis helpers, `node:test` for unit tests.

## Global Constraints

- Trigger word: `DESTROY` via `useCheatCode` (case-insensitive buffer already uppercases).
- Desktop only: coarse pointer / no hover → toast, do not mount.
- One egg at a time; destroy clears Myspace/Konami first.
- While destroy active, `Esc` toggles pause menu — provider must not clear the egg on Escape.
- Leave mode soft-restores DOM before teardown; Exit uses `location.reload()`.
- Canvas is `pointer-events: none`; input from `window` listeners.
- `prefers-reduced-motion`: no shake, fewer particles.
- Out of scope: platformer physics, mobile controls, Kick-Ass embed, background packs.

---

## File structure

| File | Responsibility |
|------|----------------|
| `lib/easterEggs/codes.ts` | `DESTROY_CHEAT_CODE`, `EasterEggId` += `"destroy"` |
| `lib/systemMode.ts` | `eggToMode("destroy")` → `"default"` |
| `lib/easterEggs/destroy/targets.ts` | Query candidates, hit-test, snapshot, damage, restore |
| `lib/easterEggs/destroy/weapons.ts` | Weapon ids, configs, index clamp/cycle |
| `lib/easterEggs/destroy/sprites.ts` | Pixel draw helpers for character / FX / roaches |
| `lib/easterEggs/destroy/audio.ts` | Mute + short WebAudio blips |
| `lib/easterEggs/destroy/engine.ts` | rAF loop, entities, input hooks, public API |
| `lib/easterEggs/destroy/desktop.ts` | Desktop capability check |
| `components/EasterEggs/DestroySiteSimulator.tsx` | React shell: canvas, HUD, pause, lifecycle |
| `components/EasterEggs/DestroySiteSimulator.module.css` | HUD / pause styles |
| `components/EasterEggs/SystemModeProvider.tsx` | Wire cheat, mount, Escape ownership |
| `components/EasterEggs/index.ts` | Export simulator |
| `lib/easterEggs/prompts.ts` | One whisper (never spells DESTROY) |
| `styles/easter-eggs.css` | Optional `data-easter-egg="destroy"` hooks |
| `lib/favicon/drawFavicon.ts` | Treat `"destroy"` like default (no special favicon) unless trivial |

---

### Task 1: Codes, mode map, desktop gate, weapons, targets (pure logic)

**Files:**
- Modify: `lib/easterEggs/codes.ts`
- Modify: `lib/systemMode.ts`
- Create: `lib/easterEggs/destroy/desktop.ts`
- Create: `lib/easterEggs/destroy/weapons.ts`
- Create: `lib/easterEggs/destroy/targets.ts`
- Create: `lib/easterEggs/destroy/weapons.test.ts`
- Create: `lib/easterEggs/destroy/targets.test.ts`

**Interfaces:**
- Produces:
  - `DESTROY_CHEAT_CODE = "DESTROY"`
  - `EasterEggId = "broken-ux" | "myspace" | "destroy"`
  - `isDestroyDesktop(): boolean`
  - `WeaponId = "blaster" | "missile" | "bomb" | "swarm"`
  - `WEAPONS: readonly WeaponId[]`
  - `clampWeaponIndex(i: number): number`
  - `cycleWeaponIndex(i: number, delta: number): number`
  - `TargetSnapshot` + `createTargetRegistry()` / `applyDamage` / `restoreAll` / `isIgnorable`

- [ ] **Step 1:** Extend codes + `eggToMode` / `modeToEgg` (destroy stays default mode)
- [ ] **Step 2:** Implement `desktop.ts`, `weapons.ts`, `targets.ts` with tests for clamp/cycle and ignore filter
- [ ] **Step 3:** Run `node --import tsx --test lib/easterEggs/destroy/*.test.ts` — expect PASS
- [ ] **Step 4:** Commit

---

### Task 2: Sprites, audio, engine

**Files:**
- Create: `lib/easterEggs/destroy/sprites.ts`
- Create: `lib/easterEggs/destroy/audio.ts`
- Create: `lib/easterEggs/destroy/engine.ts`

**Interfaces:**
- Produces `createDestroyEngine(options)` returning:
  - `start()` / `stop()` / `setPaused(boolean)` / `setMuted(boolean)`
  - `setWeapon(index: number)` / `getWeaponIndex(): number`
  - `repair()` — clear FX + `restoreAll`
  - `destroy()` — full teardown (cancel rAF, remove listeners)
  - Options: `canvas`, `onShake?`, `reducedMotion: boolean`

Engine responsibilities:
- Character lerp to cursor; aim arm; draw via sprites
- Click (when not paused, not on HUD): spawn active weapon
- Keys `1-4`, wheel: switch weapon
- Blaster / missile / bomb / swarm behaviors per spec
- Caps on projectiles, particles, roaches
- `visibilitychange` pauses rAF while hidden

- [ ] **Step 1:** Implement sprites + audio
- [ ] **Step 2:** Implement engine with public API above
- [ ] **Step 3:** Smoke-check types (`tsc` / project build later)
- [ ] **Step 4:** Commit

---

### Task 3: DestroySiteSimulator UI + provider wiring

**Files:**
- Create: `components/EasterEggs/DestroySiteSimulator.tsx`
- Create: `components/EasterEggs/DestroySiteSimulator.module.css`
- Modify: `components/EasterEggs/SystemModeProvider.tsx`
- Modify: `components/EasterEggs/index.ts`
- Modify: `lib/easterEggs/prompts.ts`
- Modify: `styles/easter-eggs.css` (minimal)
- Modify: `lib/favicon/drawFavicon.ts` / `setFavicon.ts` if needed for new egg id

**Behavior:**
- Mount canvas + HUD (`data-destroy-ignore`)
- Pause Lenis via `getLenis()?.stop()` on enter; `start()` on leave
- Pause menu: Resume / Repair site / Leave mode / Exit
- Desktop toast when cheat fires on non-desktop
- Provider: `useCheatCode(DESTROY)`; exclude Escape auto-exit while `activeEgg === "destroy"`
- Mutual exclusion when activating

- [ ] **Step 1:** Build simulator component + CSS
- [ ] **Step 2:** Wire provider + exports + whisper prompt
- [ ] **Step 3:** Commit + push; create/update PR
- [ ] **Step 4:** Manual verify: type DESTROY, weapons, Esc paths, mutual exclusion

---

### Task 4: Polish + verification

- [ ] **Step 1:** Reduced-motion path, particle caps, mute toggle persistence (session)
- [ ] **Step 2:** Run unit tests + `npm run lint` / `npm run build`
- [ ] **Step 3:** Fix issues; commit; update PR

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Typed DESTROY trigger | 1, 3 |
| Overlay egg, mode default | 1, 3 |
| Mutual exclusion | 3 |
| Desktop gate + toast | 1, 3 |
| Escape → pause (not exit) | 3 |
| Cursor-follow character | 2 |
| Chaos kit 1–4 | 1, 2, 3 |
| DOM damage + particles | 1, 2 |
| Soft repair / Leave / Exit | 2, 3 |
| Lenis pause/resume | 3 |
| Reduced motion | 2, 4 |
| Whisper prompt | 3 |
