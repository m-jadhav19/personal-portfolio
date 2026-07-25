/** Scroll-driven transform for the ASCII background scene */

/** Closed-loop keyframes: p=0 and p=1 are identical for seamless scroll reversal */
const KEYFRAMES = [
	{ p: 0, xVw: 0, yVh: 0, rotate: 0, scale: 1, glowOpacity: 0.52, glowScale: 1.1 },
	{ p: 0.25, xVw: 1, yVh: 1.5, rotate: 4, scale: 0.98, glowOpacity: 0.44, glowScale: 1.06 },
	{ p: 0.5, xVw: 0, yVh: 2.5, rotate: 8, scale: 0.96, glowOpacity: 0.38, glowScale: 1.04 },
	{ p: 0.75, xVw: -1, yVh: 1.5, rotate: 4, scale: 0.98, glowOpacity: 0.44, glowScale: 1.06 },
	{ p: 1, xVw: 0, yVh: 0, rotate: 0, scale: 1, glowOpacity: 0.52, glowScale: 1.1 },
]

/** Maps scroll progress to page sections: Hero → Work → About → Contact */
const SHAPE_CHAPTERS = [
	{ start: 0, end: 0.25, shapes: [0] },
	{ start: 0.25, end: 0.55, shapes: [1, 2] },
	{ start: 0.55, end: 0.8, shapes: [3, 4] },
	{ start: 0.8, end: 1, shapes: [5, 0] },
]

function easeInOutCubic(t) {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function lerp(a, b, t) {
	return a + (b - a) * t
}

function interpolateKeyframes(progress) {
	const clamped = Math.min(1, Math.max(0, progress))

	let i = 0
	while (i < KEYFRAMES.length - 2 && clamped > KEYFRAMES[i + 1].p) {
		i += 1
	}

	const start = KEYFRAMES[i]
	const end = KEYFRAMES[i + 1]
	const span = end.p - start.p || 1
	const localT = easeInOutCubic((clamped - start.p) / span)

	return {
		xVw: lerp(start.xVw, end.xVw, localT),
		yVh: lerp(start.yVh, end.yVh, localT),
		rotate: lerp(start.rotate, end.rotate, localT),
		scale: lerp(start.scale, end.scale, localT),
		glowOpacity: lerp(start.glowOpacity, end.glowOpacity, localT),
		glowScale: lerp(start.glowScale, end.glowScale, localT),
	}
}

function getShapeChapter(progress) {
	const clamped = Math.min(1, Math.max(0, progress))
	for (let i = SHAPE_CHAPTERS.length - 1; i >= 0; i -= 1) {
		if (clamped >= SHAPE_CHAPTERS[i].start) return SHAPE_CHAPTERS[i]
	}
	return SHAPE_CHAPTERS[0]
}

export function getMorphScrollTransform(progress) {
	return interpolateKeyframes(progress)
}

export function getMorphShapeIndex(progress, shapeCount) {
	if (!shapeCount) return 0

	const chapter = getShapeChapter(progress)
	const span = chapter.end - chapter.start || 1
	const local = Math.min(1, (progress - chapter.start) / span)
	const shapeList = chapter.shapes
	const idx = Math.min(shapeList.length - 1, Math.floor(local * shapeList.length))
	return shapeList[idx] % shapeCount
}
