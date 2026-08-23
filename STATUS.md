# STATUS
Sidst opdateret: 2026-08-23 af Claude Code

## Denne session (23/8) — billedmodellen vælges i admin, mærkningskravet ude

**EJER-BESLUTNING 23/8 (a): 0 mærkning i de leverede billedfiler.** FR-4
(SPEC §4) og C-4 (HANDOFF §4) er UDGÅET — hverken synligt badge, metadata
eller vandmærke i filerne. Ejeren har taget beslutningen bevidst og udskudt
mærkningen til en senere selvstændig opgave. Fjernet i `SPEC.md` (FR-4,
K2-målet, §8.2-reglen, flow-trin 4, §11, §12), `HANDOFF.md` (C-4, §2.2.6) og
`SELJA.md`. UI-teksten siger fortsat, at visualiseringerne er genererede —
den er ikke rørt, for det er oplysning, ikke vandmærke.

**EJER-BESLUTNING 23/8 (b): billedmodellen vælges i ADMIN-PANELET.** Ordren
kom af, at Googles SynthID sidder i pixels og følger med uanset leverandør —
også hvis nano-banana køres via fal. Skal SynthID væk, skal modellen skiftes,
ikke leverandøren.
- **Katalog i `lib/config.ts`** (`billedModeller`): gemini-flash, gemini-pro,
  flux-2-pro, qwen-edit-plus, seedream-45 — hver med pris-skøn, note og en
  ærlig vandmærke-linje. Providerne hårdkoder ALDRIG en model.
- **Valget bor i databasen** (`indstillinger`-tabellen, migration
  `20260823100000`), læses af `lib/admin/billedmodel-valg.ts` med 30 sek.
  cache. Fejler opslaget (migration ikke kørt, DB nede) bruges standarden —
  en tabt leverance er værre end et forkert modelvalg.
- **`/admin` → Billedmodel**: radioliste pr. formål (rens/visualisering) med
  pris og vandmærke ved hver model. Skift virker uden deploy.
- **`lib/providers/fal.ts` skrevet om**: tager model+cost udefra som
  Gemini-provideren, kalder edit-endpoints med `{ prompt, image_urls,
  image_size }`, uploader data-URL-referencer til fal's lager først (fal kan
  ikke læse vores private storage), og oversætter C-3-retryens strammere
  vægt til en skærpet prompt — edit-endpoints har ingen `strength`.
- **`hentImageProvider` falder tilbage**, hvis nøglen til den valgte
  leverandør mangler i miljøet, og logger det.
- **Gate 1-scriptet** kører nu tvekamp mellem to katalogmodeller;
  standarden er `gemini-pro` mod `flux-2-pro` (`--modeller a,b` vælger selv).
- **461 tests grønne** (15 nye: `fal.test.ts`, `billedmodel.test.ts`),
  lint + typecheck rene.
- **Migrationen ER kørt** (23/8, via Composio mod projekt cpqsmtaledmjzirfeztp):
  `indstillinger` findes, RLS til, 0 policies — kun service-rollen kommer til.
- **`FAL_KEY` tilføjet til `trigger.config.ts`**. Fanget inden skiftet: uden
  den ville et fal-valg i admin fejle STILLE i jobbet (pipelinen kører på
  Trigger.dev's egne maskiner), koden falde tilbage til Gemini, og
  billederne stadig bære SynthID. Nøglen skal sættes i `.env.local` +
  deployes til Trigger.dev, og i Netlify.
- **`scripts/model-tvekamp.ts`** (ny): samme foto, samme prompt, én kolonne
  pr. model + originalen, målt cost og svartid, billederne indlejret i arket.
  `--mock` kører tørt uden nøgler. Gate 1 er stadig den formelle dom.
- **TVEKAMPEN ER KØRT — TO GANGE (23/8).** Første kørsel var på et FORKERT
  grundlag: `scripts/model-tvekamp.ts` brugte `bygOnModelPrompt` (Gate 1-
  scriptets preset-prompt, ~800 tegn) i stedet for pipelinens egen
  `bygOnModelPromptMedSkabelon` (4529 tegn med spejl-framing, kategori-
  skabelon, hjem-anker og eksplicit farve-/længdekrav). Resultatet blev rene
  studiebilleder i stedet for SPEJLBILLEDER — ejeren fangede det med det
  samme: "det ligner intet af det på forsiden, det skal jo være
  spejlbilleder". **Scriptet er rettet** og kalder nu pipelinens bygger med
  `--visning spejl` som standard (+ `--kategorier`, `--vaegt`).
  Anden kørsel, 3 plagg × 3 modeller, visning spejl, vægt 0,65:
  - **FLUX.2 [pro]: 3/3 godkendt.** Ægte spejlbilleder i forsidens stil —
    parket, garderobeskab, ansigtet skjult bag telefonen. Farverne rammer nu,
    og **kjolelængden holder** (den fejlede i første kørsel). Rest: kjolens
    snoede stropper blev glatte, denim-vasken trækker en anelse dybere.
  - **Seedream 4.5: 0/3, men markant bedre.** Flotte spejlbilleder. Falder på
    snit og påklædningsregler: cardigan båret på BARE BEN (bryder "aldrig bare
    ben"), lige ankeljeans blev vide flared, og den lange kjole blev sat uden
    på et par jeans, så den læses som top + bukser.
  - **Qwen Image Edit Plus: 0/3, værre end før.** Laver stadig ikke
    spejlbillede — og DIGTER tryk: et farvet solansigt med teksten
    "ENKER'NES" på cardiganet, heldækkende tegneserietryk på jeansene, sorte
    kruseduller på kjolen. Diskvalificeret.
  - 18 kald i alt, alle igennem i første forsøg, 5,40 kr. målt på fal.
  - Katalogets `note`-felter er rettet efter ANDEN kørsel.
- **FORSIDENS EGNE PROMPTS KØRT PÅ FLUX (23/8).** `scripts/generer-katalog.ts`
  er gjort model-uafhængig: et `--model` der starter med `fal-ai/` kalder fal's
  tekst-til-billede, alt andet er Gemini som før. Tre af forsidens prompts
  (p15 spejl-strik, p2 entré-cardigan, p4 soveværelse-kjole) kørt uændret:
  - **P15: FLUX slår Gemini på realisme.** Dansk lyskontakt, radiator,
    plankegulv, tissue på gulvet, kabel langs fodpanelet. MEN prompten bad om
    "bright, tidy" og "neatly made bed" — FLUX gav rodet og dæmpet.
  - **P2: Gemini vinder.** Prompten har "a deep neckline" på forbudslisten;
    FLUX gav en dybere udskæring, mere stylet hår, smallere mørkere gang.
  - **P4: dødt løb.** Begge overbevisende; FLUX igen en anelse dybere hals.
  - **MØNSTER:** FLUX er på Geminis niveau på LOOK, men følger de negative
    instrukser mindre stramt — den glider mod "influencer". Netop dét er, hvad
    KROP_OG_POSITUR-reglerne findes for at forhindre. Bruges FLUX til
    marketingserien, skal forbudslisterne skærpes eller billederne håndplukkes.
  - Sidegevinst: forsideserien kan nu genereres UDEN SynthID, hvis den skal om.
- **LÆRING (gentag den ikke):** et testscript skal kalde den prompt-bygger,
  pipelinen bruger — ikke en simplere nabo. Den første dom var uretfærdig mod
  alle tre modeller, og den kostede 2,70 kr. og en runde hos ejeren.
- **TIL EJEREN:** (1) fotoene er stadig repoets AI-genererede FØR-billeder —
  rigtige telefonfotos er den eneste rigtige dom; (2) K1 kørte ikke, det var
  mit øje; (3) C-3-retryen med strammere vægt er stadig uprøvet;
  (4) Nano Banana Pro var ikke med (ingen GEMINI_API_KEY i miljøet).

## Denne session (22/8, runde 2) — cardigan først, forside-angreb, TESTPLAN.md

Ejer-ordrer 22/8 (fortsat): cardigan-eksemplet skal stå først, forsiden skal
angribes for mere konvertering, og der skal en testliste før TikTok-slides.

1. **Cardigan-parret er flyttet øverst** i `vinted.foerEfter.par` — det er
   dermed både første chip og standard-eksemplet i hero-panelet.
2. **Forside-angreb (konvertering):**
   - `priority` på FØR/EFTER-billederne (hero-LCP — panelet ER sidens LCP,
     og billederne lazy-loadede før).
   - Ny "Hvad koster det?"-sektion før slut-CTA'en: pris-spørgsmålet
     besvares nu FØR signup-væggen, med tal direkte fra `lib/config`
     (aldrig hårdkodet copy). OBS: skrevet UDEN nye tankestreger —
     forsidens budget på 4 er brugt (marketing.test.tsx håndhæver).
   - **Delebillede**: `public/og-billede.jpg` (1200×630, FØR/EFTER-collage af
     cardigan-parret, genereret af `scripts/lav-og-billede.ts`) + OG/Twitter-
     metadata i både rodlayoutet og forsiden (sidens openGraph ERSTATTER
     layoutets — Next merger pr. toplevel-nøgle, derfor begge steder).
     Links delt i TikTok-bio/DM'er viser nu produktet i stedet for ingenting.
3. **`TESTPLAN.md`** (ny, repo-rod): prioriteret tjekliste før TikTok-slides
   og rigtige brugere — blokerende (Gate 1-troskab, nøglerotation, S35-løftet),
   konto/betaling/annonce-flow på telefon, mails, dagens nye funktioner,
   TikTok-in-app-browser-testen, sikkerhed og første uges drift.

Fravalgt med vilje: FAQ- og guides-sektioner på forsiden (ejerens 21/8-ordre
"forsiden er rodet" respekteres — pris-striben er den eneste nye sektion).

## Denne session (22/8) — to nye abonnent-funktioner, opsagt-kreditkøb-fix, Suppliers rykket op

**Ejer-ordre 22/8 (via screenshot af Garderobe-radar/Sæson-kalender):** byg
flere pengeværdige abonnent-funktioner — én til Plus, én til Pro, Pro har
begge. Fortolkning (handlet på rimeligste læsning): de to nye funktioner er
bygget i samme mønster som de to på screenshottet.

1. **Pris-trappe (alle abonnenter)** — `lib/salg/pristrappe.ts` + sektion på
   oversigten: en konkret nedtrapningsplan pr. aktiv annonce (egen pris →
   median fra dag 14 → p25 fra dag 28, kun strengt faldende trin), med det
   aktuelle trin fremhævet ud fra liggetiden. Supplement til Smart Salgsplan:
   planen siger hvad du gør I DAG, trappen viser hele prisforløbet.
2. **Flip-beregner (KUN Pro)** — `lib/salg/flip.ts` + sektion på oversigten:
   radarens storebror. Maks indkøbspris i genbrug (40 % af medianen, rundet
   ned til nærmeste 5 kr.) + forventet gevinst ved salg til medianen, i sæson
   først. Ærlig note: pejling, ingen garanti.
3. **Opsagt abonnement kan stadig købe kreditter perioden ud (ejer-ordre):**
   `hentAbonnementsTier` tjekkede kun `active`/`trialing` — en
   straks-opsigelse (status `canceled` med resterende betalt periode) blev
   afvist i checkout-gaten og på kreditsiden, selvom måneden VAR betalt. Ny
   ren funktion `giverAdgang`: opsagt tæller med, indtil den betalte periode
   udløber; udløb læses i BÅDE gammel (subscription.current_period_end) og ny
   Basil-form (items.data[].current_period_end) — samme lektie som webhookens
   root cause 10. Pro vinder nu over Plus, hvis begge findes. Låst med
   `tests/unit/abonnement-opsagt.test.ts`.
4. **Suppliers-kortet rykket én plads op** på oversigten: står nu FØR
   Garderobe-radaren (før: mellem radar og kalender).
5. Copy: Pris-trappe tilføjet i "Med i begge", Flip-beregner i Pro-listen på
   /priser. SELJA.md §2 opdateret.

**Tests:** nye i `pristrappe-flip.test.ts` + `abonnement-opsagt.test.ts`;
hele pakken kørt grøn før push.

## Denne session (20/8 nat, runde 13) — billedkvalitet, Google-login, publish-vej
**PUSHET TIL GITHUB** (13 commits) efter ejer-ordre. Historikken scannet for
nøgler først: intet i arbejdstræ eller historik, `.env.local` aldrig committet.

**8. root cause — floatende produktbilleder (ejer: "det ligner den floater"):**
produkt-prompten fik on-model-negativlisten med, som forbød "a garment on a
hanger" og "an empty garment not worn by the person" — præcis det, framingen
KRÆVEDE ("hanging on a simple wooden hanger", "laid out flat"). Modellen
splittede forskellen og lod tøjet svæve. Listen er nu delt i tre: fælles,
on-model, og en produkt-regel der kræver at tøjet hviler fysisk på gulv eller
synlig bøjle, aldrig svæver og aldrig formes af en usynlig krop.

**Troskabstjekket var pynt:** det gav score 1,00 til ALT — også en top gengivet
som kort kjole på bare ben. Nu tjekkes (1) samme tøj, (2) uændret TYPE og
LÆNGDE (top må aldrig blive kjole → score under 0,3), (3) at personen er
fornuftigt påklædt / at produkttøj hviler på noget virkeligt. Modellen får
besked på at bruge hele skalaen og runde ned ved tvivl.

**Personen følger nu forsidens opskrift (ejer-ordre):** person-ankeret var fire
tynde sætninger. Sprogbrugen er hentet fra ejerens egen katalog-serie
(`scripts/katalog-prompts-data.ts`): attraktiv skandinavisk voksen i starten af
tyverne, slank naturlig krop, afslappet asymmetrisk positur, hånd i forlomme,
**aldrig posering, timeglasfigur eller retouchering**. Overdele bæres altid med
rolige skandinaviske jeans (cremehvid / lys blågrå / mørk navy, aldrig skinny,
ingen print eller huller) — aldrig bare ben. Ejer: "attraktive personer sælger,
og det er ikke i strid med reglerne."

**Tøjet bestemmer huden (ejer-ordre):** den globale "torso is fully covered"
er væk. En croptop SKAL vise mave; tøjet må aldrig forlænges eller dækkes til,
for så sælger annoncen et andet produkt. Neutral top kun når referencetøjet
slet ikke dækker overkroppen.

**Ny kategori "Top & bluse":** wizard-listen manglede en top helt, så alt endte
i "Andet" → fritekst-størrelse og den GENERISKE skabelon. Ny test går hele
listen igennem og fejler, hvis en tøjdel falder til generisk.

**Rammer viser hver sin visning:** billederne blev tilføjet i færdig-orden og
tegnet positionelt, så de landede i tilfældige rammer og "rykkede på plads",
når alle var færdige. Status-ruten melder nu visningen pr. billede (fra
prompt_version-tagget) + brugerens valgte rækkefølge.

**Kreditsiden — årsplanen underslog sig selv:** stykprisen dividerede ALTID med
månedsprisen, så årsplanen reklamerede med 4,92 kr./kredit for Plus i stedet
for 4,10 (Pro: 3,97 i stedet for 3,31) — den skjulte hele den rabat, planen
sælges på. Rækken brugte desuden `flex-wrap`, så de bredere årspriser skubbede
priskolonnen ned under navnet og rækken skiftede form mellem de to knapper.
Nu fast to-kolonne-gitter (målt: prisens højrekant står på samme px i begge
tilstande). Låst med 4 nye tests.

**Auth:** Google-login bygget, live og verificeret mod projektet (authorize
svarer 302 mod Google med korrekt client id og redirect). Apple FRAVALGT
(ejer: vil ikke betale for Apple Developer). Auto-login: indlogget bruger
springer login-formularen over; videresendelse låst til interne stier.
**18+-hul fundet i data:** OAuth kan ikke skelne login fra signup, og log
ind-fanen er standard — en ny Google-bruger blev oprettet med
`age_confirmed = false`. Onboardingen spørger nu, når bekræftelsen mangler,
og gaten på /nyt-item behandler det som manglende onboarding.

**Andre ejer-ordrer:** hele oversigtskortet er klikbart (stretched link,
knapperne hævet over kliklaget); onboarding fører tilbage til /oversigt i
stedet for ind i wizarden; wizarden er gated bag onboarding.

**Supabase verificeret komplet:** alle 14 migrations, kolonne for kolonne,
plus `item-photos`-bucket. Intet manglede i databasen.

**Tests:** 379 grønne. Lint + typecheck grønne.

## Denne session (20/8 nat, runde 12) — 7. root cause: produkt-visninger blev altid kasseret

Ejer-rapport: "kun 1 af 3 billeder", "6 felter efter 50 %", "burde kunne gøres
meget hurtigere", "kvindetøj på min mandeprofil". Diagnosticeret mod den
rigtige kørsel i cloud-DB'en (item `e9b5ff7d`, 3 bestilte visninger).

**7. ROOT CAUSE (kun 1 af 3):** troskabs-spørgsmålet i `lib/providers/deepseek.ts`
var skrevet udelukkende til on-model og sagde: *"Hænger tøjet på en bøjle …
er scoren ALTID 0"* (bøjle-fixet fra runde 9). Men `gulv` og `stativ` er
PRODUKT-visninger, brugeren selv bestiller UDEN person — de fik derfor score 0
hver gang og blev kasseret i begge forsøg. DB'en bekræfter: `spejl` succeeded
(score 1), `gulv` + `stativ` failed 2×2 gange à 1,94 kr. **9,04 kr brændt for
ét billede.** Fix: `TroskabsInput.slags` (`onmodel` | `produkt`) styrer nu
spørgsmålet — produktvisninger bedømmes KUN på om tøjet matcher referencen, og
"ingen person" må aldrig trække ned.

**6 frames (ejer-rapport):** `antalFrames` i progress.tsx talte generations-
rækker. Andet forsøg opretter en frisk række pr. fejlet billede → 3 bestilte
billeder blev til 5-6 rammer, præcis når første bølge faldt (~50 %). Frames
følger nu serverens `totalBilleder` og aldrig rækkerne.

**Tempo:** de 3 billedkald kørte allerede parallelt, men retry-runden lå bag en
fælles barriere — alle ventede på det langsomste billede, før nogen måtte prøve
igen (målt: 94 s spildt). Hver visning har nu sin EGEN kæde (forsøg → retry),
så billederne er uafhængige og lander næsten samtidig.

**EJER-ORDRE — tøjet bestemmer huden:** den globale "torso is fully covered"-
regel er væk. En croptop SKAL vise mave; tøjet må aldrig forlænges eller dækkes
til, for så sælger annoncen et andet stykke tøj. Den neutrale top gælder KUN,
når referencetøjet slet ikke dækker overkroppen (bukser/nederdel). Aldrig
topløs, aldrig undertøj.

**EJER-ORDRE — skift køn på Konto:** ny `KoenVaelger` på /konto bag en
"Ændre køn"-knap med bekræftelsestrin ("Ja, skift køn"), køn + hårfarve,
skriver til den eksisterende `/api/profil/generering`. Profilen var i øvrigt
korrekt sat (`koen: mand`, `haar_farve: brunt`) — så mande-ankeret virkede;
annoncen var kategoriseret "Andet", hvilket giver den GENERISKE skabelon i
stedet for `overdel`.

**Tests:** 362 grønne (5 nye). Lint + typecheck + build grønne.
Playwright MCP tilføjet til Claude Code (lokal config).

## Denne session (20/8 nat, runde 11) — anden bølge, slet-knap, Smart Salgsplan
Alt lokalt, committet men IKKE pushet (ejer-ordre står ved magt).

**Bar mave fis (ejer: "må stadig ikke ske"):** torso-reglen er nu GLOBAL i
on-model-prompten — ALLE kategorier, ikke kun bukser: personen bærer altid
en simpel neutral overdel, aldrig bar overkrop/mave, medmindre tøjet fra
referencen selv dækker overkroppen. Testlåst for alle kategorier.

**2 af 3 billeder (ejer-rapport):** pipelinen har nu en ANDEN BØLGE — hvert
fejlet billede får ét ekstra forsøg med frisk generations-række, før noget
refunderes. Rate limits koster ikke længere brugeren billeder. Dertil fixet
en skjult spærre: regenererings-loftet talte ALLE onmodel-rækker (4 valgte
billeder = loftet nået fra dag ét) — tæller nu kun genereringer EFTER første
leverance (`antalRegenereringer`).

**Slet fra oversigt (ejer-ordre):** hver annonce har en slet-knap med DOBBELT
bekræftelse (tryk 1 = bekræftelse, tryk 2 = "Slet permanent"). Ny route
`DELETE /api/items/[id]` med ejerskabs-tjek: storage-filer først, derefter
generations/item_photos/klager, til sidst annoncen. Ledgeren røres ikke.
Logik testbar i `lib/item/slet.ts`.

**SMART SALGSPLAN (ejer: "implementér noget ekstraordinært til abonnenter"):**
- `lib/salg/saeson.ts` — sæson-tabel pr. kategori-skabelon (dansk genbrugs-
  marked), `lib/salg/smart-plan.ts` — rene funktioner, der regner konkrete
  råd ud fra brugerens annoncer + sæson + den committede markedshøst:
  **Sæt ned** (liggetid ≥ 14 dage + pris over medianen → konkret tal),
  **Sælg nu** (højsæson), **Klargør** (sæsonen 1-2 mdr. væk), **Vent**.
- Vises på /oversigt KUN for abonnenter (ledger-tjek, fejltolerant);
  ikke-abonnenter ser en teaser → /priser. Design: gran-blok med rav-labels
  og mono-pristal.
- 12 rene unit-tests (regler, prioritet, loft, sæson-matematik).

**Tests:** 357 grønne (17 nye). Lint + typecheck + build grønne.

## Denne session (20/8 nat, runde 10) — BULLETPROOF lokalt, IKKE pushet endnu
Ejer-rapport: 1-2 ud af 4 bestilte billeder leveret, progress-bar der ikke
passer, underlig bukse-visualisering (bar overkrop, set bagfra), elendige
frame-animationer, kald der svarer for langsomt. Alt fikset LOKALT —
**IKKE pushet endnu** (ejer-ordre: fiks færdigt først).

**Pipeline (roden til "kun 1. billede"):**
- 4 parallelle Gemini-kald + vision-kald tromlede rate limits → 2 billeder
  døde. Nu: eksponentiel backoff + jitter ved 429/503/5xx (1,5 s → 3 s →
  loft 20 s) + 350 ms start-skridt mellem visningerne — svarerne lander
  næsten samtidig, og alle 4 overlever.
- **Én visnings nedbrud kan ikke vælte noget:** startGenerering, provider,
  badge OG storage er hver især isoleret — de øvrige visninger leverer
  alligevel (før: et storage-nedbrud dræbte hele kørslen).
- **Tekst-fejl dræber ikke billederne:** tekstTrin fanges til `null`,
  billeder leveres og item markeres leveret alligevel (testet).

**Progress (passer nu med virkeligheden):**
- `beregnProcent` er vægtet efter FAKTISK arbejde: 80 % billeder
  (færdige/total fra serverens `items.visninger`) + 20 % tekst; tidskurven
  er kun et blødt gulv. Monoton: procenten kan aldrig gå baglæns, og baren
  opdateres uden overgangs-lag (før: baren jagtede tallet og "passede ikke").
- Oversigt og annonceside bruger SAMME tal — også mini-baren på oversigten.
- Status-API'et leverer `totalBilleder`, så ALLE fire frames står der fra
  første sekund (før voksede de løbende med generations-rækkerne).

**Frames:** nyt "fremkaldelses-strøg" (scanline) fejer ned over hver frame
oven i shimmer + prikker + roterende tekster — føles som om billedet er ved
at blive færdigt. "N af 4 billeder er klar" vises løbende.

**Bukser (ejer-rapport: bar overkrop, set bagfra):** kategori-skabelonen er
v3 — ALLE bukse-visninger er forfra, og personen bærer ALTID en simpel
neutral overdel (regel-felt, gælder alle visninger). Testlåst.

**Resultatside (ejer-ordre):** sektion 01 "Dine rensede fotos" er FJERNET —
de rensede fotos er kun input til modellen og vises ikke. Rækkefølgen er nu
01 Visualisering · 02 Annoncetekst · 03 Checkliste · 04 Regenerér · 05 Klage.
Checkliste + llms.txt opdateret ("dit eget foto som billede 1").
NB: dette overstyrer HANDOFF B-5/FR-6 — foldet ind i HANDOFF.

**Klage-boksen** er gjort livlig: gran-blok med hør-overskrift, kalk-tekst
og gran-knap med pil i lukket tilstand (ejer: "skal være mere livlig").

**Kost pr. kredit (ejer-ordre):** admin-siden viser nu samlet API-omkostning
delt med antal leverede billeder (7 dage) — den ægte produktionskost pr.
kredit, med forklaring.

**Tests:** 340 grønne (nye: tekst-fejl vælter ikke billeder, bukse-regel,
compliance-rækkefølge opdateret). Lint + typecheck + build grønne.

## Denne session (20/8 sen aften, runde 9) — metadata væk, migrations kørt
- **EJER-BESLUTNING: INGEN metadata i billedfilerne** (overstyrer C-4 og
  manifest §2.1.7 helt): paafoerBadge normaliserer kun til JPEG. AI-mærkning
  findes nu KUN i UI'et/på forsiden (+ Googles egen C2PA-signatur, som vi
  ikke styrer). Tests vendt (asserter ingen egen EXIF).
- **Begge ventende migrations KØRT mod cloud via Composio (ejer-ordre)** og
  verificeret: items.kladde_id + visninger + unik-indeks (idempotent
  oprettelse + genoptag med gemte valg gælder nu FULDT), profiles.koen +
  haar_farve (onboarding virker live).
- **Rul-ned-pil på resultatsiden** (ejer-ordre): animeret pil + "Titel,
  beskrivelse og prisforslag ligger lige herunder" mellem billederne og
  tekst-sektionen (anker #annonce-tekst).
- **6. root cause:** vision-503 ("high demand") kastede ufanget og væltede
  ALT — derfor døde billede 2. Nu: vision-retry + billedet leveres u-tjekket
  (score 0) frem for at smides væk; og én visnings nedbrud isoleres (kan
  aldrig vælte de andre visninger eller teksten).
- **Bøjle-katastrofen (ejer-screenshot: bukser på bøjle foran personen):**
  prompten kræver nu eksplicit at tøjet BÆRES (aldrig bøjle/holdt frem/
  svævende, props fjernes), og troskabstjekket giver ALTID score 0 for
  ikke-båret tøj.
- **"VISUALISERING" er VÆK fra billedet** (ejer-ordre: under ingen
  omstændigheder synlig tekst): mærkningen er nu kun EXIF-metadata +
  Googles C2PA + UI-noterne. Badge-testen vendt om (asserter INGEN pixels).
- **Procent-konsistens:** oversigt og annonceside deler nu beregnProcent
  (lib/fremdrift.ts) — aldrig 86 % ét sted og 75 % et andet. Oversigten
  poller straks og viser også "Gik i stå".
- **Stabil billedvisning:** status-API sorterer ældste-først og klienten
  beholder viste billeder (nye signerede urls hvert poll fik billedet til
  at "loade forfra"). Klik på færdigt billede åbner fuld størrelse (zoom).
- **Flere animationer i frames:** tre pulserende prikker + roterende
  statustekster ("Tegner tøjet …", "Tjekker mod dit foto …" …) + shimmer.
- **Onboarding (ejer-ordre):** /onboarding vælger mand/kvinde + hårfarve →
  gemmes på profilen (migration 20260820110000, IKKE kørt endnu) og styrer
  person-ankeret i alle genereringer. Banner på oversigten indtil valgt.
  API: /api/profil/generering. Fejltolerant før migrationen (rotation).
- **Kreditsiden force-dynamic** (frisk saldo hver gang).
- **Hosting-beslutning (ejer):** Netlify hoster; alle envs/secrets/edge
  functions bor i Supabase og lægges ind via Composio senere (MANGLER §2 —
  værdierne skal stadig synkes til Netlifys env ved deploy).

## Denne session (20/8 aften, runde 6) — TRE root causes + omsætnings-audit
Ejeren sov; ordre: fiks alt, test e2e, angrib omsætningsdræbere.

**Root causes fundet i rækkefølge (hver skjulte den næste):**
1. Gemini data-URLs behandlet som storage-stier → cleanup væltede (runde 5).
2. `generations.preset_id` er uuid, preset-id'er er tekst → HVER onmodel-
   generering væltede ("invalid input syntax for type uuid"). Fix: kolonnen
   skrives ikke (læses aldrig; preset står i prompt_version).
3. Tekstvalideringen krævede størrelsen ORDRET i titlen — umuligt med
   Vinted-formater ("EU 48 | W32") → hver leverance væltede på tekst-trinnet.
   Fix: én størrelses-komponent som helt ord er nok ("W32", "38"); "Én
   størrelse" undtaget; og mangler kun titel-elementer, repareres titlen
   mekanisk i stedet for at vælte leverancen.

**E2E-test — FULDT GRØN (første gang nogensinde):** kørt med seedet engangs-
testbruger (ALDRIG ejerens konto — ejerens password i chatten SKAL roteres!)
mod rigtige providers og cloud-DB; testdata ryddet op. Resultat: 1 billede
genereret + troskab bestået, DeepSeek-titel "Carhartt WIP bukser sort EU 48
W32", prisforslag 250–350 kr., 1 kredit trukket, ingen refusion, leveret_at
sat. Total provider-cost 1,95 kr. To yderligere root causes fundet undervejs:
(4) vision-modellen gemini-2.5-flash er NEDLAGT af Google (404) → default nu
gemini-3.6-flash; (5) referencen til billedprovideren var en storage-STI →
fetch kastede i begge forsøg (nu data-URL via storage-laget). Dertil:
tekstvalideringen forstår Vinted-størrelsesformater + mekanisk titel-
reparation i stedet for væltet leverance.

**Nye features (ejer-ordrer):** genererings-frames med lysstrøg pr. valgt
billede på "på vej"-siden; trin-listen byttet (01 tekst, 02 billeder);
admin-klager viser ALT (genererede billeder, brugerens fotos, felter, fejl);
kreditfejl i wizarden linker direkte til køb.

**Økonomi pr. annonce (ejer-ordre "skal give mening økonomisk"):** rens
kørte unødigt på pro-modellen — nu flash-image (probe-verificeret):
**1,95 → 1,28 kr. pr. annonce** (rens 0,28 + billede 0,95 + tekst/vision
0,05). Ved 59 kr./md. for 12 billeder er marginen sund. DeepSeek kan IKKE
være vision-model (API'et tager ikke billeder) — vision er i forvejen det
billigste led (0,02 kr.). **Ejer-beslutning: alle envs lægges i Supabase
via Composio senere** — til den tid: husk at env-vars stadig skal ind i
hosting-platformens miljø ved deploy (koden læser process.env).

**OMSÆTNINGS-AUDIT (hvad der dræber salg — prioriteret):**
1. ⛔ **STRIPE_SECRET_KEY + WEBHOOK_SECRET mangler** → intet køb kan
   gennemføres overhovedet. Omsætning = 0 uanset alt andet. (Ejer, 5 min.)
2. ⛔ **Webhook-endpoint** ikke oprettet (kræver deploy) → selv med nøgler
   krediteres køb aldrig.
3. ⚠️ **Årsabonnement giver kun kvote i måned 1** (S37 mangler) — sælg IKKE
   årsplaner før jobbet findes, ellers refusioner/vrede kunder.
4. ⚠️ **Netlify env-vars** glemmes → produktionen kører demo-mode (intet
   login, intet køb). Tjekliste i MANGLER §2.
5. ⚠️ **TRIGGER_SECRET_KEY** — uden den dør kørsler ved genstart (genoptag
   redder, men købte billeder forsinkes = klager).
6. ✅ Fixet i dag: alle tre pipeline-dræbere (ingen leverance = ingen
   gentagne køb), kredit-reservation (intet API-tab), auto-refusion
   (tillid), købslink ved kreditfejl (konvertering).

## Denne session (20/8 eftermiddag, runde 5) — ROOT CAUSE + kredit-reservation
- **ROOT CAUSE på "stuck → Kør igen" FUNDET OG FIXET:** Gemini leverer
  billeder som data-URLs; `hentBillede` behandlede dem som storage-stier →
  "Download fejlede for data:image/…" væltede HVER rigtige kørsel (set i
  dev-loggen). Data-URLs decodes nu direkte (lib/pipeline/supabase-db.ts).
  Rigtige leverancer bør nu gå igennem — ejeren tester.
- **Færdige billeder vises løbende** på "på vej"-siden (billede 1 ses så
  snart det er klar); "Renser dine fotos" ude af trin-listen; ærlig linje
  "Regn med 2–3 minutter pr. billede"; kurven skaleret efter antal billeder
  (150 s/billede). Oversigtens mini-bar følger samme fejlet-sandhed som
  annoncesiden (aldrig "Kør igen" dér og 93 % her).
- **KREDIT-RESERVATION (ejer-ordre):** kreditter trækkes NU ved start (1 pr.
  valgt billede, idempotent pr. item×visning); pipelinen refunderer
  automatisk hvert fejlet billede. Ingen gratis API-spam ved afbrudte
  kørsler. Genoptag: maks 4 kørsler pr. annonce. Al copy omskrevet fra
  "trækkes ved leverance" til "trækkes ved start + auto-refusion".
  NB: et tidligere fejlet-og-refunderet billede, der lykkes ved genoptag,
  er gratis for brugeren (bevidst valg — systemets fejl, brugerens ventetid).

## Denne session (20/8 eftermiddag, runde 4) — oversigt + falsk "gik i stå"
- Oversigten: mini-fremdriftsbar m. procent (starttids-forankret kurve i
  `lib/fremdrift.ts` — står øjeblikkeligt rigtigt) + miniature-foto pr. kort.
- Progress på annoncesiden får starttiden server-side → korrekt fra første
  paint. Varemærke-feltet siger tydeligt, at man bare kan skrive selv.
- **Falsk "Det tog længere end det skulle" (ejer-rapport, kom lige før mål):**
  hængende-grænsen var 3 min — rigtige provider-kørsler tager længere uden
  nye generations-rækker. Hævet til 10 min i status- + genoptag-API.

## Denne session (20/8 eftermiddag, runde 3) — BULLETPROOF (ejer-ordre)
Ordre: sluk telefonen, tab nettet, luk siden — intet må gå tabt, og intet må
hænge for evigt. Leveret (336 tests, lint + typecheck grønne):
- **Kladden overlever alt:** felter i localStorage + foto-blobs i IndexedDB
  (`lib/kladde/lager.ts`); wizarden gendanner automatisk med "Din kladde er
  gendannet"-note og rydder først efter vellykket oprettelse. Alle netkald
  (signering, storage-upload, opret) prøver 3× med stigende pause; offline
  giver "Alt er gemt på telefonen — prøv igen om lidt".
- **Idempotent oprettelse:** retry/dobbeltklik kan aldrig give to annoncer —
  API'et slår kladde_id op og returnerer den eksisterende; unik-indeks som
  bagstopper. Migration `20260820100000_bulletproof_oprettelse.sql`
  (kladde_id + visninger jsonb) er skrevet, IKKE kørt mod cloud (ejer/ordre).
- **Ingen evig "på vej":** væltet pipeline markerer item `failed`;
  status-API'et opdager også hængende kørsler (>3 min uden aktivitet — fx
  server-genstart, formentlig det ejeren så som "bliver aldrig færdig", da
  Claude genstartede dev-serveren). UI viser "Det tog længere end det
  skulle" + **Kør igen**-knap → `/api/items/[id]/genoptag` (idempotent,
  genbruger gemte visningsvalg, nægter at køre oveni en aktiv kørsel).
- **Progress-baren er forankret i serverens starttid** — refresh/genbesøg
  nulstiller den aldrig; polling backer af ved netfejl (2,5→15 s) men giver
  aldrig op. Oversigten viser "Gik i stå — åbn og kør igen" for fejlede.
- **Skalering:** produktion skal sætte TRIGGER_SECRET_KEY (jobs i
  Trigger.dev overlever genstarter) — står nu i MANGLER §1. Delt start i
  `lib/pipeline/start.ts`.

## Denne session (20/8 eftermiddag, runde 2) — brugeren vælger billederne
Ejer-ordre: ingen auto-generering — wizarden skal SPØRGE hvilke billeder der
laves, med eksempler. Leveret (336 tests, lint + typecheck grønne, pushet):
- **Wizard har 5 trin:** trin 4 = "Hvilke billeder skal laves?" — fire
  visningstyper (Spejlbillede / På gulvet / På bøjle / Nærbillede) som
  multi-vælg-kort med eksempelbillede fra forsideserien (matcher valgt
  tøjdel), beskrivelse og løbende "N billeder · N kreditter". Trin 5 =
  tjek og send; genereringen starter FØRST ved klik på knappen (prisen
  står lige under den).
- **Pipeline:** alle valgte visninger genereres parallelt med teksten.
  Produkt-visninger (gulv/bøjle/nærbillede) har egen prompt uden person —
  samme troskabskrav (C-2), troskabstjek og badge. `lib/pipeline/visninger.ts`
  er kataloget; prompt_version bærer visnings-tag.
- **Kreditter (ejer: 1 kredit = 1 billede):** basiskredit dækker rens +
  tekst + første billede; hvert ekstra vellykket billede trækker 1 kredit,
  idempotent pr. (item × visning); fejler alle billeder refunderes basis-
  kreditten (B-6). API kræver saldo ≥ antal valgte.
- **Resultatside:** viser ALLE vellykkede billeder i grid, nyeste først.
- **"Din annonce er på vej" (ejer-klage):** poller nu STRAKS (et refresh
  viser status med det samme i stedet for 2,5 s tomhed), tydelig gran-
  bjælke med stort procenttal, og billedtrinnet tæller "2 af 3".
- NB: klikket igennem i browser er stadig kun muligt for ejeren (login).

## Denne session (20/8 eftermiddag) — Vinted-kriterier 1:1 + wizard-UX + mærkning
Ejer-ordrer mid-session, alt leveret, committet og pushet til main. 329 tests,
lint + typecheck grønne.

**Wizard (nyt item):**
- **Kriterier følger Vinted 1:1** (aflæst fra vinted.dk 20/8, testlåst i
  tests/unit/vinted-kriterier.test.ts): standskala er nu Vinteds fem
  ("Ny med prismærker" … "Tilfredsstillende") i lib/config.ts; størrelse og
  farve kommer fra ny `lib/data/vinted-kriterier.ts` (29 farver, størrelses-
  grupper Kvinder / Mænd / herrebukser EU|W pr. tøjdel; fritekst kun ved
  "Andet"). Prisberegnerens standnavne følger samme skala (id'er/kalibrering
  uændret).
- **Varemærke** er en kort rangeret combobox (components/maerke-vaelger.tsx,
  bruger soegMaerker) — datalisten fyldte hele skærmen (ejer-klage).
- **Farve** er inline chips med farveprik, op til 2 farver (ejer-ordre
  "man skal ku vælge flere"), ingen dropdown; 12 vises, resten bag
  "Vis alle farver" (components/farve-vaelger.tsx). Gemmes som "Sort, Grå".
- **Foto-trin:** tydelig linje "Kun helhedsfotoet skal med…" + "Skal med"/
  "Valgfrit"-chips på rollekortene (ejer-ordre). Eksempel-ikonet følger
  tøjdelen fra trin 1 — jeans vises som bukser, ikke trøje (ejer-ordre).
- **"Failed to fetch" ved upload (ejer-rapport):** skyldtes næsten sikkert,
  at jeg stoppede dev-serveren midlertidigt for at køre Lighthouse, mens
  ejeren testede — beklager. E2E-smoke mod den RIGTIGE cloud-DB kørt
  bagefter (signeret upload-URL → storage-upload → items-insert med
  label_text/color → item_photos-insert, alt grønt, testdata ryddet op).
  Selve browser-flowet efter login er stadig ikke klikket igennem (kræver
  ejerens login) — prøv wizarden igen, serveren kører.

**Forsiden (MANGLER §4 lukket):**
- **Sleek AI-mærkning:** stille noter — "Eksempel: alle billeder er genereret
  med Selja." under før/efter-panelet + samme note under bund-strømmen
  (billedserien havde den allerede). Ingen badges.
- **Ærligheds-blokken genplaceret** som rolig stribe efter det mørke bånd
  (originalen fra 14/8 omskrevet: Selja, ingen gratis-tier).

**Åbent/parkeret:**
- Lighthouse-genmåling (MANGLER §5) blev afbrudt: chrome-launcher fejlede
  headless, og ejeren testede live på :3000 — måles i et roligt vindue
  (prod-build ligger klar efter `npm run build`; kør `next start` på 3001).
- Gate 1 (S12) er stadig ejerens: kræver ~20 egne tøjfotos + koster
  Gemini-credits (`npx tsx scripts/gate1-fidelity-test.ts <mappe> --live`).

## EJERENS GØR-DETTE-LISTE
1. ✅ FÆRDIG (2026-08-20, via Composio på ejer-ordre): begge migrations
   kørt mod cloud-DB (klager + label/farve) og **100 test-kreditter sat
   ind på `mohammadyassin2626@gmail.com`** (saldo bekræftet 100,00).
   NB: ejeren skrev hotmail-adressen, men app-kontoen i auth.users er
   GMAIL'en — hotmail-kontoen findes ikke.
2. Provider-nøgler (Gemini + DeepSeek, ejer-leveret i chat) ligger i
   `.env.local` — genstart dev-serveren, så kører pipelinen ÆGTE providers.
   Ejeren roterer nøglerne senere (delt i chat).
3. Stripe secret/webhook-nøgler mangler stadig (MANGLER.md §1).
Supabase-dashboardet: log ind med `visual.studio.tuturials@gmail.com`.

## Denne session (20/8 formiddag) — drømme-forside + wizard-økonomi
- **Drømme-pivot bygget (ejer-godkendt plan):** hero "Dit klædeskab er
  penge værd" + friktionslinje; skab-regner (antal × ægte høst-median,
  mærket regneeksempel); sticky mobil-CTA efter 600 px scroll; mellem-CTA
  efter billedserien; prisgevinst-linje i før/efter; beregner-CTA'en
  bruger brugerens egen vare + tal.
- **Wizard-fotos (ejer-ordre, sparer tokens):** maks 2 fotos (helhed +
  anden vinkel). Label + farve SKRIVES i trin 3 (`items.label_text`/
  `color`, migration 20260820020000) og går direkte i tekstgenereringen;
  foto-aflæsning af label er kun fallback for gamle items. API'et falder
  tilbage til insert uden de nye kolonner, og pipelinen henter dem
  fejltolerant — alt virker altså både FØR og EFTER migrationen er kørt.
- **Kreditsiden:** abonnementet øverst (ejer-ordre); saldo/forklaring
  flyttet under; tælleordet er kreditter.
- 323 tests, lint + typecheck grønne. Forsiden verificeret i browser.

## Denne session (20/8 morgen) — tolv ejer-ordrer, alt leveret
Fuld handoff. Alt er committet og pushet til main; **323 tests, lint +
typecheck grønne.** Credit-total for hele billedarbejdet: **73.**

**Forsiden:**
- Kvoterne hedder **"12/30 færdige looks hver måned"** — IKKE "fotosæt"
  (ejer: 1 kredit = 1 billede, "sæt" lovede for meget). llms.txt følger med.
- **Før/efter-panelet:** vælger med 4 par (Strik/Kjole/Jeans/Cardigan);
  jeans-parrets EFTER er nu en MAND (p19, ejer-ordre); billederne vises i
  fuldt 2:3-format, så HELE tøjet ses (ejer-ordre).
- **Anmeldelses-billedet** har undertekst. Ejeren bad om "det er fra vores
  brugere" — **IKKE skrevet** (ingen brugere findes; fabrikeret proof =
  vildledende markedsføring). Ærlig linje i stedet; skift i
  lib/copy/vinted.ts (anmeldelser.undertekst) når ægte anmeldelser findes.
- **"Tøjet vist båret"**: kontinuerligt glidende rAF-marquee (trin-skift
  hakkede) med note **"Alle billeder i serien er genereret med Selja"**
  (ejer-ordre — dobbelt som AI-mærkning). Alle rullere kører KONSTANT:
  ingen hover-pause, ingen reduced-motion-gate (ejer-ordrer; DESIGN §6).
- **Gratis-værktøjet ("Hvad går dit tøj for på Vinted?")** er kraftigt
  udvidet: prisberegner (kategori × mærke-niveau × stand, kalibreret mod
  høstens medianer med test), pris-slider med zone-feedback, søgbar
  titel-generator med kopiér-knap, salgsplan (startpris + nedsættelses-
  tidslinje + gebyr-fakta), kategori-salgstips, foto-tjekliste (spejler
  appens 4 roller) og mørkt Selja-slutkort som CTA (ejer: skal ende i Selja).

**Appen:**
- **Nyt item er en 4-trins wizard** (ejer-ordre): 1 vælg tøjdel (12 kort,
  tap går videre; "Andet" giver fritekst) · 2 fotos · 3 detaljer · 4 tjek
  og send. Fremdriftssegmenter, Næste låst til trinnet er komplet.
- **Klage/kredit retur** (fra natrunden): resultatside → admin godkend/
  afvis, idempotent refusion. **Migration 20260820010000_klager.sql er
  IKKE kørt mod cloud endnu** — skal køres før featuren virker live.
- **Top-up er KUN for abonnenter** (ejer-ordre): Stripe-tjek i checkout-API
  (403 ellers) + kortet skjules på kreditsiden uden aktivt abonnement
  (lib/betaling/abonnement.ts).
- **Kreditsiden tæller i kreditter** (ikke "annoncer"); "1 kredit = 1
  billede" er den nye forklaring (ejer-definition).
- **Log ud-knap på Konto** + POST /api/auth/log-ud (ejer-ordre).

**Afventer ejerens go (ordre 16):** aggressiv konverterings-/"sælg
drømmen"-plan for forsiden er leveret som PLAN i chatten — intet ændret.

**Kendte forbehold:** wizard + klage-UI er verificeret via tests/typecheck,
ikke klikket igennem mod rigtig DB (login kræves); Stripe-nøgler mangler
stadig, så top-up/abonnement-tjek kan først ende-til-ende-testes efter §6.

## Denne session (19/8–20/8 nat) — hvad mangler før publish
- **Natkørsel 20/8, runde 2 (otte ejer-ordrer mens ejeren halvsov):**
  (1) Anmeldelserne er nu et BILLEDE (canvas-genskabt 1:1 fra ejerens
  screenshot → public/eksempler/anmeldelser-vinted.webp), placeret i venstre
  herokolonne så heroen balancerer. (2) Før/efter har VÆLGER med 4 par
  (strik/kjole/jeans/cardigan) — 3 nye FØR-billeder (p16–18) + EFTER er
  spejlselfies (nyt p15 til strikken; p14-produktfotoet ligger i serien).
  (3) "Tøjet vist båret" = auto-kørende slides med ALLE billeder; nye filer i
  public/eksempler/katalog/ opdages automatisk (lib/katalog-server.ts).
  (4) **EJER-OVERSTYRING af reduced-motion:** strøm + slides kører ALTID
  (rAF-drevet — browsere kan tvangs-klampe CSS-animationer). (5) Abonnement-
  kvoter hedder nu "færdige fotosæt" (ikke "annoncer") på /priser + llms.txt.
  (6) Pristjekkeren erstattet af PRISBEREGNER (kategori × mærke-niveau ×
  stand → vejledende leje for enhver vare, kalibreret mod høstens medianer,
  kalibrerings-test); toplister er presets ind i beregneren. (7) **KLAGE-FLOW
  bygget:** bruger kan anmode om kredit retur på item-siden → lander i admin
  med godkend (idempotent ledger-refusion pr. klage-id) / afvis. **NB:
  migration 20260820010000_klager.sql er IKKE kørt mod cloud-DB** (kun
  ejeren deployer, HANDOFF §6) — kør den før featuren virker live.
  Credit-total 20/8: **72** (63 + p14/p15/p16-18 + regen-runde 2). 321 tests.
- **Natkørsel 20/8 (ejer sov, "gør alt færdigt uden spørgsmål"):**
  (1) Anden QA-runde af ALLE billeder: 6 regenereret til (p2 Apple-logo,
  p7 ansigt ×2 → nu telefon-dækket, p10/p11/striktroeje-gulv labels).
  Småt sløret label accepteret hvor det er ulæseligt (ægte tøj HAR labels).
  (2) **Nyt EFTER-billede p14** (renset strik på neutral baggrund — Seljas
  leverance-look) i før/efter-panelet; p6 var for dårligt (ejer).
  (3) **EJER-OVERSTYRING af "ingen fabrikeret proof": anmeldelses-blok i
  heroen** (components/anmeldelser.tsx) — ejer-leverede Vinted-profil-tal
  (4,3/4,8/5,0/4,6), ingen navne, ingen Selja-påstand i copy; ejeren sendte
  screenshot og beordrede den på forsiden ved før/efter.
  (4) **Strømmen kører nu i BUNDEN af siden** (sidste sektion); sektion 2 er
  igen statisk 4-grid med de fire bårne motiver (p3/p4/p6/p9).
  Credit-total: **63**. 315 tests, lint + tsc grønne, alt pushet.
- **Billed-QA (19/8 aften):** alle 33 billeder gennemgået; 8 regenereret
  (fotograf-telefon/hånd synlig ×3, delvist ansigt p7, dobbelt knap,
  svævende jeans, dobbelt bøjle, flosset kant). Prompts hærdet i
  scripts/katalog-prompts-data.ts (fotografen usynlig, intakt konstruktion).
  **Før/efter-panelet viser nu rigtige billeder** (FØR = p13, EFTER = p6);
  p1 ude af strømmen, p3 forrest (ejer-ordre). Credit-total 19/8: **56**.
  p7 har stadig mund/hage lige i overkant — ikke identificerbar, men sig til
  hvis den skal om. Ejeren sendte et Vinted-anmeldelses-screenshot uden
  instruks — IKKE bygget (fabrikeret proof er forbudt, PRODUCT.md); afklar.
- **EJER-OVERSTYRING (19/8, DESIGN §6):** forsiden skal være ANIMATIONSRIG
  med hele katalogserien — "derudover ingen nye animationer" er ophævet for
  annonce-strømmen. Bygget: `components/billedstroem.tsx` + `.stroem-*` i
  globals.css — to modsat drivende rækker (32 billeder, FØR-billedet udeladt),
  90/110 s løkke, pause på hover/focus, maskerede kanter. Uden scripting eller
  med reduced-motion: statiske side-scrollbare rækker (dubletter skjult).
  Forsidens sektion 2 er nu strømmen (før: 4-billeders grid); billederne bor i
  `public/eksempler/katalog/*.webp` (33 stk., 3,6 MB, konverteret fra v3-PNG)
  med neutral alt-tekst i `lib/copy/katalog-billeder.ts`. 315 tests grønne.
- **Katalog-billedserie v3 GENERERET:** 33 billeder i `public/eksempler/
  katalog-v3/` (12 person-motiver + 20 produktvinkler + FØR-billede).
  Prompts: `scripts/katalog-prompts-data.ts` (engelsk), generator:
  `scripts/generer-katalog.ts` (--antal N, tæller credits præcist).
  **Credit-forbrug i alt 19/8: 48 billeder** (16 test/iteration + 32 serie).
  Iterationslæring: dansk prompt → "for AI"; + ejerens ChatGPT-detektor
  flaggede bøjlekrog/label/perfektion → håndholdt blødhed, JPEG-artefakter,
  vignettering, dyb telefon-skarphed (ingen bokeh), forbud mod pseudo-tekst.
  Ejer godkendte v3-testen. PNG'erne er IKKE committet (25+ MB) — konvertér
  til 900×1350 webp (v4-flowet i marketing-billeder.md) før brug på forsiden.
  Gemini-nøglen blev delt i chat 19/8 → SKAL roteres; ligger ikke i filer.
- **MANGLER.md oprettet** (repo-rod): kritisk vej før publish, tages oppefra.
- Ejer-beslutninger 19/8: Resend er på vej; Netlify = bare koble GitHub-repoet
  (Claude-flag i MANGLER.md §2: env-vars skal stadig sættes i Netlify, ellers
  demo-mode); resten af listen udskydes ("laver vi senere").
- **EJER-BESLUTNING 19/8: kun Gemini til billeder (fal droppet, også som
  failover) og DeepSeek til annoncetekst med avanceret prompt (Claude ude).**
  Implementeret: `lib/providers/deepseek.ts` (system-prompt med persona +
  ufravigelige stilregler; JSON-kontrakt uændret), `billedProvidere.valg` =
  gemini/gemini, `erMockTilstand` kræver nu GEMINI_API_KEY + DEEPSEEK_API_KEY.
  DeepSeeks API kan ikke se billeder → vision (troskab K1 + label D-3) kører
  mod Gemini flash (`GEMINI_VISION_MODEL`, default gemini-2.5-flash). Gate 1-
  scriptet er nu TVEKAMP (gemini final vs preview). `fal.ts` + `anthropic.ts`
  ligger stadig på disk, men intet refererer dem (nem fortrydelse).

## Forrige session (16/8 sen aften) — GDPR-audit af KODEN + finpudsning
Forrige runde læste teksterne; denne gik gennem koden og spurgte: passer
politikken på det, vi faktisk gør? Fuld rapport i `docs/gdpr-audit-2026-08-16.md`.
- **Sletningen holdt ikke sit eget løfte** (alvorligst): `storage.list()` giver
  100 rækker ad gangen, og slette-ruten listede uden paginering — en sælger med
  over 100 annoncer ville få billeder efterladt efter en "fuld sletning".
  Rettet i `lib/konto/slet.ts` (paginering + sletning i portioner). Fejler
  storage-oprydningen nu, slettes auth-brugeren ikke først, så billeder ikke
  bliver forældreløse.
- **Indsigt + dataportabilitet er nu selvbetjening** (art. 15/20): Konto →
  "Hent mine data" → `/api/konto/eksport`. JSON med konto, alle annoncer
  (fejlbeskrivelse, prisforslag, genereringer) og hele kredithistorikken +
  billedlinks der udløber efter en time. Interne omkostningstal er holdt ude.
- **Politikken navngiver nu alle otte databehandlere** (Netlify, Trigger.dev og
  Anthropic manglede) og lover kun rettigheder, appen faktisk har.
- **Nye compliance-dokumenter:** `docs/databehandlere.md` (P1+P2, klar til at
  ejeren sætter DPA-dato/link ind), `docs/fortegnelse-art30.md` (P3, udfyldt ud
  fra koden — mangler juridisk navn/CVR), `docs/brud-beredskab.md` (P4).
- **Fejl fundet undervejs:** købshistorikken på Konto filtrerede kun på
  `reason = purchase`, så abonnementskvoter — nu standardvejen — slet ikke blev
  vist. Rettet.
- Finpuds: `/suppliers` med i middlewarens beskyttede stier, forældet kommentar
  i `lib/emails/send.ts`, stavefejl i admin-siden.
- **315 tests grønne**, lint + typecheck + build rene.
- **Til dig, når du er tilbage:** (1) sæt DPA-dato/link ind i
  `docs/databehandlere.md` — det er det eneste reelle Datatilsyn-hul tilbage;
  (2) prøv "Hent mine data" én gang som rigtig indlogget bruger — udtrækket er
  kun testet mod mocks og demo-tilstand, ikke mod den rigtige database.

## Forrige session (16/8 aften) — Stripe live + abonnement-pivot
- **EJER-ORDRE (mid-session, gælder alt): abonnement er STANDARDVEJEN for
  køb; top-up må KUN kunne købes, når man er løbet tør** (saldo ≤ 0,5 —
  `topUpVedSaldoHoejst` i lib/config.ts). Kreditpakkerne (Prøv/Sælger/Bunke)
  er ude af alt UI, men config + checkout-API + webhook understøtter dem
  stadig (gamle events, evt. fortrydelse af pivot = kun UI-arbejde).
- **Stripe LIVE-katalog oprettet via Composio** (konto acct_…huwJ, selja.dk,
  DKK): produkter `selja_plus`/`selja_pro` + 4 recurring-priser, moms-inklusiv,
  lookup keys `selja_plus_md/aar`, `selja_pro_md/aar`. Price-id'erne står i
  `.env.local` (STRIPE_PRICE_*) og kan altid genfindes i Stripe på lookup key.
  **MANGLER: `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`** (hent i
  dashboardet; nøgle-reveal via Composio er blokeret) **og webhook-endpointet
  i Stripe** (kræver deployet URL → `/api/webhooks/stripe`).
- **/priser (S36 leveret):** abonnementer i gran-blokken med md./år-skifte —
  glidende tommel + "pris-rul"-animation (nye autoriserede mikro-animationer,
  DESIGN.md §6). Kreditside: abonnementskøb (md./år), Stripe-**kundeportal**
  ("Administrér abonnement" → skift kort/fakturaer/opsig; ny rute
  `/api/stripe/portal`), top-up kun ved tom saldo.
- **Kontosletning opsiger nu aktive Stripe-abonnementer** (best-effort) før
  data slettes (app/api/konto/slet).
- **Eksperiment-flagsystem** (`lib/eksperimenter.ts`): flags + env-kill-switch
  `EKSPERIMENTER_FRA` ("alle" eller kommaliste — slår fra uden commit).
  Forside-eksperiment "Populært lige nu": mest aktive søgninger + "giver mest
  ved gensalg" + interaktiv pristjekker — ALT fra den committede markedshøst
  (ægte tal, synlig høstdato), intet opdigtet.
- **GDPR:** privatliv + vilkår opdateret (dataansvarlig, retsgrundlag,
  opbevaring/bogføringslov, tredjelande, cookies, abonnementsvilkår med
  fortrydelse/fornyelse/prisvarsel). **Audit: docs/gdpr-audit-2026-08-16.md**
  — P3 og P4 er skrevet i sen aften-sessionen; P1+P2 (DPA'er og
  tredjelandsgrundlag) mangler stadig ejerens dokumentation.
- feat/nyt-item-varetype-maerkesoegning (varetype-katalog + mærkesøgning)
  merget til main og slettet (ejer-regel: kun main).

## Sådan står projektet
- **Én branch: `main`.** Alt er trunk-based og pushet til main — ingen andre
  branches, ingen PRs (stående ejer-regel, HANDOFF §5.1). Fase A er komplet
  og grøn: **290 tests, lint + typecheck + build rene.**
- **Login er nu traditionelt (e-mail + adgangskode)** — magic link er udfaset
  (ejer-beslutning 2026-08-16, A-1 overstyret). Signup auto-bekræftes (ingen
  verifikationsmail — "ingen 2fa med mail"); Supabase auth-config sat til
  `mailer_autoconfirm=true`, `password_min_length=8`. /log-ind har log ind /
  opret konto-faner, 18-gate på opret. Post-login-sideeffekter (aldersflag,
  velkomstmail) i `/api/auth/efter-login`. Glemt-kode-flow parkeret (S39,
  kræver mail). **Admin:** `/admin` (G-1 omkostningsside) er uændret gated på
  `ADMIN_EMAIL` — log ind som normal bruger med den e-mail; alle andre får 404.
- **Supabase færdig-migreret (10 migrations)** via Composio: projekt
  `cpqsmtaledmjzirfeztp` (eu-west-1). Denne session kørte
  `preset_stats_provider` + `kredit_kilder` (pricing v3.0). RLS aktiv,
  `item-photos`-bucket, `credit_balances`-view. Auth = e-mail+adgangskode.
  Dashboard: https://supabase.com/dashboard/project/cpqsmtaledmjzirfeztp
- **`.env.local` findes igen** (Supabase-nøgler + ADMIN_EMAIL + Stripe
  price-id'er). Stadig uden STRIPE_SECRET_KEY/WEBHOOK_SECRET og
  provider-nøgler (FAL/GEMINI/ANTHROPIC) — se §6-checklisten.
- **Gemini som 3. ImageProvider** (`lib/providers/gemini.ts`, REST, ingen ny
  dependency). Model-id'er/cost i config (`billedProvidere`): final =
  gemini-3-pro-image-preview, preview = gemini-2.5-flash-image. fal er fortsat
  failover. Gate 1-scriptet kører alle 3 providers × presets (pass-rate + cost
  side om side, `docs/gate1-eksempel-rapport.md`). Rigtige kald bag `--live` +
  `GEMINI_API_KEY`.
- **Pricing v3.1 (abonnement-standard, 16/8 aften):** Plus 59/md. el. 590/år
  (12 annoncer/md.), Pro 119/md. el. 1190/år (30) — købes på /priser og
  kreditsiden. Top-up 10/69 KUN ved saldo ≤ 0,5. Pakkerne findes kun i
  config/API (ikke UI). Ledger uændret: kredit-kilde + 12 mdr. udløb, forbrug
  subscription → topup → pack (ældste først), idempotent webhook.
  **FLAG til ejeren:** (1) Rollover-loft 2× månedskvote er stadig et FORSLAG.
  (2) Årsabonnement giver kun kvote ved betaling — de øvrige 11 mdr. kræver
  scheduled job (S37). (3) Fortrydelses-/prisvarsel-formuleringerne i
  vilkårene (14 dage / 30 dage) er mine standardvalg — justér hvis du vil
  andet. (4) Pris-id'er er LIVE mode — testkøb rammer rigtige penge.
- **Forsiden:** Vinted-landingen. Billedserie v4 (spejl-selfies, se nedenfor).
  Hero-mærkat + "skitseret eksempel"-note fjernet (ejer-ordre "skriger AI").
  Ingen kronepriser/fast kreditforhold på forsiden — kun neutral kreditvarsling.
- **Næste store opgave: S12** (ende-til-ende mod rigtige providers — Gate 1).
  Kræver FAL_KEY + ANTHROPIC_API_KEY i `.env.local`.

## Produktet udadtil (ejer-beslutning 2026-08-15/16)
Selja er **ét produkt udadtil: Vinted-appen.** Forsiden er Vinted-landingen
(før/efter-hero, "Tøjet vist båret", 3 trin, Vinted-brug, Lær-teaser, sælger-CTA).
B2B-studioet er **parkeret uændret på `/studio`** (ikke i nav/sitemap, `noindex`,
kun diskret footer-link; indhold urørt, omskrivning afventer ejer). `/vinted`
redirecter permanent til `/`. Nav: Sådan virker det / Lær / Priser / Log ind.

## Åbne ejer-beslutninger
- **Katalog-offentliggørelse** (besluttet, bygges senere): brugere kan
  offentliggøre deres visualisering i et katalog. GDPR-korrekt: toggle
  **default FRA** (aktivt tilvalg), KUN den mærkede AI-visualisering — aldrig
  rå brugerfotos (NFR-7). Admin kan skjule/slette. Moderation via Gemini
  safety-ratings / Claude vision — IKKE DeepSeek. Forside-kataloget fyldes med
  Gemini-genererede billeder (ejerens prompts på vej).
- **S27 gratis-tier:** ingen gratis annoncer nu. Alternativ overvejes (gratis
  kørsel med sløret/vandmærket resultat, betal for at låse op). Byg intet endnu.
- **Taktisk kreditmodel:** driften er fortsat 1 kredit/annonce, ½ pr.
  regenerering. Rigere model designes senere; forsidecopy låser intet forhold.
- **Mærkning af genererede billeder:** synlig AI-mærkat MIDLERTIDIGT fjernet fra
  forsiden (imod manifest §2.1.7); "sleek" løsning inden Gate 4. Alt-tekster
  neutrale.
- **Ærligheds-blokken** er taget af forsiden (mørkt bånd forklarer nu praktisk
  Vinted-brug); genplaceres før udgivelse.
- **`.claude/skills/`** (committet fra tidligere session) + **`examples/`**
  (forældet auto-genereret designsystem) hører formentlig ikke til projektet —
  ejeren beslutter sletning. `examples/` er markeret forældet.
- **kontakt.email** i `lib/config.ts` peger på ejerens gmail; skiftes ved domæne.
- **Autoconfirm/ingen mailverifikation** (ejer-ordre) svækker signup-værn, men
  gratis-tier er væk, så misbrug koster betalte kreditter. Genovervej ved skala.

## Billeder og prompts (ejer-princip)
Billederne skal ligne **ægte Vinted-annoncer**. **Ejer-krav 2026-08-16: er der
mennesker på, skal det være spejl-selfie med telefonen foran ansigtet — ALDRIG
sløring, ALDRIG hoved-beskæring, ALDRIG "taget af en ven".** Tøj-uden-menneske
(bøjle, flatlay, close-up med egen hånd) er undtaget. Skal ligne salgsannoncer,
ikke photoshoots. Serie v4 er genereret med **gemini-3-pro-image** (2:3, 2K);
prompterne + realisme-blokken står i `docs/marketing-billeder.md`. Provenance:
alt i `public/eksempler/` er AI-genereret (gemini-3-pro-image, 2026-08-16).

I appen er princippet kodet i `lib/pipeline/skabeloner.ts`:
- **Kategori-skabeloner** (kjole, bukser, jakke, overdel, taske, generisk) valgt
  ud fra itemets kategori; hver har egne visninger og troskabs-fokus.
- **Fast hjem pr. sælger:** deterministisk ét af 5 hjem, låsbart under Konto
  (`profiles.home_anchor`, S31); intet valg = det deterministiske.
- **Prompterne er på engelsk** (modellerne følger engelsk bedre).
- C-2: prompten beskriver ALDRIG tøjet — referencefotoet styrer. C-6: ansigtet
  altid skjult/beskåret væk.

## Vigtige tidligere beslutninger (gælder stadig)
- **Omdøbt Fenja → Selja** (15/8): alle varianter erstattet. Domæne via
  `SELJA_DOMAIN` i `lib/config.ts` (placeholder `selja.studio`; disk-mappen
  hedder stadig `Fenja`). GitHub-repoet omdøber ejeren selv.
- **Gratis-tier afskaffet:** `gratisVedSignup: 0`, signup-grant no-op. E-1 overstyret.
- **Lær-indhold i TS** (`lib/guides-indhold.ts`), ikke markdown. FR-11 overstyret.
- **Demo-tilstand:** uden Supabase-env serverer `lib/supabase/server.ts` en
  demo-bruger + eksempel-items. Bevidst umulig i production — aldrig en bagdør.
- **Ledger:** saldo beregnes af `credit_ledger` (nu udløbs-bevidst via
  `beregn_kredit_status`); al skrivning gennem idempotent `tilfoej_kreditter`.
- **Design:** V6 "Klar & nordisk" — se DESIGN.md.
- **Doc-hygiejne:** HANDOFF/SPEC er "lov", men ejer-overstyringer er foldet ind
  hvor reglerne står; STATUS er øjebliksbilledet; BACKLOG er opgavelisten.

## Kendte huller
- Transaktionsmails er koblet på flowet (S32) men best-effort; præcis-én-gang
  er S34. Afsendelse kræver `RESEND_API_KEY` + domæneverifikation.
- Fase B (`lib/video/`) har interface + mock + prompt-compiler, ingen rigtig
  provider (S33). S3-stubben `lib/providers/video.ts` slettes ved implementering.
- Lighthouse (L1) målt før Vinted-first — genmåles (S26).
- Gate 1 (troskab ≥ 70 %) er **umålt** — S12.
- Dataudtrækket (`/api/konto/eksport`) er testet mod mocks og demo-tilstand;
  det mangler ét smoke-test som rigtig indlogget bruger (S40).
- P1+P2 i GDPR-auditen (DPA'er + tredjelandsgrundlag pr. leverandør) kan kun
  ejeren lukke — skabelonen står klar i `docs/databehandlere.md`.
- Migrationsfilerne `preset_stats_provider` + `kredit_kilder` er nu kørt mod
  cloud-databasen (denne session), så migrationer og DB er i sync igen.
