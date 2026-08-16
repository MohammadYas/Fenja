# STATUS
Sidst opdateret: 2026-08-16 af Claude Code (afslutnings-session)

## Sådan står projektet
- **Én branch: `main`.** Alt er trunk-based og pushet til main — ingen andre
  branches, ingen PRs (stående ejer-regel, HANDOFF §5.1). Fase A er komplet
  og grøn: **265 tests, lint + typecheck rene.**
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
- **`.env.local` MANGLER** på maskinen → appen kører demo-mode lokalt. Genskab
  fra `.env.example`: URL = https://cpqsmtaledmjzirfeztp.supabase.co; anon +
  service_role fra dashboardet (Settings → API). Sæt også `ADMIN_EMAIL`.
- **Gemini som 3. ImageProvider** (`lib/providers/gemini.ts`, REST, ingen ny
  dependency). Model-id'er/cost i config (`billedProvidere`): final =
  gemini-3-pro-image-preview, preview = gemini-2.5-flash-image. fal er fortsat
  failover. Gate 1-scriptet kører alle 3 providers × presets (pass-rate + cost
  side om side, `docs/gate1-eksempel-rapport.md`). Rigtige kald bag `--live` +
  `GEMINI_API_KEY`.
- **Pricing v3.0 live:** pakker Prøv 5/49, Sælger 15/89 (anbefalet), Bunke
  40/169; top-up "Fyld op" 10/69 (kun kreditsiden ved saldo ≤ 5); Plus 59/md.
  (12 annoncer, rollover), Pro 119/md. (30), år 590/1190 — alt i `lib/config.ts`.
  Ledgeren har kredit-kilde (subscription/topup/pack) + 12 mdr. udløb; saldo
  beregnes ved genafspilning (`beregn_kredit_status`), forbrug i rækkefølgen
  subscription → topup → pack (ældste først). Stripe-checkout + webhook for
  top-up og abonnementer, idempotent.
  **FLAG til ejeren:** (1) pack-rækkefølge = ÆLDSTE FØRST (briefen modsagde sig
  selv) — sig til hvis omvendt. (2) Rollover-loft 2× månedskvote er et FORSLAG
  (`abonnementer.rolloverLoftFaktor`), ikke besluttet. (3) /priser viser endnu
  ikke abonnementer/pakkenavne (S36). (4) Årsabonnement giver kun kvote ved
  betaling — de øvrige 11 mdr. kræver scheduled job (S37).
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
- Migrationsfilerne `preset_stats_provider` + `kredit_kilder` er nu kørt mod
  cloud-databasen (denne session), så migrationer og DB er i sync igen.
