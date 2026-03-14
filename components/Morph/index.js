import { useEffect, useRef, useState } from 'react'

const W = 80, H = 80
const BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37,
  63, 31, 55, 23, 61, 29, 53, 21
]

function project(x, y, z, rotX, rotY) {
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX)
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY)
  const y1 = y * cosX - z * sinX, z1 = y * sinX + z * cosX
  const x2 = x * cosY + z1 * sinY, z2 = -x * sinY + z1 * cosY
  const fov = 160, dist = fov / (fov + z2 + 60)
  return [W / 2 + x2 * dist, H / 2 + y1 * dist, z2, dist]
}

function dithPix(val, x, y) {
  return val > BAYER8[(y % 8) * 8 + (x % 8)] / 64 ? 1 : 0
}

function clearBuf() {
  const col = new Float32Array(W * H)
  const dep = new Float32Array(W * H).fill(-999)
  return { col, dep }
}

function plotPoint(buf, px, py, pz, light) {
  const lx = Math.round(px), ly = Math.round(py)
  if (lx >= 0 && lx < W && ly >= 0 && ly < H) {
    const idx = ly * W + lx
    if (pz > buf.dep[idx]) {
      buf.dep[idx] = pz
      buf.col[idx] = Math.max(0, Math.min(1, light))
    }
  }
}

function drawSphere(buf, rotX, rotY, r, cx, cy, cz) {
  const steps = 40
  for (let i = 0; i <= steps; i++) {
    const lat = (i / steps) * Math.PI - Math.PI / 2
    for (let j = 0; j <= steps * 2; j++) {
      const lon = (j / (steps * 2)) * Math.PI * 2
      const x = cx + r * Math.cos(lat) * Math.cos(lon)
      const y = cy + r * Math.cos(lat) * Math.sin(lon)
      const z = cz + r * Math.sin(lat)
      const [px, py, pz] = project(x, y, z, rotX, rotY)
      const nx = Math.cos(lat) * Math.cos(lon)
      const ny = Math.cos(lat) * Math.sin(lon)
      const nz = Math.sin(lat)
      const light = 0.1 + 0.9 * Math.max(0, nx * 0.4 + ny * 0.2 + nz * 0.9)
      plotPoint(buf, px, py, pz, light)
    }
  }
}

function drawBox(buf, rotX, rotY, x0, y0, z0, x1, y1, z1) {
  const faces = [
    [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]],
    [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [0, 0, -1]],
    [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], [0, 1, 0]],
    [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0]],
    [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1], [1, 0, 0]],
    [[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1], [-1, 0, 0]],
  ]
  for (const [a, b, c, d, n] of faces) {
    const light = Math.max(0.05, n[0] * 0.3 + n[1] * 0.5 + n[2] * 0.9) * 0.95
    const pts = [a, b, c, d]
    const minX = Math.min(...pts.map(p => p[0]))
    const maxX = Math.max(...pts.map(p => p[0]))
    const minY = Math.min(...pts.map(p => p[1]))
    const maxY = Math.max(...pts.map(p => p[1]))
    const minZ = Math.min(...pts.map(p => p[2]))
    const maxZ = Math.max(...pts.map(p => p[2]))
    const steps = 28
    for (let i = 0; i <= steps; i++) for (let j = 0; j <= steps; j++) {
      const u = i / steps, v = j / steps
      let wx, wy, wz
      if (n[2] !== 0) { wx = minX + (maxX - minX) * u; wy = minY + (maxY - minY) * v; wz = n[2] > 0 ? z1 : z0 }
      else if (n[1] !== 0) { wx = minX + (maxX - minX) * u; wy = n[1] > 0 ? y1 : y0; wz = minZ + (maxZ - minZ) * v }
      else { wx = n[0] > 0 ? x1 : x0; wy = minY + (maxY - minY) * u; wz = minZ + (maxZ - minZ) * v }
      const [px, py, pz] = project(wx, wy, wz, rotX, rotY)
      plotPoint(buf, px, py, pz, 0.08 + 0.92 * light)
    }
  }
}

function drawCylinder(buf, rotX, rotY, cx, cy, cz, r, h, steps = 36) {
  for (let s = 0; s <= steps; s++) {
    const a = s / steps * Math.PI * 2
    const nx = Math.cos(a)
    for (let t = 0; t <= 20; t++) {
      const wx = cx + r * nx, wy = cy - h / 2 + h * (t / 20), wz = cz + r * Math.sin(a)
      const [px, py, pz] = project(wx, wy, wz, rotX, rotY)
      const light = 0.08 + 0.92 * Math.min(1, Math.max(0, nx * 0.5 + 0.5))
      plotPoint(buf, px, py, pz, light)
    }
  }
  for (let cap = 0; cap < 2; cap++) {
    const wy = cy + (cap === 0 ? -h / 2 : h / 2)
    const light = Math.max(0.05, (cap === 0 ? -1 : 1) * 0.6 + 0.3)
    for (let ri = 0; ri <= 12; ri++) for (let s = 0; s <= steps; s++) {
      const a = s / steps * Math.PI * 2
      const rr = ri / 12 * r
      const wx = cx + rr * Math.cos(a), wz = cz + rr * Math.sin(a)
      const [px, py, pz] = project(wx, wy, wz, rotX, rotY)
      plotPoint(buf, px, py, pz, 0.08 + 0.92 * light)
    }
  }
}

function drawTorus(buf, rotX, rotY, cx, cy, cz, R, r, steps = 48) {
  for (let i = 0; i <= steps; i++) {
    const u = i / steps * Math.PI * 2
    for (let j = 0; j <= steps; j++) {
      const v = j / steps * Math.PI * 2
      const wx = cx + (R + r * Math.cos(v)) * Math.cos(u)
      const wy = cy + r * Math.sin(v)
      const wz = cz + (R + r * Math.cos(v)) * Math.sin(u)
      const [px, py, pz] = project(wx, wy, wz, rotX, rotY)
      const nx = (wx - cx - R * Math.cos(u)) / r
      const ny = (wy - cy) / r
      const nz = (wz - cz - R * Math.sin(u)) / r
      const light = 0.1 + 0.9 * Math.max(0, nx * 0.3 + ny * 0.7 + nz * 0.4)
      plotPoint(buf, px, py, pz, light)
    }
  }
}

// --- NEW SHAPES ---

// Pyramid (square base)
function drawPyramid(buf, rotX, rotY, cx, cy, cz, size, height) {
  const h2 = height / 2
  const s = size
  // Fill 4 triangular faces by parametric sampling
  const apex = [cx, cy - h2, cz]
  const base = [
    [cx - s, cy + h2, cz - s],
    [cx + s, cy + h2, cz - s],
    [cx + s, cy + h2, cz + s],
    [cx - s, cy + h2, cz + s],
  ]
  const faceNormals = [
    [0, s, -height / 2],   // front
    [height / 2, s, 0],    // right
    [0, s, height / 2],    // back
    [-height / 2, s, 0],   // left
  ]
  const steps = 32
  for (let f = 0; f < 4; f++) {
    const b0 = base[f], b1 = base[(f + 1) % 4]
    const n = faceNormals[f]
    const len = Math.sqrt(n[0] ** 2 + n[1] ** 2 + n[2] ** 2)
    const light = Math.max(0.05, (n[0] * 0.3 + n[1] * 0.6 + n[2] * 0.5) / len)
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      for (let j = 0; j <= steps * (1 - t); j++) {
        const u = j / (steps * (1 - t) + 0.001)
        const wx = apex[0] * t + (b0[0] + (b1[0] - b0[0]) * u) * (1 - t)
        const wy = apex[1] * t + (b0[1] + (b1[1] - b0[1]) * u) * (1 - t)
        const wz = apex[2] * t + (b0[2] + (b1[2] - b0[2]) * u) * (1 - t)
        const [px, py, pz] = project(wx, wy, wz, rotX, rotY)
        plotPoint(buf, px, py, pz, 0.08 + 0.92 * light)
      }
    }
  }
  // Base square
  const steps2 = 24
  for (let i = 0; i <= steps2; i++) for (let j = 0; j <= steps2; j++) {
    const wx = cx - s + (2 * s) * (i / steps2)
    const wz = cz - s + (2 * s) * (j / steps2)
    const [px, py, pz] = project(wx, cy + h2, wz, rotX, rotY)
    plotPoint(buf, px, py, pz, 0.15)
  }
}

// Möbius strip
function drawMobius(buf, rotX, rotY, cx, cy, cz, R, width) {
  const uSteps = 120, vSteps = 20
  for (let i = 0; i <= uSteps; i++) {
    const u = i / uSteps * Math.PI * 2
    for (let j = 0; j <= vSteps; j++) {
      const v = (j / vSteps) * 2 - 1
      const wx = cx + (R + v * width * Math.cos(u / 2)) * Math.cos(u)
      const wy = cy + v * width * Math.sin(u / 2)
      const wz = cz + (R + v * width * Math.cos(u / 2)) * Math.sin(u)
      const [px, py, pz] = project(wx, wy, wz, rotX, rotY)
      const nx = Math.cos(u / 2) * Math.cos(u)
      const ny = Math.sin(u / 2)
      const nz = Math.cos(u / 2) * Math.sin(u)
      const light = 0.15 + 0.85 * Math.abs(nx * 0.4 + ny * 0.6 + nz * 0.3)
      plotPoint(buf, px, py, pz, light)
    }
  }
}

// Gem / Diamond shape (octahedron-like with wide girdle)
function drawGem(buf, rotX, rotY, cx, cy, cz, r) {
  const crown = cy - r * 0.3   // top table
  const girdle = cy + r * 0.1  // widest point
  const culet = cy + r * 1.0   // bottom point
  const top = cy - r * 0.8     // apex
  const facets = 16
  for (let f = 0; f < facets; f++) {
    const a0 = f / facets * Math.PI * 2
    const a1 = (f + 1) / facets * Math.PI * 2
    const steps = 20
    // Crown facets (top → girdle)
    for (let i = 0; i <= steps; i++) for (let j = 0; j <= steps; j++) {
      const t = i / steps, u = j / steps
      const ra = a0 + (a1 - a0) * u
      const topX = cx, topZ = cz
      const gX = cx + r * Math.cos(ra), gZ = cz + r * Math.sin(ra)
      const cX = cx + r * 0.5 * Math.cos(ra), cZ = cz + r * 0.5 * Math.sin(ra)
      const wx = topX * (1 - t) + gX * t
      const wy = top * (1 - t) + girdle * t
      const wz = topZ * (1 - t) + gZ * t
      const [px, py, pz] = project(wx, wy, wz, rotX, rotY)
      const angle = f / facets
      const light = 0.3 + 0.7 * Math.abs(Math.cos(angle * Math.PI * 4 + 1))
      plotPoint(buf, px, py, pz, light)
    }
    // Pavilion facets (girdle → culet)
    for (let i = 0; i <= steps; i++) for (let j = 0; j <= steps; j++) {
      const t = i / steps, u = j / steps
      const ra = a0 + (a1 - a0) * u
      const gX = cx + r * Math.cos(ra), gZ = cz + r * Math.sin(ra)
      const wx = gX * (1 - t) + cx * t
      const wy = girdle * (1 - t) + culet * t
      const wz = gZ * (1 - t) + cz * t
      const [px, py, pz] = project(wx, wy, wz, rotX, rotY)
      const light = 0.15 + 0.85 * (1 - t) * Math.abs(Math.cos(f / facets * Math.PI * 3))
      plotPoint(buf, px, py, pz, light)
    }
  }
}

// DNA double helix
function drawDNA(buf, rotX, rotY, cx, cy, cz) {
  const turns = 3
  const helixR = 10
  const steps = turns * 40
  const totalHeight = 42
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const angle = t * turns * Math.PI * 2
    const wy = cy - totalHeight / 2 + totalHeight * t
    // Strand A
    const wxa = cx + helixR * Math.cos(angle)
    const wza = cz + helixR * Math.sin(angle)
    const [pxa, pya, pza] = project(wxa, wy, wza, rotX, rotY)
    const lightA = 0.3 + 0.7 * Math.max(0, Math.cos(angle))
    plotPoint(buf, pxa, pya, pza, lightA)
    // Strand B (offset by π)
    const wxb = cx + helixR * Math.cos(angle + Math.PI)
    const wzb = cz + helixR * Math.sin(angle + Math.PI)
    const [pxb, pyb, pzb] = project(wxb, wy, wzb, rotX, rotY)
    const lightB = 0.3 + 0.7 * Math.max(0, Math.cos(angle + Math.PI))
    plotPoint(buf, pxb, pyb, pzb, lightB)
    // Rungs every ~half turn
    if (i % 7 === 0) {
      for (let r = 0; r <= 12; r++) {
        const s = r / 12
        const wrx = wxa + (wxb - wxa) * s
        const wrz = wza + (wzb - wza) * s
        const [prx, pry, prz] = project(wrx, wy, wrz, rotX, rotY)
        plotPoint(buf, prx, pry, prz, 0.5 + 0.3 * s)
      }
    }
  }
}

// Icosahedron
function drawIcosahedron(buf, rotX, rotY, cx, cy, cz, r) {
  const phi = (1 + Math.sqrt(5)) / 2
  const verts = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
  ].map(v => {
    const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2)
    return [cx + v[0] / len * r, cy + v[1] / len * r, cz + v[2] / len * r]
  })
  const faces = [
    [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
    [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
    [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
    [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
  ]
  const steps = 14
  for (const [ai, bi, ci] of faces) {
    const a = verts[ai], b = verts[bi], c = verts[ci]
    const nx = (b[1]-a[1])*(c[2]-a[2]) - (b[2]-a[2])*(c[1]-a[1])
    const ny = (b[2]-a[2])*(c[0]-a[0]) - (b[0]-a[0])*(c[2]-a[2])
    const nz = (b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0])
    const nl = Math.sqrt(nx*nx+ny*ny+nz*nz)
    const light = Math.max(0.05, (nx/nl)*0.3 + (ny/nl)*0.7 + (nz/nl)*0.5)
    for (let i = 0; i <= steps; i++) for (let j = 0; j <= steps - i; j++) {
      const u = i / steps, v = j / steps, w = 1 - u - v
      const wx = a[0]*w + b[0]*u + c[0]*v
      const wy = a[1]*w + b[1]*u + c[1]*v
      const wz = a[2]*w + b[2]*u + c[2]*v
      const [px, py, pz] = project(wx, wy, wz, rotX, rotY)
      plotPoint(buf, px, py, pz, 0.08 + 0.92 * light)
    }
  }
}

// Interlocked tori
function drawInterlockedRings(buf, rotX, rotY, cx, cy, cz, R, r) {
  // Ring 1: in XY plane
  for (let i = 0; i <= 80; i++) {
    const u = i / 80 * Math.PI * 2
    for (let j = 0; j <= 24; j++) {
      const v = j / 24 * Math.PI * 2
      const wx = cx + (R + r * Math.cos(v)) * Math.cos(u)
      const wy = cy + (R + r * Math.cos(v)) * Math.sin(u)
      const wz = cz + r * Math.sin(v)
      const [px, py, pz] = project(wx, wy, wz, rotX, rotY)
      const nx = (wx - cx - R * Math.cos(u)) / r
      const ny = (wy - cy - R * Math.sin(u)) / r
      const light = 0.1 + 0.9 * Math.max(0, nx * 0.5 + ny * 0.3 + 0.3)
      plotPoint(buf, px, py, pz, light)
    }
  }
  // Ring 2: in XZ plane, offset so they interlock
  for (let i = 0; i <= 80; i++) {
    const u = i / 80 * Math.PI * 2
    for (let j = 0; j <= 24; j++) {
      const v = j / 24 * Math.PI * 2
      const wx = cx + (R + r * Math.cos(v)) * Math.cos(u)
      const wy = cy + r * Math.sin(v)
      const wz = cz + (R + r * Math.cos(v)) * Math.sin(u)
      const [px, py, pz] = project(wx, wy, wz, rotX, rotY)
      const nx = (wx - cx - R * Math.cos(u)) / r
      const nz = (wz - cz - R * Math.sin(u)) / r
      const light = 0.1 + 0.9 * Math.max(0, nx * 0.3 + nz * 0.5 + 0.3)
      plotPoint(buf, px, py, pz, light)
    }
  }
}

// Spring / helix coil
function drawSpring(buf, rotX, rotY, cx, cy, cz) {
  const turns = 5
  const helixR = 14
  const tubeR = 4
  const height = 38
  const uSteps = turns * 30
  const vSteps = 16
  for (let i = 0; i <= uSteps; i++) {
    const u = i / uSteps
    const angle = u * turns * Math.PI * 2
    const hcx = cx + helixR * Math.cos(angle)
    const hcy = cy - height / 2 + height * u
    const hcz = cz + helixR * Math.sin(angle)
    const tx = -helixR * Math.sin(angle)
    const ty = height / (turns * Math.PI * 2)
    const tz = helixR * Math.cos(angle)
    const tlen = Math.sqrt(tx*tx+ty*ty+tz*tz)
    const txn = tx/tlen, tyn = ty/tlen, tzn = tz/tlen
    const bx = tyn * 0 - tzn * (-1), by = tzn * 0 - txn * 0, bz = txn * (-1) - tyn * 0
    const blen = Math.sqrt(bx*bx+by*by+bz*bz) || 1
    const bxn = bx/blen, byn = by/blen, bzn = bz/blen
    const nx2 = tyn * bzn - tzn * byn, ny2 = tzn * bxn - txn * bzn, nz2 = txn * byn - tyn * bxn
    for (let j = 0; j <= vSteps; j++) {
      const v = j / vSteps * Math.PI * 2
      const wx = hcx + tubeR * (Math.cos(v) * nx2 + Math.sin(v) * bxn)
      const wy = hcy + tubeR * (Math.cos(v) * ny2 + Math.sin(v) * byn)
      const wz = hcz + tubeR * (Math.cos(v) * nz2 + Math.sin(v) * bzn)
      const [px, py, pz] = project(wx, wy, wz, rotX, rotY)
      const light = 0.2 + 0.8 * Math.max(0, Math.cos(v) * 0.6 + 0.4)
      plotPoint(buf, px, py, pz, light)
    }
  }
}

// Star / asterisk shape (3 intersecting cylinders)
function drawStar3D(buf, rotX, rotY, cx, cy, cz) {
  const arms = 6
  const armLen = 20
  const armR = 5
  for (let a = 0; a < arms / 2; a++) {
    const angle = a / (arms / 2) * Math.PI
    const dx = Math.cos(angle), dz = Math.sin(angle)
    for (let s = 0; s <= 20; s++) {
      const t = (s / 20) * 2 - 1
      const acx = cx + dx * armLen * t
      const acz = cz + dz * armLen * t
      for (let r = 0; r <= 16; r++) {
        const va = r / 16 * Math.PI * 2
        const wx = acx + armR * (-dz * Math.cos(va))
        const wy = cy + armR * Math.sin(va)
        const wz = acz + armR * (dx * Math.cos(va))
        const [px, py, pz] = project(wx, wy, wz, rotX, rotY)
        const light = 0.2 + 0.8 * Math.max(0, Math.cos(va) * 0.7 + 0.3)
        plotPoint(buf, px, py, pz, light)
      }
    }
  }
  // Vertical arm
  drawCylinder(buf, rotX, rotY, cx, cy, cz, armR, armLen * 2, 16)
}

// Knot (trefoil)
function drawTrefoil(buf, rotX, rotY, cx, cy, cz) {
  const R = 14, r = 4
  const steps = 200, vSteps = 18
  for (let i = 0; i <= steps; i++) {
    const t = i / steps * Math.PI * 2
    const kx = cx + (R + R * 0.4 * Math.cos(1.5 * t)) * Math.cos(t)
    const ky = cy + (R + R * 0.4 * Math.cos(1.5 * t)) * Math.sin(t)
    const kz = cz + R * 0.4 * Math.sin(1.5 * t)
    // Approximate tangent
    const dt = 0.02
    const t2 = t + dt
    const kx2 = cx + (R + R * 0.4 * Math.cos(1.5 * t2)) * Math.cos(t2)
    const ky2 = cy + (R + R * 0.4 * Math.cos(1.5 * t2)) * Math.sin(t2)
    const kz2 = cz + R * 0.4 * Math.sin(1.5 * t2)
    const tx = kx2-kx, ty = ky2-ky, tz = kz2-kz
    const tl = Math.sqrt(tx*tx+ty*ty+tz*tz) || 1
    // Normal: pick a stable up vector
    const ux = 0, uy = 0, uz = 1
    const nx = ty*uz - tz*uy, ny = tz*ux - tx*uz, nz = tx*uy - ty*ux
    const nl = Math.sqrt(nx*nx+ny*ny+nz*nz) || 1
    const nxn=nx/nl, nyn=ny/nl, nzn=nz/nl
    const bx = ty/tl*nzn - tz/tl*nyn
    const by = tz/tl*nxn - tx/tl*nzn
    const bz = tx/tl*nyn - ty/tl*nxn
    for (let j = 0; j <= vSteps; j++) {
      const v = j / vSteps * Math.PI * 2
      const wx = kx + r * (Math.cos(v) * nxn + Math.sin(v) * bx)
      const wy = ky + r * (Math.cos(v) * nyn + Math.sin(v) * by)
      const wz = kz + r * (Math.cos(v) * nzn + Math.sin(v) * bz)
      const [px, py, pz] = project(wx, wy, wz, rotX, rotY)
      const light = 0.15 + 0.85 * Math.max(0, Math.cos(v) * 0.6 + 0.4)
      plotPoint(buf, px, py, pz, light)
    }
  }
}

const shapes = [
  {
    name: 'sphere',
    draw: (buf, rx, ry) => drawSphere(buf, rx, ry, 22, 0, 0, 0)
  },
  {
    name: 'cube',
    draw: (buf, rx, ry) => drawBox(buf, rx, ry, -18, -18, -18, 18, 18, 18)
  },
  {
    name: 'torus',
    draw: (buf, rx, ry) => drawTorus(buf, rx, ry, 0, 0, 0, 16, 7)
  },
  {
    name: 'pyramid',
    draw: (buf, rx, ry) => drawPyramid(buf, rx, ry, 0, 0, 0, 18, 36)
  },
  {
    name: 'möbius',
    draw: (buf, rx, ry) => drawMobius(buf, rx, ry, 0, 0, 0, 16, 7)
  },
  {
    name: 'gem',
    draw: (buf, rx, ry) => drawGem(buf, rx, ry, 0, 0, 0, 20)
  },
  {
    name: 'DNA',
    draw: (buf, rx, ry) => drawDNA(buf, rx, ry, 0, 0, 0)
  },
  {
    name: 'icosahedron',
    draw: (buf, rx, ry) => drawIcosahedron(buf, rx, ry, 0, 0, 0, 22)
  },
  {
    name: 'linked rings',
    draw: (buf, rx, ry) => drawInterlockedRings(buf, rx, ry, 0, 0, 0, 13, 5)
  },
  {
    name: 'spring',
    draw: (buf, rx, ry) => drawSpring(buf, rx, ry, 0, 0, 0)
  },
  {
    name: 'star',
    draw: (buf, rx, ry) => drawStar3D(buf, rx, ry, 0, 0, 0)
  },
  {
    name: 'trefoil knot',
    draw: (buf, rx, ry) => drawTrefoil(buf, rx, ry, 0, 4, 0)
  },
  {
    name: 'capsule',
    draw: (buf, rx, ry) => {
      drawCylinder(buf, rx, ry, 0, 0, 0, 12, 24)
      drawSphere(buf, rx, ry, 12, 0, -12, 0)
      drawSphere(buf, rx, ry, 12, 0, 12, 0)
    }
  },
  {
    name: 'ring stack',
    draw: (buf, rx, ry) => {
      drawTorus(buf, rx, ry, 0, -14, 0, 12, 4)
      drawTorus(buf, rx, ry, 0, 0, 0, 12, 4)
      drawTorus(buf, rx, ry, 0, 14, 0, 12, 4)
    }
  },
  {
    name: 'tower',
    draw: (buf, rx, ry) => {
      drawBox(buf, rx, ry, -14, -20, -14, 14, 20, 14)
      drawBox(buf, rx, ry, -8, -28, -8, 8, -20, 8)
      drawSphere(buf, rx, ry, 6, 0, -30, 0)
    }
  },
]

export default function Morph() {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState(260)

  const state = useRef({
    rotX: 0.4,
    rotY: 0.4,
    targetShape: 0,
    currentShape: 0,
    morphT: 1,
    morphing: false,
    frame: 0,
    autoTimer: null,
    isDark: false,
    autoIdx: 1
  })

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth
      // mobile: ~200px, tablet: ~260px, desktop: ~320px
      const size = vw < 480 ? 200 : vw < 1024 ? 260 : 320
      setCanvasSize(size)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  function jumpTo(idx) {
    if (idx === state.current.currentShape) return
    state.current.targetShape = idx
    state.current.morphT = 0
    state.current.morphing = true
  }

  useEffect(() => {
    state.current.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const ctx = canvasRef.current.getContext('2d')

    function renderBuf(buf) {
      const img = ctx.createImageData(W, H)
      const colorStr = getComputedStyle(document.documentElement).getPropertyValue('--selected-color-rgb') || '51, 154, 240'
      const rgb = colorStr.split(',').map(v => parseInt(v.trim()))
      const isDark = state.current.isDark
      const fgR = rgb[0], fgG = rgb[1], fgB = rgb[2]

      for (let i = 0; i < W * H; i++) {
        const x = i % W, y = Math.floor(i / W)
        const v = buf.col[i]
        const has = buf.dep[i] > -999

        if (has) {
          const d = dithPix(v, x, y)
          if (d) {
            img.data[i * 4] = fgR
            img.data[i * 4 + 1] = fgG
            img.data[i * 4 + 2] = fgB
            img.data[i * 4 + 3] = 255
          } else {
            img.data[i * 4] = !isDark ? Math.round(fgR * 0.2) : 220
            img.data[i * 4 + 1] = !isDark ? Math.round(fgG * 0.2) : 220
            img.data[i * 4 + 2] = !isDark ? Math.round(fgB * 0.2) : 220
            img.data[i * 4 + 3] = 255
          }
        } else {
          img.data[i * 4] = 0
          img.data[i * 4 + 1] = 0
          img.data[i * 4 + 2] = 0
          img.data[i * 4 + 3] = 0
        }
      }
      ctx.putImageData(img, 0, 0)
    }

    let rafId
    const loop = () => {
      state.current.isDark = document.documentElement.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark'

      const s = state.current
      s.rotY += 0.018
      s.rotX = 0.35 + Math.sin(s.frame * 0.008) * 0.15
      s.frame++

      const buf = clearBuf()

      if (s.morphing && s.morphT < 1) {
        s.morphT += 0.045
        const t = s.morphT < 1 ? s.morphT : 1
        const ease = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2

        const bufA = clearBuf()
        shapes[s.currentShape].draw(bufA, s.rotX, s.rotY)

        const bufB = clearBuf()
        shapes[s.targetShape].draw(bufB, s.rotX, s.rotY)

        for (let i = 0; i < W * H; i++) {
          const hasA = bufA.dep[i] > -999, hasB = bufB.dep[i] > -999
          if (hasA || hasB) {
            const colA = hasA ? bufA.col[i] : 0
            const colB = hasB ? bufB.col[i] : 0
            const presA = hasA ? (1 - ease) : 0
            const presB = hasB ? ease : 0
            const tot = presA + presB
            if (tot > 0) {
              buf.col[i] = (colA * presA + colB * presB) / tot
              buf.dep[i] = Math.max(bufA.dep[i], bufB.dep[i])
              const noise = Math.random() * 0.35 * (1 - Math.abs(ease - 0.5) * 2)
              buf.col[i] = Math.max(0, Math.min(1, buf.col[i] + noise))
            }
          }
        }
        if (s.morphT >= 1) { s.morphing = false; s.currentShape = s.targetShape }
      } else {
        shapes[s.currentShape].draw(buf, s.rotX, s.rotY)
      }

      renderBuf(buf)
      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    const nextAuto = () => {
      jumpTo(state.current.autoIdx)
      state.current.autoIdx = (state.current.autoIdx + 1) % shapes.length
      state.current.autoTimer = setTimeout(nextAuto, 3000)
    }
    state.current.autoTimer = setTimeout(nextAuto, 3000)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(state.current.autoTimer)
    }
  }, [])

  return (
    <div ref={wrapRef} className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{
          imageRendering: 'pixelated',
          width: canvasSize,
          height: canvasSize,
          display: 'block',
        }}
      />
    </div>
  )
}