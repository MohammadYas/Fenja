"use client";

// Content-værktøjer (ejer-ordre 21/8): færdige prompts med kopiér-knap —
// åbn Claude/ChatGPT, sæt ind, få content i Seljas tone med rigtige fakta.

import { useState } from "react";
import { Card } from "@/components/ui/card";
import type { ContentPrompt } from "@/lib/admin/content-prompts";
import { da } from "@/lib/copy/da";

export function ContentVaerktoejer({ prompts }: { prompts: ContentPrompt[] }) {
  const [kopieret, setKopieret] = useState<string | null>(null);

  async function kopier(prompt: ContentPrompt) {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setKopieret(prompt.id);
      setTimeout(() => setKopieret(null), 2000);
    } catch {
      // Clipboard kan være blokeret — så må man markere teksten selv
    }
  }

  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      {prompts.map((prompt) => (
        <Card key={prompt.id}>
          <p className="font-medium">{prompt.titel}</p>
          <p className="mt-1 text-detalje text-tekst/70">{prompt.beskrivelse}</p>
          <button
            type="button"
            onClick={() => kopier(prompt)}
            className="mt-3 inline-flex min-h-touch cursor-pointer items-center rounded-bloed border border-koks px-4 text-detalje font-medium transition hover:bg-koks hover:text-kalk"
          >
            {kopieret === prompt.id
              ? da.admin.content.kopieret
              : da.admin.content.kopierKnap}
          </button>
        </Card>
      ))}
    </div>
  );
}
