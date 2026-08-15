# STATUS
Sidst opdateret: 2026-08-15 af cloud session (L1, Lighthouse-gaten)
## Nu
- Intet i gang. Næste opgave: S12 [KRÆVER NØGLER] — ejeren kører hjemme-checklisten (HANDOFF §6) først
## Senest færdigt
Alt på branch `claude/ga-i-fang-og-beug-uxux-ha52r9`, videreført på
`claude/read-all-md-files-fcuyr5` og `claude/naeste-task-dcfccg` efter merge
(én commit pr. opgave):
- 2026-08-15 M2 Markedstal i prisforslaget (D-4): nyt analyse:eksport-trin
  genererer lib/data/markedspriser.ts (committet datafil, kun intervaller
  med ≥ 30 annoncer bag) fra markedsstatistikken; lib/pipeline/
  markedspriser.ts matcher items mærke (normaliseret — "Levis"/"Levi's",
  "HM"/"H&M") + kategori-ord og vælger største stikprøve; tekstTrin sender
  intervallet med (dækker både hovedpipeline og regenerér), og Claude-
  prompten får en dateret markedslinje, eksplicit mærket som udbudspriser
  ("færdige handler lander ofte lidt under"). Uden match er prompten
  uændret. Første eksport fra dagens høst committet (10 intervaller).
  6 nye tests (96 → 102).
- 2026-08-15 L2 scripts/gate1-fidelity-test.ts skrevet — den manglede, selv
  om HANDOFF §6 trin 4 beder ejeren køre den. Genbruger den ægte pipeline-
  logik (rensBaggrund → genererOnModelMedTroskab m. retry → troskabs-tjek),
  så målingen matcher appens adfærd. CLI: --mappe, --preset <id|alle>,
  --maks. Udskriver pass-rate samlet + pr. preset (Gate 1-krav ≥ 70 %),
  tærskel-kalibreringstabel 0,50–0,90 (ærligt markeret konservativ over den
  konfigurerede tærskel, hvor retry-udfald ikke kendes) og omkostningsskøn
  (NFR-11) før kørsel. Rigtige fotos uploades til fal storage; mock-tilstand
  verificeret keyless (3 dummy-fotos × 3 presets, hele kæden grøn).
  data/gate1/ gitignoreret.
- 2026-08-15 M1 Vinted-markedsanalyse (ejer-ønske): scripts/markedsanalyse/
  med hent.ts (anonym katalog-høst, hård grænse 60 kald/kørsel, pause+jitter,
  stop ved 429/403, robots-signaler respekteret, sælgerfelter når aldrig
  disken), analyser.ts (dedup, median/p25/p75, favoritter-pr-dag-proxy, andel
  ny m. prismærker, pr. stand) og rapport.ts (dansk markdown m. forbehold:
  udbudspriser ≠ salgspriser; katalog-loftet 960 vises som "≥ 960").
  npm-scripts analyse:hent/beregn/rapport (tsx som ny devDep — runner til
  scripts, også til L2/gate1). 11 nye tests (85 → 96). Valideret ende-til-
  ende mod det rigtige katalog: 1.817 annoncer, 19 kald — fandt og rettede
  to virkeligheds-bugs (dublet-cookies gav 401; standen hedder "Ny med
  prismærker" i flertal). data/markedsanalyse/ gitignoreret.
  OBS: scripts/gate1-fidelity-test.ts (HANDOFF §6) findes IKKE — oprettet
  som L2 i backloggen; skal skrives før S12.
- 2026-08-15 CI-gate: Lighthouse-gaten (HANDOFF §8) håndhæves nu i CI — nyt
  `lighthouse`-job bygger appen keyless og kører `@lhci/cli autorun` mod alle
  syv marketing-sider med tærskel ≥ 90 i alle fire kategorier
  (lighthouserc.json). CI bygger dermed også appen, så et knækket build
  fanges før merge. Valideret lokalt: 7/7 sider bestod. `.lighthouseci/`
  gitignoreret.
- 2026-08-15 Ydelse (NFR-2): Supabase-browserklienten (53 KB gzip, 93 % ubrugt
  ved sideindlæsning) lazy-importeres nu først ved submit i log-ind og
  nyt-item — /log-ind faldt 178 → 111 kB First Load JS, og marketing-sidernes
  prefetch af ruten er tilsvarende lettere. Ubrugt kursiv-skrift (31 KB
  preload pr. sidevisning) afdeklareret i fonts.ts — ingen copy/guide bruger
  kursiv (kun **fed**); filen ligger stadig i /public/fonts med genvej i
  kommentaren. Lighthouse mobil efter: forside 96, /priser 95 (LCP simuleret
  3,6 → 2,9 s), /log-ind 97, guide 98 — alle stadig 100 i a11y/BP/SEO.
- 2026-08-15 S25 B-9 Batch: resultatsidens vente-tilstand inviterer nu til at
  fotografere det næste stykke tøj ("Du behøver ikke vente her …" + søm-link
  til /nyt-item) — pipelinen kører færdig serverside, og backend har hele
  tiden kørt items parallelt. Oversigten henter generations(status) og viser
  "På vej"-badge på kladder med kørende/køet generering, så en genererende
  kladde kan skelnes fra en efterladt. Verificeret keyless via midlertidig
  preview-rute (S17-mønstret, slettet igen): 390/320 px, scrollWidth ok.
- 2026-08-15 L1 Lighthouse-gaten (HANDOFF §8) målt og bestået keyless:
  Lighthouse 13.4.1, mobil-emulering, prod-build lokalt — alle syv
  marketing-sider (forside, /priser, /laer, guide, /vilkaar, /privatliv,
  /log-ind) ender på performance 91–96 og 100 i tilgængelighed, best
  practices og SEO. Tre a11y-fund rettet undervejs: (1) kontrast — mono-
  labels i tekst-koks/60 var 3,60:1 på hør og 4,06:1 på kalk (under AA);
  nu /70 = 4,73:1 og 5,47:1 (hero-seddlens "foto"-label + forrige/næste-
  labels på guides); (2) heading-rækkefølge — forsidens "Sådan virker det"
  sprang h1→h3; SektionsMarkoer kan nu renderes som h2 (`som="h2"`) og
  bærer sektionsoverskriften; (3) dl-struktur på /priser — dt/dd lå to
  div-lag nede (Reveal + layout-div); Reveal bærer nu layout-klasserne
  selv, så dl > div > dt/dd er gyldig. Verificeret: 85 tests, lint,
  typecheck, build grønt; scrollWidth = 320 på 320 px for alle ændrede
  sider. Gate 1/2 (troskab, ≤ 2 min) venter fortsat på S12-nøgler.
- 2026-08-15 V1–V4 Af-skabelonisering af forsiden (ejerens dom: "ligner stadig
  AI"): konturord i plakaten + lodret marginalia (V1); hero-skitserne erstattet
  af annonce-transformationen — sjusket seddel overlappet af den færdige
  leverance, ærligt mærket som skitseret eksempel (V2, hero-skitse.tsx slettet);
  Ærlighed på koks som sidens ene mørke blok (V3); stregkoder på pakkernes
  hangtags (V4). Verificeret 320/390/1280, sw320 = 320.
- 2026-08-15 U4 Oversigt: statusfilter-chips (Alle/Kladde/Aktiv/Solgt med antal)
  over listen — vises først ved 4+ items; listen flyttet til client-komponent,
  aria-pressed på valget, tom-tilstand med egen linje.
- 2026-08-15 U3 A11y: skip-link ("Spring til indholdet") som første fokuserbare
  element i både marketing- og app-layoutet; usynligt indtil tastaturfokus.
- 2026-08-15 U2 Guides: forrige/næste-navigation nederst på hver guide (følger
  katalognummeret) + Article-JSON-LD pr. guide.
- 2026-08-15 U1 FAQ på /priser: fem ærlige spørgsmål/svar (ingen Vinted-adgang,
  aldrig billede 1, 2–4 fotos, regenerér til ½ kredit, ingen adgangskode) som
  søm-rækker + FAQPage-JSON-LD; sitemap-huller lukket (/priser, /log-ind).
- 2026-08-15 Slop-gennemgang del 3 (afsluttende, HANDOFF §8): alle otte
  marketing-flader (forside, log-ind, Lær + guide, vilkår, privatliv, priser,
  404) screenshottet ved 390 OG 320 px — scrollWidth = 320 overalt, ingen
  vandret scroll, ingen manifest-brud, ingen engelsk UI-copy (grep af JSX).
  Dansk korrektur af da.ts + alle 8 guides: "alders-bekræftelse" →
  "aldersbekræftelse", imperativ "Strøg" → "Stryg" (fototeknik), "besparer
  dig for" → "sparer dig for" (mål og størrelser), ensartet mellemrum før
  udeladelsesprikker i regenerér-statuslinjerne.
- 2026-08-15 Slop-gennemgang del 2 (app-siderne, HANDOFF §8): oversigt,
  nyt-item, kreditter og resultatsiden (inkl. regenerér-sektionen) audited
  keyless via midlertidige preview-ruter (S17-mønstret, slettet igen) ved
  390/320 px. Ingen manifest-brud fundet — statistik-gran-blok, prislap-saldo
  med decimal ("2,5"), rollekort og kompliance-rækkefølgen står som designet.
  Ét copy-fund rettet: "½ kredit kredit pr. del" (dobbelt ord) i
  regenerér-forklaringen.
- 2026-08-15 S24 18+-valg som taktile valgkort: native radios beholdt (a11y),
  kortet får koks-kant, hør-grund og offset-skygge når valgt, fokusring via
  focus-within, side om side på sm+.
- 2026-08-15 S21 Desktop-rytme: Ærligheds-blokken indrykket bag lodret søm med
  hero-skala på lg; slut-CTA med hængende prislap-detalje ("3 gratis
  annoncer") ved knappen.
- 2026-08-15 S23 Footer-blok: gran-footer med FENJA-ordmærke, grupperede links
  (Produkt / Det juridiske) og mærknings-linjen som sidens sidste ord.
  .verify/ (lokalt screenshot-harness) gitignoreret + eslint-ignoreret.
- 2026-08-15 S22 Lær som katalog-indeks: kortstakken (skabelontegn) erstattet
  af nummererede rækker med kant-delelinjer i to spalter på lg — en
  indholdsfortegnelse, hele rækken er klikbar.
- 2026-08-15 S20 Tørresnoren: prislapperne hænger nu fra den vandrette søm-snor
  i deterministisk varierede højder med snor og klemme pr. lap — forside +
  /priser. Ny komponent components/toerresnor.tsx.
- 2026-08-15 S19 Hero-figur (slop-rebuild): den tomme before/after-ramme var
  desktopens største AI-tegn — nu bærer den skematiske stregtegninger i egen
  streg (skæv/krøllet trøje m. bøjlestang og rodet gulv → samme trøje ret og
  ren m. ribkant og blød skygge), stadig ærligt mærket pladsholder til S12.
  Desktop-hero i to kolonner (plakat + ramme), så højresiden ikke står død.
  320 px uden scroll; lint/typecheck/85 tests/build grønt.
- 2026-08-15 B-8 Regenerér enkeltdele: ny visualisering (valgfrit preset) eller
  ny annoncetekst fra resultatsiden til reduceret pris (prisRegenerering: 0,5
  kredit — EJER-BESLUTNING at justere). Kreditter går fra integer til
  numeric(6,2) i ny migration (før første db push; ledger-årsag 'regen'
  tilføjet). Træk sker KUN ved succes, idempotent pr. requestId; loft pr.
  delaftype (maksGenereringerPrDel: 4); visualiserings-stier er nu unikke pr.
  generering, og resultatsiden viser nyeste succesfulde. API-route (auth,
  ejerskab, leveret-tjek, saldo-tjek, Trigger.dev eller inline), sektion
  05 — PRØV IGEN på resultatsiden med preset-vælger og søm-progress.
  5 nye tests (80 → 85). Decimal-saldi formateres dansk ("2,5").
- 2026-08-15 SEO/OG (F-3): typografisk OG-plakat (1200×630, app/opengraph-image.png
  — bygget af egne self-hostede skrifter, ærligt tekst-only, ingen fake
  produktfotos) + alt-tekst, prislap-bomærke som favicon (app/icon.svg),
  metadataBase fra NEXT_PUBLIC_SITE_URL, openGraph (da_DK) og twitter-kort
  i rodlayoutet.
- 2026-08-15 Tre nye guides (F-2 → 8 stk): "Mål og størrelser" (mål slår
  størrelsesmærker; hvad man måler pr. tøjtype), "Pak og send" (frister,
  vandtæt genbrugsemballage, vægt, bedømmelser) og "Sæsonens rytme"
  (årshjulet, forskudt salg, off-season-prissætning). Samme ærlige tone;
  anti-buzzword-testen dækker dem automatisk (77 → 80 tests).
- 2026-08-15 404- og fejlside: app/not-found.tsx (kæmpe rav-mono-404,
  ærlig besked, én vej hjem) og app/error.tsx (prøv igen-knap via reset,
  ingen undskyldnings-teater). Copy i da.ts. 320 px ok, alt grønt.
- 2026-08-15 /priser-side (HANDOFF §3-strukturen): dedikeret marketing-side —
  kaempe-rubrik, ét stempel, kreditpakker som prislapper på gran (genbrugt
  landing-motiv), "Sådan virker kreditter" i fire ærlige punkter (levering-først,
  refund, udløber ikke, moms), CTA. Priser + Lær tilføjet i topbar og footer.
  Verificeret 320/390 px, lint/typecheck/77 tests/build grønt.
- 2026-08-15 Slop-gennemgang del 1 (HANDOFF §8): guide-detaljesiden manglede
  titel, katalognummer og vej tilbage (kun brødtekst blev renderet) — nu
  tilbage-link + rav-mononummer + display-titel, konsistent med Lær-listen.
  Dansk copy strammet: "Send login-link" → "Send mig et link" (manifest
  §2.1.11), "til login" → "til at logge ind" i privatlivsteksten.
  Verificeret: 320 px uden vandret scroll, lint/typecheck/77 tests/build grønt.
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
- HANDOFF §6 hjemme-checklisten: Supabase cloud (`link`/`db push` — 5 migrations ligger klar), Netlify + env-vars, fal.ai-nøgle → kør Gate 1 (S12), Stripe testmode (produkt/webhook — koden bruger inline price_data, så kun webhook-endpoint + nøgler behøves), Trigger.dev-projekt (sæt TRIGGER_PROJECT_REF), Resend, domæne (NEXT_PUBLIC_SITE_URL styrer sitemap)
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
