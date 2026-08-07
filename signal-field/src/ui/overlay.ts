import { gsap } from "gsap";

export type OverlayController = {
  onStart: (callback: () => void | Promise<void>) => void;
};

export function initOverlay(): OverlayController {
  const overlay = document.getElementById("overlay");
  if (!overlay) {
    throw new Error("Overlay element not found");
  }

  gsap.from("#overlay h1", { opacity: 0, y: 18, duration: 1, ease: "power3.out" });
  gsap.from("#overlay .sub", {
    opacity: 0,
    y: 10,
    duration: 1,
    delay: 0.15,
    ease: "power3.out",
  });
  gsap.from("#overlay .desc", {
    opacity: 0,
    y: 10,
    duration: 1,
    delay: 0.3,
    ease: "power3.out",
  });
  gsap.from("#overlay .enter", {
    opacity: 0,
    y: 10,
    duration: 1,
    delay: 0.45,
    ease: "power3.out",
  });

  return {
    onStart(callback) {
      overlay.addEventListener("click", async () => {
        await callback();

        gsap.to(overlay, {
          autoAlpha: 0,
          duration: 0.7,
          ease: "power2.out",
          onComplete: () => overlay.classList.add("hide"),
        });
        gsap.to("#hud", { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power2.out" });
        gsap.to("#brand", { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power2.out" });
        gsap.to("#mute", { opacity: 1, duration: 0.8, delay: 0.4, ease: "power2.out" });
      });
    },
  };
}

export function initOverlayEntrance() {
  gsap.set("#hud", { y: -8 });
  gsap.set("#brand", { y: -8 });
}
