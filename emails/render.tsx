// Renderer en mail-skabelon til et komplet HTML-dokument klar til afsendelse
// (lib/emails/send.ts tager html som streng). Bruges server-side (jobs/routes)
// og i tests — IKKE i React Server Components (dev-siden renderer JSX direkte).

import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { emailFarver } from "./stil";

export function renderMailHtml(emne: string, skabelon: ReactElement): string {
  const dokument = (
    <html lang="da">
      {/* eslint-disable-next-line @next/next/no-head-element -- mail-dokument, ikke en Next-side */}
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{emne}</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: emailFarver.baggrund,
          // Forhindrer iOS/Windows Mail i at skalere teksten op
          WebkitTextSizeAdjust: "100%",
        }}
      >
        {skabelon}
      </body>
    </html>
  );
  return `<!doctype html>${renderToStaticMarkup(dokument)}`;
}
