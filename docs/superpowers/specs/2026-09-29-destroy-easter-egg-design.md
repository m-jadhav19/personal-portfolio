# Destroy Mode Easter Egg — Design Spec

> **Scope:** Typed `DESTROY` cheat code that mounts a medium-chaos, Flash-era “destroy the website” overlay: cursor-following 8-bit character, chaos weapon kit, real DOM destruction, soft repair + hard reload. Desktop only.  
> **Deferred:** Full Kick-Ass platformer physics (run/jump/fly on DOM platforms), five-weapon reference arsenal beyond the chaos kit, mobile/touch controls, background theme packs, third-party destroy-the-web script embeds.

## Goal

Add a discoverable easter egg that feels like old Flash site gags (missiles, bombs, scurrying pests) while staying integrated with the portfolio’s existing cheat-code / single-active-egg system. Visitors type `DESTROY`, an orange pixel character appears and follows the cursor, and clicking with different weapons damages the real UI. They can repair in place or hard-reset the page.

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Fidelity | Medium chaos (not full platformer) |
| Character presence | Always on screen while active |
| Movement | Follows cursor (lerp, not glued) |
| Weapons | Chaos kit: blaster, missile, bomb, cockroach swarm |
| Recovery | Soft repair + hard reload + leave mode |
| Platforms | Desktop only |
| Architecture | Canvas overlay + DOM hit/restore system |

## Architecture

Wire into `SystemModeProvider` as a third overlay egg, sibling to Broken UX and Myspace.

```
SystemModeProvider
        │
        ├── useCheatCode("DESTROY") → activate destroy
        ├── BrokenUxSimulator (konami)
        ├── Y2kMySpace (vice)
        └── DestroySiteSimulator (destroy)   ← new
                 │
                 ├── HUD / Pause UI (DOM, data-destroy-ignore)
                 └── destroy/engine (canvas rAF)
                          ├── sprites (character + FX)
                          ├── weapons (4 configs)
                          └── targets (query / hit / snapshot / restore)
```

| Concern | Behavior |
|---------|----------|
| Trigger | Typed `DESTROY` via existing `useCheatCode` |
| Egg id | `"destroy"` on `EasterEggId` |
| DOM flag | `html[data-easter-egg="destroy"]` |
| System mode | Overlay-only — `eggToMode("destroy")` stays `"default"` (no theme swap) |
| Mutual exclusion | Activating destroy clears Myspace/Konami first (and vice versa); one egg at a time |
| Desktop gate | If coarse pointer / no hover capability, show a short toast and do not mount |
| Escape | While destroy is active, `Esc` opens/closes the **pause menu** (does not immediately clear the egg). Provider-level Escape exit must not steal this while destroy owns input. |

### Layers

1. **Real page** — destruction targets  
2. **Fixed canvas** — sprite, projectiles, particles, cockroaches (`pointer-events: none`; aim/fire via `window` pointer listeners)  
3. **HUD / pause** — above canvas, `pointer-events` only on UI chrome, marked `data-destroy-ignore`

## Character

- Orange 8-bit stick-figure style, pixel-snapped, roughly 32–48px tall  
- Always visible while the egg is active  
- Position lerps toward the cursor for slight lag  
- Faces left/right from horizontal cursor delta  
- Idle bob + simple walk frames when moving  
- Weapon arm aims toward cursor  

Art is drawn procedurally on canvas (or tiny inline pixel buffers in `sprites.ts`) — no large external sprite sheet dependency required for v1.

## Chaos kit

Switch with `1–4`, mouse wheel, or HUD icons.

| Id | Weapon | Click behavior | Damage |
|----|--------|----------------|--------|
| 1 | Blaster | Fast projectile from sprite toward cursor | Small — shatters one element |
| 2 | Missile | Missile drops from top of viewport toward click point | Larger blast radius |
| 3 | Bomb | Arcing throw toward cursor, delayed boom | Medium AoE |
| 4 | Cockroach swarm | Spawns several pixel roaches near click | They scurry and nibble nearby UI for ~2–3s, then despawn |

Caps: limit concurrent projectiles, particles, and live roaches to protect frame rate.

## Destruction model

### Target selection

Candidates are visible content/interactive nodes: headings, paragraphs, images, cards, buttons, links, and similar portfolio content.

**Never target:**

- Canvas overlay, HUD, pause menu  
- Nodes with `[data-destroy-ignore]`  
- Explicitly safelisted chrome (pause control, repair/exit buttons)

### On hit

1. Snapshot enough state to restore (visibility / opacity / pointer-events / optional inline transforms)  
2. Hide or clip the element  
3. Spawn canvas debris particles from its bounding box  
4. Missile/bomb may apply a light screen shake (skipped under `prefers-reduced-motion`)

### Scroll / Lenis

Pause Lenis while destroy mode is active so aiming stays stable. Resume Lenis on Leave mode or after hard Exit (reload handles this automatically).

## HUD, pause & recovery

### In-game HUD

- Weapon icons with active highlight  
- Hint: `1–4` switch · click fire · `Esc` pause  
- Mute toggle (default sound **on**; short WebAudio 8-bit blips; mute persists for the session)

### Pause menu (`Esc` or HUD pause)

- Title: `Paused — destroy mode`  
- **Resume** — unpause game loop  
- **Repair site** — soft restore: reverse snapshots, clear particles/roaches/projectiles, brief rebuild flash on restored nodes; **stay in destroy mode**  
- **Leave mode** — soft-restore any remaining damage, then unmount overlay, clear egg, resume Lenis (reload stays optional)  
- **Exit** — `location.reload()` hard reset  

Weapon strip may remain visible while paused but is inactive.

### Lifecycle

| Event | Behavior |
|-------|----------|
| Enter | Desktop check → set egg → pause Lenis → mount canvas/HUD → spawn character near cursor |
| Soft repair | Clear FX + restore DOM; remain active |
| Leave mode | Soft-restore damaged nodes → teardown engine → clear egg DOM flags → resume Lenis |
| Exit | Full reload |
| Tab hide | Pause rAF while hidden; resume on visible if still active |
| React unmount | Soft-restore + cancel rAF so the portfolio is never left permanently broken |

## Reduced motion & a11y

- `prefers-reduced-motion: reduce` → no screen shake, fewer particles; destroy/repair still work  
- Cheat typing still ignores inputs inside form fields / contenteditable (existing helper)  
- Desktop-only toast is polite and dismissible  
- Pause/Leave always reachable via keyboard (`Esc` + focusable menu buttons)

## File sketch

```
lib/easterEggs/codes.ts                 # DESTROY_CHEAT_CODE, EasterEggId += "destroy"
lib/systemMode.ts                       # destroy → mode "default"
components/EasterEggs/
  DestroySiteSimulator.tsx
  DestroySiteSimulator.module.css
  SystemModeProvider.tsx                # trigger, mount, Escape ownership, exclusivity
lib/easterEggs/destroy/
  engine.ts                             # rAF loop, input, entity lists
  weapons.ts                            # weapon configs + spawn helpers
  targets.ts                            # query, hit-test, snapshot, restore
  sprites.ts                            # pixel draw helpers
  audio.ts                              # WebAudio blips + mute
styles/easter-eggs.css                  # optional html[data-easter-egg="destroy"] hooks
lib/easterEggs/prompts.ts               # add one whisper hint that never spells DESTROY
```

## Data flow

1. `useCheatCode({ code: "DESTROY" })` fires in `SystemModeProvider`  
2. Desktop gate → if fail, toast and return; if pass, clear other eggs and set `activeEgg = "destroy"`  
3. `DestroySiteSimulator` mounts → `targets` builds registry → `engine.start()`  
4. Pointer move updates aim + character lerp target; click spawns active weapon entity  
5. Hits call `targets.applyDamage` → DOM mutate + particles  
6. Pause / Repair / Leave / Exit call engine + provider teardown APIs  

## Testing

**Unit (light):**

- Target filter excludes `[data-destroy-ignore]` and HUD  
- Weapon index wraps/clamps for `1–4` and wheel  
- Soft restore returns snapshotted nodes to visible state  

**Manual:**

- Type `DESTROY` on desktop → character appears and follows cursor  
- Each weapon damages UI with distinct feel  
- Esc → Resume / Repair / Leave / Exit paths  
- Mutual exclusion with Konami and `PIMPMYRIDE`  
- Coarse-pointer / touch environment shows toast and does not start  
- Reduced-motion: no shake, still playable  

## Out of scope (v1)

- Jetpack / platformer collision against DOM boxes  
- Background scene packs (mountain dusk, etc.)  
- “New website” navigation from the reference pause menu  
- Shipping or vendoring a full Kick-Ass bookmarklet  
- Mobile control scheme  

## Success criteria

- Typing `DESTROY` on desktop starts the overlay within one interaction frame of detection  
- Character is always visible and tracks the cursor with perceptible lag  
- All four chaos weapons are selectable and produce distinct destruction  
- Soft repair restores damaged UI without reload  
- Leave mode soft-restores damage and returns the portfolio to normal interaction without reload  
- Exit hard-reloads cleanly  
- Other easter eggs cannot run concurrently  
