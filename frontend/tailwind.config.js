/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#03070d",
        deep: "#060d18",
        cyan: {
          DEFAULT: "#00d9ff",
          dim: "rgba(0,217,255,0.15)",
          glow: "rgba(0,217,255,0.4)",
        },
        green: {
          neon: "#00ff88",
        },
        orange: {
          neon: "#ff6b35",
        },
      },
      fontFamily: {
        syne: ["var(--font-syne)", "Syne", "sans-serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "monospace"],
      },
      animation: {
        "fade-up": "fadeInUp 0.7s ease forwards",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        orbit: "orbit 8s linear infinite",
        scanline: "scanline 8s linear infinite",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(0,217,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "60px 60px",
      },
    },
  },
  plugins: [],
};
