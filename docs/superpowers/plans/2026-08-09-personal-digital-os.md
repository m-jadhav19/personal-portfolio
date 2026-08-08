# Personal Digital OS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship SystemModeProvider, cobalt semantic tokens, hero SystemMeta + portrait mode treatments, and a mode-aware cursor for DEFAULT / VICE / KONAMI.

**Architecture:** Evolve the existing egg provider into `SystemModeProvider` so `mode` is canonical; `html[data-mode]` drives tokens/UI; `html[data-easter-egg]` remains for overlays/transitions. Hero and Cursor read `mode` + config maps only.

**Tech Stack:** Next.js App Router, React, CSS modules, GSAP, Three.js portrait shader, existing easter-egg overlays.

## Global Constraints

- Components consume `mode` only — never `isMyspace` / egg ids in new UI.
- DEFAULT tokens: `--bg #123F5C`, `--surface #0E344D`, `--text #F4F4F0`, `--muted #8FA9B8`, `--cobalt #2457FF`.
- `--fx-cyan` / `--fx-magenta` are dimensional FX only (marquee shadows), not UI chrome.
- Availability status uses `--cobalt` in DEFAULT.
- Location copy: `MUMBAI / INDIA`.
- KONAMI cursor glyph: `[!]`; rare `...` / `ERROR` only.
- Do not apply `cursor: none` until custom cursor initialized.
- Out of scope: Konami progression, Vice radio deepening, marquee scramble, TechTicker mode variants, portrait removal.

---

## File structure

| File | Responsibility |
|------|----------------|
| `lib/systemMode.ts` | `SystemMode`, egg↔mode map, `MODE_META`, `MODE_CURSOR` |
| `components/EasterEggs/SystemModeProvider.tsx` | Canonical mode state + DOM attrs + overlays |
| `components/EasterEggs/MyspaceThemeProvider.tsx` | Compat re-exports |
| `styles/tokens.css` | DEFAULT semantic tokens + aliases |
| `styles/easter-eggs.css` | VICE/KONAMI remaps on `data-mode`; fix cursor conflicts |
| `components/Hero/SystemMeta.tsx` + CSS | Tiny system labels |
| `components/Hero/Hero.tsx` / `HeroMeta.tsx` / portrait | Wire mode |
| `components/Cursor/Cursor.tsx` + CSS | Mode glyphs + semantic chrome |
| `content/portfolio.ts` | Slash-form location |

---

### Task 1: Mode config + SystemModeProvider

**Files:**
- Create: `lib/systemMode.ts`
- Create: `components/EasterEggs/SystemModeProvider.tsx`
- Modify: `components/EasterEggs/MyspaceThemeProvider.tsx` (re-export)
- Modify: `components/EasterEggs/index.ts`, `EasterEggManager.tsx`, `components/Providers.tsx`

- [ ] **Step 1:** Add `lib/systemMode.ts` with `SystemMode`, `eggToMode`, `MODE_META`, `MODE_CURSOR`
- [ ] **Step 2:** Port MyspaceThemeProvider logic into SystemModeProvider; sync `data-mode` + `data-easter-egg`; expose `mode`, `isEasterEggActive`, `isTransitioning`
- [ ] **Step 3:** Wire Providers + compat exports (`useMyspaceTheme` → derives `isMyspace` from `mode === "vice"`)
- [ ] **Step 4:** Verify cheat codes still toggle eggs and `document.documentElement.dataset.mode` updates

---

### Task 2: Semantic tokens

**Files:**
- Modify: `styles/tokens.css`
- Modify: `styles/easter-eggs.css`
- Modify: `components/Hero/Hero.module.css` (marquee shadows → `--fx-*`)

- [ ] **Step 1:** Redefine `:root` / `html[data-mode="default"]` tokens per spec; alias `--background` / `--foreground` / `--accent`
- [ ] **Step 2:** Remap VICE on `html[data-mode="vice"]` (semantic + cursor offsets); keep overlay gradients on `data-easter-egg="myspace"`
- [ ] **Step 3:** Add KONAMI `--hack-*` + semantic remap on `html[data-mode="konami"]`
- [ ] **Step 4:** Remove Myspace/Konami custom-cursor overrides that fight the custom cursor; scope `cursor: wait` so it does not override when `custom-cursor-active`
- [ ] **Step 5:** Point hero marquee dimensional shadows at `--fx-cyan` / `--fx-magenta`

---

### Task 3: SystemMeta + HeroMeta

**Files:**
- Create: `components/Hero/SystemMeta.tsx`, `SystemMeta.module.css`
- Modify: `components/Hero/Hero.tsx`, `HeroMeta.tsx`, `HeroMeta.module.css`
- Modify: `content/portfolio.ts`

- [ ] **Step 1:** Build SystemMeta from `MODE_META[mode]`
- [ ] **Step 2:** Mount in Hero; use `mode === "vice"` for Myspace hero class
- [ ] **Step 3:** Location `MUMBAI / INDIA`; availability copy + cobalt status dot

---

### Task 4: Portrait mode treatments

**Files:**
- Modify: `components/Hero/HeroPortrait.tsx`, `Hero.module.css`
- Modify: `components/Hero/PortraitRgbCanvas.tsx` (optional chromatic scale)

- [ ] **Step 1:** VICE: stronger chromatic + CSS scanline overlay
- [ ] **Step 2:** KONAMI: darken + tiny `! MALWARE DETECTED` label
- [ ] **Step 3:** Drive from `mode` only

---

### Task 5: Mode-aware cursor

**Files:**
- Modify: `components/Cursor/Cursor.tsx`, `Cursor.module.css`

- [ ] **Step 1:** Read `mode`; idle glyph from `MODE_CURSOR`; framed states keep `data-cursor` symbols
- [ ] **Step 2:** Style with `--cursor-fg` / offset shadows; Konami rare interruption
- [ ] **Step 3:** Defer `custom-cursor-active` / `cursor: none` until after first paint of cursor portal

---

### Task 6: Verify

- [ ] DEFAULT: cobalt bg, SystemMeta, cobalt cursor `+`, unchanged portrait
- [ ] VICE (`PIMPMYRIDE`): MODE / VICE CITY, ✦ cursor, chromatic+scanlines, radio overlay still works
- [ ] KONAMI: MODE / CORRUPTED, `[!]` cursor, malware label, overlays clickable
- [ ] Touch / reduced-motion: native cursor; meta/portrait still mode-aware
