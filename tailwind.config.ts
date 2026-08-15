import type { Config } from "tailwindcss";
import {
  bevaegelse,
  farver,
  radius,
  roller,
  skrifter,
  tekstur,
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
      // BEMÆRK: roller.detalje (rav) må IKKE mappes som farven "detalje" —
      // navnet kolliderer med typeskala-trinnet, og text-detalje ville så
      // farve tekst i stedet for at sætte størrelsen. Brug "rav" direkte.
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
    // Fladt udtryk (DESIGN.md §5): ingen dekorative skygger overhovedet.
    boxShadow: {
      none: "none",
    },
    extend: {
      // Næsten usynlig vævning på kalk-flader (REDESIGN §2.4) — inline-SVG,
      // ingen billedfiler; farve og opacity deriverer fra tokens.
      backgroundImage: {
        tekstur: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M0 .5h8M.5 0v8' stroke='%23${farver.koks.slice(1)}' stroke-opacity='${tekstur.opacity}'/%3E%3C/svg%3E")`,
      },
      transitionDuration: {
        DEFAULT: bevaegelse.varighed,
        reveal: bevaegelse.reveal,
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
