/**
 * Generates placeholder WebP frame sequences for the cinematic intro scrubber.
 * Run: node scripts/generate-placeholder-frames.js
 *
 * Replace output in public/frames/intro/ with real frames:
 *   ffmpeg -i intro.mp4 -vf fps=30 public/frames/intro/desktop/frame_%04d.webp
 */
const fs = require('fs')
const path = require('path')

let sharp
try {
	sharp = require('sharp')
} catch {
	console.error('Install sharp first: npm install --save-dev sharp')
	process.exit(1)
}

const ROOT = path.join(__dirname, '..', 'public', 'frames', 'intro')

async function generateSet(folder, count, width, height) {
	const dir = path.join(ROOT, folder)
	fs.mkdirSync(dir, { recursive: true })

	for (let i = 0; i < count; i += 1) {
		const progress = i / Math.max(count - 1, 1)
		const r = Math.round(10 + progress * 40)
		const g = Math.round(20 + progress * 80)
		const b = Math.round(40 + progress * 160)

		const svg = `
			<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:rgb(${r},${g},${b})"/>
						<stop offset="100%" style="stop-color:rgb(${Math.min(r + 30, 255)},${Math.min(g + 20, 255)},${Math.min(b + 40, 255)})"/>
					</linearGradient>
				</defs>
				<rect width="100%" height="100%" fill="url(#g)"/>
				<text x="50%" y="45%" text-anchor="middle" fill="rgba(255,255,255,0.15)" font-family="monospace" font-size="${Math.round(width * 0.04)}">MANDAR</text>
				<text x="50%" y="55%" text-anchor="middle" fill="rgba(255,255,255,0.08)" font-family="monospace" font-size="${Math.round(width * 0.02)}">FRAME ${String(i + 1).padStart(4, '0')}</text>
			</svg>
		`

		const filename = `frame_${String(i + 1).padStart(4, '0')}.webp`
		await sharp(Buffer.from(svg))
			.webp({ quality: 75 })
			.toFile(path.join(dir, filename))

		if ((i + 1) % 10 === 0) {
			console.log(`  ${folder}: ${i + 1}/${count}`)
		}
	}
}

async function main() {
	console.log('Generating placeholder frames...')
	await generateSet('desktop', 30, 1920, 1080)
	await generateSet('mobile', 20, 1080, 1920)
	console.log('Done. Frames written to public/frames/intro/')
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
