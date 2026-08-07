import { expInterp } from "../utils/math.ts";

export type DroneVoice = {
  connect: (destination: AudioNode) => void;
  update: (xNorm: number, yNorm: number, speed: number) => { freq: number; cutoff: number };
  fadeOut: () => void;
  start: () => void;
};

export function createDroneVoice(ctx: AudioContext): DroneVoice {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  osc1.type = "sawtooth";
  osc2.type = "sawtooth";
  osc2.detune.value = 9;

  const oscGain = ctx.createGain();
  oscGain.gain.value = 0.35;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 800;
  filter.Q.value = 4;

  const delay = ctx.createDelay(1.0);
  delay.delayTime.value = 0.28;

  const feedback = ctx.createGain();
  feedback.gain.value = 0.32;

  const wetGain = ctx.createGain();
  wetGain.gain.value = 0.35;

  const dryGain = ctx.createGain();
  dryGain.gain.value = 0.8;

  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.0001;

  osc1.connect(oscGain);
  osc2.connect(oscGain);
  oscGain.connect(filter);

  filter.connect(dryGain);
  filter.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wetGain);

  dryGain.connect(droneGain);
  wetGain.connect(droneGain);

  let started = false;

  return {
    connect(destination) {
      droneGain.connect(destination);
    },
    start() {
      if (started) return;
      osc1.start();
      osc2.start();
      started = true;
    },
    update(xNorm, yNorm, speed) {
      const now = ctx.currentTime;
      const freq = expInterp(110, 440, xNorm);
      osc1.frequency.setTargetAtTime(freq, now, 0.045);
      osc2.frequency.setTargetAtTime(freq, now, 0.045);

      const cutoff = expInterp(250, 4000, 1 - yNorm);
      filter.frequency.setTargetAtTime(cutoff, now, 0.06);

      const targetVol = Math.min(0.18, 0.04 + speed * 0.45);
      droneGain.gain.setTargetAtTime(targetVol, now, 0.08);
      feedback.gain.setTargetAtTime(0.25 + Math.min(speed, 0.3) * 0.5, now, 0.2);

      return { freq, cutoff };
    },
    fadeOut() {
      const now = ctx.currentTime;
      droneGain.gain.setTargetAtTime(0.0001, now, 0.4);
    },
  };
}
