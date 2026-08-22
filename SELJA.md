# SELJA — komplet overblik

Sidst opdateret: 2026-08-22. Dette dokument beskriver HELE produktet: hvad det
er, hvordan det er bygget, hvilke konti det kører på, og hvad der mangler.
**Giv dette dokument til enhver AI-assistent, der skal arbejde på Selja** — det
er skrevet til at kunne læses koldt.

> **Til assistenter:** ejeren (mo) skriver kort, dansk og i høj kadence, ofte
> med nye ordrer midt i en igangværende opgave — og han **omgør tit tidligere
> beslutninger**. Læs ALTID hans seneste besked som facit; dette dokument og
> `MANGLER.md` kan være timer bagud. Han vil have handling frem for afklarende
> spørgsmål: handl på rimeligste fortolkning, og skriv fortolkningen i
> opsummeringen, så han kan korrigere.

---

## 1. Hvad er Selja?

**Selja** (selja.dk) er en dansk web-app til private Vinted-sælgere. Brugeren
tager 2–4 mobilfotos af et stykke tøj og får på ca. 2 minutter:

1. **Rensede salgsfotos** (bruges som billede 1 på Vinted)
2. **En AI-visualisering af tøjet båret** — altid tydeligt mærket som
   genereret; må kun bruges som supplement, aldrig billede 1
3. **Færdig annoncetekst**: titel, beskrivelse, søgeord og prisforslag bygget
   på ægte Vinted-markedspriser — klar til copy-paste

Navnet er oldnordisk for "at sælge". Brandet er **ærlighed**: fejl/slid nævnes
altid, ingen fabrikerede anmeldelser, AI-mærkning følger EU AI-forordningen
art. 50. Tone: dansk, konkret, lavmælt selvsikker (HANDOFF §2.2.4).
B2B-delen er parkeret på `/studio` (noindex).

## 2. Forretningsmodel

- **1 kredit = 1 genereret billede.** Kreditter reserveres når genereringen
  startes; fejlede billeder refunderes automatisk. Udløber efter 12 måneder.
- **ABONNEMENT KRÆVES for at købe kreditter** (ejer-beslutning 22/8 — denne
  er blevet vendt frem og tilbage; dette er den gældende):
  - **Plus: 59 kr./md. / 590 kr./år** — 12 kreditter/md.
  - **Pro: 119 kr./md. / 1190 kr./år** — 30 kreditter/md.
  - Rollover: ubrugt kvote følger med, loft = 2× månedskvoten.
- **Ekstra kreditter** (Prøv 5/49 · Sælger 15/89 · Bunke 40/169 · Lager
  100/349) og top-up (10/69) kan **kun købes af abonnenter** — gaten sidder i
  `app/api/stripe/checkout/route.ts`, ikke kun i UI.
- **Opsigelse tager ALDRIG kreditter.** Stripe holder abonnementet `active`
  til periodens udløb (lovkrav), og webhooken rører aldrig ledgeren ved
  `customer.subscription.deleted`. Låst med test.
- **Opsigelse lukker heller ikke for kreditkøb før periodens udløb** (ejer
  22/8, 2. runde): også et abonnement, der står som `canceled` hos Stripe
  (straks-opsigelse), tæller som abonnent, indtil den betalte periode er
  udløbet — `giverAdgang` i `lib/betaling/abonnement.ts`, låst med test.
- Ingen gratis kreditter ved signup (misbrugsværn).
- Regenerering af én del: ½ kredit.

**Abonnent-fordele (alle):** Smart Salgsplan på oversigten, Ugens Salgsplan på
mail (mandag 06 UTC), Garderobe-radar, Sæson-kalender, Pris-trappe
(nedtrapningsplan pr. annonce, 22/8), Annonce-doktor (sundhedstjek med score
0-100 og konkrete råd pr. annonce, 22/8 — Plus ser de 3 der trænger mest),
salgsstatistik.
**Kun Pro:** Konkurrent-tjek (pris mod markedets p25/median/p75),
Flip-beregner (maks indkøbspris i genbrug + forventet gevinst, 22/8),
Annonce-doktor uden loft (alle annoncer) og Bundle-bygger (2–4 annoncer →
én pakke-annonce). Pro har OGSÅ alle Plus-fordele.
**Oversigtens layout (22/8):** annoncerne og statistikken står ØVERST;
alle værktøjs-paneler er sammenklappelige `<details>` under overskriften
"Salgsværktøjer" (kun Smart Salgsplan åben som standard); Suppliers-kortet
nederst.
Favorit-overvågning er LOVET i copy, men IKKE bygget (S35).

## 3. Teknisk arkitektur

| Lag | Teknologi | Detaljer |
|---|---|---|
| Frontend/backend | **Next.js 15** (App Router, TypeScript) | Dansk kodebase (funktioner/variabler på dansk) |
| Hosting | **Netlify**, site `selja` | GitHub-koblet: push til `main` auto-deployer (~4–5 min). Domæner: selja.dk, www, selja.netlify.app |
| Database/Auth/Storage | **Supabase** `cpqsmtaledmjzirfeztp` (eu-west-1) | Postgres + RLS, e-mail/kode + Google OAuth, privat bucket `item-photos`, offentlig `forside-billeder` |
| Tunge jobs | **Trigger.dev** `proj_zmmrdmvkjhnxepwlxssi` (org SDu) | `item-pipeline`, `item-regen`, `salgsplan-digest` (mandag 06 UTC), `udloebsvarsel` (dagligt 07 UTC) |
| Betaling | **Stripe** LIVE `acct_1U55tgQu1PV9huwJ` | Checkout + portal + webhook `https://selja.dk/api/webhooks/stripe`. Priser via lookup keys `selja_plus_md/aar`, `selja_pro_md/aar` |
| Mails | **Resend** (selja.dk verificeret) | Transaktionsmails fra `Selja <post@selja.dk>` + Supabase auth-mails via SMTP. OBS: Resend-kontoen er oprettet på krausesigne@gmail.com |
| Billed-AI | **Google Gemini** | Rens `gemini-3.1-flash-image` (0,28 kr.), visualisering `gemini-3-pro-image-preview` (0,95 kr.), vision flash |
| Tekst-AI | DeepSeek | **MÅ IKKE nævnes udadtil** (ejer-ordre) — privatpolitikken siger "ekstern sprogmodel-leverandør" |

**Deploy:** `git push` → Netlify bygger i skyen. Trigger.dev deployes separat:
`npx trigger.dev@4.5.12 deploy` (versionen SKAL matche `@trigger.dev/*` i
package.json). `syncEnvVars` skubber nøgler til jobmiljøet ved hvert deploy.

## 4. Kodestruktur

- `app/(marketing)/` — forside, /priser, /laer (14 guides i
  `lib/guides-indhold.ts`), /kontakt, /log-ind, /ny-adgangskode, /vilkaar,
  /privatliv
- `app/(app)/` — /oversigt, /nyt-item (5-trins wizard), /items/[id],
  /kreditter, /konto, /onboarding, /admin
- `app/api/` — items, stripe (checkout/portal), webhooks/stripe, auth
  (callback + **confirm** = token_hash-flow), upload-signering, feedback,
  kontakt, besoeg (tracking), bundle, konto (eksport/slet/hjem), admin
  (klager, kreditter, forside-billeder)
- `lib/pipeline/` — run.ts, start.ts, **skabeloner.ts** (kategori→prompt),
  **hjem-generator.ts** (1000 hjem), **hjem-tildeling.ts** (ét sted pr.
  sælger), markedspriser.ts, visninger.ts, badge/share (sharp)
- `lib/credits/ledger.ts` — AL kreditlogik, idempotent
- `lib/betaling/` — webhook.ts (læser BÅDE gammel og ny Stripe-API-form!),
  abonnement.ts (slår op på **stripe_customer_id**, e-mail som fallback)
- `lib/salg/` — smart-plan, saeson, radar, statistik, kalender, konkurrent,
  pristrappe, flip, doktor (rene funktioner, fuldt testede)
- `lib/sikkerhed/` — **ratelimit.ts** (DB-baseret, hashet IP),
  **validering.ts** (skema, kasserer ukendte felter)
- `lib/copy/da.ts` + `vinted.ts` — AL brugervendt tekst
- `lib/config.ts` — priser, kvoter, misbrugsværn, modeller. ÉN kilde
- `tests/` — 441 tests (vitest). **Copy-vagter håndhæver ærlighedsregler**
  (maks 4 tankestreger på forsiden, 2-minutters-løftet skal være afgrænset)

## 5. Hjemmet på billederne (vigtigt koncept)

Hver sælger får **ét fast sted**, så alle deres annoncer ligner samme hjem.

- **1000 hjem** genereres deterministisk fra byggeklodser (by × bolig × spejl
  × gulv × lys × stue = 450.450 mulige kombinationer) i `hjem-generator.ts`
- **Eksklusivt**: unikt DB-indeks på `profiles.home_anchor`. Tildelingen
  SKRIVER for at kræve stedet og går videre ved unique_violation — atomisk,
  ingen race. To sælgere kan aldrig dele sted.
- **Højst 3 skift** (`hjemRotation.maks`), tælles i `profiles.hjem_rotationer`,
  skrevet med service-rollen så klienten ikke kan nulstille
- Serveren vælger hvad man skifter TIL. Sælgeren ser **ikke** stedets navn
- Prompt-kvalitet: hvert spejl har en defekt, gulve har slid, lyset navngiver
  retning + hvidbalance + skygger og slutter altid "no flash", hvert rum har
  hverdagsrod. Låst med `tests/unit/hjem-prompt.test.ts`

## 6. Sikkerhed & compliance

- **Rate limiting** på offentlige ruter (DB-baseret, bruger-id eller hashet IP)
- **Skema-validering** kasserer ukendte felter (mod massetildeling)
- Admin: 404 for alle ikke-admins; `ADMIN_EMAIL` = kommasepareret liste
- Webhook: signatur verificeres altid; kreditering idempotent
- Upload: signerede URLs, sti låst til brugerens mappe
- Misbrugsværn: 15 annoncer/bruger/dag, dagligt budgetloft 200 kr.
- Origin-header valideres mod allowlist i checkout/portal
- Security-headers via `next.config.ts` (rammer også SSR-svar)
- GDPR: selvbetjent eksport + sletning; bilag 5 år; audit i
  `docs/gdpr-audit-2026-08-16.md` (P1+P2 åbne)
- E-mail-bekræftelse er **TIL** og E2E-verificeret
- Ingen hardcodede nøgler; `.env` aldrig committet; `server-only` på alle
  moduler der rører service-nøglen

## 7. Kendte root causes (gentag dem ikke)

1. Gemini leverer data-URLs, ikke storage-stier
2. `generations.preset_id` uuid vs. tekst-id
3. Tekstvalidering krævede størrelse ordret
4. Google nedlagde gemini-2.5-flash (404)
5. Provider-reference var storage-sti, ikke data-URL
6. Vision-503 væltede hele leverancen
7. Troskabs-spørgsmålet kasserede produkt-visninger som "ikke båret"
8. Produkt-prompten arvede on-model-negativlisten → floatende tøj
9. Lokal Windows-deploy manglede linux-sharp → alle oprettelser 500'ede
10. **Stripe-webhooken læste kun den gamle API-form** — første rigtige køb blev
    betalt uden kreditering (`invoice.parent.subscription_details`)
11. **PKCE-bekræftelseslink virkede kun i signup-browseren** → token_hash-flow
12. Redirects brugte `url.origin`, som bag Netlify kan være branch-domænet
13. **Shorts matchede bukser-skabelonen**, hvis regler forbød "shorts" og
    "bare legs" → modellen forlængede dem til lange bukser

## 8. Dokumenter

- `SPEC.md` v0.2 + `HANDOFF.md` v1.0 = "loven" — MEN `STATUS.md`s
  beslutnings-sektion registrerer ejerens overstyringer (der er mange)
- `MANGLER.md` = hvad der mangler før/efter launch
- `BACKLOG.md` = nummererede opgaver (S12, S35, S39…)
- `TESTPLAN.md` = prioriteret tjekliste FØR TikTok-trafik og rigtige brugere
- `docs/supabase-mail-skabeloner.md` = mail-skabelonerne SKAL pege på
  /auth/confirm med token_hash (glemt-kode-fejlen 22/8; kræver dashboardet)
- `SELJA.md` (denne) = samlet overblik

Stående regler: kun ÉN branch (`main`), ingen PRs; al copy i `lib/copy`;
nøgler kun i gitignoret `.env.local`; v6-designet "Klar & nordisk".
**Kør altid `npm test` FØR commit** — copy-vagterne fanger ærlighedsbrud.
