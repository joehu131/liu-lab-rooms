import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-ibm-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      colors: {
        bg: {
          bot: "var(--bg-bot)",
          top: "var(--bg-top)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink-2)",
          3: "var(--ink-3)",
        },
        rule: "var(--rule)",
        panel: {
          DEFAULT: "var(--panel)",
          solid: "var(--panel-solid)",
          hover: "var(--panel-hover)",
        },
        accent: {
          linux: "var(--accent-linux)",
          win: "var(--accent-win)",
        },
        status: {
          free: "var(--status-free)",
          warn: "var(--status-warn)",
          busy: "var(--status-busy)",
          sim: "var(--status-sim)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
