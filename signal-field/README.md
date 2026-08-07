# Signal Field

A cursor-controlled synthwave instrument. Move your pointer across a particle field — X bends pitch, Y opens the filter, speed drives the swell, and crossing horizontal zones triggers pentatonic plucks over a continuous drone pad.

## Features

- **Hybrid audio**: continuous dual-saw drone (theremin-style glide) + discrete A minor pentatonic plucks on zone crossing
- **Particle field**: GSAP-driven canvas with cursor push, wave displacement, and audio-reactive shimmer
- **Web Audio API**: lowpass filter, delay feedback, analyser-driven visuals — no audio libraries
- **Click to start**: browser audio unlock overlay with GSAP entrance animations

## Quick Start

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal (typically `http://localhost:5173`).

## Controls

| Input | Effect |
|-------|--------|
| X position | Drone pitch (110–440 Hz) + pentatonic zone |
| Y position | Filter cutoff (250–4000 Hz) |
| Movement speed | Volume swell + particle turbulence |
| Zone crossing | Short pluck note (10-zone pentatonic grid) |
| Mute button | Silence output |
| Escape | Fade drone to silence |

## Build & Deploy

```bash
npm run build   # outputs to dist/
npm run preview # preview production build locally
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages).

## Tech Stack

- Vite 8 + TypeScript
- GSAP 3 (animation, ticker, quickTo)
- Web Audio API
- Canvas 2D

## Project Structure

```
src/
├── main.ts           # bootstrap and pointer orchestration
├── canvas/           # particle field + cursor tracking
├── audio/            # drone, pluck, scales, engine, analyser
├── ui/               # overlay and HUD
├── styles/           # CSS
└── utils/            # math helpers
```
