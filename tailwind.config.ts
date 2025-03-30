
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        cyber: ["'Share Tech Mono'", "monospace"],
        digital: ["'Orbitron'", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        cyber: {
          black: "#050A18",
          darkblue: "#0A1428",
          purple: "#1F1933",
          darkpurple: "#131021",
          cyan: "#00FFFF",
          "cyan-glow": "#00FFFF80",
          "purple-highlight": "#9F00FF",
          accent: "#FF2C70",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-cyan": {
          "0%, 100%": { boxShadow: "0 0 12px 0px #00FFFF" },
          "50%": { boxShadow: "0 0 22px 5px #00FFFF" },
        },
        "gradient-x": {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "cyber-glitch": {
          "0%, 100%": { transform: "translate(0)" },
          "10%": { transform: "translate(-3px, 1px)" },
          "20%": { transform: "translate(3px, -1px)" },
          "30%": { transform: "translate(-3px, 1px)" },
          "40%": { transform: "translate(3px, -1px)" },
          "50%": { transform: "translate(-3px, 1px)" },
          "60%": { transform: "translate(3px, -1px)" },
          "70%": { transform: "translate(-3px, 1px)" },
          "80%": { transform: "translate(3px, -1px)" },
          "90%": { transform: "translate(-3px, 1px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-cyan 2s infinite",
        "gradient-flow": "gradient-x 3s ease infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "cyber-glitch": "cyber-glitch 0.3s ease",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
