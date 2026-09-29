export type BlipKind =
  | "shoot"
  | "hit"
  | "boom"
  | "rocket"
  | "vortex"
  | "zap"
  | "ui";

export type DestroyAudio = {
  setMuted: (muted: boolean) => void;
  isMuted: () => boolean;
  play: (kind: BlipKind) => void;
  dispose: () => void;
};

function noiseBuffer(ctx: AudioContext, seconds: number) {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    // Pink-ish noise: low-pass random walk for thicker impacts.
    const white = Math.random() * 2 - 1;
    last = last * 0.86 + white * 0.14;
    const t = 1 - i / length;
    data[i] = (white * 0.35 + last * 0.65) * t;
  }
  return buffer;
}

export function createDestroyAudio(initialMuted = false): DestroyAudio {
  let muted = initialMuted;
  let ctx: AudioContext | null = null;
  let sharedNoise: AudioBuffer | null = null;
  let longNoise: AudioBuffer | null = null;

  function ensureCtx() {
    if (typeof window === "undefined") return null;
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      sharedNoise = noiseBuffer(ctx, 0.45);
      longNoise = noiseBuffer(ctx, 0.9);
    }
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    return ctx;
  }

  function tone(
    audio: AudioContext,
    type: OscillatorType,
    f0: number,
    f1: number,
    start: number,
    dur: number,
    vol: number,
    dest: AudioNode,
    attack = 0.006,
  ) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), start + dur);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vol, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(start);
    osc.stop(start + dur + 0.03);
  }

  function burst(
    audio: AudioContext,
    start: number,
    dur: number,
    vol: number,
    dest: AudioNode,
    filterFreq = 1800,
    opts?: { q?: number; buffer?: AudioBuffer | null; type?: BiquadFilterType },
  ) {
    const buf = opts?.buffer ?? sharedNoise;
    if (!buf) return;
    const src = audio.createBufferSource();
    src.buffer = buf;
    const filter = audio.createBiquadFilter();
    filter.type = opts?.type ?? "bandpass";
    filter.frequency.setValueAtTime(filterFreq, start);
    filter.Q.value = opts?.q ?? 0.85;
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vol, start + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    src.start(start);
    src.stop(start + dur + 0.03);
  }

  function play(kind: BlipKind) {
    if (muted) return;
    const audio = ensureCtx();
    if (!audio) return;

    const now = audio.currentTime;
    const master = audio.createGain();
    // Soft ceiling so layered hits stay punchy without clipping harshly.
    master.gain.value = 0.78;
    master.connect(audio.destination);

    switch (kind) {
      case "shoot": {
        // Neon blaster: bright zap + body + crack
        tone(audio, "square", 1480, 220, now, 0.11, 0.05, master, 0.003);
        tone(audio, "sawtooth", 920, 160, now, 0.08, 0.028, master, 0.002);
        tone(audio, "triangle", 2400, 600, now, 0.045, 0.018, master, 0.001);
        burst(audio, now, 0.035, 0.055, master, 4200, { q: 1.2 });
        break;
      }
      case "hit": {
        // Punchy surface hit
        tone(audio, "triangle", 260, 48, now, 0.1, 0.055, master, 0.002);
        tone(audio, "sine", 90, 36, now, 0.12, 0.04, master, 0.003);
        burst(audio, now, 0.07, 0.07, master, 1100, { q: 0.6 });
        break;
      }
      case "rocket": {
        // Tube whoosh + ignition crackle
        burst(audio, now, 0.28, 0.09, master, 480, {
          q: 0.45,
          buffer: longNoise,
          type: "lowpass",
        });
        burst(audio, now + 0.02, 0.12, 0.05, master, 1800, { q: 0.8 });
        tone(audio, "sawtooth", 220, 70, now, 0.26, 0.035, master, 0.01);
        tone(audio, "square", 90, 40, now, 0.18, 0.02, master, 0.008);
        break;
      }
      case "vortex": {
        // Weird descending hum + swirl noise
        tone(audio, "sine", 420, 70, now, 0.42, 0.05, master, 0.02);
        tone(audio, "triangle", 640, 90, now, 0.36, 0.03, master, 0.015);
        burst(audio, now, 0.35, 0.06, master, 700, {
          q: 2.4,
          buffer: longNoise,
        });
        burst(audio, now + 0.08, 0.18, 0.035, master, 1400, { q: 3.2 });
        break;
      }
      case "zap": {
        // Electric crackle chain
        tone(audio, "sawtooth", 2100, 180, now, 0.09, 0.04, master, 0.001);
        tone(audio, "square", 3200, 400, now, 0.05, 0.025, master, 0.001);
        burst(audio, now, 0.08, 0.08, master, 5000, { q: 1.6 });
        burst(audio, now + 0.03, 0.06, 0.045, master, 2800, { q: 2.2 });
        tone(audio, "triangle", 160, 80, now + 0.02, 0.1, 0.03, master, 0.002);
        break;
      }
      case "boom": {
        // Cinematic boom: sub + body + debris hiss
        tone(audio, "sine", 78, 22, now, 0.45, 0.12, master, 0.004);
        tone(audio, "triangle", 140, 34, now, 0.3, 0.055, master, 0.005);
        tone(audio, "sawtooth", 210, 50, now, 0.18, 0.03, master, 0.003);
        burst(audio, now, 0.38, 0.14, master, 420, {
          q: 0.4,
          buffer: longNoise,
          type: "lowpass",
        });
        burst(audio, now + 0.015, 0.16, 0.07, master, 2400, { q: 0.9 });
        burst(audio, now + 0.05, 0.22, 0.045, master, 900, {
          q: 0.5,
          buffer: longNoise,
        });
        break;
      }
      case "ui":
      default: {
        tone(audio, "triangle", 780, 520, now, 0.05, 0.03, master, 0.004);
        tone(audio, "sine", 1180, 900, now, 0.035, 0.015, master, 0.003);
        break;
      }
    }
  }

  return {
    setMuted(next) {
      muted = next;
    },
    isMuted() {
      return muted;
    },
    play,
    dispose() {
      if (ctx) {
        void ctx.close();
        ctx = null;
        sharedNoise = null;
        longNoise = null;
      }
    },
  };
}
