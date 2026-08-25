// Foto-analyse for trialen: prøven har INGEN formularer, så kategori, mærke,
// farve og stand aflæses af selve fotoet med Gemini flash-vision (samme
// billige model som troskabstjek/label — se lib/providers/deepseek.ts).
// Uden nøgler / i mock-tilstand: deterministisk mock (NFR-5).

import { vinted } from "@/lib/config";

const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta";
const VISION_MODEL = process.env.GEMINI_VISION_MODEL ?? "gemini-3.6-flash";
const VISION_COST_DKK = 0.02;

export type TrialAnalyse = {
  /** Fritekst-kategori i pipelinens format (matches mod kategori-skabelonerne) */
  kategori: string;
  maerke: string | null;
  farve: string | null;
  /** Skøn på Vinteds standskala ud fra fotoet — et forslag, aldrig en garanti */
  stand: string;
  /** Én linje om tøjet — kontekst til annonceteksten */
  beskrivelse: string;
  costDkk: number;
};

export const MOCK_TRIAL_ANALYSE: TrialAnalyse = {
  kategori: "striktrøje",
  maerke: null,
  farve: "blå",
  stand: "God",
  beskrivelse: "Blå striktrøje med rund hals",
  costDkk: 0,
};

const PROMPT = `Dette er et sælgerfoto af ét stykke brugt tøj (eller taske/sko) til en genbrugsannonce. Aflæs KUN hvad du faktisk kan se — gæt aldrig på mærke eller detaljer, der ikke er synlige.
Svar KUN med JSON:
{"kategori": string på dansk med tøjtypen i ét-to ord (fx "kjole", "jeans", "shorts", "striktrøje", "t-shirt", "skjorte", "jakke", "cardigan", "nederdel", "taske", "sko"),
 "maerke": string eller null (kun hvis et mærke/logo er tydeligt læsbart),
 "farve": string på dansk eller null,
 "stand": en af ${JSON.stringify(vinted.standskala)} (dit bedste skøn ud fra fotoet — vælg "God" i tvivl),
 "beskrivelse": én kort dansk sætning om tøjet (type, farve, evt. print/detaljer)}`;

function parseJson<T>(tekst: string): T {
  const match = /\{[\s\S]*\}/.exec(tekst);
  if (!match) throw new Error("trial-analyse: intet JSON i svaret");
  return JSON.parse(match[0]) as T;
}

/** Foto som inline-data — trialen arbejder altid med data-URLs */
function tilInlineData(dataUrl: string): { mimeType: string; data: string } {
  const match = /^data:([^;,]+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error("trial-analyse: forventede en data-URL");
  return { mimeType: match[1]!, data: match[2]! };
}

export async function analyserTrialFoto(fotoDataUrl: string): Promise<TrialAnalyse> {
  const noegle = process.env.GEMINI_API_KEY;
  if (process.env.MOCK_PROVIDERS === "1" || !noegle) return MOCK_TRIAL_ANALYSE;

  const svar = await fetch(`${GEMINI_API}/models/${VISION_MODEL}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": noegle, "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ inlineData: tilInlineData(fotoDataUrl) }, { text: PROMPT }] }],
    }),
  });
  if (!svar.ok) {
    throw new Error(`trial-analyse: HTTP ${svar.status} — ${(await svar.text()).slice(0, 200)}`);
  }
  const data = (await svar.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const tekst = data.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
  if (!tekst) throw new Error("trial-analyse: intet tekstsvar");

  const raa = parseJson<{
    kategori?: string;
    maerke?: string | null;
    farve?: string | null;
    stand?: string;
    beskrivelse?: string;
  }>(tekst);

  const skala = vinted.standskala as readonly string[];
  return {
    kategori: (raa.kategori ?? "").trim().toLowerCase() || "tøj",
    maerke: raa.maerke?.trim() || null,
    farve: raa.farve?.trim() || null,
    stand: skala.includes(raa.stand ?? "") ? raa.stand! : "God",
    beskrivelse: (raa.beskrivelse ?? "").trim().slice(0, 200),
    costDkk: VISION_COST_DKK,
  };
}
