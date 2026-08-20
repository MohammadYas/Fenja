// DeepSeek-implementering af TextProvider (ejer-beslutning 2026-08-19:
// annoncetekst skrives af DeepSeek med avanceret prompt — ikke Claude).
// DeepSeeks API kan ikke se billeder, så vision-opgaverne (troskab K1 +
// label-aflæsning D-3) køres mod Gemini flash — nøglen findes i forvejen.
// Kræver DEEPSEEK_API_KEY + GEMINI_API_KEY — tests kører mod mock (NFR-5).
// Modeller kan overstyres med env.

import type {
  AnnonceTekst,
  AnnonceTekstInput,
  LabelInput,
  LabelResultat,
  TextProvider,
  TroskabsInput,
  TroskabsResultat,
} from "./text";

const DEEPSEEK_API = "https://api.deepseek.com/chat/completions";
const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta";

const TEKST_MODEL = process.env.DEEPSEEK_TEKST_MODEL ?? "deepseek-chat";
// gemini-2.5-flash er nedlagt for nye brugere (HTTP 404, fundet 20/8 —
// troskabstjekket kasserede derfor ALLE billeder); 3.6-flash er afløseren
const VISION_MODEL = process.env.GEMINI_VISION_MODEL ?? "gemini-3.6-flash";

// Skøn i kr. pr. kald — kalibreres i S12 (NFR-11). DeepSeek er markant
// billigere end Claude; Gemini flash-vision ligger på samme lave niveau.
const TEKST_COST_DKK = 0.03;
const VISION_COST_DKK = 0.02;

// Avanceret prompt (ejer-krav): fast persona + stilregler som system-prompt,
// så alle annoncer holder samme "privat sælger"-tone; data og krav i user-turn.
const SYSTEM_PROMPT = `Du skriver Vinted-annoncer på dansk for private sælgere. Du er selv en erfaren Vinted-sælger — ikke en marketingtekstforfatter.

Stilregler (ufravigelige):
- Naturligt, konkret hverdagssprog. Skriv som et menneske, der sælger sit eget tøj.
- ALDRIG reklamesprog, superlativer eller sælgerfloskler ("fantastisk", "must-have", "skønt").
- Ingen emojis, ingen udråbstegn-jubel, ingen hashtags.
- Kort og skimbart: 2-4 korte afsnit, det vigtigste først.
- Ærlighed er ikke til forhandling: oplyste fejl/slid SKAL stå tydeligt i beskrivelsen, aldrig pakket ind eller bagatelliseret.
- Nævn kun det, dataene understøtter — find ALDRIG på materiale, pasform eller detaljer.

Titel: søgbar, i rækkefølgen mærke + type + evt. kendetegn + størrelse. Ingen pynt.
Søgeord: 4-8 ord/fraser, som købere faktisk søger på (mærke, type, farve, stil).
Pris: interval i hele kroner med kort, nøgtern begrundelse. Det er et forslag, aldrig en garanti. Markedstal er udbudspriser — færdige handler lander ofte lidt under; vægt stand og oplyste fejl.

Svar KUN med gyldig JSON i præcis dette format:
{"titel": string, "beskrivelse": string, "soegeord": string[], "prisFra": number, "prisTil": number, "prisBegrundelse": string}`;

function parseJson<T>(tekst: string): T {
  const match = /\{[\s\S]*\}/.exec(tekst);
  if (!match) throw new Error("deepseek: intet JSON i svaret");
  return JSON.parse(match[0]) as T;
}

// Ejer-rapport 20/8: tjekket gav 1,00 til ALT — også en top gengivet som kort
// kjole. Skalaen skal bruges, og tvivl skal trække ned, ellers er tjekket pynt.
const SVAR_FORMAT =
  `Vær STRENG og brug hele skalaen: 1.0 kun når du ikke kan pege på ét eneste ` +
  `afvigende træk, 0.6-0.8 ved små afvigelser, under 0.5 ved tydelige. Er du i ` +
  `tvivl, giv den lavere score. ` +
  `Svar KUN med JSON: {"score": number mellem 0 og 1, "begrundelse": string på dansk}`;

/**
 * Troskabs-spørgsmålet afhænger af visningens slags (ejer-rapport 20/8: kun 1
 * af 3 billeder leveret). On-model-tjekket kræver at tøjet BÆRES — bøjle-reglen
 * fra runde 9. Men gulv/bøjle/nærbillede er PRODUKT-visninger, som brugeren
 * selv har bestilt UDEN person; på dem er "ingen person" det rigtige svar, og
 * det gamle spørgsmål gav dem derfor altid score 0 og kasserede hvert billede.
 */
export function troskabsSpoergsmaal(slags: "onmodel" | "produkt"): string {
  if (slags === "produkt") {
    return `Billede 1 er et ægte foto af et stykke tøj. Billede 2 er en genereret produktvisning af det SAMME stykke tøj — lagt frem, hængt på bøjle eller som nærbillede. Der er MED VILJE ingen person i billede 2; det er korrekt og må ALDRIG trække scoren ned. Vurdér to ting: (1) Er det præcis samme stykke tøj — samme type, samme længde, samme print/grafik, samme farve og snit, og er synligt slid/fejl bevaret? (2) Hviler tøjet fysisk på noget virkeligt — fladt på gulv/seng eller på en synlig bøjle? Svæver tøjet frit i luften, er det formet af en usynlig krop, eller ligner det en spøgelsesmannequin, er scoren ALTID under 0.3. ${SVAR_FORMAT}`;
  }
  return `Billede 1 er et ægte foto af et stykke tøj. Billede 2 er en genereret visualisering af en person, der BÆRER tøjet. Vurdér tre ting: (1) Er det PRÆCIS samme stykke tøj — samme print/grafik, samme farve, samme snit, og er synligt slid/fejl bevaret? (2) Er tøjets TYPE og LÆNGDE uændret? En top må ALDRIG være blevet til en kjole eller tunika, og kanten skal slutte samme sted som i billede 1 — er typen eller længden ændret, er scoren ALTID under 0.3. (3) Bæres tøjet NATURLIGT på kroppen med arme/ben inde i det, og er personen ellers fornuftigt påklædt (en overdel bæres med bukser eller nederdel, aldrig bare ben eller undertøj)? Hænger tøjet på en bøjle, holdes det frem foran kroppen, eller svæver det tomt, er scoren ALTID 0 uanset hvor godt tøjet matcher. ${SVAR_FORMAT}`;
}

/** Reference-billeder til Gemini-vision — data-URLs pakkes ud, http-URLs hentes */
async function tilInlineData(
  url: string,
): Promise<{ mimeType: string; data: string }> {
  if (url.startsWith("data:")) {
    const match = /^data:([^;,]+);base64,(.+)$/.exec(url);
    if (!match) throw new Error("gemini-vision: ugyldig data-URL");
    return { mimeType: match[1]!, data: match[2]! };
  }
  const svar = await fetch(url);
  if (!svar.ok) {
    throw new Error(`gemini-vision: kunne ikke hente billede (HTTP ${svar.status})`);
  }
  return {
    mimeType: svar.headers.get("content-type") ?? "image/jpeg",
    data: Buffer.from(await svar.arrayBuffer()).toString("base64"),
  };
}

export class DeepSeekTextProvider implements TextProvider {
  private deepseekNoegle: string;
  private geminiNoegle: string;

  constructor() {
    const deepseek = process.env.DEEPSEEK_API_KEY;
    const gemini = process.env.GEMINI_API_KEY;
    if (!deepseek) {
      throw new Error("DEEPSEEK_API_KEY mangler — brug mock-providers uden nøgler");
    }
    if (!gemini) {
      throw new Error("GEMINI_API_KEY mangler — brug mock-providers uden nøgler");
    }
    this.deepseekNoegle = deepseek;
    this.geminiNoegle = gemini;
  }

  async genererAnnonceTekst(input: AnnonceTekstInput): Promise<AnnonceTekst> {
    const bruger = `Skriv annoncen for dette stykke tøj:
- Mærke: ${input.maerke}
- Kategori: ${input.kategori}
- Størrelse: ${input.stoerrelse}
- Stand (Vinteds skala): ${input.stand}
- Fejl/slid oplyst af sælger: ${input.fejlBeskrivelse ?? "ingen"}
- Label-info: ${input.labelTekst ?? "ukendt"}
- Købspris: ${input.koebsprisDkk != null ? `${input.koebsprisDkk} kr.` : "ukendt"}${
      input.markedsinterval
        ? `\n- Markedstal fra aktive Vinted-annoncer for "${input.markedsinterval.soegetekst}" (${input.markedsinterval.antal} stk., høstet ${input.markedsinterval.hoestetDato}): typisk ${input.markedsinterval.p25Dkk}–${input.markedsinterval.p75Dkk} kr., median ${input.markedsinterval.medianDkk} kr.`
        : ""
    }`;

    const svar = await fetch(DEEPSEEK_API, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.deepseekNoegle}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: TEKST_MODEL,
        max_tokens: 1024,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: bruger },
        ],
      }),
    });
    if (!svar.ok) {
      const tekst = (await svar.text()).slice(0, 300);
      throw new Error(`deepseek: HTTP ${svar.status} — ${tekst}`);
    }
    const data = (await svar.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const indhold = data.choices?.[0]?.message?.content;
    if (!indhold) throw new Error("deepseek: intet tekstsvar");

    const parsed = parseJson<{
      titel: string;
      beskrivelse: string;
      soegeord: string[];
      prisFra: number;
      prisTil: number;
      prisBegrundelse: string;
    }>(indhold);

    return {
      titel: parsed.titel,
      beskrivelse: parsed.beskrivelse,
      soegeord: parsed.soegeord,
      prisforslagDkk: { fra: parsed.prisFra, til: parsed.prisTil },
      prisBegrundelse: parsed.prisBegrundelse,
      costDkk: TEKST_COST_DKK,
    };
  }

  async vurderTroskab(input: TroskabsInput): Promise<TroskabsResultat> {
    const tekst = await this.geminiVision([
      { inlineData: await tilInlineData(input.aegteUrl) },
      { inlineData: await tilInlineData(input.genereretUrl) },
      { text: troskabsSpoergsmaal(input.slags ?? "onmodel") },
    ]);
    const data = parseJson<{ score: number; begrundelse: string }>(tekst);
    return { score: data.score, begrundelse: data.begrundelse, costDkk: VISION_COST_DKK };
  }

  async aflaesLabel(input: LabelInput): Promise<LabelResultat> {
    const tekst = await this.geminiVision([
      { inlineData: await tilInlineData(input.labelFotoUrl) },
      {
        text: `Dette er et foto af et vaskemærke/label i et stykke tøj. Aflæs materiale og vaskeanvisning hvis muligt. Svar KUN med JSON: {"tekst": string på dansk eller null hvis ulæseligt}`,
      },
    ]);
    const data = parseJson<{ tekst: string | null }>(tekst);
    return { tekst: data.tekst, costDkk: VISION_COST_DKK };
  }

  private async geminiVision(
    parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[],
  ): Promise<string> {
    const svar = await fetch(`${GEMINI_API}/models/${VISION_MODEL}:generateContent`, {
      method: "POST",
      headers: {
        "x-goog-api-key": this.geminiNoegle,
        "content-type": "application/json",
      },
      body: JSON.stringify({ contents: [{ parts }] }),
    });
    if (!svar.ok) {
      const tekst = (await svar.text()).slice(0, 300);
      throw new Error(`gemini-vision: HTTP ${svar.status} — ${tekst}`);
    }
    const data = (await svar.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const tekst = data.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
    if (!tekst) throw new Error("gemini-vision: intet tekstsvar");
    return tekst;
  }
}
