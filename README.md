# Developer Portfolio

## Description

This is a developer portfolio website built using Next.js.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

To run this project locally, follow these steps:
1. Clone the repository.
2. Install dependencies using `npm install`.
3. Start the development server with `npm run dev`.

## Cinematic Redesign (cinematic-redesign branch)

Scroll-driven portfolio with GTA VI-style canvas frame scrubbing on the homepage.

### Frame assets

Placeholder frames live in `public/frames/intro/`. Replace them with your own cinematic sequence:

```bash
# Generate placeholders (dev only)
node scripts/generate-placeholder-frames.js

# Extract from video (production)
ffmpeg -i intro.mp4 -vf fps=30 public/frames/intro/desktop/frame_%04d.webp
ffmpeg -i intro-mobile.mp4 -vf fps=24 public/frames/intro/mobile/frame_%04d.webp
```

Update frame counts in `data/portfolio.json` under `scrollExperience.intro` to match your file count.

### Development

```bash
npm run dev
```

Homepage: scroll-scrubbed intro, horizontal project rail, about overlay, contact CTA.
Subpages: `/resume` and `/blog` use the shared cinematic layout without frame loading.


## Contributing

If you want to contribute to this project, feel free to submit a pull request.

## License

This project is licensed under the MIT License.