// Dev-side til visuel gennemgang af alle transaktionsmails — findes IKKE i
// production (notFound). Skabelonerne renderes direkte som JSX (de er rene
// tabel-komponenter med inline styles), så siden viser præcis mail-markuppen.
// Teksterne her er dev-mærkater, ikke brugervendt copy — mail-copy bor i
// lib/copy/emails.ts.

import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AnnonceKlarMail } from "@/emails/annonce-klar";
import { KreditRefunderetMail } from "@/emails/kredit-refunderet";
import { KvitteringMail } from "@/emails/kvittering";
import { MagicLinkMail } from "@/emails/magic-link";
import { VelkomstMail } from "@/emails/velkomst";
import { emails } from "@/lib/copy/emails";

export const metadata = { title: "Mails (dev) · Selja" };

const EKSEMPEL_TITEL = "Mørkeblå uldstrik · str. M";
const EKSEMPEL_BASE = "http://localhost:3000";

export default function DevEmails() {
  if (process.env.NODE_ENV === "production") notFound();

  const skabeloner: { navn: string; emne: string; indhold: ReactNode }[] = [
    {
      navn: "Magic link (A-1)",
      emne: emails.magicLink.emne,
      indhold: (
        <MagicLinkMail linkUrl={`${EKSEMPEL_BASE}/auth/bekraeft?token=eksempel`} />
      ),
    },
    {
      navn: "Velkomst",
      emne: emails.velkomst.emne,
      indhold: <VelkomstMail startUrl={`${EKSEMPEL_BASE}/nyt-item`} />,
    },
    {
      navn: "Annonce klar (B-5)",
      emne: emails.annonceKlar.emne(EKSEMPEL_TITEL),
      indhold: (
        <AnnonceKlarMail
          itemTitel={EKSEMPEL_TITEL}
          itemUrl={`${EKSEMPEL_BASE}/items/eksempel`}
        />
      ),
    },
    {
      navn: "Kvitterings-supplement (E-2)",
      emne: emails.kvittering.emne,
      indhold: (
        <KvitteringMail antal={10} prisDkk={29} saldoUrl={`${EKSEMPEL_BASE}/kreditter`} />
      ),
    },
    {
      navn: "Kredit refunderet (B-6)",
      emne: emails.kreditRefunderet.emne,
      indhold: (
        <KreditRefunderetMail
          itemTitel={EKSEMPEL_TITEL}
          itemUrl={`${EKSEMPEL_BASE}/items/eksempel`}
        />
      ),
    },
  ];

  return (
    <main style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: "1.375rem", margin: "0 0 4px" }}>
        Transaktionsmails (dev)
      </h1>
      <p style={{ margin: "0 0 32px", opacity: 0.7 }}>
        Alle skabeloner fra /emails med eksempeldata. Siden findes ikke i
        production.
      </p>
      {skabeloner.map((skabelon) => (
        <section key={skabelon.navn} style={{ margin: "0 0 48px" }}>
          <h2 style={{ fontSize: "1rem", margin: "0 0 4px" }}>{skabelon.navn}</h2>
          <p style={{ margin: "0 0 12px", fontFamily: "monospace", opacity: 0.7 }}>
            Emne: {skabelon.emne}
          </p>
          <div style={{ border: "1px solid rgb(33 37 35 / 0.15)" }}>
            {skabelon.indhold}
          </div>
        </section>
      ))}
    </main>
  );
}
