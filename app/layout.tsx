import type { Metadata, Viewport } from "next";
import { da } from "@/lib/copy/da";
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
    <html lang="da">
      <body>{children}</body>
    </html>
  );
}
