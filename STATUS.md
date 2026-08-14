# STATUS
Sidst opdateret: 2026-08-14 af cloud-session (S1–S11 + S13–S16)
## Nu
- Intet i gang. Næste opgave: S12 [KRÆVER NØGLER] — ejeren kører hjemme-checklisten (HANDOFF §6) først
## Senest færdigt
Alt på branch `claude/ga-i-fang-og-beug-uxux-ha52r9` (én commit pr. opgave):
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
