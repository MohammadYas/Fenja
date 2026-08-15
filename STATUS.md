# STATUS
Sidst opdateret: 2026-08-15 af lokal session (S17)
## Nu
- Intet i gang. Næste opgave: S12 [KRÆVER NØGLER] — ejeren kører hjemme-checklisten (HANDOFF §6) først
## Senest færdigt
Alt på branch `claude/ga-i-fang-og-beug-uxux-ha52r9` (én commit pr. opgave):
- 2026-08-15 S17 Visuel rebuild v2 "katalog møder plakat" (REDESIGN.md): tokens v2
  (plakat/kaempe-typeskala m. clamp, offset-skygge i gran/hør, rotationstrin,
  tekstur-opacity, bevægelses-varigheder 150/300 ms + 60 ms stagger), Sømmen 2.0
  (dobbelt stiplet + hover/aktiv-markering), prislap- og stempel-motiv
  (components/ui/prislap.tsx, stempel.tsx), scroll-reveal (rå IntersectionObserver,
  én gang, bag `@media (scripting: enabled)` + prefers-reduced-motion), tal-tæller,
  syende søm-progress. Alle sider fra REDESIGN §3 bygget om: plakat-hero
  ("SÆLG DIT TØJ HURTIGERE", rav på sidste ord), farveblokke (kalk→hør→gran→hør),
  kæmpe rav-mono-tal, priser som prislapper på gran, app-topbar m. søm + saldo-prislap,
  bundnav m. søm-overkant, taktile rollekort, fuld-bredde plakat-knap, resultatside
  m. mono-sektionsmarkører og prislap-pris, kopiér m. "KOPIERET"-stempel, statistik
  som gran-blok m. tællende kæmpe-tal, guide-kort m. offset-skygge og rav-numre.
  Kontrasttest udvidet (hør/rav på gran, ravDyb på hør). 77 tests, lint, typecheck,
  build — alt grønt. Screenshots 320/390/430 px: ingen vandret scroll (heller ikke 320).
  Dødstegn-tjek REDESIGN §5: (1) hero kan ikke ligge på en SaaS — typografien ER
  grafikken; (2) intet view uden gran/rav/fysisk motiv — app-skallen bærer søm+prislap,
  tomme/succes-tilstande er gran-blokke; (3) dosering holdt — maks 1 stempel pr. view,
  rotation kun på prislap-klynger og hero-rammen; (4) intet bevæger sig uden
  brugerhandling ud over scroll-reveal/tæller, alt bag reduced-motion; (5) ingen
  neubrutalism — skygger i hør/gran (aldrig sort), radius 8 px, ingen pills.
- 2026-08-14 Dokumenter: HANDOFF, SPEC, STATUS, BACKLOG committet
- 2026-08-14 S1 Scaffold: Next.js 15 + TS strict + Tailwind, mappestruktur, netlify.toml, supabase config + migration 1 (skema + RLS), .env.example, CI, copy-manifest-test
- 2026-08-14 S2 Design: DESIGN.md, tokens.ts (eneste kilde), self-hostede OFL-skrifter (Bricolage Grotesque/Instrument Sans/Spline Sans Mono), Button/Field/Card/Badge, WCAG-kontrasttest
- 2026-08-14 S3 Providers: ImageProvider (fal) + TextProvider (Claude: tekst/troskab/label) + VideoProvider-interface (fase B); mocks som CI/dev-default
- 2026-08-14 S4 Pipeline-kerne: presets (3 nordiske, 5-bloks prompt, divers personrotation), on-model m. troskabs-retry, D-1/D-2-valideret annoncetekst, sharp-badge + EXIF AI-mærkning (art. 50), 4:5-beskæring
- 2026-08-14 S6 Kreditter: transaktionel SQL-funktion (advisory lock + idempotency key), ledger.ts, memory- og Supabase-impl, tests (signup/dublet/refund/utilstrækkelig saldo)
- 2026-08-14 S5 Runner + Trigger.dev-job: parallelle trin, budgetloft-kill-switch, delvis leverance m. auto-refund (B-6), omkostningslog pr. generering (G-1), idempotente genkørsler
- 2026-08-14 S7 Auth/konto: magic link, 18+-gate (radio, venlig afvisning), signup-kreditter ved første verificerede login, middleware-session, konto-side m. fuld sletning (A-4)
- 2026-08-14 S8 Nyt item: guidet upload m. 4 roller + egne stregtegnings-eksempler, canvas-komprimering ≤1,5 MB, mærke-autocomplete, rate limit + saldo-tjek, pipeline-start (Trigger.dev eller inline mock)
- 2026-08-14 S9 Resultatside: progress m. reelle trin, compliance-rækkefølge håndhævet af test, kopiér-knapper, checkliste, Vinted-disclaimer
- 2026-08-14 S10 Bibliotek: statusbadges, markér-som-solgt m. pris, statistik (salgsværdi/antal/liggetid)
- 2026-08-14 S11 Stripe: Checkout (DKK, automatic tax), idempotent webhook → ledger, kreditside; ærlig 503 uden nøgler
- 2026-08-14 S13 Landing + vilkår/privatliv: before/after-hero m. Sømmen (ærligt mærket pladsholder til S12-output), menneskedansk jura
- 2026-08-14 S14 Lær: 5 guides (markdown + marked), sitemap/robots, anti-buzzword-test på guides
- 2026-08-14 S15/S16: admin-omkostningsside (ADMIN_EMAIL-gated), delbart 9:16 before/after (F-4); rate limits og budgetloft lå i S5/S8
- 2026-08-14 Mobilverifikation: 390 px-screenshots af landing/log-ind/lær/guide/vilkår; fandt og rettede token-navnekollision (text-detalje farvede tekst rav i stedet for at sætte størrelse)
## Blokeret / afventer ejer
- HANDOFF §6 hjemme-checklisten: Supabase cloud (`link`/`db push` — 4 migrations ligger klar), Netlify + env-vars, fal.ai-nøgle → kør Gate 1 (S12), Stripe testmode (produkt/webhook — koden bruger inline price_data, så kun webhook-endpoint + nøgler behøves), Trigger.dev-projekt (sæt TRIGGER_PROJECT_REF), Resend, domæne (NEXT_PUBLIC_SITE_URL styrer sitemap)
- `supabase db reset` skal verificeres lokalt (kræver Docker)
- Landing-hero skal have ægte before/after fra første rigtige S12-kørsel
- Sentry (G-2, P1) fravalgt indtil videre — kræver DSN; besluttes af ejer
## Beslutninger truffet undervejs
- 2026-08-14: Kreditsaldo = sum af credit_ledger (view credit_balances); intet credits-felt på profilen (E-3 vinder over SPEC §7)
- 2026-08-14: users-tabellen hedder profiles; auth.users ejer identiteten via trigger
- 2026-08-14: Palette udvidet med ravDyb #9A6013 — rav består ikke AA på kalk; håndhævet i tests
- 2026-08-14: ui-ux-pro-max' generiske forslag (blå palette, Inter) afvist jf. manifest §2.1.8/9; strukturelle råd beholdt (DESIGN.md §1)
- 2026-08-14: Signatur-element "Sømmen" (stiplet tekstilsøm i rav)
- 2026-08-14: Troskabs-tjek ligger hos TextProvider (Claude vision) — fal-laget er kun billeder; C-7's princip (alt bag interfaces + mock) fastholdt for begge
- 2026-08-14: B-6-refund refunderer hele annonce-kreditten (1 kredit = 1 annonce; der findes ingen separat visualiserings-kredit)
- 2026-08-14: Uden TRIGGER_SECRET_KEY køres pipelinen inline i baggrunden (kun dev/mock); med nøgle altid Trigger.dev
- 2026-08-14: Farvetokenet "detalje" må ikke eksponeres i Tailwind (navnekollision med typeskala-trinnet) — brug rav/pris direkte
- 2026-08-15: ravDyb på hør er kun godkendt til STORE pristal/stempler (≥ 24 px, AA large-text 3,46:1) — brødtekst på hør er altid koks; håndhævet i tokens.test.ts
- 2026-08-15: Scroll-reveal skjuler kun indhold bag `@media (scripting: enabled) and (prefers-reduced-motion: no-preference)` — uden JS eller med reduceret bevægelse vises alt med det samme (ingen tom side ved JS-fejl)
- 2026-08-15: Rotationer og offset-skygger er deterministiske pr. indeks (rotate-lap-v/-h/-stempel/-ramme fra tokens) — aldrig random, aldrig sort skygge (kun gran/hør)
- 2026-08-15: da.landing.samletVaerdi udgik; statistik-blokken bruger kæmpe mono-tal + solgtMedFenja-linjen
