# Retro 8-bit Pixel Art Portfolio

A modern portfolio website with a retro 8-bit pixel art aesthetic, featuring weather-reactive backgrounds, CRT monitor effects, and pixel-perfect animations.

## 🎮 Features

### Design Theme
- **Retro 8-bit pixel art aesthetic** with modern functionality
- **Press Start 2P font** for authentic retro feel
- **Custom color palette** inspired by classic pixel art games
- **CRT monitor effects** with scanlines and flicker animations

### Components

#### 1. Floating Pixel Pill Header
- Fixed top navigation with pixel border and neon glow
- Responsive design with mobile menu
- Smooth scroll navigation
- Floating pixel particle animations

#### 2. Hero Section with Pixel Avatar
- Animated 8-bit pixel avatar with blinking effects
- Typewriter animation for subtitle
- CRT cursor blinking effect
- Floating pixel particles and scanlines

#### 3. Weather-Reactive Background
- Real-time weather detection using OpenWeather API
- Pixel art weather effects:
  - **Clear**: Pixel sky with stars and animated sun
  - **Rain**: Animated pixel rain drops
  - **Clouds**: Slow-moving pixel clouds
  - **Snow**: Floating pixel snow particles
- Automatic weather updates every 10 minutes

#### 4. Work Section - Retro Game Cartridges
- Game cartridge-style project cards
- CRT modal preview with scanline effects
- Hover animations with pixel glow
- Technology tags in pixel style

#### 5. Minimal Retro Footer
- Pixel social icons with hover effects
- Copyright text in pixel font
- Floating particle decorations

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Powder Blue | #A3D8F4 | Primary glow, borders |
| Pastel Sky | #C9E9FF | Background gradients |
| Mint Pixel | #B8F3D2 | Secondary accents |
| Lilac Mist | #CDB4DB | Subtle UI elements |
| Blush Pink | #FFC8DD | Highlight color |
| Butter Yellow | #FFF1A8 | Text highlights |
| Charcoal Gray | #1B1B1B | Base dark contrast |
| White Smoke | #F7F7F7 | Text, borders |

## 🛠️ Technical Stack

- **Next.js 12** - React framework
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animation library
- **GSAP** - Advanced animations
- **Three.js** - 3D graphics (for particles)
- **OpenWeather API** - Weather data

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Set up environment variables:**
   ```bash
   # Create .env.local
   OPENWEATHERMAP_API_KEY=your_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 📁 Project Structure

```
components/
├── RetroHeader/          # Floating pixel pill navigation
├── RetroHero/            # Hero section with avatar
├── RetroWork/            # Work section with game cartridges
├── RetroFooter/          # Minimal retro footer
├── RetroLayout/          # Main layout component
├── PixelAvatar/          # 8-bit avatar with variants
└── WeatherBackground/    # Weather-reactive backgrounds

styles/
└── globals.css           # Retro styles and animations

pages/
├── index.js             # Main page
└── api/
    └── weather.js       # Weather API proxy
```

## 🎯 Key Features Explained

### CRT Monitor Effects
- **Scanlines**: Horizontal lines moving across the screen
- **Flicker**: Subtle opacity changes simulating old monitors
- **Glow**: Neon-like glow effects on interactive elements

### Pixel Animations
- **Typewriter effect**: Character-by-character text animation
- **Blinking cursor**: Classic terminal-style cursor
- **Floating particles**: Subtle background animations
- **Hover effects**: Scale and glow transformations

### Weather Integration
- **Real-time weather**: Fetches current weather conditions
- **Pixel art weather**: Custom pixel art for different weather types
- **Caching**: 30-minute cache to reduce API calls
- **Fallback**: Defaults to clear weather if API fails

## 🎮 Customization

### Adding New Projects
Update `data/portfolio.json` with your project information:

```json
{
  "projects": [
    {
      "id": "unique-id",
      "title": "Project Name",
      "description": "Project description",
      "imageSrc": "/images/project.png",
      "url": "https://project-url.com",
      "github": "https://github.com/username/repo",
      "technologies": ["React", "Node.js", "MongoDB"]
    }
  ]
}
```

### Customizing Colors
Update the CSS custom properties in `styles/globals.css`:

```css
:root {
  --powder-blue: #A3D8F4;
  --pastel-sky: #C9E9FF;
  /* ... other colors */
}
```

### Weather API Setup
1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Add it to your `.env.local` file:
   ```
   OPENWEATHERMAP_API_KEY=your_api_key_here
   ```

## 🎨 Design Philosophy

This portfolio combines the nostalgic charm of 8-bit pixel art with modern web development practices. Every element is designed to evoke the feeling of classic video games while maintaining excellent usability and performance.

The design emphasizes:
- **Pixel-perfect precision** in all visual elements
- **Smooth animations** that enhance rather than distract
- **Responsive design** that works on all devices
- **Accessibility** with proper contrast and keyboard navigation
- **Performance** with optimized animations and lazy loading

## 📱 Responsive Design

The portfolio is fully responsive with breakpoints:
- **Mobile**: 375px+
- **Tablet**: 768px+
- **Laptop**: 1024px+
- **Desktop**: 1280px+

## 🚀 Deployment

The portfolio is ready for deployment on Vercel, Netlify, or any static hosting service. Make sure to:

1. Set up your environment variables
2. Build the project: `npm run build`
3. Deploy the `out` folder (if using static export) or deploy directly to Vercel

## 🎯 Future Enhancements

- [ ] Sound effects for interactions
- [ ] More weather types (storm, fog, etc.)
- [ ] Interactive pixel art editor
- [ ] Retro game mini-games
- [ ] Dark/light theme toggle
- [ ] More avatar expressions and animations

---

**Crafted in Pixels** 🎮✨
