const CHARS = "!<>-_\\/[]{}—=+*^?#";

type QueueItem = {
  from: string;
  to: string;
  start: number;
  end: number;
  char: string | null;
};

export class TextScramble {
  private el: HTMLElement;
  private chars = CHARS;
  private queue: QueueItem[] = [];
  private frame = 0;
  private frameRequest = 0;
  private resolve?: () => void;

  constructor(el: HTMLElement) {
    this.el = el;
  }

  setText(newText: string) {
    const oldText = this.el.textContent ?? "";
    const length = Math.max(oldText.length, newText.length);

    const promise = new Promise<void>((resolve) => {
      this.resolve = resolve;
    });

    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] ?? "";
      const to = newText[i] ?? "";
      const start = Math.floor(Math.random() * 20);
      const end = start + Math.floor(Math.random() * 20);
      this.queue.push({ from, to, start, end, char: null });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();

    return promise;
  }

  private update() {
    let output = "";
    let complete = 0;

    for (const item of this.queue) {
      if (this.frame >= item.end) {
        complete++;
        output += item.to;
      } else if (this.frame >= item.start) {
        if (!item.char || Math.random() < 0.28) {
          item.char = this.chars[Math.floor(Math.random() * this.chars.length)];
        }
        output += `<span class="scramble-char">${item.char}</span>`;
      } else {
        output += item.from;
      }
    }

    this.el.innerHTML = output;

    if (complete === this.queue.length) {
      this.resolve?.();
    } else {
      this.frameRequest = requestAnimationFrame(() => {
        this.frame++;
        this.update();
      });
    }
  }
}

/** One-shot scramble to `finalText` (hero intro reveal). */
export function scrambleElementOnce(element: HTMLElement, finalText: string) {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    element.textContent = finalText;
    return Promise.resolve();
  }

  const fx = new TextScramble(element);
  element.textContent = finalText
    .split("")
    .map(() => CHARS[Math.floor(Math.random() * CHARS.length)] ?? "#")
    .join("");

  return fx.setText(finalText);
}

export function bindScrambleOnView(element: HTMLElement, finalText: string) {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    element.textContent = finalText;
    return () => undefined;
  }

  const fx = new TextScramble(element);
  element.textContent = finalText
    .split("")
    .map(() => CHARS[Math.floor(Math.random() * CHARS.length)])
    .join("");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fx.setText(finalText);
          observer.disconnect();
        }
      });
    },
    { threshold: 0.35 },
  );

  observer.observe(element);

  return () => observer.disconnect();
}
