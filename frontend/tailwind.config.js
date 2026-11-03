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
        cream: {
          DEFAULT: "#faf8f4",
          100: "#f7f3ec",
          200: "#f4f0e8",
        },
        ink: {
          DEFAULT: "#1a1814",
        },
        bronze: {
          DEFAULT: "#8b6a3e",
        },
        success: {
          DEFAULT: "#5f7350",
        },
        text: {
          primary: "#1a1814",
          secondary: "#3d3a35",
          muted: "#6b6760",
          meta: "#9b9690",
        },
        surface: {
          DEFAULT: "#ffffff",
          alt: "#faf8f4",
        },
        rule: "rgba(26,24,20,0.12)",
        cyan: {
          DEFAULT: "#0d7377",
          dim: "rgba(13, 115, 119, 0.12)",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "Merriweather", "serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      animation: {
        "fade-up": "fadeInUp 0.7s ease forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in": "slideIn 0.3s ease-out forwards",
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(26,24,20,0.08)",
        drawer: "-8px 0 24px -4px rgba(26,24,20,0.12)",
      },
      letterSpacing: {
        widest: "0.1em",
      },
    },
  },
  plugins: [],
};
