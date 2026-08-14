import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { KopierKnap } from "@/components/kopier-knap";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";
import { Progress } from "./progress";

const BUCKET = "item-photos";

type FotoRaekke = {
  id: string;
  role: string;
  original_url: string;
  cleaned_url: string | null;
};
type GenereringRaekke = { kind: string; status: string; output_url: string | null };

async function signeretUrl(sti: string | null): Promise<string | null> {
  if (!sti) return null;
  if (sti.startsWith("http")) return sti;
  const service = opretServiceKlient();
  const { data } = await service.storage.from(BUCKET).createSignedUrl(sti, 3600);
  return data?.signedUrl ?? null;
}

// Resultatside i compliance-rækkefølge (B-5/FR-6): (1) ægte fotos med
// "billede 1"-instruks, (2) visualisering med badge, (3) tekst med kopiér-knapper,
// (4) Vinted-checkliste. Rækkefølgen er et lovkrav i produktet — ændr den ikke.
export default async function ItemSide({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await opretServerKlient();

  const { data: item } = await supabase
    .from("items")
    .select(
      "id, brand, titel, beskrivelse, soegeord, pris_fra_dkk, pris_til_dkk, pris_begrundelse, defects_text, leveret_at, item_photos(id, role, original_url, cleaned_url), generations(kind, status, output_url)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!item) {
    return (
      <main className="py-6">
        <p className="max-w-laesbar">{da.resultat.ikkeFundet}</p>
        <Link href="/oversigt" className="mt-4 inline-block text-primaer underline">
          {da.nav.oversigt}
        </Link>
      </main>
    );
  }

  if (!item.leveret_at) {
    return (
      <main className="py-6">
        <h1 className="font-display text-display">{da.resultat.titelArbejder}</h1>
        <Progress itemId={id} />
      </main>
    );
  }

  const fotos = item.item_photos as FotoRaekke[];
  const generings = item.generations as GenereringRaekke[];
  const visualiseringSti =
    generings.find((g) => g.kind === "onmodel" && g.status === "succeeded")
      ?.output_url ?? null;
  const visualiseringFejlede = !visualiseringSti;

  const rensedeMedUrl = (
    await Promise.all(
      fotos
        .filter((f) => f.cleaned_url)
        .map(async (f) => ({
          ...f,
          visUrl: await signeretUrl(f.cleaned_url),
        })),
    )
  ).filter((f) => f.visUrl);
  const visualiseringUrl = await signeretUrl(visualiseringSti);

  return (
    <main className="py-6">
      <h1 className="font-display text-display">{item.titel ?? item.brand}</h1>

      {/* 1 · Ægte fotos først — altid (compliance-rækkefølgen, FR-6) */}
      <section className="mt-8" aria-label={da.resultat.aegteFotosTitel}>
        <h2 className="text-titel font-medium">{da.resultat.aegteFotosTitel}</h2>
        <p className="mt-1 max-w-laesbar text-detalje text-tekst/70">
          {da.resultat.aegteFotosInstruks}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {rensedeMedUrl.map((foto, i) => (
            <figure key={foto.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto.visUrl!}
                alt={`Renset foto ${i + 1}: ${da.nytItem.roller[foto.role as keyof typeof da.nytItem.roller]?.navn ?? foto.role}`}
                className="aspect-[4/5] w-full rounded-bloed border border-kant object-cover"
                loading={i > 1 ? "lazy" : undefined}
              />
              <figcaption className="mt-1">
                <a
                  href={foto.visUrl!}
                  download
                  className="text-detalje text-primaer underline underline-offset-4"
                >
                  {da.resultat.downloadFoto}
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <div className="soem-vandret mt-8" aria-hidden="true" />

      {/* 2 · Visualisering efter — med badge, aldrig først */}
      <section className="mt-8" aria-label={da.resultat.visualiseringTitel}>
        <div className="flex items-center gap-2">
          <h2 className="text-titel font-medium">{da.resultat.visualiseringTitel}</h2>
          <Badge variant="visualisering">{da.resultat.visualiseringBadge}</Badge>
        </div>
        {visualiseringFejlede ? (
          <p className="mt-2 max-w-laesbar text-tekst/80">
            {da.resultat.visualiseringFejlede}
          </p>
        ) : (
          <>
            <p className="mt-1 max-w-laesbar text-detalje text-tekst/70">
              {da.resultat.visualiseringForklaring}
            </p>
            <figure className="mt-3 max-w-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={visualiseringUrl!}
                alt={`Visualisering: tøjet båret af en genereret person. ${da.resultat.visualiseringBadge}`}
                className="w-full rounded-bloed border border-kant"
              />
              <figcaption className="mt-1">
                <a
                  href={visualiseringUrl!}
                  download
                  className="text-detalje text-primaer underline underline-offset-4"
                >
                  {da.resultat.downloadFoto}
                </a>
              </figcaption>
            </figure>
          </>
        )}
      </section>

      <div className="soem-vandret mt-8" aria-hidden="true" />

      {/* 3 · Annoncetekst med kopiér-knap pr. element */}
      <section className="mt-8" aria-label={da.resultat.tekstTitel}>
        <h2 className="text-titel font-medium">{da.resultat.tekstTitel}</h2>
        <div className="mt-3 flex flex-col gap-4">
          <Card>
            <p className="text-detalje text-tekst/70">{da.resultat.titelLabel}</p>
            <p className="mt-1 font-medium">{item.titel}</p>
            <div className="mt-3">
              <KopierKnap tekst={item.titel ?? ""} />
            </div>
          </Card>
          <Card>
            <p className="text-detalje text-tekst/70">{da.resultat.beskrivelseLabel}</p>
            <p className="mt-1 whitespace-pre-line">{item.beskrivelse}</p>
            <div className="mt-3">
              <KopierKnap tekst={item.beskrivelse ?? ""} />
            </div>
          </Card>
          {item.soegeord && (item.soegeord as string[]).length > 0 ? (
            <Card>
              <p className="text-detalje text-tekst/70">{da.resultat.soegeordLabel}</p>
              <p className="mt-1">{(item.soegeord as string[]).join(", ")}</p>
              <div className="mt-3">
                <KopierKnap tekst={(item.soegeord as string[]).join(", ")} />
              </div>
            </Card>
          ) : null}
          <Card>
            <p className="text-detalje text-tekst/70">{da.resultat.prisLabel}</p>
            <p className="mt-1 font-mono text-titel text-pris">
              {da.resultat.prisVisning(item.pris_fra_dkk ?? 0, item.pris_til_dkk ?? 0)}
            </p>
            <p className="mt-1 max-w-laesbar text-detalje text-tekst/70">
              {item.pris_begrundelse}
            </p>
          </Card>
        </div>
      </section>

      {/* 4 · Checkliste */}
      <section className="mt-8" aria-label={da.resultat.checklisteTitel}>
        <h2 className="text-titel font-medium">{da.resultat.checklisteTitel}</h2>
        <ol className="mt-3 flex max-w-laesbar list-decimal flex-col gap-2 pl-5">
          {da.resultat.checkliste.map((punkt) => (
            <li key={punkt}>{punkt}</li>
          ))}
        </ol>
        <p className="mt-4 text-detalje text-tekst/70">
          {da.resultat.vintedDisclaimer}{" "}
          <a
            href="https://www.vinted.dk/help/247-katalogregler"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primaer underline underline-offset-4"
          >
            {da.resultat.vintedReglerLink}
          </a>
        </p>
      </section>
    </main>
  );
}
