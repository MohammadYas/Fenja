// Claude-implementering af TextProvider (D-1, C-3, D-3). Kræver ANTHROPIC_API_KEY —
// tests kører mod mock. Modeller kan overstyres med env.

import Anthropic from "@anthropic-ai/sdk";
import type {
  AnnonceTekst,
  AnnonceTekstInput,
  LabelInput,
  LabelResultat,
  TextProvider,
  TroskabsInput,
  TroskabsResultat,
} from "./text";

const TEKST_MODEL = process.env.ANTHROPIC_TEKST_MODEL ?? "claude-sonnet-5";
const VISION_MODEL =
  process.env.ANTHROPIC_VISION_MODEL ?? "claude-haiku-4-5-20251001";

// Skøn i kr. pr. kald — kalibreres i S12 (NFR-11)
const TEKST_COST_DKK = 0.15;
const VISION_COST_DKK = 0.05;

function billedBlok(url: string): Anthropic.ImageBlockParam {
  return { type: "image", source: { type: "url", url } };
}

function foersteTekst(svar: Anthropic.Message): string {
  const blok = svar.content.find((b) => b.type === "text");
  if (!blok || blok.type !== "text") throw new Error("Claude: intet tekstsvar");
  return blok.text;
}

function parseJson<T>(tekst: string): T {
  const match = /\{[\s\S]*\}/.exec(tekst);
  if (!match) throw new Error("Claude: intet JSON i svaret");
  return JSON.parse(match[0]) as T;
}

export class AnthropicTextProvider implements TextProvider {
  private klient: Anthropic;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY mangler — brug mock-providers uden nøgler");
    }
    this.klient = new Anthropic();
  }

  async genererAnnonceTekst(input: AnnonceTekstInput): Promise<AnnonceTekst> {
    const svar = await this.klient.messages.create({
      model: TEKST_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Skriv en Vinted-annonce på dansk for et stykke tøj. Naturligt "privat sælger"-sprog — konkret og ærligt, IKKE reklamesprog, ingen emojis, ingen udråbstegn-jubel.

Data:
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
          }

Krav:
1. Titlen skal være søgbar: mærke + type + størrelse.
2. Er der oplyst fejl/slid, SKAL det nævnes tydeligt i beskrivelsen.
3. Prisforslag som interval i hele kroner med kort begrundelse ("lignende ... ligger typisk X–Y kr."). Det er et forslag, aldrig en garanti.${
            input.markedsinterval
              ? " Brug markedstallene som virkelighedstjek — de er udbudspriser (ikke salgspriser), så færdige handler lander ofte lidt under; vægt stand og oplyste fejl."
              : ""
          }

Svar KUN med JSON: {"titel": string, "beskrivelse": string, "soegeord": string[], "prisFra": number, "prisTil": number, "prisBegrundelse": string}`,
        },
      ],
    });

    const data = parseJson<{
      titel: string;
      beskrivelse: string;
      soegeord: string[];
      prisFra: number;
      prisTil: number;
      prisBegrundelse: string;
    }>(foersteTekst(svar));

    return {
      titel: data.titel,
      beskrivelse: data.beskrivelse,
      soegeord: data.soegeord,
      prisforslagDkk: { fra: data.prisFra, til: data.prisTil },
      prisBegrundelse: data.prisBegrundelse,
      costDkk: TEKST_COST_DKK,
    };
  }

  async vurderTroskab(input: TroskabsInput): Promise<TroskabsResultat> {
    const svar = await this.klient.messages.create({
      model: VISION_MODEL,
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: [
            billedBlok(input.aegteUrl),
            billedBlok(input.genereretUrl),
            {
              type: "text",
              text: `Billede 1 er et ægte foto af et stykke tøj. Billede 2 er en genereret visualisering af en person, der bærer tøjet. Vurdér om billede 2 viser PRÆCIS det samme stykke tøj: samme print/grafik, samme farve, samme snit og længde, og om synligt slid/fejl er bevaret. Svar KUN med JSON: {"score": number mellem 0 og 1, "begrundelse": string på dansk}`,
            },
          ],
        },
      ],
    });

    const data = parseJson<{ score: number; begrundelse: string }>(
      foersteTekst(svar),
    );
    return { score: data.score, begrundelse: data.begrundelse, costDkk: VISION_COST_DKK };
  }

  async aflaesLabel(input: LabelInput): Promise<LabelResultat> {
    const svar = await this.klient.messages.create({
      model: VISION_MODEL,
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            billedBlok(input.labelFotoUrl),
            {
              type: "text",
              text: `Dette er et foto af et vaskemærke/label i et stykke tøj. Aflæs materiale og vaskeanvisning hvis muligt. Svar KUN med JSON: {"tekst": string på dansk eller null hvis ulæseligt}`,
            },
          ],
        },
      ],
    });

    const data = parseJson<{ tekst: string | null }>(foersteTekst(svar));
    return { tekst: data.tekst, costDkk: VISION_COST_DKK };
  }
}
