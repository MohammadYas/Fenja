// Content-værktøjer til admin (ejer-ordre 21/8): færdige prompts til Claude/
// ChatGPT, så ejeren kan producere marketing-content på minutter. Alle fakta
// (pris, trin, URL) er afledt af config + copy, så prompten aldrig lyver om
// produktet. Én kilde — nye kanaler tilføjes her.

import { abonnementer, site } from "@/lib/config";

const FAKTA = `Om produktet (fakta — brug dem præcist, digt aldrig nye tal eller løfter):
- Selja (${site.baseUrl}) er en dansk web-app til private Vinted-sælgere.
- Man uploader 2-4 mobilfotos af et stykke tøj og får: rensede salgsfotos, en AI-visualisering af tøjet båret (altid tydeligt mærket som genereret) og en færdig annoncetekst med prisforslag — klar til copy-paste på Vinted, på cirka 2 minutter.
- Prisforslag bygger på ægte Vinted-priser. Abonnenter får Smart Salgsplan: hvad skal sælges nu, sættes ned eller vente — også på mail hver mandag.
- Priser: Plus ${abonnementer.tiers[0]!.prisDkkPrMd} kr./md. (${abonnementer.tiers[0]!.annoncerPrMd} annoncer), Pro ${abonnementer.tiers[1]!.prisDkkPrMd} kr./md. (${abonnementer.tiers[1]!.annoncerPrMd} annoncer). Ingen binding.
- Tone: dansk, konkret, ærlig, lavmælt selvsikker. Aldrig "revolutionerende", aldrig udråbstegn i bunker, ingen fabrikerede anmeldelser eller opdigtede brugere.
- Ærlighed er brandet: ægte foto er altid billede 1 på Vinted; visualiseringen er et mærket supplement. Fejl og slid nævnes altid ærligt.`;

export type ContentPrompt = {
  id: string;
  titel: string;
  beskrivelse: string;
  prompt: string;
};

export const CONTENT_PROMPTS: ContentPrompt[] = [
  {
    id: "tiktok",
    titel: "TikTok/Reels-manus",
    beskrivelse: "30-45 sekunders manus med hook, demo og rolig CTA.",
    prompt: `${FAKTA}

Skriv 3 forskellige manus til en TikTok/Reels-video på 30-45 sekunder om Selja, på dansk.
Format pr. manus: HOOK (første 2 sekunder, sagt til kamera), derefter replikker + hvad der vises på skærmen (skærmoptagelse af appen eller tøjfotos), og til sidst en rolig CTA til selja.dk.
Vinkler: (1) "jeg solgte min bunke glemt tøj", (2) før/efter på ét stykke tøj, (3) "det tager 2 minutter"-demoen.
Tal som en ven, ikke som en reklame. Ingen påstande om konkrete brugere eller tal, vi ikke har.`,
  },
  {
    id: "instagram",
    titel: "Instagram-opslag",
    beskrivelse: "Caption + forslag til billede, 3 varianter.",
    prompt: `${FAKTA}

Skriv 3 Instagram-captions på dansk om Selja (maks 4 linjer + 3-5 relevante danske hashtags).
Til hver caption: foreslå hvilket billede der passer (fx før/efter af et tøjfoto, skærmbillede af en færdig annonce).
Én skal tale til folk med en "sælge-bunke" liggende, én til studerende med stram økonomi, én til den øvede Vinted-sælger.`,
  },
  {
    id: "reddit",
    titel: "Reddit/Facebook-gruppe-opslag",
    beskrivelse: "Ærligt community-opslag uden salgstale.",
    prompt: `${FAKTA}

Skriv et opslag på dansk til en Facebook-gruppe/subreddit om genbrug og Vinted-salg.
Krav: fuldt ærligt om at jeg selv har bygget Selja (ingen skjult reklame — det ville skade brandet og bryde gruppernes regler). Fortæl hvad det gør, hvad det koster, og stil ét åbent spørgsmål til gruppen om deres største tidsrøver ved Vinted-salg.
Maks 150 ord, ingen links i første sætning, ydmyg tone.`,
  },
  {
    id: "blog",
    titel: "SEO-blogindlæg",
    beskrivelse: "Guide-udkast der kan lande på /laer.",
    prompt: `${FAKTA}

Skriv et udkast til en dansk guide på 600-900 ord: "Sådan sælger du dit brugte tøj hurtigere på Vinted".
Struktur: kort intro, 5-7 konkrete afsnit med handlingsanvisninger (fotos, titel, pris, sæson, ærlighed om fejl), afslut med ét kort, ærligt afsnit om hvordan Selja automatiserer fotos + tekst.
Skriv til søgeintentionen "sælg tøj på vinted tips". Ingen keyword-stuffing — naturligt dansk.`,
  },
  {
    id: "mail",
    titel: "Nyhedsmail til ventelisten",
    beskrivelse: "Kort lanceringsmail, én CTA.",
    prompt: `${FAKTA}

Skriv en kort dansk mail (maks 120 ord) der fortæller at Selja er live på selja.dk.
Emne + brødtekst. Én CTA-knap-tekst. Tonen er personlig afsender ("jeg har bygget..."), ærlig og uden pres. Nævn prisen ærligt.`,
  },
];
