import { createAnalyserSampler } from "./analyser.ts";
import { createDroneVoice } from "./droneVoice.ts";
import { createPluckVoice } from "./pluckVoice.ts";
import { noteNameForZone } from "./scales.ts";

export type AudioEngine = {
  unlock: () => Promise<void>;
  isReady: () => boolean;
  isMuted: () => boolean;
  setMuted: (muted: boolean) => void;
  updateFromCursor: (
    xNorm: number,
    yNorm: number,
    speed: number,
    zoneChanged: boolean,
    zone: number,
  ) => { freq: number; cutoff: number; note: string } | null;
  onIdle: () => void;
  getLevel: () => number;
  destroy: () => void;
};

export function createAudioEngine(): AudioEngine {
  let ctx: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let analyser: AnalyserNode | null = null;
  let sampler: ReturnType<typeof createAnalyserSampler> | null = null;
  let drone: ReturnType<typeof createDroneVoice> | null = null;
  let pluck: ReturnType<typeof createPluckVoice> | null = null;
  let muted = false;
  let ready = false;

  const buildGraph = () => {
    if (ctx) return;

    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.0001;

    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;

    drone = createDroneVoice(ctx);
    pluck = createPluckVoice(ctx);

    drone.connect(masterGain);
    pluck.connect(masterGain);
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    drone.start();
    sampler = createAnalyserSampler(analyser);
    sampler.start();
    ready = true;
  };

  return {
    async unlock() {
      buildGraph();
      if (ctx?.state === "suspended") {
        await ctx.resume();
      }
      if (masterGain && ctx) {
        masterGain.gain.setTargetAtTime(1.0, ctx.currentTime, 0.05);
      }
    },
    isReady: () => ready,
    isMuted: () => muted,
    setMuted(value) {
      muted = value;
      if (!ctx || !masterGain) return;
      masterGain.gain.setTargetAtTime(value ? 0.0001 : 1.0, ctx.currentTime, 0.05);
    },
    updateFromCursor(xNorm, yNorm, speed, zoneChanged, zone) {
      if (!ready || !ctx || !drone || !pluck || muted) return null;

      const { freq, cutoff } = drone.update(xNorm, yNorm, speed);

      if (zoneChanged) {
        pluck.trigger(zone, speed);
      }

      return { freq, cutoff, note: noteNameForZone(zone) };
    },
    onIdle() {
      drone?.fadeOut();
    },
    getLevel: () => sampler?.getLevel() ?? 0,
    destroy() {
      sampler?.stop();
      void ctx?.close();
      ctx = null;
      ready = false;
    },
  };
}
