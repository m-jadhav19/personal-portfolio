const DYNAMIC_ATTR = "data-dynamic-favicon";

export function ensureFaviconLink() {
  let link = document.querySelector<HTMLLinkElement>(
    `link[rel="icon"][${DYNAMIC_ATTR}]`,
  );

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.setAttribute(DYNAMIC_ATTR, "true");
    document.head.appendChild(link);
  }

  link.type = "image/png";
  link.sizes = "32x32";
  return link;
}

export function setFaviconFromCanvas(canvas: HTMLCanvasElement) {
  const link = ensureFaviconLink();
  link.href = canvas.toDataURL("image/png");
}

export function readFaviconMode(): "default" | "broken-ux" | "myspace" {
  const egg = document.documentElement.dataset.easterEgg;
  if (egg === "broken-ux" || egg === "myspace") return egg;
  return "default";
}
