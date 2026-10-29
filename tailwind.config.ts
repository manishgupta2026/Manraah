import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./frontend/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./parent/**/*.{js,ts,jsx,tsx,mdx}",
    "./Couples/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#fdf7ff",
        "surface-dim": "#ded6f0",
        "surface-bright": "#fdf7ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f7f1ff",
        "surface-container": "#f2ebff",
        "surface-container-high": "#ece4fe",
        "surface-container-highest": "#e6dff8",
        "on-surface": "#1d192b",
        "on-surface-variant": "#484551",
        "inverse-surface": "#322e41",
        "inverse-on-surface": "#f5eeff",
        outline: "#797582",
        "outline-variant": "#cac4d3",
        "surface-tint": "#006B56",
        primary: {
          DEFAULT: "#006B56",
          purple: "#005B48",
          container: "#006B56",
          fixed: "#E6F4F0",
          "fixed-dim": "#CBECE2",
        },
        "on-primary": "#ffffff",
        "on-primary-container": "#fffbff",
        "inverse-primary": "#88f7d6",
        secondary: {
          DEFAULT: "#006b56",
          container: "#88f7d6",
          fixed: "#88f7d6",
          "fixed-dim": "#6adaba",
        },
        "on-secondary": "#ffffff",
        "on-secondary-container": "#00725c",
        tertiary: {
          DEFAULT: "#874959",
          container: "#a46172",
          fixed: "#ffd9e0",
          "fixed-dim": "#ffb1c3",
        },
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#fffbff",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        background: "#fdf7ff",
        "on-background": "#1d192b",
        "surface-variant": "#e6dff8",
        // Manraah Brand & Accent Tokens (from reference specifications)
        "forest-emerald": {
          DEFAULT: "#006B56",
          dark: "#005B48",
          hover: "#005B48",
        },
        "pine-green": "#004D3D",
        "sage-mint": "#5FAF8A",
        "mint-surface": "#E6F4F0",
        "sage-surface": "#EAF6F2",
        "mint-border": "#CBECE2",
        "mint-accent": "#D0EDE4",
        "emerald-container": "#112F28",
        "emerald-border": "#1C463C",
        terracotta: {
          DEFAULT: "#E37A47",
          hover: "#D36A37",
          dark: "#F38A57",
          wash: "#FFF6F2",
        },
        "amber-wash": "#FFF6EB",
        "amber-border": "#FFE1C2",
        // Mood Accents
        pink: "#F4A6B8",
        peach: "#F5C99B",
        "pale-yellow": "#F5E6A8",
        lavender: "#7C6BC4",
        mint: "#5FCFB0",
        // Warm Earth Design System Tokens
        warm: {
          bg: "#211A14", // Deep espresso (main app bg)
          navbar: "#1B1510", // Dark coffee
          sidebar: "#201811", // Dark roasted brown
          card: "#30241A", // Warm espresso brown (primary card)
          "card-secondary": "#3B2C20", // Warm brown (secondary card)
          elevated: "#443326", // Lighter coffee brown (modals, elevated)
          olive: "#A3A77A", // Muted olive (primary accent)
          sage: "#A7B69A", // Soft sage (secondary accent)
          cream: "#F3E9D8", // Warm cream (primary text)
          beige: "#C5B7A4", // Muted beige (secondary text)
          taupe: "#9F907E", // Soft taupe (tertiary text)
          border: "#51402E", // Subtle brown (borders & dividers)
          button: "#858A60", // Warm olive (primary button bg)
          "button-text": "#211A14", // Deep espresso (primary button text)
          success: "#91AD87", // Muted sage green
          amber: "#D7AD70", // Soft amber (warning)
          red: "#C95D54", // Accessible muted red (error & crisis)
        },
      },
      fontFamily: {
        sans: ["var(--font-work-sans)", "Work Sans", "sans-serif"],
        heading: ["var(--font-quicksand)", "Quicksand", "sans-serif"],
      },
      borderRadius: {
        sm: "0.25rem", // 4px
        DEFAULT: "0.5rem", // 8px
        md: "0.75rem", // 12px
        lg: "1rem", // 16px
        xl: "1.5rem", // 24px
        full: "9999px",
      },
      spacing: {
        base: "8px",
        xs: "4px",
        sm: "12px",
        md: "24px",
        lg: "48px",
        xl: "80px",
        "container-mobile": "20px",
        "container-desktop": "64px",
      },
      boxShadow: {
        ambient: "0 10px 30px rgba(0, 107, 86, 0.08)",
        "ambient-deep": "0 20px 50px rgba(0, 107, 86, 0.05)",
        "card-lift": "0 12px 36px rgba(0, 107, 86, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
