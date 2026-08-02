/**
 * Captures live screenshots of each project URL into public/images/projects/.
 *
 * Regenerate when a project URL changes or a site is redesigned:
 *   npm run generate:thumbnails
 * Then commit the updated PNGs.
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

import { portfolio } from "../content/portfolio";

const VIEWPORT = { width: 1280, height: 800 };
const SETTLE_MS = 2000;
const NAV_TIMEOUT_MS = 30_000;
const OUTPUT_DIR = path.join(process.cwd(), "public", "images", "projects");

type CaptureTarget = {
  slug: string;
  url: string;
  title: string;
};

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const targets = new Map<string, CaptureTarget>();

  for (const project of portfolio.projects) {
    if (!project.slug || !project.url) continue;
    if (!targets.has(project.slug)) {
      targets.set(project.slug, {
        slug: project.slug,
        url: project.url,
        title: project.title,
      });
    }
  }

  if (targets.size === 0) {
    console.error("No projects with slug and url found.");
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const failures: string[] = [];

  try {
    const page = await browser.newPage();
    await page.setViewportSize(VIEWPORT);

    for (const { slug, url, title } of targets.values()) {
      const outputPath = path.join(OUTPUT_DIR, `${slug}.png`);

      try {
        console.log(`Capturing ${title} (${url})…`);
        await page.goto(url, {
          waitUntil: "networkidle",
          timeout: NAV_TIMEOUT_MS,
        });
        await page.waitForTimeout(SETTLE_MS);
        await page.screenshot({ path: outputPath, type: "png" });
        console.log(`  ✓ ${path.relative(process.cwd(), outputPath)}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`  ✗ ${slug}: ${message}`);
        failures.push(slug);
      }
    }
  } finally {
    await browser.close();
  }

  if (failures.length > 0) {
    console.error(`\nFailed to capture: ${failures.join(", ")}`);
    process.exit(1);
  }

  console.log(`\nDone — ${targets.size} thumbnail(s) written to public/images/projects/`);
}

void main();
