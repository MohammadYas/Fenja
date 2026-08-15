// Fase B (Tillæg B, UR-3): typer for brief → scripts. Claude omsætter en
// B2B-brief til flere UGC-scriptvarianter (hook/beats/dialog/CTA); hvert
// script bliver derefter til struktureret PromptInput for prompt-compileren.

import type { VideoFormat } from "./provider";

/** B2B-briefen — det strukturerede grundlag for scriptgenerering */
export type VideoBrief = {
  /** Virksomhedens navn, som det må nævnes i annoncen */
  virksomhed: string;
  /** Produktet/ydelsen annoncen sælger */
  produkt: string;
  maalgruppe: string;
  /** Kernebudskabet — den ene sætning annoncen skal lande */
  kernebudskab: string;
  /** Konkrete pointer/fordele scripts må trække på */
  pointer: string[];
  /** Tonen, fx "jordnær og direkte" */
  tone: string;
  /** Klipvarighed pr. script i sekunder (Seedance: 4–15 s) */
  varighedSek: number;
  format: VideoFormat;
  /** Antal scriptvarianter der ønskes af briefen */
  antalVarianter: number;
};

/** Ét beat i scriptet: hvad der sker, og hvad der evt. siges imens */
export type ScriptBeat = {
  /** Hvad der sker visuelt i beatet */
  handling: string;
  /** Replik i beatet — null når beatet er uden tale */
  replik: string | null;
};

/** Ét UGC-script — én variant af briefen, klar til promptkompilering */
export type UgcScript = {
  /** Stabilt id sat af generatoren, fx "brief-slug-v1" — aldrig tilfældigt */
  id: string;
  /** Åbningslinjen, der skal fange inden for de første sekunder */
  hook: string;
  beats: ScriptBeat[];
  /** Afsluttende call-to-action */
  cta: string;
  varighedSek: number;
  format: VideoFormat;
};
