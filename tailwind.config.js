/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Cinzel Decorative'", "serif"],
        body: ["'Rajdhani'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        obsidian: {
          900: "#050508",
          800: "#0a0a0f",
          700: "#0f0f18",
          600: "#141420",
        },
        ember: {
          400: "#ff6b35",
          500: "#ff4500",
          600: "#cc3600",
        },
        gold: {
          300: "#ffd700",
          400: "#ffb700",
          500: "#ff9500",
        },
        arcane: {
          400: "#b366ff",
          500: "#8b2be2",
          600: "#6a0dad",
        }
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "rise": "rise 0.6s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" }
        },
        glowPulse: {
          "0%,100%": { boxShadow: "0 0 20px rgba(255,107,53,0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(255,107,53,0.8)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" }
        },
        rise: {
          "0%": { opacity: 0, transform: "translateY(30px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        }
      }
    },
  },
  plugins: [],
}
