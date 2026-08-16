// S32 · transaktionsmails koblet på flowet. Ét sted der binder skabelon
// (emails/*), emne (lib/copy/emails) og afsenderen (send.ts) sammen, så
// kanterne (auth-callback, Stripe-webhook, item-pipeline) kun kalder én typet
// funktion. Rene og testbare: alt går gennem en injiceret EmailAfsender, så
// tests og CI kører mod MockEmailAfsender uden nøgle (NFR-5).

import { AnnonceKlarMail } from "@/emails/annonce-klar";
import { KreditRefunderetMail } from "@/emails/kredit-refunderet";
import { KvitteringMail } from "@/emails/kvittering";
import { renderMailHtml } from "@/emails/render";
import { VelkomstMail } from "@/emails/velkomst";
import { emails as kopi } from "@/lib/copy/emails";
import type { EmailAfsender, EmailKvittering } from "./send";

/**
 * Kør en mail-afsendelse uden at kunne vælte kalderen: en transaktionsmail er
 * aldrig kritisk — login, betaling og leverance skal lykkes, også når mailen
 * fejler eller nøglen mangler. Fejl logges, men kastes ikke videre.
 */
export async function bedstMuligt(handling: () => Promise<unknown>): Promise<void> {
  try {
    await handling();
  } catch (fejl) {
    console.error("Transaktionsmail fejlede (ikke-kritisk):", fejl);
  }
}

export async function sendVelkomst(
  afsender: EmailAfsender,
  args: { til: string; startUrl: string },
): Promise<EmailKvittering> {
  const emne = kopi.velkomst.emne;
  return afsender.send({
    til: args.til,
    emne,
    html: await renderMailHtml(emne, <VelkomstMail startUrl={args.startUrl} />),
  });
}

export async function sendKvittering(
  afsender: EmailAfsender,
  args: { til: string; antal: number; prisDkk: number; saldoUrl: string },
): Promise<EmailKvittering> {
  const emne = kopi.kvittering.emne;
  return afsender.send({
    til: args.til,
    emne,
    html: await renderMailHtml(
      emne,
      <KvitteringMail antal={args.antal} prisDkk={args.prisDkk} saldoUrl={args.saldoUrl} />,
    ),
  });
}

export async function sendAnnonceKlar(
  afsender: EmailAfsender,
  args: { til: string; itemTitel: string; itemUrl: string },
): Promise<EmailKvittering> {
  const emne = kopi.annonceKlar.emne(args.itemTitel);
  return afsender.send({
    til: args.til,
    emne,
    html: await renderMailHtml(
      emne,
      <AnnonceKlarMail itemTitel={args.itemTitel} itemUrl={args.itemUrl} />,
    ),
  });
}

export async function sendKreditRefunderet(
  afsender: EmailAfsender,
  args: { til: string; itemTitel: string; itemUrl: string },
): Promise<EmailKvittering> {
  const emne = kopi.kreditRefunderet.emne;
  return afsender.send({
    til: args.til,
    emne,
    html: await renderMailHtml(
      emne,
      <KreditRefunderetMail itemTitel={args.itemTitel} itemUrl={args.itemUrl} />,
    ),
  });
}
