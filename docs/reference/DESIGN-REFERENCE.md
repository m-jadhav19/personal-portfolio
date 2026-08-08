# Design Reference — Russell Numo Replica Blueprint

This document is the **source of truth** when implementing sections. It maps the self-contained HTML prototype, the live Russell Numo reference, and our Next.js module roadmap.

## Reference files

| Source | Location |
|--------|----------|
| HTML prototype (liftable sections) | User-provided single-file spec (Jul 2026) |
| Live site snapshot | `Russell Numo _ Creative Frontend Developer.html` |
| Extracted assets | `Russell Numo _ Creative Frontend Developer_files/` |

Our implementation uses **Next.js 15 App Router + TypeScript + Tailwind v4 + GSAP + Lenis** — not Chakra UI from the original Russell build.

---

## Page structure (build order)

| # | Section | DOM id | Status |
|---|---------|--------|--------|
| 0 | Preloader | `#preloader` | Planned — Phase 05 Loader |
| — | Navigation | `header` fixed | **Done** — `components/Navigation/` |
| 1 | Hero | `#hero` | Planned — Phase 06 Hero |
| 2 | About | `#about` | Planned — Phase 07 |
| 3 | Featured Work | `#projects` (ref: `#work`) | Planned — Phase 08 |
| 4 | Pull Quote | — | Planned |
| 5 | Services | `#services` | Planned — Phase 09 |
| 6 | Closing Statement | — | Planned |
| 7 | Contact | `#contact` | Planned — Phase 11 |
| 8 | Footer | `footer` | Planned — Phase 12 |

> **Note:** Russell's reference uses `id="work"`. Our nav uses `id="projects"` — keep `projects` for consistency with `content/navigation.ts`.

---

## Design tokens (prototype ↔ ours)

| Token | Prototype | Our `tokens.css` |
|-------|-----------|------------------|
| Page bg (light) | `#f5f4f0` | `--background` |
| Text | `#0e1111` | `--foreground` |
| Text dim | `#6b6b6b` | `--muted` |
| Accent | `#4b3bff` (placeholder) | `--accent` (ours: `#0ea5e9`) |
| Border | `rgba(14,14,14,.12)` | `--border` |
| Dark bg | `#0e1111` | `--background-dark` |
| Dark text | `#f5f4f0` | `--foreground-dark` |

**Theme switch:** Light by default. `body.theme-dark` (or `data-theme="dark"`) when Contact is centered in viewport — `rootMargin: -45% 0px -45% 0px`.

---

## Global behaviors (from prototype JS)

### Lenis smooth scroll
- Duration `1.1`, custom easing
- All scroll-linked effects use `lenis.on('scroll')` not native `scroll`
- Nav anchor clicks: `lenis.scrollTo(target, { offset: -80 })`
- Wired in `hooks/useLenis.ts` → `Providers`

### Custom cursor
- 10px dot, `mix-blend-mode: difference` (prototype)
- Scales to 48px on interactive elements (prototype) / 18px on nav (our Phase 02 spec)
- Disabled on touch / `prefers-reduced-motion`
- Ours: `components/Cursor/Cursor.tsx`

### Preloader
- Fixed fullscreen, counter `0–100%`, slides up with `translateY(-100%)`
- On complete → dispatch `intro:complete` → nav intro → hero intro
- Russell uses `html.intro-loading` + `clip-path` on `[data-intro]` elements

### Navigation intro (Russell extract)
```css
html.intro-loading [data-intro=marquee-line],
html.intro-loading [data-intro=portrait] { clip-path: inset(100% 0 0 0); }
html.intro-loading [data-intro=meta-item],
html.intro-loading [data-intro=nav-item] { opacity: 0; }
```

---

## Section-specific patterns

### Hero
- **3 marquee rows** — CSS `@keyframes` loop at ±50%, alternating direction
- **Portrait** — centered absolute, `mix-blend-mode: difference`, `isolation: isolate` on hero
- **Ambient glitch** — random interval 3–7s, RGB split via `::before`/`::after`
- **Hover** — grayscale off, scale 1.04, chromatic aberration
- **Meta row** — location + live clock + availability pill (green dot)
- **Scroll cue** — bottom center

Roles for Mandar (from earlier spec):
```
Creative Developer    [ Portrait ]    Frontend Engineer
        Three.js                      React
```

### About
- Giant display heading with `[data-scramble]` text decode animation
- Two-column copy grid
- Scroll reveal (`.reveal` → `.in-view`)

### Featured Work
- **Sticky** “Featured Work” heading at `top: 35vh`
- Project cards scroll **over** heading (opaque `background: var(--color-bg)`)
- Image scale on hover, scroll parallax between columns

### Services
- Accordion rows, arrow alternates L/R per row
- `grid-template-rows: 0fr → 1fr` expand
- Hover: name slides ±12px, accent color

### Contact
- Triggers dark theme when centered
- Large italic display heading “Get in touch”
- Email + phone in footer row

---

## Motion language

| Use | Prototype | Ours |
|-----|-----------|------|
| Ease | `cubic-bezier(0.76, 0, 0.24, 1)` (preloader) | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Reveal | `0.8s ease` opacity + translateY(24px) | GSAP in `animations/reveal.ts` |
| Marquee | 24s linear infinite | `animations/marquee.ts` |
| Reduced motion | Disable all animations | Respect `prefers-reduced-motion` |

---

## Component map

```
components/
  Navigation/     ✅ Done
  Loader/         Phase 05
  Hero/           Phase 06
  About/          Phase 07
  Projects/       Phase 08
  Services/       Phase 09
  Contact/        Phase 11
  Footer/         Phase 12
  Cursor/         ✅ Basic (expand in Phase 13)

animations/
  navigation.ts   ✅
  loader.ts       stub + signalIntroComplete
  hero.ts         Phase 06
  reveal.ts       Phase 07+
  marquee.ts      Phase 06
  split.ts        Phase 07 (scramble text)

content/
  navigation.ts   ✅
  portfolio.ts    ✅
  sections.ts     ✅ section registry
```

---

## Mandar content placeholders

Replace prototype `[PLACEHOLDER]` values from `content/portfolio.ts`:

- **Logo:** MANDAR / JADHAV (split wordmark)
- **Hero roles:** Creative Developer, Frontend Engineer, Three.js
- **Location:** Mumbai, India
- **Availability:** Open to work (green dot)
- **Quote:** from `servicesBlock.quote` (when added back)
- **Projects:** 7 items in `portfolio.projects`
- **Contact:** `jadhavmandar44@gmail.com`

---

## When in doubt

1. Check this doc for the intended behavior
2. Fall back to the HTML prototype for CSS/JS patterns
3. Check Russell snapshot for `data-intro` attributes and loader states
4. Prefer our design tokens over hardcoded prototype values
5. Keep animations in `animations/` — not inside components
