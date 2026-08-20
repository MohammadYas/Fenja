# STATUS
Sidst opdateret: 2026-08-20 (eftermiddag) af Claude Code

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
