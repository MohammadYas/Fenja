import type { Config } from "tailwindcss";

// S2 (design-sessionen) kobler /lib/design/tokens.ts på her,
// så al farve/typo/spacing i Tailwind deriverer fra tokens (HANDOFF §2.2.1).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
