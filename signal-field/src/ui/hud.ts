export type HudController = {
  updateReadout: (freq: number, cutoff: number, note: string) => void;
  onMuteToggle: (callback: (muted: boolean) => void) => void;
};

export function initHud(): HudController {
  const freqEl = document.getElementById("freqVal");
  const cutEl = document.getElementById("cutVal");
  const noteEl = document.getElementById("noteVal");
  const muteBtn = document.getElementById("mute");

  if (!freqEl || !cutEl || !noteEl || !muteBtn) {
    throw new Error("HUD elements not found");
  }

  return {
    updateReadout(freq, cutoff, note) {
      freqEl.textContent = freq.toFixed(0);
      cutEl.textContent = cutoff.toFixed(0);
      noteEl.textContent = note;
    },
    onMuteToggle(callback) {
      muteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const muted = muteBtn.textContent === "Mute";
        muteBtn.textContent = muted ? "Unmute" : "Mute";
        callback(muted);
      });
    },
  };
}
