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
        "surface-tint": "#6251a8",
        primary: {
          DEFAULT: "#5f4ea5",
          purple: "#7C6BC4",
          container: "#7867c0",
          fixed: "#e6deff",
          "fixed-dim": "#cbbeff",
        },
        "on-primary": "#ffffff",
        "on-primary-container": "#fffbff",
        "inverse-primary": "#cbbeff",
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
        // Mood Accents
        pink: "#F4A6B8",
        peach: "#F5C99B",
        "pale-yellow": "#F5E6A8",
        lavender: "#7C6BC4",
        mint: "#5FCFB0",
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
        ambient: "0 10px 30px rgba(124, 107, 196, 0.08)",
        "ambient-deep": "0 20px 50px rgba(124, 107, 196, 0.05)",
        "card-lift": "0 12px 36px rgba(95, 78, 165, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
