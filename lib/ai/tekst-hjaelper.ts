// Abonnent-hjælpere på tekst-modellen (21/8 nat): forhandlings-svar og
// bundle-annoncer. Fri JSON-generering uden om pipeline-interfacet —
// keyless-miljøer (tests/demo) får en deterministisk mock, så alt kan
// testes uden nøgle (NFR-5). Kald er billige (~0,03 kr.) og rate-limites
// i API-ruterne — abonnenten betaler ALDRIG kreditter for dem.

const DEEPSEEK_API = "https://api.deepseek.com/chat/completions";

const TONE =
  "Du skriver på dansk for en privat Vinted-sælger. Tonen er venlig, kort og ærlig — aldrig pushy, aldrig undskyldende. Ingen emojis, ingen udråbstegn i bunker.";

async function kaldJson<T>(system: string, bruger: string, mock: T): Promise<T> {
  const noegle = process.env.DEEPSEEK_API_KEY;
  if (process.env.MOCK_PROVIDERS === "1" || !noegle) return mock;
  const svar = await fetch(DEEPSEEK_API, {
    method: "POST",
    headers: {
      authorization: `Bearer ${noegle}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_TEKST_MODEL ?? "deepseek-chat",
      max_tokens: 900,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `${TONE}\n\n${system}` },
        { role: "user", content: bruger },
      ],
    }),
  });
  if (!svar.ok) throw new Error(`Tekst-modellen svarede ${svar.status}`);
  const data = (await svar.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const indhold = data.choices?.[0]?.message?.content;
  if (!indhold) throw new Error("Tekst-modellen svarede tomt");
  return JSON.parse(indhold) as T;
}

export type BundleInput = {
  items: { titel: string; kategori: string; prisTilDkk: number | null }[];
  samletFoerDkk: number;
  bundlePrisDkk: number;
};

export type BundleTekst = {
  titel: string;
  beskrivelse: string;
};

/** Samlet bundle-annonce for flere stykker tøj med én skarp pakkepris */
export async function skrivBundleTekst(input: BundleInput): Promise<BundleTekst> {
  const mock: BundleTekst = {
    titel: `Tøjpakke: ${input.items.length} dele samlet`,
    beskrivelse: `${input.items.map((i) => `• ${i.titel}`).join("\n")}\n\nSamlet værdi ${input.samletFoerDkk} kr. — sælges samlet for ${input.bundlePrisDkk} kr. Alt kommer fra et røgfrit hjem og sendes samme eller næste dag.`,
  };
  return kaldJson(
    `Skriv én samlet Vinted-annonce for en tøjpakke (bundle). Titlen er en søgestreng (ingen udråbstegn). Beskrivelsen lister hvert stykke på sin egen linje med • foran, nævner den samlede værdi og pakkeprisen som en god handel — uden at oversælge. Svar KUN med JSON: {"titel": string, "beskrivelse": string}`,
    `Stykker:\n${input.items
      .map((i) => `- ${i.titel} (${i.kategori}${i.prisTilDkk != null ? `, ca. ${i.prisTilDkk} kr.` : ""})`)
      .join("\n")}\nSamlet værdi enkeltvis: ${input.samletFoerDkk} kr.\nPakkepris: ${input.bundlePrisDkk} kr.`,
    mock,
  );
}
