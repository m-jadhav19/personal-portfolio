import { ScrollTrigger } from "gsap/ScrollTrigger";

import { getLenis } from "./lenis";

let lockCount = 0;

export function lockPageScroll() {
  if (lockCount === 0) {
    document.documentElement.classList.add("catalog-open");
    getLenis()?.stop();
  }

  lockCount += 1;
}

export function unlockPageScroll() {
  lockCount = Math.max(0, lockCount - 1);

  if (lockCount === 0) {
    document.documentElement.classList.remove("catalog-open");
    getLenis()?.start();
    ScrollTrigger.update();
  }
}

export function resetPageScrollLock() {
  lockCount = 0;
  document.documentElement.classList.remove("catalog-open");
  getLenis()?.start();
  ScrollTrigger.update();
}

export function isPageScrollLocked() {
  return lockCount > 0;
}
