"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  EksempelBagside,
  EksempelFejl,
  EksempelHelhed,
  EksempelLabel,
} from "@/components/foto-eksempler";
import { SektionsMarkoer } from "@/components/sektions-markoer";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { vinted } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { MAERKER } from "@/lib/data/maerker";
import { opretBrowserKlient } from "@/lib/supabase/client";
import { komprimerFoto } from "@/lib/upload/compress";

type Rolle = "full" | "back" | "label" | "defect";

const EKSEMPLER: Record<Rolle, React.ReactNode> = {
  full: <EksempelHelhed />,
  back: <EksempelBagside />,
  label: <EksempelLabel />,
  defect: <EksempelFejl />,
};

type FotoTilstand = { blob: Blob; forhaandsvisning: string };

export default function NytItem() {
  const router = useRouter();
  const [fotos, setFotos] = useState<Partial<Record<Rolle, FotoTilstand>>>({});
  const [komprimererRolle, setKomprimererRolle] = useState<Rolle | null>(null);
  const [maerke, setMaerke] = useState("");
  const [stoerrelse, setStoerrelse] = useState("");
  const [stand, setStand] = useState("");
  const [kategori, setKategori] = useState("");
  const [fejlTekst, setFejlTekst] = useState("");
  const [koebspris, setKoebspris] = useState("");
  const [fejl, setFejl] = useState<string | null>(null);
  const [travl, setTravl] = useState(false);
  const kladdeId = useRef<string>(crypto.randomUUID());

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

      <form onSubmit={indsend} className="mt-8 flex flex-col gap-10">
        <section aria-label={da.nytItem.fotoTitel}>
          <SektionsMarkoer nr={1} titel={da.nytItem.fotoTitel} />
          <div className="mt-4 flex flex-col gap-4">
            {(Object.keys(EKSEMPLER) as Rolle[]).map((rolle) => {
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
                  ) : (
                    EKSEMPLER[rolle]
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {info.navn}
                      {info.paakraevet ? " *" : ""}
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

        <section aria-label={da.nytItem.felterTitel} className="flex flex-col gap-5">
          <SektionsMarkoer nr={2} titel={da.nytItem.felterTitel} />
          <Field
            label={da.nytItem.maerkeLabel}
            list="maerker"
            required
            value={maerke}
            onChange={(e) => setMaerke(e.target.value)}
          />
          <datalist id="maerker">
            {MAERKER.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
          <Field
            label={da.nytItem.stoerrelseLabel}
            required
            value={stoerrelse}
            onChange={(e) => setStoerrelse(e.target.value)}
          />
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
          <Field
            label={da.nytItem.kategoriLabel}
            hjaelp={da.nytItem.kategoriHjaelp}
            required
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
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

        {fejl ? (
          <p role="alert" className="text-detalje text-fejl">
            {fejl}
          </p>
        ) : null}

        {/* Stor fuld-bredde afsend-knap — vægt gennem størrelse, ikke råben */}
        <Button
          type="submit"
          travl={travl}
          className="w-full py-4 font-display text-titel font-semibold"
        >
          {travl ? da.nytItem.uploader : da.nytItem.lavAnnonce}
        </Button>
      </form>
    </main>
  );
}
