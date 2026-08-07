export type AnalyserSampler = {
  getLevel: () => number;
  start: () => void;
  stop: () => void;
};

export function createAnalyserSampler(analyser: AnalyserNode): AnalyserSampler {
  let level = 0;
  let frameId = 0;
  const data = new Uint8Array(analyser.frequencyBinCount);

  const sample = () => {
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    level = level * 0.85 + rms * 0.15;
    frameId = requestAnimationFrame(sample);
  };

  return {
    getLevel: () => level,
    start: () => {
      if (!frameId) frameId = requestAnimationFrame(sample);
    },
    stop: () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
    },
  };
}
