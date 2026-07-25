/** Self-contained dithered ASCII 3D renderer for the cinematic background */

export const INTERNAL_SIZE = 200

const BAYER = [
	0, 8, 2, 10,
	12, 4, 14, 6,
	3, 11, 1, 9,
	15, 7, 13, 5,
]

const LIGHT = (() => {
	const x = -0.35
	const y = -0.55
	const z = 0.75
	const len = Math.hypot(x, y, z)
	return [x / len, y / len, z / len]
})()

function shade(nx, ny, nz, lx, ly, lz) {
	return 0.1 + 0.9 * Math.max(0, nx * lx + ny * ly + nz * lz)
}

function createBuffer(size) {
	const count = size * size
	return {
		size,
		color: new Float32Array(count),
		depth: new Float32Array(count),
	}
}

let _buf = null
let _bufA = null
let _bufB = null

function getBuffers(size) {
	if (!_buf || _buf.size !== size) {
		_buf = createBuffer(size)
		_bufA = createBuffer(size)
		_bufB = createBuffer(size)
	}
	return { buf: _buf, bufA: _bufA, bufB: _bufB }
}

function clearBuffer(buf) {
	buf.depth.fill(-Infinity)
	buf.color.fill(0)
}

function plot(buf, px, py, pz, light, project) {
	const x = Math.round(px)
	const y = Math.round(py)
	if (x < 0 || y < 0 || x >= buf.size || y >= buf.size) return
	const i = y * buf.size + x
	if (pz > buf.depth[i]) {
		buf.depth[i] = pz
		buf.color[i] = Math.max(0, Math.min(1, light))
	}
}

function buildProjector(rotX, rotY, zoom, size) {
	const cX = Math.cos(rotX)
	const sX = Math.sin(rotX)
	const cY = Math.cos(rotY)
	const sY = Math.sin(rotY)
	const half = size / 2

	return (x, y, z) => {
		const y1 = y * cX - z * sX
		const z1 = y * sX + z * cX
		const x2 = x * cY + z1 * sY
		const z2 = -x * sY + z1 * cY
		const dist = 340 / (340 + z2 + 110)
		return [half + x2 * dist * 2.15 * zoom, half + y1 * dist * 2.15 * zoom, z2]
	}
}

function lightForRotation(rotX, rotY) {
	const [lx, ly, lz] = LIGHT
	const cY = Math.cos(-rotY)
	const sY = Math.sin(-rotY)
	const lx1 = lx * cY + lz * sY
	const lz1 = -lx * sY + lz * cY
	const cX = Math.cos(-rotX)
	const sX = Math.sin(-rotX)
	return [lx1, ly * cX - lz1 * sX, ly * sX + lz1 * cX]
}

function drawSphere(buf, project, light, radius = 26, cx = 0, cy = 0, cz = 0) {
	const [lx, ly, lz] = light
	const steps = 52
	for (let i = 0; i <= steps; i++) {
		const lat = (i / steps) * Math.PI - Math.PI / 2
		const clat = Math.cos(lat)
		for (let j = 0; j <= steps * 2; j++) {
			const lon = (j / (steps * 2)) * Math.PI * 2
			const nx = clat * Math.cos(lon)
			const ny = clat * Math.sin(lon)
			const nz = Math.sin(lat)
			const [px, py, pz] = project(cx + radius * nx, cy + radius * ny, cz + radius * nz)
			plot(buf, px, py, pz, shade(nx, ny, nz, lx, ly, lz), project)
		}
	}
}

function drawBox(buf, project, light, half = 22) {
	const [lx, ly, lz] = light
	const faces = [
		[0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0],
	]
	const steps = 34
	faces.forEach(([nx, ny, nz]) => {
		const lit = shade(nx, ny, nz, lx, ly, lz)
		for (let i = 0; i <= steps; i++) {
			for (let j = 0; j <= steps; j++) {
				const u = i / steps
				const v = j / steps
				let wx
				let wy
				let wz
				if (nz) {
					wx = -half + half * 2 * u
					wy = -half + half * 2 * v
					wz = nz > 0 ? half : -half
				} else if (ny) {
					wx = -half + half * 2 * u
					wy = ny > 0 ? half : -half
					wz = -half + half * 2 * v
				} else {
					wx = nx > 0 ? half : -half
					wy = -half + half * 2 * u
					wz = -half + half * 2 * v
				}
				const [px, py, pz] = project(wx, wy, wz)
				plot(buf, px, py, pz, lit, project)
			}
		}
	})
}

function drawTorus(buf, project, light, major = 18, minor = 8) {
	const [lx, ly, lz] = light
	const stepsU = 64
	const stepsV = 30
	for (let i = 0; i <= stepsU; i++) {
		const u = (i / stepsU) * Math.PI * 2
		for (let j = 0; j <= stepsV; j++) {
			const v = (j / stepsV) * Math.PI * 2
			const wx = (major + minor * Math.cos(v)) * Math.cos(u)
			const wy = minor * Math.sin(v)
			const wz = (major + minor * Math.cos(v)) * Math.sin(u)
			const nx = Math.cos(v) * Math.cos(u)
			const ny = Math.sin(v)
			const nz = Math.cos(v) * Math.sin(u)
			const [px, py, pz] = project(wx, wy, wz)
			plot(buf, px, py, pz, shade(nx, ny, nz, lx, ly, lz), project)
		}
	}
}

function drawIcosahedron(buf, project, light, radius = 24) {
	const phi = (1 + Math.sqrt(5)) / 2
	const raw = [
		[-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
		[0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
		[phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
	]
	const verts = raw.map(([x, y, z]) => {
		const len = Math.hypot(x, y, z)
		return [x / len * radius, y / len * radius, z / len * radius]
	})
	const faces = [
		[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
		[1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
		[3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
		[4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
	]
	const [lx, ly, lz] = light
	const steps = 14
	faces.forEach(([ai, bi, ci]) => {
		const a = verts[ai]
		const b = verts[bi]
		const c = verts[ci]
		const ex = (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1])
		const ey = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2])
		const ez = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
		const len = Math.hypot(ex, ey, ez) || 1
		const lit = shade(ex / len, ey / len, ez / len, lx, ly, lz)
		for (let i = 0; i <= steps; i++) {
			for (let j = 0; j <= steps - i; j++) {
				const u = i / steps
				const v = j / steps
				const w = 1 - u - v
				const [px, py, pz] = project(
					a[0] * w + b[0] * u + c[0] * v,
					a[1] * w + b[1] * u + c[1] * v,
					a[2] * w + b[2] * u + c[2] * v
				)
				plot(buf, px, py, pz, lit, project)
			}
		}
	})
}

function drawTorusKnot(buf, project, light) {
	const [lx, ly, lz] = light
	const major = 15
	const minor = 5
	const tube = 3.2
	const steps = 220
	const ring = 22
	for (let i = 0; i <= steps; i++) {
		const t = (i / steps) * Math.PI * 2
		const t2 = t + 0.02
		const cx = (major + minor * Math.cos(3 * t)) * Math.cos(2 * t)
		const cy = (major + minor * Math.cos(3 * t)) * Math.sin(2 * t)
		const cz = minor * Math.sin(3 * t)
		const tx = (major + minor * Math.cos(3 * t2)) * Math.cos(2 * t2) - cx
		const ty = (major + minor * Math.cos(3 * t2)) * Math.sin(2 * t2) - cy
		const tz = minor * Math.sin(3 * t2) - cz
		const tl = Math.hypot(tx, ty, tz) || 1
		const txn = tx / tl
		const tyn = ty / tl
		const tzn = tz / tl
		const bix = tyn * 0 - tzn * 1
		const biy = tzn * 0 - txn * 0
		const biz = txn * 1 - tyn * 0
		const bil = Math.hypot(bix, biy, biz) || 1
		const nxn = bix / bil
		const nyn = biy / bil
		const nzn = biz / bil
		const bx = tyn * nzn - tzn * nyn
		const by = tzn * nxn - txn * nzn
		const bz = txn * nyn - tyn * nxn
		for (let j = 0; j <= ring; j++) {
			const a = (j / ring) * Math.PI * 2
			const snx = Math.cos(a) * nxn + Math.sin(a) * bx
			const sny = Math.cos(a) * nyn + Math.sin(a) * by
			const snz = Math.cos(a) * nzn + Math.sin(a) * bz
			const [px, py, pz] = project(cx + tube * snx, cy + tube * sny, cz + tube * snz)
			plot(buf, px, py, pz, shade(snx, sny, snz, lx, ly, lz), project)
		}
	}
}

function drawMobius(buf, project, light, width = 9) {
	const [lx, ly, lz] = light
	const radius = 18
	const stepsU = 120
	const stepsV = 24
	for (let i = 0; i <= stepsU; i++) {
		const u = (i / stepsU) * Math.PI * 2
		for (let j = 0; j <= stepsV; j++) {
			const v = (j / stepsV) * 2 - 1
			const wx = (radius + v * width * Math.cos(u / 2)) * Math.cos(u)
			const wy = v * width * Math.sin(u / 2)
			const wz = (radius + v * width * Math.cos(u / 2)) * Math.sin(u)
			const nx = Math.cos(u / 2) * Math.cos(u)
			const ny = Math.sin(u / 2)
			const nz = Math.cos(u / 2) * Math.sin(u)
			const [px, py, pz] = project(wx, wy, wz)
			plot(buf, px, py, pz, 0.12 + 0.88 * Math.abs(nx * lx + ny * ly + nz * lz), project)
		}
	}
}

export const ASCII_SHAPES = [
	{ name: 'sphere', spin: 0.013, draw: (buf, p, l, frame = 0) => drawSphere(buf, p, l, 26 + 2 * Math.sin(frame * 0.04)) },
	{ name: 'cube', spin: 0.016, draw: (buf, p, l) => drawBox(buf, p, l, 22) },
	{ name: 'torus', spin: 0.014, draw: (buf, p, l) => drawTorus(buf, p, l, 18, 8) },
	{ name: 'icosahedron', spin: 0.015, draw: (buf, p, l) => drawIcosahedron(buf, p, l, 24) },
	{ name: 'torus knot', spin: 0.012, draw: (buf, p, l) => drawTorusKnot(buf, p, l) },
	{ name: 'möbius', spin: 0.011, draw: (buf, p, l) => drawMobius(buf, p, l) },
]

export function getDisplaySize() {
	if (typeof window === 'undefined') return 720
	const vmin = Math.min(window.innerWidth, window.innerHeight)
	if (window.innerWidth < 768) return Math.floor(Math.min(vmin * 0.94, 440))
	if (window.innerWidth < 1024) return Math.floor(Math.min(vmin * 0.82, 760))
	return Math.floor(Math.min(vmin * 0.78, 1020))
}

export function readAccentRgb() {
	if (typeof window === 'undefined') return [51, 154, 240]
	const rgb = getComputedStyle(document.documentElement).getPropertyValue('--selected-color-rgb').trim()
	if (!rgb) return [51, 154, 240]
	return rgb.split(',').map((v) => parseInt(v.trim(), 10))
}

export function renderAsciiFrame(ctx, state) {
	const {
		rotX,
		rotY,
		zoom,
		currentShape,
		targetShape,
		morphT,
		morphing,
		frame,
	} = state

	const size = INTERNAL_SIZE
	const { buf, bufA, bufB } = getBuffers(size)
	const project = buildProjector(rotX, rotY, zoom, size)
	const light = lightForRotation(rotX, rotY)

	if (morphing && morphT < 1) {
		clearBuffer(bufA)
		clearBuffer(bufB)
		ASCII_SHAPES[currentShape].draw(bufA, buildProjector(rotX, rotY, zoom, size), light, frame)
		ASCII_SHAPES[targetShape].draw(bufB, buildProjector(rotX, rotY, zoom, size), light, frame)
		const ease = morphT < 0.5 ? 2 * morphT * morphT : 1 - Math.pow(-2 * morphT + 2, 2) / 2
		for (let i = 0; i < size * size; i++) {
			const hasA = bufA.depth[i] > -Infinity
			const hasB = bufB.depth[i] > -Infinity
			if (!hasA && !hasB) continue
			const weightA = hasA ? 1 - ease : 0
			const weightB = hasB ? ease : 0
			const total = weightA + weightB
			buf.color[i] = total
				? ((hasA ? bufA.color[i] * weightA : 0) + (hasB ? bufB.color[i] * weightB : 0)) / total
				: 0
			buf.depth[i] = Math.max(bufA.depth[i], bufB.depth[i])
		}
	} else {
		clearBuffer(buf)
		ASCII_SHAPES[currentShape].draw(buf, project, light, frame)
	}

	const [fgR, fgG, fgB] = readAccentRgb()
	const bgR = Math.round(fgR * 0.08)
	const bgG = Math.round(fgG * 0.08)
	const bgB = Math.round(fgB * 0.08)
	const image = ctx.createImageData(size, size)

	for (let i = 0; i < size * size; i++) {
		if (buf.depth[i] <= -Infinity) {
			image.data[i * 4 + 3] = 0
			continue
		}
		const x = i % size
		const y = Math.floor(i / size)
		const on = buf.color[i] > BAYER[(y % 4) * 4 + (x % 4)] / 16
		image.data[i * 4] = on ? fgR : bgR
		image.data[i * 4 + 1] = on ? fgG : bgG
		image.data[i * 4 + 2] = on ? fgB : bgB
		image.data[i * 4 + 3] = 255
	}

	ctx.putImageData(image, 0, 0)
}

export function createAsciiState() {
	return {
		rotX: 0.35,
		rotY: 0.45,
		zoom: 1,
		spinY: 0.014,
		spinX: 0,
		currentShape: 0,
		targetShape: 0,
		morphT: 1,
		morphing: false,
		frame: 0,
		dragging: false,
		lastX: 0,
		lastY: 0,
		dragVelX: 0,
		dragVelY: 0,
		hidden: false,
	}
}
