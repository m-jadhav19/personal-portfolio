const TARGET_SELECTOR = [
  "h1",
  "h2",
  "h3",
  "h4",
  "p",
  "li",
  "img",
  "a",
  "button",
  "[role='button']",
  "article",
  "figure",
  "figcaption",
  "strong",
  "em",
  "label",
].join(",");

/** Refresh candidate cache at most this often (ms). */
const CACHE_TTL_MS = 250;

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
  return rect.width >= 12 && rect.height >= 12;
}

/** Pure helper for unit tests — true when closest marks the node ignorable. */
export function matchesDestroyIgnore(
  closest: (selector: string) => unknown,
): boolean {
  return Boolean(closest("[data-destroy-ignore]") || closest("canvas"));
}

export function isIgnorable(el: Element | null): boolean {
  if (!el || !(el instanceof Element)) return true;
  return matchesDestroyIgnore((selector) => el.closest(selector));
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
    const nodes = document.querySelectorAll<HTMLElement>(TARGET_SELECTOR);
    const out: HTMLElement[] = [];
    for (const el of nodes) {
      if (isIgnorable(el)) continue;
      if (damaged.has(el)) continue;
      if (!isVisible(el)) continue;
      // Skip nodes nested inside another candidate (prefer outer blocks)
      let nested = false;
      for (const other of out) {
        if (other.contains(el)) {
          nested = true;
          break;
        }
      }
      if (nested) continue;
      out.push(el);
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
    // Drop disconnected / newly damaged entries cheaply
    cache = cache.filter((el) => el.isConnected && !damaged.has(el));
    return cache;
  }

  function invalidate() {
    cache = [];
    cacheAt = 0;
  }

  function applyDamage(
    x: number,
    y: number,
    radius: number,
    maxHits: number,
  ): DamagedTarget[] {
    const candidates = collect();
    const scored: { el: HTMLElement; dist: number; box: DOMRect }[] = [];

    for (const el of candidates) {
      const box = el.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const dist = Math.hypot(cx - x, cy - y);
      // Point-in-expanded-box for blaster; circle for AoE
      if (radius <= 0) {
        const pad = 6;
        if (
          x >= box.left - pad &&
          x <= box.right + pad &&
          y >= box.top - pad &&
          y <= box.bottom + pad
        ) {
          scored.push({ el, dist, box });
        }
      } else if (dist <= radius) {
        scored.push({ el, dist, box });
      }
    }

    scored.sort((a, b) => a.dist - b.dist);
    const hits = scored.slice(0, Math.max(1, maxHits));
    const result: DamagedTarget[] = [];

    for (const { el, box } of hits) {
      if (damaged.has(el)) continue;
      const snap = snapshotElement(el);
      damaged.set(el, snap);
      el.setAttribute("data-destroy-damaged", "true");
      el.style.transition =
        "opacity 120ms ease, filter 120ms ease, transform 120ms ease";
      el.style.opacity = "0";
      el.style.visibility = "hidden";
      el.style.pointerEvents = "none";
      el.style.filter = "blur(2px)";
      el.style.transform = "scale(0.96) rotate(-1deg)";
      result.push({
        snapshot: snap,
        box: new DOMRect(box.x, box.y, box.width, box.height),
      });
    }

    if (result.length > 0) {
      invalidate();
    }

    return result;
  }

  function restoreAll() {
    for (const snap of damaged.values()) {
      restoreSnapshot(snap);
      // Rebuild flash
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
    // Instant restore without flash timers
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
