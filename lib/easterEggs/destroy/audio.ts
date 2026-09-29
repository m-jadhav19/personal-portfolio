export type BlipKind =
  | "shoot"
  | "hit"
  | "boom"
  | "missile"
  | "throw"
  | "roach"
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
  for (let i = 0; i < length; i++) {
    // Soften toward the end for natural decay envelopes
    const t = 1 - i / length;
    data[i] = (Math.random() * 2 - 1) * t;
  }
  return buffer;
}

export function createDestroyAudio(initialMuted = false): DestroyAudio {
  let muted = initialMuted;
  let ctx: AudioContext | null = null;
  let sharedNoise: AudioBuffer | null = null;

  function ensureCtx() {
    if (typeof window === "undefined") return null;
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      sharedNoise = noiseBuffer(ctx, 0.35);
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
  ) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), start + dur);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vol, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  function burst(
    audio: AudioContext,
    start: number,
    dur: number,
    vol: number,
    dest: AudioNode,
    filterFreq = 1800,
  ) {
    if (!sharedNoise) sharedNoise = noiseBuffer(audio, 0.35);
    const src = audio.createBufferSource();
    src.buffer = sharedNoise;
    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(filterFreq, start);
    filter.Q.value = 0.7;
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vol, start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    src.start(start);
    src.stop(start + dur + 0.02);
  }

  function play(kind: BlipKind) {
    if (muted) return;
    const audio = ensureCtx();
    if (!audio) return;

    const now = audio.currentTime;
    const master = audio.createGain();
    master.gain.value = 0.9;
    master.connect(audio.destination);

    switch (kind) {
      case "shoot": {
        // Sharp laser: high square + short noise crack
        tone(audio, "square", 1240, 280, now, 0.09, 0.045, master);
        tone(audio, "square", 1860, 420, now, 0.05, 0.02, master);
        burst(audio, now, 0.04, 0.05, master, 3200);
        break;
      }
      case "hit": {
        // Impact thud when a bolt punches a hole
        tone(audio, "triangle", 220, 60, now, 0.08, 0.05, master);
        burst(audio, now, 0.06, 0.06, master, 900);
        break;
      }
      case "missile": {
        // Launch whoosh
        burst(audio, now, 0.18, 0.07, master, 600);
        tone(audio, "sawtooth", 180, 80, now, 0.2, 0.03, master);
        break;
      }
      case "throw": {
        tone(audio, "square", 360, 140, now, 0.1, 0.03, master);
        burst(audio, now, 0.05, 0.03, master, 1400);
        break;
      }
      case "boom": {
        // Layered explosion: sub hit + noise blast + spark
        tone(audio, "sine", 90, 28, now, 0.32, 0.1, master);
        tone(audio, "sawtooth", 160, 40, now, 0.22, 0.04, master);
        burst(audio, now, 0.28, 0.12, master, 500);
        burst(audio, now + 0.02, 0.12, 0.06, master, 2200);
        break;
      }
      case "roach": {
        burst(audio, now, 0.07, 0.04, master, 2400);
        tone(audio, "triangle", 260, 140, now, 0.06, 0.02, master);
        break;
      }
      case "ui":
      default: {
        tone(audio, "square", 660, 520, now, 0.045, 0.025, master);
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
      }
    },
  };
}
