"use client";

// Admin: upload/slet forside-billeder (ejer-ordre 21/8 nat). Nye billeder
// ryger i den offentlige bucket og dukker op på forsiden ved næste
// revalidering — ingen deploy nødvendig.

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { da } from "@/lib/copy/da";

type Billede = { navn: string; url: string };

export function ForsideBilleder() {
  const [billeder, setBilleder] = useState<Billede[]>([]);
  const [travl, setTravl] = useState(false);
  const [fejl, setFejl] = useState<string | null>(null);
  const copy = da.admin.forsideBilleder;

  const hent = useCallback(async () => {
    try {
      const svar = await fetch("/api/admin/forside-billeder");
      const data = (await svar.json()) as { billeder?: Billede[] };
      setBilleder(data.billeder ?? []);
    } catch {
      // stille — listen er ikke kritisk
    }
  }, []);

  useEffect(() => {
    void hent();
  }, [hent]);

  async function upload(filer: FileList | null) {
    if (!filer || filer.length === 0) return;
    setFejl(null);
    setTravl(true);
    try {
      for (const fil of Array.from(filer)) {
        const form = new FormData();
        form.append("fil", fil);
        const svar = await fetch("/api/admin/forside-billeder", {
          method: "POST",
          body: form,
        });
        if (!svar.ok) {
          const data = (await svar.json()) as { fejl?: string };
          setFejl(data.fejl ?? da.fejl.generel);
          break;
        }
      }
      await hent();
    } catch {
      setFejl(da.fejl.generel);
    } finally {
      setTravl(false);
    }
  }

  async function slet(navn: string) {
    setFejl(null);
    try {
      await fetch("/api/admin/forside-billeder", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ navn }),
      });
      await hent();
    } catch {
      setFejl(da.fejl.generel);
    }
  }

  return (
    <div className="mt-3">
      <label className="inline-flex min-h-touch cursor-pointer items-center rounded-bloed border border-koks px-4 text-detalje font-medium transition hover:bg-koks hover:text-kalk">
        {travl ? copy.uploader : copy.uploadKnap}
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={travl}
          onChange={(e) => void upload(e.target.files)}
        />
      </label>
      <p className="mt-2 text-detalje text-tekst/70">{copy.note}</p>
      {fejl ? (
        <p role="alert" className="mt-2 text-detalje text-fejl">
          {fejl}
        </p>
      ) : null}
      {billeder.length > 0 ? (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {billeder.map((b) => (
            <li key={b.navn} className="flex flex-col gap-1">
              <Image
                src={b.url}
                alt=""
                width={160}
                height={200}
                unoptimized
                className="aspect-[4/5] w-full rounded-bloed object-cover"
              />
              <Button variant="sekundaer" onClick={() => void slet(b.navn)}>
                {copy.sletKnap}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-detalje text-tekst/70">{copy.tom}</p>
      )}
    </div>
  );
}
