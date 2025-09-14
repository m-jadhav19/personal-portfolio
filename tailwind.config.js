/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
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
      fontFamily: {
        orbitron: ["Orbitron", "monospace"],
        exo: ["Exo 2", "sans-serif"],
        vt323: ["VT323", "monospace"],
      },
      colors: {
        primary: "#00295b",
        secondary: "#0093e9",
        tertiary: "#80d0c7",
        quaternary: "#ffc3a0",
        quinary: "#ff5f6d",
        cyber: {
          yellow: "#FFD700", // Bold CP77 website yellow
          darkYellow: "#FFA500", // Darker yellow for accents
          black: "#000000", // Pure black
          white: "#FFFFFF", // Pure white
          red: "#FF0000", // Red for CTAs
          gray: "#1a1a1a", // Dark gray
        },
      },
      boxShadow: {
        neonYellow: "0 0 5px #fcee09, 0 0 10px #fcee09, 0 0 20px #fcee09",
        neonCyan: "0 0 5px #00f6ff, 0 0 10px #00f6ff, 0 0 20px #00f6ff",
        neonMagenta: "0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 20px #ff00ff",
      },
      keyframes: {
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "50%": { transform: "translate(-1px, 1px)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        flicker: {
          "0%, 90%, 100%": { opacity: 1 },
          "95%": { opacity: 0.7 },
        },
        cyberpunkPulse: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.8 },
        },
        dataStream: {
          "0%": { transform: "translateY(-100%)", opacity: 0 },
          "10%": { opacity: 1 },
          "90%": { opacity: 1 },
          "100%": { transform: "translateY(100vh)", opacity: 0 },
        },
        hudGlow: {
          "0%, 100%": { boxShadow: "0 0 5px currentColor" },
          "50%": { boxShadow: "0 0 15px currentColor, 0 0 25px currentColor" },
        },
      },
      animation: {
        glitch: "glitch 0.3s infinite",
        scanline: "scanline 3s linear infinite",
        flicker: "flicker 3s infinite",
        cyberpunkPulse: "cyberpunkPulse 2s infinite",
        dataStream: "dataStream 3s linear infinite",
        hudGlow: "hudGlow 1s infinite alternate",
      },
    },
  },
  plugins: [],
};
