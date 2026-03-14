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
      const lx = Math.round(px), ly = Math.round(py)
      if (lx >= 0 && lx < W && ly >= 0 && ly < H) {
        const idx = ly * W + lx
        if (pz > buf.dep[idx]) {
          buf.dep[idx] = pz
          const nx = Math.cos(lat) * Math.cos(lon)
          const ny = Math.cos(lat) * Math.sin(lon)
          const nz = Math.sin(lat)
          const light = Math.max(0, nx * 0.4 + ny * 0.2 + nz * 0.9)
          buf.col[idx] = 0.1 + 0.9 * light
        }
      }
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
      if (n[2] !== 0) { wx = minX + (maxX - minX) * u; wy = minY + (maxY - minY) * v; wz = n[2] > 0 ? z1 : z0; }
      else if (n[1] !== 0) { wx = minX + (maxX - minX) * u; wy = n[1] > 0 ? y1 : y0; wz = minZ + (maxZ - minZ) * v; }
      else { wx = n[0] > 0 ? x1 : x0; wy = minY + (maxY - minY) * u; wz = minZ + (maxZ - minZ) * v; }
      const [px, py, pz] = project(wx, wy, wz, rotX, rotY)
      const lx = Math.round(px), ly = Math.round(py)
      if (lx >= 0 && lx < W && ly >= 0 && ly < H) {
        const idx = ly * W + lx
        if (pz > buf.dep[idx]) { buf.dep[idx] = pz; buf.col[idx] = 0.08 + 0.92 * light; }
      }
    }
  }
}

function drawCylinder(buf, rotX, rotY, cx, cy, cz, r, h, steps = 36) {
  for (let s = 0; s <= steps; s++) {
    const a = s / steps * Math.PI * 2
    const nx = Math.cos(a), nz = Math.sin(a)
    for (let t = 0; t <= 20; t++) {
      const ty = t / 20
      const wx = cx + r * nx, wy = cy - h / 2 + h * ty, wz = cz + r * nz
      const [px, py, pz] = project(wx, wy, wz, rotX, rotY)
      const lx = Math.round(px), ly = Math.round(py)
      if (lx >= 0 && lx < W && ly >= 0 && ly < H) {
        const idx = ly * W + lx
        if (pz > buf.dep[idx]) {
          buf.dep[idx] = pz
          const light = Math.max(0, nx * 0.5 + 0.1 + 0.4)
          buf.col[idx] = 0.08 + 0.92 * Math.min(1, light)
        }
      }
    }
  }
  for (let cap = 0; cap < 2; cap++) {
    const wy = cy + (cap === 0 ? -h / 2 : h / 2)
    const ny = cap === 0 ? -1 : 1
    const light = Math.max(0.05, ny * 0.6 + 0.3)
    for (let ri = 0; ri <= 12; ri++) for (let s = 0; s <= steps; s++) {
      const a = s / steps * Math.PI * 2
      const rr = ri / 12 * r
      const wx = cx + rr * Math.cos(a), wz = cz + rr * Math.sin(a)
      const [px, py, pz] = project(wx, wy, wz, rotX, rotY)
      const lx = Math.round(px), ly = Math.round(py)
      if (lx >= 0 && lx < W && ly >= 0 && ly < H) {
        const idx = ly * W + lx
        if (pz > buf.dep[idx]) { buf.dep[idx] = pz; buf.col[idx] = 0.08 + 0.92 * light; }
      }
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
      const lx = Math.round(px), ly = Math.round(py)
      if (lx >= 0 && lx < W && ly >= 0 && ly < H) {
        const idx = ly * W + lx
        if (pz > buf.dep[idx]) {
          buf.dep[idx] = pz
          const nx = (wx - cx - R * Math.cos(u)) / r
          const ny = (wy - cy) / r
          const nz = (wz - cz - R * Math.sin(u)) / r
          const light = Math.max(0, nx * 0.3 + ny * 0.7 + nz * 0.4)
          buf.col[idx] = 0.1 + 0.9 * light
        }
      }
    }
  }
}

const shapes = [
  {
    name: 'sphere',
    draw: (buf, rx, ry) => { drawSphere(buf, rx, ry, 22, 0, 0, 0); }
  },
  {
    name: 'cube',
    draw: (buf, rx, ry) => { drawBox(buf, rx, ry, -18, -18, -18, 18, 18, 18); }
  },
  {
    name: 'cylinder',
    draw: (buf, rx, ry) => { drawCylinder(buf, rx, ry, 0, 0, 0, 16, 36); }
  },
  {
    name: 'torus',
    draw: (buf, rx, ry) => { drawTorus(buf, rx, ry, 0, 0, 0, 16, 7); }
  },
  {
    name: 'tower',
    draw: (buf, rx, ry) => {
      drawBox(buf, rx, ry, -14, -20, -14, 14, 20, 14);
      drawBox(buf, rx, ry, -8, -28, -8, 8, -20, 8);
      drawSphere(buf, rx, ry, 6, 0, -30, 0);
    }
  },
  {
    name: 'capsule',
    draw: (buf, rx, ry) => {
      drawCylinder(buf, rx, ry, 0, 0, 0, 12, 24);
      drawSphere(buf, rx, ry, 12, 0, -12, 0);
      drawSphere(buf, rx, ry, 12, 0, 12, 0);
    }
  },
  {
    name: 'ring stack',
    draw: (buf, rx, ry) => {
      drawTorus(buf, rx, ry, 0, -14, 0, 12, 4);
      drawTorus(buf, rx, ry, 0, 0, 0, 12, 4);
      drawTorus(buf, rx, ry, 0, 14, 0, 12, 4);
    }
  },
  {
    name: 'dice',
    draw: (buf, rx, ry) => {
      drawBox(buf, rx, ry, -18, -18, -18, 18, 18, 18);
      drawSphere(buf, rx, ry, 4, 0, 0, 22);
      drawSphere(buf, rx, ry, 4, 0, 0, -22);
      drawSphere(buf, rx, ry, 4, -10, -10, 22);
      drawSphere(buf, rx, ry, 4, 10, 10, 22);
    }
  },
]

export default function Morph() {
  const canvasRef = useRef(null)
  const [active, setActive] = useState(0)
  const [label, setLabel] = useState(shapes[0].name)
  const [labelOpacity, setLabelOpacity] = useState(1)

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

  function jumpTo(idx) {
    if (idx === state.current.currentShape) return
    
    setLabelOpacity(0)
    setTimeout(() => {
      setLabel(shapes[idx].name)
      setLabelOpacity(1)
    }, 300)

    state.current.targetShape = idx
    state.current.morphT = 0
    state.current.morphing = true
    setActive(idx)
  }

  useEffect(() => {
    state.current.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const ctx = canvasRef.current.getContext('2d')

    function renderBuf(buf) {
      const img = ctx.createImageData(W, H)
      
      // Get current selected color from CSS variable
      const colorStr = getComputedStyle(document.documentElement).getPropertyValue('--selected-color-rgb') || '51, 154, 240'
      const rgb = colorStr.split(',').map(v => parseInt(v.trim()))
      
      const isDark = state.current.isDark
      
      // Determine foreground color based on theme
      // In dark mode, use the selected color directly or a bright version
      // In light mode, ensure it has enough contrast
      const fgR = rgb[0], fgG = rgb[1], fgB = rgb[2]
      
      for (let i = 0; i < W * H; i++) {
        const x = i % W, y = Math.floor(i / W)
        const v = buf.col[i]
        const has = buf.dep[i] > -999
        
        if (has) {
          const d = dithPix(v, x, y)
          
          if (d) {
            // "On" pixel: Use the selected color
            img.data[i * 4] = fgR
            img.data[i * 4 + 1] = fgG
            img.data[i * 4 + 2] = fgB
            img.data[i * 4 + 3] = 255
          } else {
            // "Off" pixel: SWAPPED logic
            // Light mode now uses darkened color, Dark mode uses light tint
            img.data[i * 4] = !isDark ? Math.round(fgR * 0.2) : 220
            img.data[i * 4 + 1] = !isDark ? Math.round(fgG * 0.2) : 220
            img.data[i * 4 + 2] = !isDark ? Math.round(fgB * 0.2) : 220
            img.data[i * 4 + 3] = 255
          }
        } else {
          // Transparent background with a very subtle tint - also swapped
          img.data[i * 4] = fgR
          img.data[i * 4 + 1] = fgG
          img.data[i * 4 + 2] = fgB
          img.data[i * 4 + 3] = !isDark ? 5 : 8
        }
      }
      ctx.putImageData(img, 0, 0)
    }

    let rafId
    const loop = () => {
      // Update theme state on each frame to react to changes
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
        if (s.morphT >= 1) { s.morphing = false; s.currentShape = s.targetShape; }
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
    <div className="flex flex-col items-center justify-center p-8">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="w-[300px] h-[300px] block"
        style={{ imageRendering: 'pixelated' }}
      />
      <div 
        className="font-geist-mono text-[11px] tracking-[0.2em] uppercase text-black/40 dark:text-white/40 mt-4 h-4 transition-opacity duration-400"
        style={{ opacity: labelOpacity }}
      >
        {label}
      </div>
      <div className="flex gap-2 mt-4">
        {shapes.map((_, i) => (
          <div
            key={i}
            onClick={() => jumpTo(i)}
            className={`w-1.5 h-1.5 rounded-full border border-black/15 dark:border-white/15 cursor-pointer transition-all duration-300 ${
              active === i ? 'bg-black dark:bg-white' : 'bg-transparent'
            }`}
          />
        ))}
      </div>
    </div>
  )
}