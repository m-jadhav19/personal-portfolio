const INTRO_CLASSES = [
  "intro-loading",
  "loader-active",
  "intro-nav-only",
] as const;

export function resetIntroDocumentState() {
  if (typeof document === "undefined") return;

  const html = document.documentElement;
  html.classList.remove(...INTRO_CLASSES);
  delete html.dataset.intro;
}
