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
        primary: "#00295b",
        secondary: "#0093e9",
        tertiary: "#80d0c7",
        quaternary: "#ffc3a0",
        quinary: "#ff5f6d",
      },
      fontFamily: {
        'display': ['"Bricolage Grotesque"', 'sans-serif'],
        'body': ['Outfit', 'sans-serif'],
        'label': ['"JetBrains Mono"', 'monospace'],
        'instrument': ['"Bricolage Grotesque"', 'sans-serif'],
        'geist': ['Outfit', 'sans-serif'],
        'geist-mono': ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
