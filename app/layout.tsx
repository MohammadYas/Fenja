import type { Metadata, Viewport } from "next";
import { site } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { brod, display, mono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  // Absolut base for canonical + OG-URLs — samme ene kilde som resten (SELJA_DOMAIN)
  metadataBase: new URL(site.baseUrl),
  title: da.site.navn,
  description: da.site.beskrivelse,
  openGraph: {
    type: "website",
    siteName: da.site.navn,
    locale: "da_DK",
    title: da.site.navn,
    description: da.site.beskrivelse,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="da" className={`${display.variable} ${brod.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
