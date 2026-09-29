type BlipKind = "shoot" | "boom" | "roach" | "ui";

export type DestroyAudio = {
  setMuted: (muted: boolean) => void;
  isMuted: () => boolean;
  play: (kind: BlipKind) => void;
  dispose: () => void;
};

export function createDestroyAudio(initialMuted = false): DestroyAudio {
  let muted = initialMuted;
  let ctx: AudioContext | null = null;

  function ensureCtx() {
    if (typeof window === "undefined") return null;
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    return ctx;
  }

  function play(kind: BlipKind) {
    if (muted) return;
    const audio = ensureCtx();
    if (!audio) return;

    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.connect(gain);
    gain.connect(audio.destination);

    const profiles: Record<
      BlipKind,
      { type: OscillatorType; f0: number; f1: number; dur: number; vol: number }
    > = {
      shoot: { type: "square", f0: 880, f1: 440, dur: 0.06, vol: 0.04 },
      boom: { type: "sawtooth", f0: 120, f1: 40, dur: 0.22, vol: 0.06 },
      roach: { type: "triangle", f0: 220, f1: 160, dur: 0.08, vol: 0.03 },
      ui: { type: "square", f0: 520, f1: 520, dur: 0.04, vol: 0.03 },
    };

    const p = profiles[kind];
    osc.type = p.type;
    osc.frequency.setValueAtTime(p.f0, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, p.f1), now + p.dur);
    gain.gain.setValueAtTime(p.vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + p.dur);
    osc.start(now);
    osc.stop(now + p.dur + 0.01);
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
      }
    },
  };
}
