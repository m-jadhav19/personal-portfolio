/** Elements that should never be destroyed. */
const IGNORE_SELECTOR = "[data-destroy-ignore], canvas, [data-cursor-root]";

/** Prefer these when walking elementsFromPoint / AoE scans. */
const TARGET_TAGS = new Set([
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "P",
  "LI",
  "IMG",
  "A",
  "BUTTON",
  "SPAN",
  "STRONG",
  "EM",
  "LABEL",
  "FIGURE",
  "FIGCAPTION",
  "ARTICLE",
  "SECTION",
  "DIV",
]);

const AOE_SELECTOR = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "li",
  "img",
  "a",
  "button",
  "[role='button']",
  "span",
  "strong",
  "em",
  "label",
  "figure",
  "figcaption",
  "[data-intro]",
  "[data-intro='marquee-chunk']",
  "[data-intro='marquee-line']",
  "[data-destroy-target]",
].join(",");

const CACHE_TTL_MS = 500;
const MIN_SIZE = 10;

export type TargetSnapshot = {
  element: HTMLElement;
  visibility: string;
  opacity: string;
  pointerEvents: string;
  filter: string;
  transform: string;
  transition: string;
};

export type DamagedTarget = {
  snapshot: TargetSnapshot;
  box: DOMRect;
};

function isVisible(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (Number(style.opacity) === 0) return false;
  const rect = el.getBoundingClientRect();
  return rect.width >= MIN_SIZE && rect.height >= MIN_SIZE;
}

/** Pure helper for unit tests — true when closest marks the node ignorable. */
export function matchesDestroyIgnore(
  closest: (selector: string) => unknown,
): boolean {
  return Boolean(
    closest("[data-destroy-ignore]") ||
      closest("canvas") ||
      closest("[data-cursor-root]"),
  );
}

export function isIgnorable(el: Element | null): boolean {
  if (!el || !(el instanceof Element)) return true;
  return matchesDestroyIgnore((selector) => el.closest(selector));
}

function hasMeaningfulContent(el: HTMLElement): boolean {
  if (el.matches("img, svg, canvas, video")) return true;
  const text = (el.innerText || el.textContent || "").trim();
  if (text.length >= 1) return true;
  // Decorative / media blocks without text
  if (el.querySelector("img, svg, video")) return true;
  return false;
}

function isDestroyable(el: HTMLElement): boolean {
  if (isIgnorable(el)) return false;
  // Hero portrait observes Destroy mode — never trash Mogambo's face early.
  if (el.closest("[data-intro='portrait']")) return false;
  const forced =
    el.hasAttribute("data-destroy-target") ||
    el.hasAttribute("data-intro") ||
    el.closest("[data-intro='marquee-line']") === el;
  if (
    !TARGET_TAGS.has(el.tagName) &&
    !forced &&
    !el.hasAttribute("data-intro")
  ) {
    return false;
  }
  // Skip giant page shells
  if (el === document.body || el === document.documentElement) return false;
  if (el.dataset.destroyDamaged === "true") return false;
  if (!isVisible(el)) return false;
  if (!hasMeaningfulContent(el)) return false;

  const rect = el.getBoundingClientRect();
  // Avoid wiping the entire viewport in one shot (huge wrappers)
  // Marquee chunks / forced targets may be wide — allow up to full width strips.
  const areaCap =
    el.hasAttribute("data-destroy-target") ||
    el.getAttribute("data-intro") === "marquee-line" ||
    el.getAttribute("data-intro") === "marquee-chunk"
      ? window.innerWidth * window.innerHeight * 0.85
      : window.innerWidth * window.innerHeight * 0.55;
  if (rect.width * rect.height > areaCap) {
    return false;
  }
  return true;
}

function pointInRect(x: number, y: number, rect: DOMRect) {
  return (
    x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
  );
}

/** Hit-test nodes that may have pointer-events:none (e.g. front marquee). */
function probeForcedTargets(x: number, y: number): HTMLElement | null {
  const nodes = document.querySelectorAll<HTMLElement>(
    "[data-destroy-target], [data-intro='marquee-chunk'], [data-intro='marquee-line']",
  );
  let best: HTMLElement | null = null;
  let bestArea = Number.POSITIVE_INFINITY;
  for (const el of nodes) {
    if (!isDestroyable(el)) continue;
    const rect = el.getBoundingClientRect();
    if (!pointInRect(x, y, rect)) continue;
    const area = rect.width * rect.height;
    if (area < bestArea) {
      best = el;
      bestArea = area;
    }
  }
  return best;
}

function pickBestFromPoint(x: number, y: number): HTMLElement | null {
  const stack = document.elementsFromPoint(x, y);
  let best: HTMLElement | null = null;
  let bestArea = Number.POSITIVE_INFINITY;

  for (const el of stack) {
    if (!(el instanceof HTMLElement)) continue;
    if (el.closest(IGNORE_SELECTOR)) continue;
    // Walk up a few ancestors to find a sensible destroyable node
    let cur: HTMLElement | null = el;
    for (let depth = 0; depth < 6 && cur; depth += 1) {
      if (isDestroyable(cur)) {
        const area =
          cur.getBoundingClientRect().width * cur.getBoundingClientRect().height;
        // Prefer smaller leaf-ish targets so letters/rows die instead of whole page
        if (area < bestArea) {
          best = cur;
          bestArea = area;
        }
        break;
      }
      cur = cur.parentElement;
    }
  }

  // Front marquee / forced targets can miss the stack when pointer-events were none.
  const forced = probeForcedTargets(x, y);
  if (forced) {
    const area =
      forced.getBoundingClientRect().width *
      forced.getBoundingClientRect().height;
    if (!best || area <= bestArea) best = forced;
  }

  return best;
}

function snapshotElement(element: HTMLElement): TargetSnapshot {
  const style = element.style;
  return {
    element,
    visibility: style.visibility,
    opacity: style.opacity,
    pointerEvents: style.pointerEvents,
    filter: style.filter,
    transform: style.transform,
    transition: style.transition,
  };
}

function restoreSnapshot(snapshot: TargetSnapshot) {
  const { element } = snapshot;
  element.style.visibility = snapshot.visibility;
  element.style.opacity = snapshot.opacity;
  element.style.pointerEvents = snapshot.pointerEvents;
  element.style.filter = snapshot.filter;
  element.style.transform = snapshot.transform;
  element.style.transition = snapshot.transition;
  element.removeAttribute("data-destroy-damaged");
}

function hideElement(el: HTMLElement) {
  el.setAttribute("data-destroy-damaged", "true");
  el.style.transition =
    "opacity 120ms ease, filter 120ms ease, transform 120ms ease";
  el.style.opacity = "0";
  el.style.visibility = "hidden";
  el.style.pointerEvents = "none";
  el.style.filter = "blur(2px)";
  el.style.transform = "scale(0.96) rotate(-1deg)";
}

export type TargetRegistry = {
  collect(): HTMLElement[];
  applyDamage(x: number, y: number, radius: number, maxHits: number): DamagedTarget[];
  restoreAll(): void;
  invalidate(): void;
  dispose(): void;
  damagedCount(): number;
};

export function createTargetRegistry(): TargetRegistry {
  const damaged = new Map<HTMLElement, TargetSnapshot>();
  let cache: HTMLElement[] = [];
  let cacheAt = 0;
  const pendingTimers = new Set<number>();

  function rebuildCache(): HTMLElement[] {
    const nodes = document.querySelectorAll<HTMLElement>(AOE_SELECTOR);
    const out: HTMLElement[] = [];
    for (const el of nodes) {
      if (!isDestroyable(el)) continue;
      // Prefer leaves: skip if already covered by a smaller child candidate
      let covered = false;
      for (let i = out.length - 1; i >= 0; i -= 1) {
        const other = out[i];
        if (el.contains(other)) {
          covered = true;
          break;
        }
        if (other.contains(el)) {
          out.splice(i, 1);
        }
      }
      if (!covered) out.push(el);
    }
    cache = out;
    cacheAt = performance.now();
    return out;
  }

  function collect(): HTMLElement[] {
    const now = performance.now();
    if (now - cacheAt > CACHE_TTL_MS || cache.length === 0) {
      return rebuildCache();
    }
    cache = cache.filter((el) => el.isConnected && !damaged.has(el));
    return cache;
  }

  function invalidate() {
    cache = [];
    cacheAt = 0;
  }

  function damageElement(el: HTMLElement): DamagedTarget | null {
    if (damaged.has(el) || !el.isConnected) return null;
    const box = el.getBoundingClientRect();
    const snap = snapshotElement(el);
    damaged.set(el, snap);
    hideElement(el);
    return {
      snapshot: snap,
      box: new DOMRect(box.x, box.y, box.width, box.height),
    };
  }

  function applyDamage(
    x: number,
    y: number,
    radius: number,
    maxHits: number,
  ): DamagedTarget[] {
    const result: DamagedTarget[] = [];
    const hits = Math.max(1, maxHits);

    if (radius <= 0) {
      // Point weapon — use real stacking order under the cursor/bolt
      const el = pickBestFromPoint(x, y);
      if (el) {
        const d = damageElement(el);
        if (d) result.push(d);
      }
      if (result.length > 0) invalidate();
      return result;
    }

    // AoE — score cached candidates by distance to blast center
    const candidates = collect();
    const scored: { el: HTMLElement; dist: number }[] = [];
    for (const el of candidates) {
      if (damaged.has(el)) continue;
      const box = el.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const dist = Math.hypot(cx - x, cy - y);
      if (dist <= radius) scored.push({ el, dist });
    }
    scored.sort((a, b) => a.dist - b.dist);

    for (const { el } of scored.slice(0, hits)) {
      const d = damageElement(el);
      if (d) result.push(d);
    }

    // One extra center probe only — elementsFromPoint is expensive.
    if (result.length < hits) {
      const el = pickBestFromPoint(x, y);
      if (el && !damaged.has(el)) {
        const d = damageElement(el);
        if (d) result.push(d);
      }
    }

    if (result.length > 0) invalidate();
    return result;
  }

  function restoreAll() {
    for (const snap of damaged.values()) {
      restoreSnapshot(snap);
      snap.element.style.transition = "opacity 280ms ease, filter 280ms ease";
      snap.element.style.opacity = "0";
      snap.element.style.visibility = "visible";
      snap.element.style.pointerEvents = snap.pointerEvents;
      requestAnimationFrame(() => {
        if (!snap.element.isConnected) return;
        snap.element.style.opacity = snap.opacity || "1";
        snap.element.style.filter = snap.filter;
        snap.element.style.transform = snap.transform;
        const timer = window.setTimeout(() => {
          pendingTimers.delete(timer);
          if (!snap.element.isConnected) return;
          snap.element.style.transition = snap.transition;
        }, 300);
        pendingTimers.add(timer);
      });
    }
    damaged.clear();
    invalidate();
  }

  function dispose() {
    for (const timer of pendingTimers) {
      window.clearTimeout(timer);
    }
    pendingTimers.clear();
    for (const snap of damaged.values()) {
      restoreSnapshot(snap);
    }
    damaged.clear();
    invalidate();
  }

  function damagedCount() {
    return damaged.size;
  }

  return { collect, applyDamage, restoreAll, invalidate, dispose, damagedCount };
}
