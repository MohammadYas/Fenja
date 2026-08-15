import localFont from "next/font/local";

// Self-hostede variable skrifter (OFL — licensfiler i /public/fonts).
// Roller og begrundelser: DESIGN.md §3.

export const display = localFont({
  src: "../public/fonts/bricolage-grotesque-latin.woff2",
  weight: "200 800",
  variable: "--font-display",
  display: "swap",
});

export const brod = localFont({
  src: [
    {
      path: "../public/fonts/instrument-sans-latin.woff2",
      weight: "400 700",
      style: "normal",
    },
    {
      path: "../public/fonts/instrument-sans-italic-latin.woff2",
      weight: "400 700",
      style: "italic",
    },
  ],
  variable: "--font-brod",
  display: "swap",
});

export const mono = localFont({
  src: "../public/fonts/spline-sans-mono-latin.woff2",
  weight: "400 700",
  variable: "--font-mono",
  display: "swap",
});
