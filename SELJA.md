# SELJA — komplet overblik (til mennesker og fremtidige chatbots)

Sidst opdateret: 2026-08-21. Dette dokument beskriver HELE produktet: hvad det
er, hvordan det er bygget, hvilke konti det kører på, og hvad ejeren mangler
at gøre. Giv det til enhver AI-assistent, der skal arbejde på Selja.

---

## 1. Hvad er Selja?

**Selja** (selja.dk) er en dansk web-app til private Vinted-sælgere. Brugeren
tager 2–4 mobilfotos af et stykke tøj og får på ca. 2 minutter:

1. **Rensede salgsfotos** (baggrund/lys fikset — bruges som billede 1 på Vinted)
2. **En AI-visualisering af tøjet båret** (altid tydeligt mærket som genereret;
   må kun bruges som supplement, aldrig billede 1)
3. **Færdig annoncetekst**: titel, beskrivelse, søgeord og prisforslag bygget
   på ægte Vinted-markedspriser — klar til copy-paste

Navnet er oldnordisk for "at sælge". Brandet er **ærlighed**: fejl/slid nævnes
altid, ingen fabrikerede anmeldelser, AI-mærkning følger EU AI-forordningen
art. 50. Tone: dansk, konkret, lavmælt selvsikker (defineret i HANDOFF §2.2.4).
B2B-delen (UGC/hjemmesider) er parkeret på `/studio` (noindex).

## 2. Forretningsmodel

- **1 kredit = 1 genereret billede.** Kreditter reserveres når generering
  startes; fejlede billeder refunderes automatisk. Kreditter udløber efter 12 mdr.
- **Abonnement er standardvejen** (ejer-beslutning):
  - **Plus: 59 kr./md. eller 590 kr./år** — 12 kreditter/md.
  - **Pro: 119 kr./md. eller 1190 kr./år** — 30 kreditter/md.
  - Rollover: ubrugt kvote følger med, loftet er 2× månedskvoten.
- **Engangspakker (tilbage i UI 21/8, ejer-ordre "skal have omsætning"):**
  Prøv 5/49 kr. · Sælger 15/89 kr. (anbefalet) · Bunke 40/169 kr. · Lager
  100/349 kr. — købes af alle på kreditsiden, ingen abonnement nødvendigt.
- **Top-up** (10 kreditter/69 kr.) kan KUN købes af aktive abonnenter, og kun
  når saldoen er under 0,5 kredit.
- Ingen gratis kreditter ved signup (misbrugsværn, ejer-beslutning).
- Regenerering af én del (ny visualisering/tekst): ½ kredit.

**Abonnent-fordele (alle):** Smart Salgsplan (sælg nu/sæt ned/vent) på
oversigten, Ugens Salgsplan på mail hver mandag 06 UTC (Trigger.dev-schedule),
Garderobe-radar (garderobens værdi + hvad der er værd at source, sæsonvægtet),
Sæson-kalender (12 måneder frem: hvornår topper hvert stykke), salgsstatistik.
**Kun Pro:** Konkurrent-tjek (din pris mod markedets p25/median/p75 pr. annonce).
Favorit-overvågning er LOVET i copy men IKKE bygget (kræver Vinted-data, S35).

## 3. Teknisk arkitektur

| Lag | Teknologi | Detaljer |
|---|---|---|
| Frontend/backend | **Next.js 15** (App Router, TypeScript) | Ét repo, dansk kodebase (funktioner/variabler på dansk) |
| Hosting | **Netlify**, site `selja` | GitHub-koblet: push til `main` auto-deployer. Domæner: selja.dk, www.selja.dk, selja.netlify.app |
| Database/Auth/Storage | **Supabase** projekt `cpqsmtaledmjzirfeztp` (eu-west-1) | Postgres + RLS, e-mail/kode + Google OAuth, privat bucket `item-photos` med signerede URLs |
| Tunge jobs | **Trigger.dev** projekt "Selja" (`proj_zmmrdmvkjhnxepwlxssi`, org SDu) | Tasks: `item-pipeline`, `item-regen`, `salgsplan-digest` (cron mandag 06 UTC). Netlify-functions kan ikke køre 150+ sek. |
| Betaling | **Stripe** (LIVE, konto `acct_1U55tgQu1PV9huwJ`) | Checkout + kundeportal + webhook `https://selja.dk/api/webhooks/stripe` (4 events). Priser via lookup keys `selja_plus_md/aar`, `selja_pro_md/aar` |
| Mails | **Resend** (domæne selja.dk verificeret, region eu-west-1) | Transaktionsmails fra `Selja <post@selja.dk>` + Supabase auth-mails via SMTP (smtp.resend.com:465). OBS: Resend-kontoen er oprettet på krausesigne@gmail.com |
| Billed-AI | **Google Gemini** | Rens: `gemini-3.1-flash-image` (0,28 kr.), visualisering: `gemini-3-pro-image-preview` (0,95 kr.), vision/troskabstjek: flash. Konfigureret i `lib/config.ts` |
| Tekst-AI | DeepSeek (`lib/providers/deepseek.ts`) | Skriver annonceteksten. **MÅ IKKE nævnes udadtil** (ejer-ordre) — privatpolitikken siger "ekstern sprogmodel-leverandør" og at den kun modtager indtastede tøjfakta, aldrig billeder/identitet |
| Domæne | selja.dk hos dansk registrar (Punktum dk/MitID-aktiveret) | A `@`→75.2.60.5, CNAME `www`→selja.netlify.app + Resend-records (MX/SPF/DKIM på send/resend._domainkey) |

**Deploy:** `git push` til main → Netlify bygger i skyen (linux). Trigger.dev
deployes separat: `npx trigger.dev@4.5.12 deploy` (versionen SKAL matche
`@trigger.dev/*` i package.json — deploy nægter ved mismatch). `syncEnvVars` i
`trigger.config.ts` skubber nøgler fra lokal `.env.local` til jobmiljøet ved
hvert deploy.

## 4. Kodestruktur (vigtigste stier)

- `app/(marketing)/` — forside, /priser, /laer (guides som TS-data i
  `lib/guides-indhold.ts`), /log-ind, /ny-adgangskode, /vilkaar, /privatliv
- `app/(app)/` — /oversigt, /nyt-item (5-trins wizard), /items/[id],
  /kreditter, /konto, /onboarding, /admin
- `app/api/` — items (opret/genoptag/regenerer/delebillede), stripe
  (checkout/portal), webhooks/stripe, auth (efter-login, callback i
  `app/auth/callback`), upload-signering, feedback, konto (eksport/slet), admin/klager
- `lib/pipeline/` — run.ts (kørslen), start.ts (Trigger.dev eller in-proces),
  skabeloner.ts (kategori→prompt), markedspriser.ts, visninger.ts, badge/share (sharp)
- `lib/credits/` — ledger.ts (AL kreditlogik, idempotent via
  `tilfoej_kreditter`-SQL-funktionen), supabase.ts
- `lib/betaling/` — webhook.ts (Stripe-events → kreditter; læser BÅDE gammel og
  ny API-form!), abonnement.ts (harAktivtAbonnement + hentAbonnementsTier)
- `lib/salg/` — smart-plan.ts, saeson.ts, radar.ts, statistik.ts, kalender.ts,
  konkurrent.ts (alle RENE funktioner, fuldt testede)
- `lib/copy/da.ts` + `lib/copy/vinted.ts` — AL brugervendt tekst (aldrig i komponenter)
- `lib/config.ts` — priser, kvoter, misbrugsværn, modeller. ÉN kilde
- `lib/emails/` + `emails/` — transaktionsmails (tabel-layout, inline styles)
- `lib/auth/admin.ts` — erAdmin(): ADMIN_EMAIL er kommasepareret liste
- `trigger/` — Trigger.dev-tasks
- `supabase/migrations/` — 15 migrations, ALLE kørt mod cloud
- `tests/` — 396 tests (vitest). Copy-vagter håndhæver ærlighedsregler
  (fx maks 4 tankestreger på forsiden, 2-minutters-løftet skal være afgrænset)
- `scripts/` — katalog-generering, markedsanalyse (høst → `lib/data/markedspriser.ts`),
  indexnow-ping, gate1-fidelity-test

## 5. Sikkerhed & compliance

- Admin: 404 for alle ikke-admins; `ADMIN_EMAIL`-liste (begge ejer-mails)
- Webhook: signatur verificeres altid; kreditering idempotent pr. event/faktura
- Upload: signerede URLs, sti låst til brugerens mappe; privat bucket
- Misbrugsværn: 15 annoncer/bruger/dag, globalt dagligt budgetloft 200 kr.
  (kill-switch), maks 4 genereringer pr. del, feedback maks 10/dag
- Origin-headeren valideres mod allowlist i checkout/portal
- Security-headers (HSTS, X-Frame-Options DENY, nosniff m.fl.) via next.config
- GDPR: selvbetjent indsigt/eksport + sletning på /konto; bilag 5 år
  (bogføringsloven); audit i `docs/gdpr-audit-2026-08-16.md` (P1+P2 åbne)
- **E-mail-bekræftelse er TÆNDT og E2E-verificeret** (21/8): mail-links kører token_hash-flowet via /auth/confirm (virker på tværs af enheder); glemt adgangskode fuldt verificeret med rigtige mails
- 18+-gate ved signup OG i onboarding (OAuth kan ikke bære metadata)

## 6. Kendte root causes (lærdom — gentag dem ikke)

1. Gemini leverer data-URLs, ikke storage-stier
2. `generations.preset_id` uuid vs. tekst-id
3. Tekstvalidering krævede størrelse ordret
4. Google nedlagde gemini-2.5-flash (404)
5. Provider-reference var storage-sti, ikke data-URL
6. Vision-503 væltede hele leverancen (nu retry + isolation)
7. Troskabs-spørgsmålet kasserede produkt-visninger (bøjle/gulv) som "ikke båret"
8. Produkt-prompten arvede on-model-negativlisten → floatende tøj
9. Lokal Windows-deploy manglede linux-sharp → ALLE oprettelser 500'ede
   (løst; irrelevant nu hvor Netlify bygger på linux)
10. **Stripe-webhooken læste kun den gamle API-form** — det første rigtige køb
    blev betalt uden kreditering (`invoice.parent.subscription_details` +
    `line.pricing.price_details.price` i 2025+-versionerne). Fixet + regressionstest

## 7. Dokument-hierarki

- `SPEC.md` v0.2 + `HANDOFF.md` v1.0 = "loven" — MEN `STATUS.md`s
  beslutnings-sektion registrerer ejerens overstyringer (der er mange)
- `MANGLER.md` = publish-tjeklisten (tages oppefra)
- `BACKLOG.md` = nummererede opgaver (S12, S35, S39…)
- `SELJA.md` (denne fil) = samlet overblik

Stående regler: kun ÉN branch (`main`), ingen PRs; al copy i lib/copy;
provider-nøgler KUN i gitignoret `.env.local`; nye features følger v6-designet
"Klar & nordisk" (sentence case, luft, hairlines).

---

## 8. EJERENS TO-DO (prioriteret)

### Før du lukker rigtige brugere ind
1. ~~Tænd e-mail-bekræftelse~~ GJORT og E2E-verificeret 21/8 (nat)
2. **Kør Gate 1-troskabstesten** (`npx tsx scripts/gate1-fidelity-test.ts
   <mappe med ~20 egne tøjfotos> --live`) — mål ≥70 % troskab. Visualiseringen
   dumpede kvalitetstjekket i vores ene produktions-E2E; kalibrér
   `pipeline.troskabsTaerskel` efter resultatet
3. **Verificér abonnements-fornyelse** når næste faktura trækkes (~21/9):
   kreditsiden skal vise ny kvote. Webhook-fixet er testet, men fornyelsen er
   første naturlige gentagelse

### Synlighed (kræver dine logins)
4. **Google Search Console**: search.google.com/search-console → Add property
   → Domain → selja.dk → DNS TXT-record hos registraren → verificér →
   indsend `https://selja.dk/sitemap.xml`
5. **Bing Webmaster Tools**: bing.com/webmasters → importér fra GSC (nemmest)
6. **DMARC-record** hos registraren (mail-leveringsevne): TXT `_dmarc.selja.dk`
   = `v=DMARC1; p=none; rua=mailto:post@selja.dk`

### Drift & konti
7. **Rotér nøgler der har været i chat**: Google OAuth client secret,
   TRIGGER_SECRET_KEY, RESEND_API_KEY, Stripe webhook-secret, testkonto-passwords
8. **Trigger.dev-nøglens udløb**: oprettet med 90 dages udløb → dør 19/11-2026
   og ALLE annoncer hænger. Sæt kalenderpåmindelse eller opret permanent nøgle
9. **Resend-kontoen** ligger på krausesigne@gmail.com — flyt/dokumentér ejerskab
10. **Modtage-mail på post@selja.dk**: opsæt postkasse/videresendelse hos
    registraren, så svar på dine mails ikke ryger i ingenting; skift derefter
    `kontakt.email` i `lib/config.ts` fra gmail til post@selja.dk
11. **Momsregistrering**: Stripe opkræver med `automatic_tax` og dansk B2C-moms
    — tjek med revisor at CVR/momsforhold er på plads ved omsætning
12. **GDPR P1+P2** fra audit: databehandleraftale-dokumentation + verifikation
    af tredjelandsoverførsler pr. leverandør

### Vækst-forslag (kræver din beslutning — IKKE implementeret)
13. **Omsætnings-dræber #1: ingen lille indgang.** En ny bruger med 0 kreditter
    kan KUN komme i gang ved at tegne abonnement (59 kr./md.) før de har set ét
    resultat. Forslag: vis "Prøv"-pakken (5 annoncer/49 kr., findes allerede i
    config og checkout) som engangskøb for ikke-abonnenter — lav tærskel ind,
    abonnementet sælger sig selv via Salgsplan-teaseren bagefter. Alternativt:
    1 gratis preview (config `preview` findes). Din beslutning — det overstyrer
    din egen "abonnement er standardvejen"-ordre
14. Favorit-overvågning (lovet i Pro-copy) kræver Vinted-data — byg eller fjern løftet
