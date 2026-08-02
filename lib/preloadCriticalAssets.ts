import { portfolio } from "@/content/portfolio";

const PRELOAD_TIMEOUT_MS = 20_000;
const FEATURED_PROJECT_COUNT = 3;

function uniqueUrls(urls: string[]) {
  return [...new Set(urls.filter(Boolean))];
}

export function getCriticalImageUrls() {
  const featured = portfolio.projects.slice(0, FEATURED_PROJECT_COUNT);

  return uniqueUrls([
    portfolio.hero.portrait.src,
    ...featured.map((project) => project.imageSrc),
    ...portfolio.services.map((service) => service.imageSrc),
  ]);
}

function preloadImage(url: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();

    const finish = () => resolve();

    image.onload = () => {
      if (typeof image.decode === "function") {
        void image.decode().then(finish).catch(finish);
        return;
      }

      finish();
    };

    image.onerror = finish;
    image.src = url;
  });
}

export async function preloadCriticalImages(urls = getCriticalImageUrls()) {
  if (urls.length === 0) return;

  let timeoutId: number | undefined;

  const timeout = new Promise<void>((resolve) => {
    timeoutId = window.setTimeout(resolve, PRELOAD_TIMEOUT_MS);
  });

  await Promise.race([Promise.all(urls.map((url) => preloadImage(url))), timeout]);

  if (timeoutId !== undefined) {
    window.clearTimeout(timeoutId);
  }
}

export async function waitForLoaderAssets() {
  const pageReady =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          window.addEventListener("load", () => resolve(), { once: true });
        });

  const fontsReady = document.fonts?.ready ?? Promise.resolve();

  await Promise.all([pageReady, fontsReady, preloadCriticalImages()]);
}
