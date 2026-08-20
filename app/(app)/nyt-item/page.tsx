"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { EksempelBagside, EksempelHelhed } from "@/components/foto-eksempler";
import { MaerkeVaelger } from "@/components/maerke-vaelger";
import { SektionsMarkoer } from "@/components/sektions-markoer";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { vinted } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { FarveVaelger } from "@/components/farve-vaelger";
import { stoerrelsesGrupperFor } from "@/lib/data/vinted-kriterier";
import { komprimerFoto } from "@/lib/upload/compress";

type Rolle = "full" | "back" | "label" | "defect";

// Ejer-ordre 20/8: maks 2 fotos (helhed + anden vinkel) — label og fejl
// SKRIVES i stedet for at fotograferes (AI skal ikke identificere; det
// sparer et vision-kald pr. annonce og giver mere præcis tekst).
const FOTO_ROLLER: Rolle[] = ["full", "back"];

type FotoTilstand = { blob: Blob; forhaandsvisning: string };

// Wizard-trin (ejer-ordre 2026-08-20: flere sider, tøjdel først — overskueligt
// og brugervenligt): 1 vælg del · 2 fotos · 3 detaljer · 4 tjek og send.
type Trin = 1 | 2 | 3 | 4;
const SIDSTE_TRIN: Trin = 4;

export default function NytItem() {
  const router = useRouter();
  const [trin, setTrin] = useState<Trin>(1);
  const [fotos, setFotos] = useState<Partial<Record<Rolle, FotoTilstand>>>({});
  const [komprimererRolle, setKomprimererRolle] = useState<Rolle | null>(null);
  const [maerke, setMaerke] = useState("");
  const [stoerrelse, setStoerrelse] = useState("");
  const [stand, setStand] = useState("");
  const [kategori, setKategori] = useState("");
  const [fejlTekst, setFejlTekst] = useState("");
  const [farver, setFarver] = useState<string[]>([]);
  const [labelTekst, setLabelTekst] = useState("");
  const [koebspris, setKoebspris] = useState("");
  const [fejl, setFejl] = useState<string | null>(null);
  const [travl, setTravl] = useState(false);
  const kladdeId = useRef<string>(crypto.randomUUID());

  const gaaTil = (nyt: Trin) => {
    setFejl(null);
    setTrin(nyt);
    window.scrollTo({ top: 0 });
  };

  // Vinteds størrelsesliste for den valgte tøjdel (null = fritekst)
  const stoerrelsesGrupper = stoerrelsesGrupperFor(kategori);

  const vaelgDel = (del: string) => {
    if (del !== kategori) setStoerrelse(""); // ny del = ny størrelsesliste
    setKategori(del);
    gaaTil(2);
  };

  // Trinnets krav — Næste er først aktiv, når trinnet er komplet
  const trinKlar: Record<Trin, boolean> = {
    1: kategori.trim().length > 0,
    2: Boolean(fotos.full),
    3: Boolean(maerke.trim() && stoerrelse.trim() && stand),
    4: true,
  };

  async function vaelgFoto(rolle: Rolle, fil: File | undefined) {
    if (!fil) return;
    setKomprimererRolle(rolle);
    try {
      const blob = await komprimerFoto(fil);
      setFotos((f) => {
        const gammel = f[rolle];
        if (gammel) URL.revokeObjectURL(gammel.forhaandsvisning);
        return { ...f, [rolle]: { blob, forhaandsvisning: URL.createObjectURL(blob) } };
      });
    } finally {
      setKomprimererRolle(null);
    }
  }

  async function uploadFoto(rolle: Rolle, blob: Blob): Promise<string> {
    const signering = await fetch("/api/upload-signering", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kladdeId: kladdeId.current, rolle }),
    });
    if (!signering.ok) throw new Error(da.nytItem.fejlUpload);
    const { sti, token } = (await signering.json()) as { sti: string; token: string };

    // Hentes først ved upload (dynamisk import er cachet efter første kald),
    // så selve formularsiden ikke bærer Supabase-bundtet
    const { opretBrowserKlient } = await import("@/lib/supabase/client");
    const supabase = opretBrowserKlient();
    const { error } = await supabase.storage
      .from("item-photos")
      .uploadToSignedUrl(sti, token, blob, { contentType: "image/jpeg" });
    if (error) throw new Error(da.nytItem.fejlUpload);
    return sti;
  }

  async function indsend(e: React.FormEvent) {
    e.preventDefault();
    setFejl(null);

    if (!fotos.full) {
      setFejl(da.nytItem.fejlHelhedMangler);
      return;
    }
    if (!maerke.trim() || !stoerrelse.trim() || !stand || !kategori.trim()) {
      setFejl(da.nytItem.fejlFelterMangler);
      return;
    }

    setTravl(true);
    try {
      const uploads: { rolle: Rolle; sti: string }[] = [];
      for (const [rolle, foto] of Object.entries(fotos) as [Rolle, FotoTilstand][]) {
        uploads.push({ rolle, sti: await uploadFoto(rolle, foto.blob) });
      }

      const svar = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kladdeId: kladdeId.current,
          maerke,
          stoerrelse,
          stand,
          kategori,
          fejlBeskrivelse: fejlTekst || undefined,
          farve: farver.length > 0 ? farver.join(", ") : undefined,
          labelTekst: labelTekst || undefined,
          koebsprisDkk: koebspris ? Number(koebspris) : undefined,
          fotos: uploads,
        }),
      });
      const data = (await svar.json()) as { itemId?: string; fejl?: string };
      if (!svar.ok || !data.itemId) {
        setFejl(data.fejl ?? da.fejl.generel);
        setTravl(false);
        return;
      }
      router.push(`/items/${data.itemId}`);
    } catch (fejlobjekt) {
      setFejl(fejlobjekt instanceof Error ? fejlobjekt.message : da.fejl.generel);
      setTravl(false);
    }
  }

  return (
    <main className="py-6">
      <h1 className="font-display text-kaempe font-bold">
        {da.nytItem.titel}
      </h1>
      <p className="mt-3 max-w-laesbar text-tekst/80">{da.nytItem.forklaring}</p>

      {/* Fremdrift: fire rolige segmenter + trin-tekst */}
      <div className="mt-6">
        <p className="font-mono text-detalje text-tekst/70">
          {da.nytItem.trinAf(trin, SIDSTE_TRIN)}
        </p>
        <div className="mt-2 flex gap-1.5" aria-hidden="true">
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className={`h-1 flex-1 rounded-stram transition-colors duration-300 ease-out ${
                n <= trin ? "bg-gran" : "bg-kant"
              }`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={indsend} className="mt-8 flex flex-col gap-10">
        {/* Trin 1 · Hvad sælger du? Tap på en del går direkte videre. */}
        {trin === 1 ? (
          <section aria-label={da.nytItem.delTitel}>
            <SektionsMarkoer nr={1} titel={da.nytItem.delTitel} />
            <p className="mt-2 max-w-laesbar text-detalje text-tekst/70">
              {da.nytItem.delHjaelp}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {da.nytItem.dele.map((del) => {
                const aktiv = kategori === del;
                return (
                  <button
                    key={del}
                    type="button"
                    aria-pressed={aktiv}
                    onClick={() => vaelgDel(del)}
                    className={`kort-klik min-h-touch p-4 text-left font-display text-lead font-semibold transition-colors duration-150 ease-out ${
                      aktiv ? "border-gran text-gran" : ""
                    }`}
                  >
                    {del}
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {trin === 2 ? (
        <section aria-label={da.nytItem.fotoTitel}>
          <SektionsMarkoer nr={2} titel={da.nytItem.fotoTitel} />
          {/* Ejer-ordre 20/8: tydeligt at kun helhedsfotoet kræves */}
          <p className="mt-2 max-w-laesbar text-detalje text-tekst/70">
            {da.nytItem.fotoTitelHjaelp}
          </p>
          <div className="mt-4 flex flex-col gap-4">
            {FOTO_ROLLER.map((rolle) => {
              const info = da.nytItem.roller[rolle];
              const valgt = fotos[rolle];
              return (
                // Roligt rollekort: hør-flade, kanten mørkner ved interaktion
                <div key={rolle} className="kort-klik flex items-center gap-4 p-4">
                  {valgt ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={valgt.forhaandsvisning}
                      alt={`Valgt foto: ${info.navn}`}
                      className="h-16 w-16 rounded-stram object-cover"
                    />
                  ) : rolle === "full" ? (
                    // Ikonet følger tøjdelen fra trin 1 (ejer-ordre 20/8:
                    // jeans skal ikke vises som en trøje)
                    <EksempelHelhed kategori={kategori} />
                  ) : (
                    <EksempelBagside kategori={kategori} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {info.navn}
                      <span
                        className={`rounded-stram px-1.5 py-0.5 font-mono text-detalje ${
                          info.paakraevet
                            ? "bg-gran text-kalk"
                            : "bg-flade text-tekst/60"
                        }`}
                      >
                        {info.paakraevet
                          ? da.nytItem.fotoSkalMed
                          : da.nytItem.fotoValgfrit}
                      </span>
                    </p>
                    <p className="text-detalje text-tekst/70">{info.hjaelp}</p>
                  </div>
                  <label className="inline-flex min-h-touch cursor-pointer items-center rounded-bloed border border-koks px-3 text-detalje font-medium">
                    {komprimererRolle === rolle
                      ? da.nytItem.komprimerer
                      : valgt
                        ? da.nytItem.skiftFoto
                        : da.nytItem.tagFoto}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      onChange={(e) => vaelgFoto(rolle, e.target.files?.[0])}
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </section>
        ) : null}

        {trin === 3 ? (
        <section aria-label={da.nytItem.felterTitel} className="flex flex-col gap-5">
          <SektionsMarkoer nr={3} titel={da.nytItem.felterTitel} />
          <MaerkeVaelger value={maerke} onChange={setMaerke} />
          {/* Størrelse, stand og farve følger Vinteds egne lister 1:1
              (ejer-ordre 20/8) — fritekst kun hvor Vinted ingen liste har */}
          {stoerrelsesGrupper ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="stoerrelse" className="text-basis font-medium">
                {da.nytItem.stoerrelseLabel}
              </label>
              <select
                id="stoerrelse"
                required
                value={stoerrelse}
                onChange={(e) => setStoerrelse(e.target.value)}
                className="min-h-touch rounded-bloed border border-kant bg-baggrund px-3 text-basis"
              >
                <option value="" disabled>
                  {da.nytItem.stoerrelseVaelg}
                </option>
                {stoerrelsesGrupper.length === 1 ? (
                  stoerrelsesGrupper[0]!.stoerrelser.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))
                ) : (
                  stoerrelsesGrupper.map((gruppe) => (
                    <optgroup key={gruppe.navn} label={gruppe.navn}>
                      {gruppe.stoerrelser.map((s) => (
                        <option key={`${gruppe.navn}-${s}`} value={s}>
                          {s}
                        </option>
                      ))}
                    </optgroup>
                  ))
                )}
              </select>
            </div>
          ) : (
            <Field
              label={da.nytItem.stoerrelseLabel}
              required
              value={stoerrelse}
              onChange={(e) => setStoerrelse(e.target.value)}
            />
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="stand" className="text-basis font-medium">
              {da.nytItem.standLabel}
            </label>
            <select
              id="stand"
              required
              value={stand}
              onChange={(e) => setStand(e.target.value)}
              className="min-h-touch rounded-bloed border border-kant bg-baggrund px-3 text-basis"
            >
              <option value="" disabled>
                {da.nytItem.standVaelg}
              </option>
              {vinted.standskala.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          {/* Delen er valgt i trin 1 — fritekst kun ved "Andet" */}
          {kategori === "Andet" ||
          !(da.nytItem.dele as readonly string[]).includes(kategori) ? (
            <Field
              label={da.nytItem.kategoriLabel}
              hjaelp={da.nytItem.kategoriHjaelp}
              required
              value={kategori === "Andet" ? "" : kategori}
              onChange={(e) => setKategori(e.target.value || "Andet")}
            />
          ) : null}
          <FarveVaelger valgte={farver} onChange={setFarver} />
          <Field
            label={da.nytItem.labelTekstLabel}
            hjaelp={da.nytItem.labelTekstHjaelp}
            value={labelTekst}
            onChange={(e) => setLabelTekst(e.target.value)}
          />
          <Field
            label={da.nytItem.fejlLabel}
            hjaelp={da.nytItem.fejlHjaelp}
            value={fejlTekst}
            onChange={(e) => setFejlTekst(e.target.value)}
          />
          <Field
            label={da.nytItem.koebsprisLabel}
            hjaelp={da.nytItem.koebsprisHjaelp}
            type="number"
            inputMode="numeric"
            min="0"
            value={koebspris}
            onChange={(e) => setKoebspris(e.target.value)}
          />
        </section>
        ) : null}

        {/* Trin 4 · Tjek og send */}
        {trin === 4 ? (
          <section aria-label={da.nytItem.opsummeringTitel}>
            <SektionsMarkoer nr={4} titel={da.nytItem.opsummeringTitel} />
            <p className="mt-2 max-w-laesbar text-detalje text-tekst/70">
              {da.nytItem.opsummeringHjaelp}
            </p>
            <dl className="mt-4 flex flex-col gap-3 rounded-bloed border border-kant bg-flade p-4">
              {(
                [
                  [da.nytItem.delTitel, kategori],
                  [da.nytItem.maerkeLabel, maerke],
                  [da.nytItem.stoerrelseLabel, stoerrelse],
                  [da.nytItem.standLabel, stand],
                  [
                    da.nytItem.fotoTitel,
                    `${Object.keys(fotos).length} af ${FOTO_ROLLER.length}`,
                  ],
                  [da.nytItem.fejlLabel, fejlTekst || "—"],
                ] as const
              ).map(([navn, vaerdi]) => (
                <div key={navn} className="flex flex-wrap justify-between gap-x-6">
                  <dt className="text-detalje text-tekst/70">{navn}</dt>
                  <dd className="font-medium">{vaerdi}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 flex gap-3 overflow-x-auto">
              {Object.entries(fotos).map(([rolle, foto]) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={rolle}
                  src={foto.forhaandsvisning}
                  alt={`Valgt foto: ${da.nytItem.roller[rolle as Rolle].navn}`}
                  className="h-20 w-20 flex-shrink-0 rounded-stram object-cover"
                />
              ))}
            </div>
          </section>
        ) : null}

        {fejl ? (
          <p role="alert" className="text-detalje text-fejl">
            {fejl}
          </p>
        ) : null}

        {/* Navigation: Tilbage + Næste / stor afsend-knap på sidste trin */}
        <div className="flex items-center gap-4">
          {trin > 1 ? (
            <button
              type="button"
              onClick={() => gaaTil((trin - 1) as Trin)}
              className="min-h-touch text-detalje font-medium text-tekst/70 underline underline-offset-4"
            >
              {da.nytItem.tilbage}
            </button>
          ) : null}
          {trin < SIDSTE_TRIN ? (
            <Button
              type="button"
              disabled={!trinKlar[trin]}
              onClick={() => gaaTil((trin + 1) as Trin)}
              className="ml-auto disabled:cursor-not-allowed disabled:opacity-50"
            >
              {da.nytItem.naeste}
            </Button>
          ) : (
            <Button
              type="submit"
              travl={travl}
              className="ml-auto w-full py-4 font-display text-titel font-semibold sm:w-auto sm:px-8"
            >
              {travl ? da.nytItem.uploader : da.nytItem.lavAnnonce}
            </Button>
          )}
        </div>
      </form>
    </main>
  );
}
