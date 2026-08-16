# Nyt item · varetype og mærkesøgning

**Status:** Godkendt retning, skrevet 16. august 2026
**Produkt:** Selja
**Fokus:** Første trin i Nyt item samt en bedre mærkesøgning

## 1. Formål

Brugeren skal vælge, hvad der sælges, før billeder og øvrige oplysninger
udfyldes. Valget skal være enkelt for brugeren og samtidig give Seljas
billed- og tekstpipeline en stabil kategori. Det nuværende fritekstfelt til
kategori fjernes.

Mærkefeltet må ikke bruge browserens `datalist`, som giver en uens og dårlig
oplevelse på Windows og mobil. Selja får sin egen søgbare combobox.

## 2. Afgrænsning

Første launch dækker Seljas modekatalog:

- voksen- og børnetøj;
- sko;
- tasker;
- accessories.

Bolig, elektronik, bøger, hobby og Vinteds øvrige katalog er ikke en del af
Seljas produkt ved denne launch.

Varetyperne skal være brede og praktiske. Selja bygger ikke en kopi af alle
Vinteds mikro-kategorier.

## 3. Nyt formularflow

`/nyt-item` er fortsat én side med tre nummererede sektioner:

1. `Hvad sælger du?`
2. `Fotos`
3. `Om varen`

Trin 1 omtaler ikke AI. Hjælpeteksten forklarer kun, at det præcise valg giver
en bedre og mere korrekt annonce.

Brugeren vælger først en gruppe og derefter en varetype. Når varetypen er
valgt, bliver valget stående som en tydelig valgt tilstand og kan ændres før
indsendelse. Der tilføjes ikke frem/tilbage-knapper eller separate wizard-
sider.

## 4. Modekatalog

Selja bruger disse brede brugerrettede valg:

### Tøj

- Toppe og T-shirts
- Skjorter og bluser
- Strik og cardigans
- Sweatshirts og hoodies
- Bukser og jeans
- Shorts
- Nederdele
- Kjoler og heldragter
- Jakker, blazere og veste
- Frakker og overtøj
- Sportstøj
- Badetøj
- Undertøj og nattøj

### Sko

- Sneakers
- Sko
- Støvler
- Sandaler

### Tasker

- Hånd- og skuldertasker
- Rygsække
- Andre tasker

### Accessories

- Bælter, tørklæder og hovedbeklædning
- Smykker, ure og solbriller
- Andre accessories

### Børn og baby

- Tøj
- Overtøj
- Sko
- Accessories

Hver varetype har et stabilt internt id, en dansk label, en gruppe og en
promptfamilie. Børne- og babyvarer bruger altid en produktvisning uden en
genereret person.

## 5. Fælles katalogkontrakt

Kataloget ligger i `lib/data/varetyper.ts` og er den fælles sandhed for UI,
API-validering og promptvalg. En post har denne form:

```ts
type Varetype = {
  id: string;
  label: string;
  kategori: string;
  gruppeId: string;
  promptFamilie:
    | "overdel"
    | "underdel"
    | "kjole"
    | "overtoej"
    | "sport-bad"
    | "undertoej-nattoej"
    | "sko"
    | "taske"
    | "accessory"
    | "barn-produkt";
};
```

`label` er teksten i vælgeren. `kategori` er den entydige danske tekst, der
gemmes og sendes videre; de er ens undtagen for de korte valg under `Børn og
baby`, hvor kategorien fx er `Børne- og babytøj`.

Klienten sender `varetypeId` til `POST /api/items`. Serveren afviser ukendte
id'er, slår den kanoniske kategori op og gemmer den i det eksisterende
`items.category`-felt. Der kræves ingen databasemigration.

Pipelinevalg forsøger først et eksakt opslag af den kanoniske kategori og bruger
det eksisterende nøgleordsbaserede fallback til ældre items. De nuværende
prompts fortsætter indtil ejeren leverer det nye promptbibliotek; katalogets
promptfamilier bliver de stabile pladser, de nye prompts senere kobles på.

## 6. Mærke-combobox

`Mærke` bruger en Selja-komponent og ikke et native `datalist`-element.

Komponenten skal:

- søge lokalt og øjeblikkeligt i mindst 300 relevante modebrands;
- normalisere store/små bogstaver, mellemrum, accenter, apostroffer og danske
  bogstaver, så fx `samsoe` finder `Samsøe Samsøe`, og `levis` finder
  `Levi's`;
- rangere eksakt match før start-match, ord-start og almindeligt delmatch;
- vise højst 10 søgeresultater ad gangen;
- vise et lille sæt populære mærker, når feltet er tomt;
- understøtte piletaster, Enter, Escape, Tab og muse-/touchvalg;
- bruge de korrekte `combobox`, `listbox` og `option`-roller;
- tillade et eget mærkenavn, selv om det ikke findes i listen;
- tilbyde en tydelig `Intet mærke`-mulighed.

Søgelogikken er en ren funktion i `lib/data/maerker.ts`, mens interaktion og
ARIA ligger i en fokuseret klientkomponent. Der tilføjes ingen ekstern
søgetjeneste eller afhængighed.

## 7. Validering og fejl

Formularen må ikke begynde uploads, før en gyldig varetype, mærke eller
`Intet mærke`, størrelse, stand og helhedsfoto er valgt. Mangler trin 1, vises
en konkret fejl ved varetypevælgeren, og fokus flyttes til gruppen.

API'et validerer `varetypeId` uafhængigt af klienten og svarer med HTTP 400
ved et ukendt id. Eksisterende items uden et kanonisk katalogmatch skal fortsat
kunne vises og genereres via det nuværende fallback.

## 8. Filer og ansvar

- `lib/data/varetyper.ts`: grupper, varetyper, opslag og promptfamilier.
- `lib/data/maerker.ts`: udvidet brandkatalog, normalisering og rangering.
- `components/varetype-vaelger.tsx`: gruppe- og varetypevalg.
- `components/maerke-combobox.tsx`: søgning, tastatur og ARIA.
- `app/(app)/nyt-item/page.tsx`: samler de tre trin og sender `varetypeId`.
- `app/api/items/route.ts`: servervalidering og kanonisk kategori.
- `lib/pipeline/skabeloner.ts`: eksakt promptfamilie før legacy-fallback.
- `lib/copy/da.ts`: al ny brugervendt tekst.

## 9. Testkrav

Implementeringen følger red–green–refactor og skal bevise:

- alle varetyper har unikke id'er, gyldig gruppe og promptfamilie;
- alle fem grupper kan vælges og viser deres egne varetyper;
- formularen viser trin 1, 2 og 3 og indeholder ikke et kategori-fritekstfelt;
- `datalist` er fjernet;
- mærkesøgningen håndterer `samsoe`, `levis`, accenter og rangering korrekt;
- fritekst og `Intet mærke` bevares;
- ukendte varetype-id'er afvises af API'et;
- en gyldig varetype bliver til den forventede kanoniske kategori;
- ældre kategorier rammer pipeline-fallback;
- den fulde test-, typecheck-, lint- og buildpakke består.

## 10. Ikke med i denne leverance

- ejerens kommende komplette Gemini-prompttekster;
- ændringer til kreditpriser eller kreditregnskab;
- kontakt/admin-systemet;
- den fulde supplier-butik;
- Vinteds ikke-modekategorier;
- automatisk synkronisering med Vinteds katalog eller mærkedatabase.

## 11. Acceptkriterier

Leverancen er færdig, når en bruger kan vælge en bred, korrekt modevaretype i
trin 1, fortsætte med de eksisterende fotos og oplysninger og finde eller
skrive et mærke i Seljas egen combobox. Valget skal nå server og promptvalg
uden fritekstkategori, samtidig med at gamle items stadig virker.
