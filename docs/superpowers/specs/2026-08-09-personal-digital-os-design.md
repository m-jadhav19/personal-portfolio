# Personal Digital OS — Design Spec (§1–§3)

> **Scope:** Foundation + presence (tokens, mode layer, hero metadata, portrait treatments, mode-aware cursor).  
> **Deferred:** Konami staged progression, Vice radio-station deepening, marquee interaction, TechTicker mode copy, portrait removal, scanner cursor.

## Goal

Treat the portfolio as a **base OS + secret modes**. DEFAULT is Mandar’s real portfolio. VICE and KONAMI are the same portfolio in different realities. Components consume `mode` only — never egg-specific flags.

## Architecture (Approach 1)

Evolve `MyspaceThemeProvider` into **`SystemModeProvider`**.

```
SystemModeProvider
        │
        ├── Hero (SystemMeta, portrait treatments)
        ├── Cursor (MODE_CURSOR + data-cursor)
        ├── Portrait overlays
        ├── Theme tokens via html[data-mode]
        └── Easter-egg overlays (Y2kMySpace, BrokenUxSimulator)
```

| Mode | Trigger | `data-mode` | Egg id (internal) |
|------|---------|-------------|-------------------|
| DEFAULT | — | `default` | — |
| VICE | `PIMPMYRIDE` | `vice` | `myspace` |
| KONAMI | Konami sequence | `konami` | `broken-ux` |

**Canonical state:** `type SystemMode = "default" | "vice" | "konami"`

**Provider exposes:**

- `mode: SystemMode`
- `isEasterEggActive: boolean`
- `isTransitioning: boolean`
- Existing toggles kept internally for migration; **new UI must use `mode` only**

**DOM separation:**

- `html[data-mode]` → persistent visual state (tokens, SystemMeta, cursor chrome, portrait)
- `html[data-easter-egg]` → transition / overlay state (existing Myspace enter/exit loader, egg CSS)

Keep egg ids (`myspace`, `broken-ux`) for overlay CSS/compat; map them to modes at the provider boundary.

## §1 — Tokens

### Semantic layer (components only use these)

`--bg`, `--surface`, `--text`, `--muted`, `--cobalt`, `--cobalt-light`, `--cursor-fg`, `--cursor-offset-a`, `--cursor-offset-b`.

Migration aliases: `--background: var(--bg)`, `--foreground: var(--text)`, `--accent: var(--cobalt)`.

### DEFAULT

```css
--bg:           #123F5C;
--surface:      #0E344D;
--text:         #F4F4F0;
--muted:        #8FA9B8;
--cobalt:       #2457FF;
--cobalt-light: #416DFF;
--fx-cyan:      #16D7D4;   /* dimensional FX only */
--fx-magenta:   #D94CFF;
--cursor-fg:    var(--cobalt);
--cursor-offset-a: transparent;
--cursor-offset-b: transparent;
```

Availability dot uses **`--cobalt`**, not green.

### VICE / KONAMI

Full palette override via named `--vice-*` / `--hack-*` remapped onto semantic tokens. Palettes are intentionally inconsistent. Components never reference vice/hack tokens directly.

## §2 — Hero metadata + portrait

Keep current composition: 3-row marquee, centered portrait, bottom meta, scroll cue, existing intro chain.

### SystemMeta

Tiny (~9–11px, uppercase, tracking ~0.08em). Informational only — no continuous glitch.

```ts
const MODE_META = {
  default: { modeLabel: "MODE / DEFAULT", extra: null },
  vice:    { modeLabel: "MODE / VICE CITY", extra: "RADIO / ON AIR" },
  konami:  { modeLabel: "MODE / CORRUPTED", extra: "THREATS / 47" },
};
```

Always: `MJ / SYSTEM 01`, `PORTFOLIO / 2026`, plus `MODE_META[mode]`.

### HeroMeta

- `MUMBAI / INDIA`
- `LOCAL TIME` (live clock)
- `● AVAILABLE FOR WORK` → `--cobalt` in DEFAULT
- Existing stack unchanged

### Portrait

| Mode | Treatment |
|------|-----------|
| DEFAULT | Current RGB-split WebGL |
| VICE | Stronger chromatic + subtle scanlines |
| KONAMI | Darken ~15–25% + tiny `! MALWARE DETECTED` label |

## §3 — Mode-aware cursor

Mode = visual language; `data-cursor` = interaction state.

| Mode | Glyph / chrome |
|------|----------------|
| DEFAULT | Tiny cobalt crosshair (`+`); no glow/trail |
| VICE | `✦` + subtle offset via `--cursor-offset-*`; custom cursor owns pointer |
| KONAMI | `[!]` default; rare `...` / `ERROR`; no global `cursor: wait` when custom cursor active |

Do not apply `cursor: none` until custom cursor has initialized.

## Out of scope

- Konami staged progression / portfolio-interaction gags
- Vice “whole site as radio station” deepening
- Marquee character interaction / scroll velocity polish
- TechTicker mode variants / removal
- Removing portrait / scanner cursor / third easter egg

## Success criteria

1. Mode updates SystemMeta, tokens, cursor chrome, and portrait without egg-id checks in those components.
2. DEFAULT reads as cobalt portfolio OS; VICE/KONAMI feel like alternate realities.
3. Custom cursor initializes without a missing-pointer flash; egg overlays remain usable.
4. Reduced-motion / touch degrade gracefully.
