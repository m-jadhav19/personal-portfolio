import "./styles/main.css";

import { createAudioEngine } from "./audio/engine.ts";
import { zoneFromX } from "./audio/scales.ts";
import { createCursorTracker } from "./canvas/cursor.ts";
import { createParticleField } from "./canvas/field.ts";
import { initHud } from "./ui/hud.ts";
import { initOverlay, initOverlayEntrance } from "./ui/overlay.ts";

const canvasEl = document.getElementById("scene");
if (!canvasEl || !(canvasEl instanceof HTMLCanvasElement)) {
  throw new Error("Canvas element not found");
}
const canvas = canvasEl;

const cursor = createCursorTracker();
const field = createParticleField({ canvas, cursor });
const audio = createAudioEngine();
const hud = initHud();
const overlay = initOverlay();

initOverlayEntrance();

let lastZone = zoneFromX(0.5);
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let audioStarted = false;

function handlePointerMove(x: number, y: number) {
  cursor.onMove(x, y);
  const state = cursor.getState();

  field.addTurbulence(state.speed * 1.4);

  const zone = zoneFromX(state.xNorm);
  const zoneChanged = zone !== lastZone;
  lastZone = zone;

  if (audioStarted) {
    const readout = audio.updateFromCursor(
      state.xNorm,
      state.yNorm,
      state.speed,
      zoneChanged,
      zone,
    );
    if (readout) {
      hud.updateReadout(readout.freq, readout.cutoff, readout.note);
    }

    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      audio.onIdle();
      field.decayTurbulence();
    }, 220);
  }
}

function bindPointerEvents() {
  window.addEventListener("mousemove", (e) => {
    handlePointerMove(e.clientX, e.clientY);
  });

  canvas.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) handlePointerMove(touch.clientX, touch.clientY);
    },
    { passive: false },
  );

  canvas.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    if (touch) handlePointerMove(touch.clientX, touch.clientY);
  });
}

overlay.onStart(async () => {
  await audio.unlock();
  audioStarted = true;
  document.body.style.cursor = "none";
});

hud.onMuteToggle((muted) => {
  audio.setMuted(muted);
});

window.addEventListener("resize", () => {
  field.resize();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const overlayEl = document.getElementById("overlay");
    if (overlayEl && !overlayEl.classList.contains("hide")) return;
    audio.setMuted(true);
    audio.onIdle();
    const muteBtn = document.getElementById("mute");
    if (muteBtn) muteBtn.textContent = "Unmute";
  }
});

const levelLoop = () => {
  field.setLevel(audio.getLevel());
  requestAnimationFrame(levelLoop);
};
requestAnimationFrame(levelLoop);

bindPointerEvents();

window.addEventListener("beforeunload", () => {
  field.destroy();
  audio.destroy();
});
