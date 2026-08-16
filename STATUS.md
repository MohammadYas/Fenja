# STATUS
Sidst opdateret: 2026-08-16 (sen aften) af Claude Code (GDPR-kode-audit)

## Denne session (16/8 sen aften) — GDPR-audit af KODEN + finpudsning
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
