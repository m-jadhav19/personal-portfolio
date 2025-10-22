module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    screens: {
      mob: "375px",
      tablet: "768px",
      laptop: "1024px",
      desktop: "1280px",
      laptopl: "1440px",
    },
    extend: {
      colors: {
        // Retro 8-bit Color Palette
        'powder-blue': '#A3D8F4',
        'pastel-sky': '#C9E9FF',
        'mint-pixel': '#B8F3D2',
        'lilac-mist': '#CDB4DB',
        'blush-pink': '#FFC8DD',
        'butter-yellow': '#FFF1A8',
        'charcoal-gray': '#1B1B1B',
        'white-smoke': '#F7F7F7',
        
        // Legacy colors
        primary: "#00295b",
        secondary: "#0093e9",
        tertiary: "#80d0c7",
        quaternary: "#ffc3a0",
        quinary: "#ff5f6d",
      },
      fontFamily: {
        'pixel': ['Press Start 2P', 'monospace'],
      },
    },
  },
  plugins: [],
};
