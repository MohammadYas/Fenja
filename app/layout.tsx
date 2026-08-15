import type { Metadata, Viewport } from "next";
import { da } from "@/lib/copy/da";
import { brod, display, mono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: da.site.navn,
  description: da.site.beskrivelse,
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
