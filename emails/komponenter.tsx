// Fælles byggesten til transaktionsmails: tabeller + inline styles — det
// eneste, mail-klienter forstår på tværs. Ingen Tailwind-klasser (håndhævet i
// tests/unit/emails.test.tsx). Al tekst kommer fra lib/copy/emails.ts (NFR-12).

import type { CSSProperties, ReactNode } from "react";
import { emails } from "@/lib/copy/emails";
import { emailFarver, emailRadius, emailSkrifter, emailTypo } from "./stil";

const nulTabel: CSSProperties = {
  borderCollapse: "collapse",
};

const brodStil: CSSProperties = {
  margin: "0 0 16px",
  fontFamily: emailSkrifter.brod,
  fontSize: emailTypo.basis,
  lineHeight: "1.6",
  color: emailFarver.tekst,
};

/** Almindeligt tekstafsnit; `daempet` til sekundære noter. */
export function Afsnit({
  daempet = false,
  children,
}: {
  daempet?: boolean;
  children: ReactNode;
}) {
  return (
    <p
      style={{
        ...brodStil,
        ...(daempet
          ? { color: emailFarver.daempet, fontSize: emailTypo.detalje }
          : {}),
      }}
    >
      {children}
    </p>
  );
}

export function Overskrift({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        ...brodStil,
        margin: "0 0 12px",
        fontSize: emailTypo.titel,
        lineHeight: "1.3",
        fontWeight: 700,
      }}
    >
      {children}
    </p>
  );
}

/** Knap som tabel (Outlook-sikker). 13px padding + 18px linje ≈ 44px touch-mål (NFR-1). */
export function Knap({ href, tekst }: { href: string; tekst: string }) {
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} style={nulTabel}>
      <tbody>
        <tr>
          <td
            style={{
              backgroundColor: emailFarver.knap,
              borderRadius: emailRadius.bloed,
            }}
          >
            <a
              href={href}
              style={{
                display: "inline-block",
                padding: "13px 28px",
                fontFamily: emailSkrifter.brod,
                fontSize: emailTypo.basis,
                lineHeight: "18px",
                fontWeight: 700,
                color: emailFarver.knapTekst,
                textDecoration: "none",
                borderRadius: emailRadius.bloed,
              }}
            >
              {tekst}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Råt link under knappen til klienter, hvor knappen ikke virker. */
export function KnapFallback({ href }: { href: string }) {
  return (
    <p style={{ ...brodStil, margin: "16px 0", fontSize: emailTypo.detalje }}>
      {emails.faelles.knapFallback}
      <br />
      <a
        href={href}
        style={{
          color: emailFarver.knap,
          textDecoration: "underline",
          wordBreak: "break-all",
        }}
      >
        {href}
      </a>
    </p>
  );
}

/** Hør-flade til detaljelinjer (fx købslinjen) — mono, som priser i appen. */
export function Flade({ children }: { children: ReactNode }) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{ ...nulTabel, margin: "0 0 16px" }}
    >
      <tbody>
        <tr>
          <td
            style={{
              backgroundColor: emailFarver.flade,
              borderRadius: emailRadius.stram,
              padding: "14px 16px",
              fontFamily: emailSkrifter.mono,
              fontSize: emailTypo.basis,
              lineHeight: "1.4",
              color: emailFarver.tekst,
            }}
          >
            {children}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Nummereret trinliste (velkomstmailen) — mono-tal, som mærkater i appen. */
export function Trinliste({ trin }: { trin: readonly string[] }) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{ ...nulTabel, margin: "0 0 8px" }}
    >
      <tbody>
        {trin.map((tekst, i) => (
          <tr key={tekst}>
            <td
              width={32}
              valign="top"
              style={{
                padding: "0 0 12px",
                fontFamily: emailSkrifter.mono,
                fontSize: emailTypo.detalje,
                lineHeight: "1.6",
                color: emailFarver.daempet,
              }}
            >
              {i + 1}.
            </td>
            <td valign="top" style={{ ...brodStil, padding: "0 0 12px", margin: 0 }}>
              {tekst}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Ydre ramme: kalk-baggrund, 600 px indholdskolonne, ordmærke øverst,
 * hairlines som adskillelse (v6: luft + hairline, ikke farveblokke) og
 * fælles footer. Skjult preheader-tekst til indbakke-forhåndsvisning.
 */
export function EmailRamme({
  forhaandsvisning,
  children,
}: {
  forhaandsvisning: string;
  children: ReactNode;
}) {
  const hairline = `1px solid ${emailFarver.hairline}`;
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{ ...nulTabel, backgroundColor: emailFarver.baggrund }}
    >
      <tbody>
        <tr>
          <td align="center" style={{ padding: "32px 16px" }}>
            <div
              style={{
                display: "none",
                maxHeight: 0,
                overflow: "hidden",
                fontSize: "1px",
                lineHeight: "1px",
                color: emailFarver.baggrund,
              }}
            >
              {forhaandsvisning}
            </div>
            <table
              role="presentation"
              width="100%"
              cellPadding={0}
              cellSpacing={0}
              style={{ ...nulTabel, maxWidth: "600px" }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: "0 0 16px",
                      fontFamily: emailSkrifter.brod,
                      fontSize: emailTypo.titel,
                      fontWeight: 700,
                      letterSpacing: "0.02em",
                      color: emailFarver.tekst,
                    }}
                  >
                    {emails.faelles.afsenderNavn}
                  </td>
                </tr>
                <tr>
                  <td style={{ borderTop: hairline, padding: "24px 0 8px" }}>
                    {children}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderTop: hairline,
                      padding: "16px 0 0",
                      fontFamily: emailSkrifter.brod,
                      fontSize: emailTypo.detalje,
                      lineHeight: "1.5",
                      color: emailFarver.daempet,
                    }}
                  >
                    {emails.faelles.footer}
                    <br />
                    {emails.faelles.footerHvorfor}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
