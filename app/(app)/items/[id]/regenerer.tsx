"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { da } from "@/lib/copy/da";
import { Button } from "@/components/ui/button";

type Props = {
  itemId: string;
  presets: { id: string; navn: string }[];
};

type Koerer = "visualisering" | "tekst" | null;

// B-8: regenerér én del til reduceret pris. Kører inline (mock/dev) eller via
// Trigger.dev; ved svar genindlæses server-datene, så nyeste del vises.
export function Regenerer({ itemId, presets }: Props) {
  const router = useRouter();
  const [presetId, setPresetId] = useState(presets[0]?.id ?? "");
  const [koerer, setKoerer] = useState<Koerer>(null);
  const [besked, setBesked] = useState<string | null>(null);

  async function regenerer(del: "visualisering" | "tekst") {
    setKoerer(del);
    setBesked(null);
    try {
      const svar = await fetch(`/api/items/${itemId}/regenerer`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          del === "visualisering" ? { del, presetId } : { del },
        ),
      });
      const data = (await svar.json()) as { fejl?: string; faerdig?: boolean };
      if (!svar.ok) {
        setBesked(data.fejl ?? da.regenerer.fejlAlmen);
        return;
      }
      setBesked(da.regenerer.faerdig);
      router.refresh();
    } catch {
      setBesked(da.regenerer.fejlAlmen);
    } finally {
      setKoerer(null);
    }
  }

  return (
    <div>
      <p className="max-w-laesbar text-detalje text-tekst/70">
        {da.regenerer.forklaring(da.regenerer.prisLabel)}
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-detalje font-medium">
          {da.regenerer.presetLabel}
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value)}
            disabled={koerer !== null}
            className="min-h-touch rounded-bloed border border-kant bg-kalk px-3 text-basis"
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.navn}
              </option>
            ))}
          </select>
        </label>
        <Button
          variant="sekundaer"
          onClick={() => regenerer("visualisering")}
          travl={koerer === "visualisering"}
          disabled={koerer !== null}
        >
          {koerer === "visualisering"
            ? da.regenerer.koererVisualisering
            : `${da.regenerer.nyVisualisering} · ${da.regenerer.prisLabel}`}
        </Button>
        <Button
          variant="sekundaer"
          onClick={() => regenerer("tekst")}
          travl={koerer === "tekst"}
          disabled={koerer !== null}
        >
          {koerer === "tekst"
            ? da.regenerer.koererTekst
            : `${da.regenerer.nyTekst} · ${da.regenerer.prisLabel}`}
        </Button>
      </div>

      {koerer !== null && (
        <div className="soem-spor mt-4 max-w-laesbar" aria-hidden="true">
          <div className="soem-fyld w-2/3" />
        </div>
      )}
      {besked && (
        <p role="status" className="mt-3 max-w-laesbar text-detalje">
          {besked}
        </p>
      )}
    </div>
  );
}
