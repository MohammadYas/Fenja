import localFont from "next/font/local";

// Self-hostede variable skrifter (OFL — licensfiler i /public/fonts).
// Roller og begrundelser: DESIGN.md §3.

export const display = localFont({
  src: "../public/fonts/bricolage-grotesque-latin.woff2",
  weight: "200 800",
  variable: "--font-display",
  display: "swap",
});

// Kursiv-filen (instrument-sans-italic-latin.woff2) ligger fortsat i
// /public/fonts, men er IKKE deklareret: ingen copy eller guide bruger kursiv,
// og next/font preloader alle deklarerede filer — 31 KB der konkurrerede med
// LCP på hver side. Genindsæt src-varianten (style: "italic") hvis kursiv
// tages i brug; indtil da vil en evt. <em> blive skrå-syntetiseret af browseren.
export const brod = localFont({
  src: "../public/fonts/instrument-sans-latin.woff2",
  weight: "400 700",
  variable: "--font-brod",
  display: "swap",
});

export const mono = localFont({
  src: "../public/fonts/spline-sans-mono-latin.woff2",
  weight: "400 700",
  variable: "--font-mono",
  display: "swap",
});
