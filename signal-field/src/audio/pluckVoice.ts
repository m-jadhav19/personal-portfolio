import { freqForZone } from "./scales.ts";

type ActivePluck = {
  osc: OscillatorNode;
  gain: GainNode;
  filter: BiquadFilterNode;
};

const MAX_POLYPHONY = 3;
const ATTACK = 0.008;
const DECAY = 0.28;

export type PluckVoice = {
  connect: (destination: AudioNode) => void;
  trigger: (zone: number, speed: number) => void;
};

export function createPluckVoice(ctx: AudioContext): PluckVoice {
  const output = ctx.createGain();
  output.gain.value = 1;
  const active: ActivePluck[] = [];

  const cleanupFinished = () => {
    for (let i = active.length - 1; i >= 0; i--) {
      const pluck = active[i];
      if (pluck.osc.context.state === "closed") {
        active.splice(i, 1);
      }
    }
  };

  return {
    connect(destination) {
      output.connect(destination);
    },
    trigger(zone, speed) {
      cleanupFinished();

      while (active.length >= MAX_POLYPHONY) {
        const oldest = active.shift();
        if (oldest) {
          try {
            oldest.osc.stop();
          } catch {
            // already stopped
          }
        }
      }

      const now = ctx.currentTime;
      const freq = freqForZone(zone);
      const velocity = Math.min(speed * 2, 1);
      const peakGain = 0.12 + velocity * 0.23;

      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 2000;
      filter.Q.value = 2;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + ATTACK);
      gain.gain.exponentialRampToValueAtTime(0.001, now + DECAY);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(output);

      osc.start(now);
      osc.stop(now + DECAY + 0.05);

      const pluck: ActivePluck = { osc, gain, filter };
      active.push(pluck);

      osc.onended = () => {
        const idx = active.indexOf(pluck);
        if (idx !== -1) active.splice(idx, 1);
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
    },
  };
}
