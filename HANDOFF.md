# SELJA · HANDOFF.md — Projektbibel v1.2
> Ændringslog v1.2 (2026-08-16, oprydning): ejer-overstyringer foldet ind hvor
> reglerne står (gratis-tier afskaffet i E-1, priser flyttet til config i E-2,
> guides som TS-data i F-2, midlertidig AI-billedserie i §2.1.7-note), §7's
> backlog-kopi erstattet af henvisning til BACKLOG.md. STATUS.md holder KUN
> øjebliksbilledet — varige regler bor her.
> **Dette dokument er lov.** Alle — mennesker og AI-agenter (Claude Code cloud sessions) — læser dette dokument OG `STATUS.md` før én linje kode skrives. Ved konflikt mellem dette dokument og en sessions egen idé vinder dokumentet. Ændringer til dokumentet sker kun via PR med begrundelse.
>
> Repo-rod skal indeholde: `HANDOFF.md` (denne fil) · `SPEC.md` (selja-spec v0.2, den tekniske spec) · `STATUS.md` (levende log) · `BACKLOG.md` (opgaver) · `DESIGN.md` (designbeslutninger, oprettes af design-sessionen)
---
## 0. Produktet i tre sætninger
Selja hjælper folk med at sælge deres tøj hurtigere på Vinted: upload mobilfotos af et stykke tøj, og få rensede salgsbilleder, en visualisering af tøjet båret i nordisk æstetik, og en færdig annoncetekst med prisforslag — klar til copy-paste. Compliance er indbygget: ægte fotos først, visualiseringer tydeligt mærket, fejl fremhævet frem for skjult. Forretningen: kreditpakker (gratis-tier afskaffet, ejer-beslutning 2026-08-15); sideløbende sælges B2B-annoncepakker manuelt (fase B-motoren) — B2B er udadtil parkeret på /studio, ikke en del af det offentlige site.
> Ændringslog v1.1 (2026-08-15): Vinted-first — forsiden er Vinted-appen alene; B2B parkeret på /studio.
> Omdøbt fra Fenja 15/8-2026 (navnekonflikt): Selja = oldnordisk "at sælge".
---
## 1. Faserne
> Ændringslog v1.1 (2026-08-15): Selja er ét produkt udadtil (fase A/Vinted); fase B sælges via outreach fra /studio, ikke fra forsiden.
### Fase A — Selja for Vinted (MVP, uge 1–3)
Selvbetjent, mobil-first web-app til private Vinted-sælgere. Billeder + tekst, ingen video. Detaljeret i §4 (krav) og `SPEC.md`.
**Exit-kriterie:** Live på eget domæne med betaling, ≥ 10 rigtige brugere, troskabs-pass-rate ≥ 70 %, hele kerneflowet ≤ 2 min.
### Fase B — Videoannonce-motoren (B2B, uge 3+)
Seedance 2.0-pipelinen (brief → scripts → UGC-video → assembly) som beskrevet i `SPEC.md` Tillæg B. Sælges som annoncepakker (3.000–5.000 kr.) til danske SMB'er. Genbruger fase A's auth, jobs, kreditter, provider-lag og storage.
**Exit-kriterie:** Første betalende B2B-leverance gennem pipelinen.
### Fase C — Skalering (måned 2+)
Flere sprog/lande (Vinted findes i 20+ markeder — appen bygges i18n-klar fra dag 1, se NFR-13), crosslisting (Trendsales/DBA), evt. mobilapp, evt. selvbetjent version af videomotoren.
**Exit-kriterie:** Defineres ved fase B-exit.
---
## 2. Designmanifest — ABSOLUT KRAV: intet AI-slop
Dette er et P0-krav på linje med funktionalitet. Selja skal ligne et produkt bygget af et lille, seriøst dansk studio med holdninger — ikke endnu en AI-SaaS fra en skabelon. Brugerne er unge mennesker med veludviklet bullshit-radar; ét AI-slop-signal, og tilliden er væk.
### 2.1 Forbudt (hård liste — PR'er der bryder disse afvises)
1. Lilla/blå gradient-heroes, glassmorphism, neon-glow, mesh-gradients
2. Emojis som ikoner eller i UI-tekst; ✨🚀🔥-sprog overalt
3. Ord som "Supercharge", "Unleash", "Revolutionér", "Boost", "10x", "Magisk", "på steroider" — og alle direkte oversættelser
4. "AI-powered" / "drevet af AI" som salgsargument. Vi sælger resultatet (solgt tøj, bedre billeder, sparet tid) — aldrig teknologien. Ordet "AI" optræder på sitet kun hvor det er lovpligtigt eller ærligt nødvendigt (badge på visualiseringer, vilkår, forklaring af hvordan visualiseringen laves)
5. Tre-kolonners feature-grid med generiske streg-ikoner; "How it works" med 1-2-3-cirkler som eneste struktur
6. Falske testimonials, falske "as seen in"-logoer, opdigtede tal, countdown-timers, fake scarcity
7. AI-genererede personer/stockbilleder som marketing-materiale. Marketing-billeder er ÆGTE produkt-output: rigtige before/after af rigtigt tøj. *(Midlertidig ejer-undtagelse indtil S12/S25: forsidens billedserie er AI-genereret efter reglerne i `docs/marketing-billeder.md` — spejl-selfies, aldrig "taget af en ven", p.t. uden synlig mærkat (ejer-ordre, deadline Gate 4). Udskiftes med ægte output efter første rigtige kørsel.)*
8. Udefineret skabelon-look: rå shadcn/Tailwind-defaults uden egne tokens; Inter som hele identiteten
9. Disse tre "AI-default-æstetikker" (de er blevet genkendelige AI-tegn): (a) cremet baggrund + kontrastserif + terracotta-accent, (b) næsten-sort + én syregrøn/vermillion accent, (c) avis-layout med hairlines og nul border-radius
10. Overflødige animationer, parallax-cirkus, scroll-hijacking, AI-chatbot-widget i hjørnet
11. Engelske buzzwords i dansk copy; "dashboard", "features", "pricing" i UI'et (hedder: oversigt, sådan virker det, priser)
12. Cookie-banner-teater ud over det lovpligtige; nyhedsbrev-popup
### 2.2 Påkrævet
1. **Én designfase FØR UI-kode:** en dedikeret session producerer `DESIGN.md` med token-system (4–6 navngivne farver i hex, 2–3 skrifter med roller, typeskala, spacing, layoutkoncept, ét signatur-element) + begrundelser. Al UI-kode deriverer derefter fra tokens — ingen ad hoc-farver eller -størrelser
2. **Retning (startforslag — design-sessionen må udfordre det, men skal begrunde):** nordisk redaktionelt & taktilt. Tøj er tekstil — designet må gerne føles materielt. Forslag til tokens: Kalk `#F1F3F2` (baggrund), Koks `#212523` (tekst), Gran `#24513F` (primær), Hør `#D8D3C6` (flader), Rav `#C97F1B` (kun til pris/CTA-detaljer). Skrifter: karakterfuld grotesk til display (fri licens, self-hosted), rolig læseskrift til brødtekst, mono til tal/priser. Dette er bevidst IKKE nogen af de tre forbudte defaults
3. **Signatur-element:** before/after-visningen af rigtigt tøj er produktets stærkeste bevis — gør DEN til det visuelle omdrejningspunkt (landing page-hero er et ægte before/after, ikke en illustration)
4. **Copy-regler:** dansk, konkret, ærlig, lavmælt selvsikker. Aktiv form. Tal frem for tillægsord ("færdig annonce på 2 minutter", ikke "lynhurtigt"). Knapper siger hvad de gør ("Lav min annonce", ikke "Kom i gang"). Fejlbeskeder forklarer hvad der skete og hvad man gør — uden undskyldnings-teater
5. **Kvalitetsgulv uden at prale af det:** responsivt ned til 320 px, synligt keyboard-fokus, `prefers-reduced-motion` respekteret, rigtige alt-tekster, kontrast ≥ WCAG AA
6. **Fotografisk ærlighed:** produktbilleder på sitet er uredigerede skærmbilleder/output. Visualiserings-badge ("Visualisering" + AI-mærkning i metadata) er lovpligtigt på genererede billeder og fjernes ALDRIG — det er ikke i konflikt med 2.1.4: brandet praler ikke af AI, men produktet skjuler den heller ikke hvor loven og ærligheden kræver mærkning
### 2.3 Slop-tjek (køres af hver UI-PR)
Selvkritik i PR-beskrivelsen: "Hvilke 3 elementer i denne ændring kunne stamme fra en hvilken som helst AI-genereret SaaS — og hvad gjorde jeg ved dem?" Kan spørgsmålet ikke besvares konkret, er PR'en ikke klar.
---
## 3. Arkitektur & repo-struktur
Stack (låst, se `SPEC.md` §11): Next.js (App Router) + TypeScript strict · Netlify (kun UI + lette routes; langvarige jobs i Trigger.dev) · Supabase via CLI (Postgres, Auth med e-mail+adgangskode, Storage) · Trigger.dev · fal.ai + Gemini bag provider-interfaces · Claude API (tekst) · Stripe · Resend · Tailwind + egne tokens · sharp.
```
/                     HANDOFF.md · SPEC.md · STATUS.md · BACKLOG.md · DESIGN.md
/app                  Next.js App Router (da som default-locale, i18n-klar)
  /(marketing)        landing, priser, laer/[slug], vilkaar, privatliv
  /(app)              oversigt, items/[id], nyt-item, kreditter, konto
  /api                lette routes (webhooks: stripe, trigger; upload-signering)
/components           UI-komponenter (deriverer KUN fra /lib/design/tokens)
/lib
  /design             tokens.ts (eneste kilde til farver/typo/spacing)
  /providers          image.ts (ImageProvider-interface) · fal.ts · mock.ts
                      video.ts (fase B, interface defineres nu, implementeres senere)
  /pipeline           cleanup.ts · onmodel.ts · fidelity.ts · listing-text.ts · badge.ts
  /credits            ledger.ts (transaktionel logik)
  /copy               da.ts (AL brugervendt tekst samles her — i18n-klar, copy-review muligt)
/trigger              item-pipeline.ts (jobdefinitioner)
/supabase             config.toml · /migrations (AL skemaændring som migration — aldrig dashboard)
/scripts              gate1-fidelity-test.ts m.fl.
/tests                unit (pipeline-logik, kreditter) · fixtures (testbilleder)
/public/fonts         self-hostede skrifter (fri licens, licensfil vedlagt)
.env.example          ALLE nødvendige nøgler, dokumenteret, ingen værdier
```
---
## 4. Komplet kravliste
### Epic 1 · Konto & adgang
| ID | Krav | Prio |
|---|---|---|
| A-1 | ~~Magic link-login~~ **Traditionelt login: e-mail + adgangskode** (ejer-beslutning 2026-08-16). Signup auto-bekræftes (ingen verifikationsmail — ejer-ordre "ingen 2fa med mail"). Glemt-kode-flow parkeret (S39). Magic link er udfaset | P0 |
| A-2 | Signup kræver bekræftelse af 18+ (Vinteds egen aldersgrænse) på opret-fanen; under 18 afvises venligt | P0 |
| A-3 | Konto-side: e-mail, kreditsaldo, købshistorik, slet konto | P0 |
| A-4 | Slet konto = fuld sletning af alle billeder, items og persondata inden 24 t (GDPR) | P0 |
| A-5 | Session-håndtering der overlever app-genstart på mobil | P0 |
### Epic 2 · Item-flowet (kernen)
| ID | Krav | Prio |
|---|---|---|
| B-1 | "Nyt item": guidet fotooptagelse/upload med 4 roller — helhed (påkrævet), bagside, label, fejl — med eksempelbillede pr. rolle | P0 |
| B-2 | Klientside-komprimering før upload (mobildata!); målstørrelse ≤ 1,5 MB/foto uden synligt kvalitetstab | P0 |
| B-3 | Metadatafelter: mærke (autocomplete på kendte mærker), størrelse, stand (Vinteds standskala), fejlbeskrivelse (fri tekst), kategori, evt. købspris | P0 |
| B-4 | Ét samlet "Lav min annonce"-tryk starter hele pipelinen; progress-visning med reelle trin (renser billeder → laver visualisering → skriver tekst) | P0 |
| B-5 | Resultatside i ejerens rækkefølge (overstyret 2026-08-20): (1) visualisering(er) med badge, (2) titel/beskrivelse/prisforslag med kopiér-knap pr. element, (3) checkliste "sådan lægger du den på Vinted". **De rensede ægte fotos vises IKKE længere** — de er kun input til modellen (ejer-beslutning 2026-08-20, erstatter FR-6's "ægte fotos først") | P0 |
| B-6 | Delvis leverance ved fejl: fejler visualiseringen, leveres rens + tekst alligevel, og visualiserings-kreditten refunderes automatisk | P0 |
| B-7 | Item-bibliotek: alle items med status kladde/aktiv/solgt; gen-download; "markér som solgt" med salgspris | P0 |
| B-8 | Regenerér enkeltdele (ny visualisering i andet preset, ny tekst) til reduceret kreditpris | P1 |
| B-9 | Batch: fotografér flere items i træk, pipeline kører dem parallelt | P1 |
| B-10 | Statistik: samlet salgsværdi, antal solgte, gennemsnitlig liggetid | P1 |
### Epic 3 · Billedpipeline
| ID | Krav | Prio |
|---|---|---|
| C-1 | Baggrundsrens til neutral flade + global lys/farvekorrektion. ALDRIG lokal retouch — slid, pletter og fnuller SKAL bevares | P0 |
| C-2 | On-model-generering: ægte foto som styrende reference; prompt styrer person/positur/setting — aldrig tøjets udseende. Præcise regler i `SPEC.md` §9 | P0 |
| C-3 | Automatisk troskabs-tjek (vision-model): samme print/farve/snit? Score under tærskel → 1 retry med strammere reference → ellers B-6-fallback | P0 |
| C-4 | Synligt "Visualisering"-badge + AI-metadata (EU AI-forordningen art. 50) indlejret via sharp; kan ikke fravælges | P0 |
| C-5 | 3 nordiske presets ved launch (fx lys minimalisme / københavnsk gade / hyggelig stue); versioneret med pass-rate-statistik | P1 |
| C-6 | Person-diversitet i rotation; aldrig genkendelige/virkelige personer; ingen "forbedring" af hvordan tøjet sidder | P0 |
| C-7 | Alle provider-kald bag `ImageProvider`-interface med mock-implementering til test/CI | P0 |
| C-8 | Output-formater matcher Vinteds visning (4:5-venlig beskæring tilbydes) | P1 |
### Epic 4 · Annoncetekst
| ID | Krav | Prio |
|---|---|---|
| D-1 | Claude genererer titel (søgbar: mærke + type + størrelse), beskrivelse, søgeord, prisforslag — på dansk, i naturligt "privat sælger"-sprog, ikke reklamesprog | P0 |
| D-2 | Fejl fra fejl-feltet SKAL fremgå af beskrivelsen — håndhævet med validering, ikke kun prompt | P0 |
| D-3 | Label-fotoet aflæses (materiale, vaskeanvisning) og flettes ind når muligt | P1 |
| D-4 | Prisforslag baseret på mærke/kategori/stand med kort begrundelse ("lignende [mærke]-striktrøjer ligger typisk X–Y kr.") — formuleret som forslag, aldrig garanti | P0 |
### Epic 5 · Kreditter & betaling
| ID | Krav | Prio |
|---|---|---|
| E-1 | ~~3 gratis annoncer ved signup~~ **Ingen gratis annoncer** (ejer-beslutning 2026-08-15, misbrugsværn; `gratisVedSignup: 0`, signup-grant er no-op). Alternativ overvejes i S27 — byg intet før ejeren vælger. Saldo altid synlig | P0 |
| E-2 | Kreditpakker, top-up og abonnementer via Stripe Checkout; ALLE produkter og priser bor i `lib/config.ts` (pricing v3.0) — aldrig hårdkodet i kode eller docs; webhook → ledger | P0 |
| E-3 | Ledger-model: hver bevægelse er en linje (signup/køb/levering/refund); saldo er summen; kredit trækkes i samme transaktion som leverancen markeres komplet | P0 |
| E-4 | Idempotente webhooks og jobs: dubletter må aldrig koste dobbelt | P0 |
| E-5 | Misbrugsværn: rate limits pr. bruger, globalt dagligt API-budgetloft med kill-switch. (E-mailverifikation før gratis-kreditter er bortfaldet: gratis-tier er afskaffet, og signup auto-bekræftes — ejer-ordre 2026-08-16. Misbrugs-omkostningen er nu betalte kreditter, ikke gratis) | P0 |
| E-6 | Kvitteringer via Stripe; moms korrekt konfigureret (dansk B2C) | P0 |
### Epic 6 · Marketing-site & Lær
| ID | Krav | Prio |
|---|---|---|
| F-1 | Landing page efter designmanifestet: ægte before/after som hero, priser, hvordan-det-virker i ægte skærmbilleder, vilkår/privatliv | P0 |
| F-2 | "Lær"-sektion: 5–8 guides som TS-data i `lib/guides-indhold.ts` (ejer-beslutning — IKKE markdown). Emner: sourcing (genbrug/kilosalg/loppemarked/dødsbo), prissætning, fototeknik, Vinteds regler, hvornår Vinted Pro. Indhold må ALDRIG opfordre til kommercielt salg på privat konto | P1 |
| F-3 | SEO-basics: metadata, OG-billeder (ægte output), sitemap, semantisk HTML, dansk lang-tag | P1 |
| F-4 | Delbart before/after-billede pr. item, formateret til TikTok-slideshow (brugerens valg, aldrig automatisk deling) | P1 |
### Epic 7 · Drift & observability
| ID | Krav | Prio |
|---|---|---|
| G-1 | Omkostningslog pr. generering (kr.) aggregeret pr. bruger/dag; simpel admin-side kun for dig | P0 |
| G-2 | Fejlsporing (Sentry el. lign. free tier) på app + jobs | P1 |
| G-3 | Trigger.dev-runs synlige med genkørsel af fejlede jobs | P0 |
| G-4 | Backup: Supabase PITR/backup aktiveret; migrations gør skemaet reproducérbart | P1 |
### Epic 8 · Fase B-forberedelse (bygges nu, bruges senere)
| ID | Krav | Prio |
|---|---|---|
| H-1 | `VideoProvider`-interface defineret parallelt med `ImageProvider` (implementering venter) | P1 |
| H-2 | Ingen fase A-beslutning må blokere Tillæg B-pipelinen (jobs, storage og kreditter skal kunne bære video-workloads) | P1 |
### Ikke-funktionelle krav
| ID | Krav |
|---|---|
| NFR-1 | Mobil-first: hele kerneflowet fejlfrit på 320–430 px; touch-mål ≥ 44 px |
| NFR-2 | Ydelse: LCP < 2,0 s på 4G på marketing-sider; app-interaktioner < 100 ms; billeder lazy + rigtige størrelser |
| NFR-3 | Komplet annonce ≤ 2 min; pipeline-trin parallelle hvor muligt |
| NFR-4 | TypeScript strict; ingen `any`; lint + typecheck + tests som CI-krav før merge |
| NFR-5 | Tests: unit på pipeline-logik, kreditledger og compliance-regler (badge, rækkefølge, fejl-i-tekst) med mock-providers; CI kører uden rigtige nøgler |
| NFR-6 | Sikkerhed: RLS på alle tabeller; signerede upload-URLs; ingen service-nøgler i klient; secrets kun i env |
| NFR-7 | Privatliv: billeder bruges KUN til brugerens egen leverance; ingen træning, ingen deling; privatlivspolitik på menneskedansk |
| NFR-8 | Tilgængelighed: WCAG AA-kontrast, fokusringe, labels, alt-tekster |
| NFR-9 | Faste omkostninger ≤ 500 kr./md. ved lav trafik |
| NFR-10 | Idempotens overalt hvor penge eller kreditter flyttes |
| NFR-11 | AI-cost pr. komplet annonce ≤ 2 kr.; måles i G-1 |
| NFR-12 | Al brugervendt tekst i `/lib/copy/da.ts` — aldrig hårdkodet i komponenter |
| NFR-13 | i18n-klar: locale-struktur fra dag 1, dansk som eneste aktive sprog i fase A |
---
## 5. Arbejdsprotokol — sådan arbejder sessions i dette repo
### 5.1 Hver session, hver gang
> **Branch-regel (ejer-ordre 2026-08-16, erstatter det gamle PR-flow): der
> findes KUN `main`.** Ingen feature-branches, ingen PRs. Arbejd trunk-based:
> små commits direkte på main, pushet løbende. Arbejdes der parallelt (fx
> agenter i worktrees), rebases på nyeste main og leveres til main med det
> samme — branchen slettes i samme åndedrag. Alt der før stod om "PR" læses
> som "commit-serie på main med samme beskrivelseskrav".
1. Læs `HANDOFF.md` + `STATUS.md` + relevant afsnit af `SPEC.md`/`DESIGN.md`
2. Tag ÉN opgave fra `BACKLOG.md` (øverste uafhængige, medmindre opgaven er givet i prompten)
3. Små commits, conventional commits på engelsk (`feat: add credit ledger with idempotent delivery charge`)
4. Afslut ALTID med: (a) alle tests/lint/typecheck grønne FØR push, (b) afsluttende commit-besked med: hvad, hvorfor, hvordan testet (+ slop-tjekket fra §2.3 ved UI), (c) opdatering af `STATUS.md` og afkrydsning i `BACKLOG.md` i samme serie
5. Én opgave = én sammenhængende commit-serie. Ingen "mens jeg var i gang"-ændringer uden for opgavens scope
### 5.2 Forbudt for sessions
- Committe secrets eller rigtige nøgler (kun `.env.example` opdateres)
- Kalde rigtige betalings-/billed-APIs uden at opgaven eksplicit siger det og nøgler findes
- Køre `supabase link`/`db push` mod produktion, deploye, eller ændre Netlify/Stripe-konfiguration — det gør KUN ejeren (se §6)
- Tilføje dependencies uden begrundelse i PR (og aldrig for noget under ~30 linjer egen kode)
- Bryde designmanifestet (§2) eller compliance-reglerne (`SPEC.md` §8.2)
- Efterlade branches: `main` er den eneste branch (§5.1). Opstår en midlertidig worktree-branch, slettes den ved levering
### 5.3 Definition of Done (gælder alle opgaver)
Kode typechecker og linter rent · relevante tests skrevet og grønne · fungerer med mock-providers uden nøgler · mobilvisning verificeret ved UI · copy i `/lib/copy/da.ts` og på manifest-dansk · `STATUS.md` opdateret · ingen TODO'er uden tilhørende BACKLOG-punkt
### 5.4 STATUS.md-format (opret som første opgave)
```
# STATUS
Sidst opdateret: <dato> af <session/menneske>
## Nu
<hvad der er i gang, af hvem>
## Senest færdigt
- <dato> PR #<n>: <én linje>
## Blokeret / afventer ejer
- <fx: kræver fal-nøgle, kræver supabase link — se §6>
## Beslutninger truffet undervejs
- <dato>: <beslutning + hvorfor>
```
---
## 6. Ejerens hjemme-checkliste (det eneste, der IKKE kan gøres fra mobilen)
1. ✅ FÆRDIG (2026-08-16, via Composio): Supabase-cloudprojekt `cpqsmtaledmjzirfeztp` (eu-west-1) oprettet og migreret; RLS + storage-bucket på plads
2. `.env.local` skal genskabes fra `.env.example` (nøgler i Supabase-dashboardet → Settings → API) — filen findes ikke på maskinen p.t.
3. Opret Netlify-site koblet til repoet; sæt env-variabler fra `.env.example` (Supabase URL/anon, service key KUN som server-env, fal-nøgle, Anthropic-nøgle, GEMINI_API_KEY, Stripe test-nøgler, Trigger.dev, Resend)
4. Opret fal.ai-konto + nøgle; kør `scripts/gate1-fidelity-test.ts` med 20 fotos af tøj fra din egen garderobe → skriv resultatet i `STATUS.md` (Gate 1 = S12!)
5. Stripe: opret produkt/priser i testmode (id'er fra `lib/config.ts` pricing v3.0); sæt webhook mod Netlify-URL
6. Trigger.dev-projekt + Resend-domæneverifikation
7. Registrér domæne (tjek selja.ai/getselja.com/selja.studio + virk.dk/EUIPO) — indtil da bruges `SELJA_DOMAIN`-placeholderen i `lib/config.ts`
Indtil da: sessions arbejder mod mocks. Kun S12 kræver rigtige nøgler.
---
## 7. Backlog
Opgaverne bor i `BACKLOG.md` — den er sandheden, altid ajour, tages oppefra.
(Startindholdet der før stod her, er udført; fase A S1–S16 er færdig — se
BACKLOG.md's kvitteringsliste.)
---
## 8. Kvalitetsgates før offentlig lancering
Alle skal være grønne: Gate 1 troskab ≥ 70 % (ellers: on-model slås fra, MVP = rens+tekst) · Gate 2 komplet annonce ≤ 2 min · compliance-testene grønne (badge, rækkefølge, fejl-i-tekst kan ikke omgås) · Lighthouse mobil ≥ 90 på marketing-sider · én person uden instruktion gennemfører flowet på egen telefon · slop-gennemgang af HELE sitet mod §2.1-listen · vilkår + privatliv + moms på plads · budgetloft og kill-switch testet.
---
## 9. Referencer
`SPEC.md` (selja-spec v0.2): fuld teknisk spec — datamodel, billedpipeline-detaljer, preset-system, unit economics, risici, Tillæg B (videomotoren). Vinteds katalogregler + kommercielt salg-regler: læses af enhver session, der rører compliance-logik eller Lær-indhold. EU AI-forordningens mærkningskrav (art. 50, i kraft 2/8-2026): baggrund for C-4.
*Handoff slut. Én opgave, én PR, opdatér STATUS — og intet slop.*
