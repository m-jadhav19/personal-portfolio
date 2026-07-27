import { INTRO_COMPLETE_EVENT } from "@/animations/navigation";

export { INTRO_COMPLETE_EVENT };

export function signalIntroComplete() {
  if (typeof window === "undefined") return;
  document.documentElement.dataset.intro = "complete";
  window.dispatchEvent(new CustomEvent(INTRO_COMPLETE_EVENT));
}
