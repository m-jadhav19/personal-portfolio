#!/usr/bin/env node
/**
 * One-time build script: enhance project screenshots via Gemini API
 * or fall back to sharp 2x upscale.
 *
 * Usage: GEMINI_API_KEY=... npm run enhance-images
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const enhancedDir = join(publicDir, "images", "enhanced");

const projects = [
  { slug: "retro-cassette", imageSrc: "/images/retro.png" },
  { slug: "brutalist-ui", imageSrc: "/images/brutualist.png" },
  { slug: "ply-digital-workspace", imageSrc: "/images/ply-app.png" },
  { slug: "epoch-world-timer", imageSrc: "/images/epoch.png" },
  { slug: "auratry-virtual-try-on", imageSrc: "/images/auratry.png" },
  { slug: "ditherboy", imageSrc: "/images/ditherboy.png" },
  { slug: "3d-portfolio-website", imageSrc: "/images/3dportfolio.png" },
];

function loadEnv() {
  const envPath = join(root, ".env.local");
  if (!existsSync(envPath)) return {};
  const lines = readFileSync(envPath, "utf8").split("\n");
  const env = {};
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

async function enhanceWithSharp(inputPath, outputPath) {
  const sharp = (await import("sharp")).default;
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const width = metadata.width ?? 1200;

  await image
    .resize({
      width: Math.min(Math.round(width * 2), 3840),
      withoutEnlargement: false,
      kernel: "lanczos3",
    })
    .normalize()
    .sharpen({ sigma: 0.8 })
    .webp({ quality: 92, effort: 6 })
    .toFile(outputPath);

  return "sharp";
}

async function enhanceWithGemini(inputPath, outputPath, apiKey) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const imageData = readFileSync(inputPath);
  const ext = extname(inputPath).slice(1).toLowerCase();
  const mimeType =
    ext === "jpg" || ext === "jpeg"
      ? "image/jpeg"
      : ext === "webp"
        ? "image/webp"
        : "image/png";

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: imageData.toString("base64"),
      },
    },
    {
      text: "Enhance this screenshot for a portfolio: improve clarity, reduce compression artifacts, preserve exact composition and colors. Return only the enhanced image.",
    },
  ]);

  const parts = result.response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((part) => part.inlineData?.data);

  if (!imagePart?.inlineData?.data) {
    throw new Error("Gemini did not return image data");
  }

  writeFileSync(outputPath, Buffer.from(imagePart.inlineData.data, "base64"));
  return "gemini";
}

async function main() {
  mkdirSync(enhancedDir, { recursive: true });

  const env = loadEnv();
  const apiKey = process.env.GEMINI_API_KEY ?? env.GEMINI_API_KEY;
  const summary = [];

  for (const project of projects) {
    const inputPath = join(publicDir, project.imageSrc.replace(/^\//, ""));
    const outputPath = join(enhancedDir, `${project.slug}.webp`);

    if (!existsSync(inputPath)) {
      console.warn(`Skip ${project.slug}: missing ${inputPath}`);
      continue;
    }

    let method = "sharp";

    if (apiKey) {
      try {
        method = await enhanceWithGemini(inputPath, outputPath, apiKey);
      } catch (error) {
        console.warn(
          `Gemini failed for ${project.slug}, falling back to sharp:`,
          error instanceof Error ? error.message : error,
        );
        method = await enhanceWithSharp(inputPath, outputPath);
      }
    } else {
      console.warn("No GEMINI_API_KEY — using sharp upscale only");
      method = await enhanceWithSharp(inputPath, outputPath);
    }

    summary.push({
      slug: project.slug,
      from: project.imageSrc,
      to: `/images/enhanced/${basename(outputPath)}`,
      method,
    });
  }

  console.log("\nEnhanced images:");
  for (const row of summary) {
    console.log(`  ${row.slug}: ${row.from} -> ${row.to} (${row.method})`);
  }

  const manifestPath = join(enhancedDir, "manifest.json");
  writeFileSync(manifestPath, JSON.stringify(summary, null, 2));
  console.log(`\nManifest written to ${manifestPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
