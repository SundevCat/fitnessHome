import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FFFFFF",
        surface: "#F7F8F6",
        surface2: "#EFF2ED",
        ink: "#161A18",
        inkSoft: "#5B6460",
        line: "#E4E7E2",
        sage: {
          50: "#EEF6F1",
          100: "#DCEEE3",
          200: "#B9DDC8",
          300: "#8FC7A8",
          400: "#57A97F",
          500: "#22855B",
          600: "#1B6E4B",
          700: "#155A3E",
          800: "#0F4630",
          900: "#0A3323",
        },
        amber: {
          50: "#FEF6E9",
          100: "#FBEBD2",
          300: "#F0C271",
          400: "#E8A33D",
          500: "#DC8B22",
          600: "#C77F1F",
          700: "#9C6114",
        },
        coral: {
          100: "#FDE7E0",
          400: "#F0805C",
          500: "#E8663E",
          600: "#D14E27",
          700: "#A63C1C",
        },
      },
      fontFamily: {
        heading: ["var(--font-sora)", "var(--font-noto-thai)", "sans-serif"],
        body: ["var(--font-inter)", "var(--font-noto-thai)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 35, 25, 0.04), 0 8px 24px -12px rgba(15, 35, 25, 0.12)",
        lifted: "0 4px 6px rgba(15, 35, 25, 0.05), 0 16px 36px -12px rgba(15, 35, 25, 0.2)",
        glow: "0 8px 24px -6px rgba(34, 133, 91, 0.45)",
      },
      backgroundImage: {
        "sage-gradient": "linear-gradient(135deg, #2C9166 0%, #1B6E4B 100%)",
        "hero-mesh":
          "radial-gradient(circle at 15% 15%, rgba(87, 169, 127, 0.16), transparent 45%), radial-gradient(circle at 85% 0%, rgba(232, 163, 61, 0.14), transparent 40%), radial-gradient(circle at 90% 85%, rgba(34, 133, 91, 0.12), transparent 45%)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
