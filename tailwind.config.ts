import type { Config } from "tailwindcss";
import {
  bevaegelse,
  farver,
  radius,
  roller,
  skrifter,
  typeskala,
} from "./lib/design/tokens";

// Hele temaet deriverer fra /lib/design/tokens.ts (HANDOFF §2.2.1) —
// tilføj aldrig farver eller størrelser direkte her.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      ...farver,
      baggrund: roller.baggrund,
      tekst: roller.tekst,
      primaer: roller.primaer,
      "primaer-tekst": roller.primaerTekst,
      flade: roller.flade,
      kant: roller.kant,
      pris: roller.pris,
      detalje: roller.detalje,
    },
    fontFamily: {
      display: [skrifter.display, "system-ui", "sans-serif"],
      brod: [skrifter.brod, "system-ui", "sans-serif"],
      mono: [skrifter.mono, "ui-monospace", "monospace"],
    },
    fontSize: { ...typeskala },
    borderRadius: {
      none: "0",
      stram: radius.stram,
      bloed: radius.bloed,
    },
    extend: {
      transitionDuration: {
        DEFAULT: bevaegelse.varighed,
      },
      transitionTimingFunction: {
        DEFAULT: bevaegelse.kurve,
      },
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
      maxWidth: {
        laesbar: "65ch",
      },
    },
  },
  plugins: [],
};

export default config;
