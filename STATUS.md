# STATUS
Sidst opdateret: 2026-08-16 af Claude Code (lokal session, branch `feat/onmodel-skabeloner`)

## Nu
- **Kategori-skabeloner + hjem-ankre i on-model-prompten** (branch
  `feat/onmodel-skabeloner`, bygget på ejerens prompt-bibliotek 2026-08-15/16):
  `lib/pipeline/skabeloner.ts` — (1) kategori-skabeloner (kjole/bukser/jakke/
  overdel/taske/generisk) med egne visninger (spejl-selfie, ved vinduet,
  gående) og troskabs-fokus; (2) FAST HJEM pr. sælger (deterministisk af
  user-id, 5 hjem): alle en sælgers annoncer optages i samme bolig, så
  profilen ikke ligner tusind forskellige steder — presettet vælger sted I
  hjemmet; (3) fotostil-blok med ejerens realisme-princip (hurtigt hverdags-
  foto, aldrig editorial/AI-glans) og udvidet negativ-liste. C-2 uændret
  (prompten beskriver aldrig tøjet), C-6 håndhævet (ansigt altid skjult).
  Integreret i onmodel.ts/run.ts via valgfrie userId/kategori. 24 nye tests
  (109 i alt). Ejerens rå prompt-bibliotek + forside-prompterne er
  dokumenteret i docs/marketing-billeder.md.
- **Forsiden (feat/vinted-first, 2026-08-15 aften):** Ærligheds-båndet
  midlertidigt erstattet af "Det får du" (ejer-ordre — ærligheds-copy
  genplaceres senere); billedserien genereret om med amatør-realisme
  (blandet lys, levet-i rod, skæv beskæring), da v3.0 lignede AI for meget.
- **STRATEGISKIFT (ejer, 2026-08-15, aften): Fenja er ét produkt udadtil —
  Vinted-appen.** Forsiden ER nu Vinted-landingen (fra feat/vinted-side, ejer-
  godkendt); B2B-studioet er PARKERET uændret på `/studio` som outreach-side:
  ikke i nav, ikke i sitemap, noindex, kun et diskret footer-link ("Fenja
  Studio — annoncer for virksomheder"). B2B-indholdet er IKKE slettet, og
  løfteformuleringerne er uændrede (omskrivning afventer ejer). `/vinted`
  redirecter permanent til `/`. Nav: Sådan virker det / Lær / Priser / Log ind.
  Dublet-komponenten `components/vinted/foer-efter.tsx` er samlet i
  `components/foer-efter.tsx` (S28-oprydningen). HANDOFF er v1.1.
- **Billedserie v3** (ejer-ordre samme aften): 7 nye billeder i Vinted-annonce-
  stil — spejl-selfies (telefon dækker ansigtet), tøj på bøjle, flatlay på
  sengetøj, denim-detalje, gadelook beskåret ved hagen. Mere skandinavisk,
  realistisk og moderne; lagerreol-billedet er droppet. Provenance: alle
  billeder i public/eksempler/ er AI-genererede (gpt-image-1, 2026-08-15) —
  ingen synlig mærkat (ejer-ordre, MIDLERTIDIGT, se S25); ingen genkendelige
  ansigter (C-6). OG-billedet er genlavet fra serien.
- **3 PRs stadig åbne mod `samlet`, afventer ejer-review** (sessions må ikke
  merge egne PRs, §5.2): fase B-fundament · preset-system til Gate 1 ·
  transaktionsmails (se konsolideret oversigt nedenfor). #1 /vinted-landing er
  ejer-godkendt og indgår i denne branch.
- Derefter: S12 [KRÆVER NØGLER] — ejeren kører hjemme-checklisten (HANDOFF §6) først.

## Konsolideret fra docs/sessions/ (parallel-sessionerne 2026-08-15)
Notaterne ligger på hver sin PR-branch og er sammenfattet her (slettes fra
branchene ved merge, jf. denne konsolidering):
- **Fase B-fundament** (`feat/faseb-fundament`): rent additivt `lib/video/` —
  fuldt async `VideoProvider`-interface (submit/status/webhook), deterministisk
  mock, 8-bloks UGC-prompt-compiler (ordgrænse 2 ord/sek. håndhævet med fejl,
  varighed 4–15 s, referencer `@image1…`, fast negativ-liste der kun kan
  udvides), brief→script-typer. 30 nye tests. S3-stubben i lib/providers/
  video.ts er bevidst urørt — migreres når videopipelinen implementeres.
- **Preset-system** (`feat/preset-system`): presets.ts → `lib/pipeline/presets/`
  med bevaret offentlig API og byte-identisk prompt-output; preset_stats-
  migration (RLS, security definer-rpc); `scripts/gate1-fidelity-test.ts`
  (mock default, `--live` kræver nøgler) med side-om-side-HTML-rapport og
  Gate 1-dom. 11 nye tests.
- **Transaktionsmails** (`feat/emails`): 5 skabeloner som React/tabel-HTML med
  inline styles afledt af tokens; `EmailAfsender`-interface (mock/Resend);
  dev-route `/dev/emails` (404 i production); RESEND_FROM i .env.example;
  vitest jsx: automatic. 35 nye tests. Intet koblet ind i app-flowet endnu.

## Session-handoff /vinted (2026-08-15, aften — additiv-opgave, branch feat/vinted-side)
Selvstændig landing for Vinted-appen på /vinted: eget hero m. before/after-panel
(DUBLET i components/vinted/foer-efter.tsx — bevidst kopi jf. opgaven), billedpar
fra serie v2, 3 trin, ærlighed-som-fordel, Lær-teaser (3 guides), CTA + diskret
Fenja Studio-linje. Egen copy-fil lib/copy/vinted.ts; metadata på siden.
AFVIGELSE fra opgaveteksten: den bad om billeder "med eksisterende mærkat uændret"
— ejerens senere direkte ordre (ingen synlig mærkat, serie v2) vandt.
**Integrationen er udført i feat/vinted-first (samme dag):** landingen ER nu
forsiden, /vinted redirecter til /, dubletten er samlet i components/foer-efter.tsx,
Studio-linjen bor i footeren — S28 er dermed lukket.

## Session-handoff v6.2 (2026-08-15, aften — ejerens svar på godkendelses-listen)
Ejeren godkendte via Claude-review: B2B forrest (logget som STRATEGISKIFT: forsiden
sælger fase B-tilbuddet, appen er sektion — SPEC §1's rækkefølge er ejer-overstyret),
billeder som midlertidig portfolio, gmail som kontakt indtil domæne. Derudover:
- **Synlig AI-mærkat FJERNET fra alle billeder** (ejer-ordre, MIDLERTIDIGT — imod
  reviewens betingelse og manifest §2.1.7; risiko for vildlednings-indtryk er
  flagget til ejeren). Alt-tekster er neutrale; provenance: alle billeder i
  public/eksempler/ er AI-genererede (gpt-image-1, 2026-08-15). Ejeren finder
  "sleek løsning" for mærkning snarest — S25 har deadline Gate 4.
- **Billedserie v2**: 6 nye, mere skandinavisk-realistiske billeder (strik front/
  side/detalje, jakke på gade, flatlay, lager) + ny slideshow-komponent
  (components/billedserie.tsx: crossfade, prikker som knapper, auto-fremdrift
  slået fra ved prefers-reduced-motion og pause ved hover/fokus). Hero kører
  serien; app-sektionen viser statisk par. v1-billederne slettet.
- **B2B-FAQ-rettelse** (reviewens krav): leverings-svaret siger nu at fristen
  løber fra modtaget materiale.
- **Åben ejer-beslutning (S27)**: gratis-tier-model — slør/vandmærke-forslaget
  fra reviewen er IKKE bygget; intet ændret i kreditlogik siden v6.1.
- Nat-prompt ("hardening & launch-prep", én branch/PR, ingen nøgler) ligger i
  ejerens Claude-chat — køres som separat session; ikke udført her.

## Session-handoff v6.1 (2026-08-15, eftermiddag — ejer-ordrer løbende)
Alt verificeret: lint + typecheck + 85 tests grønne; 320 px uden vandret scroll;
alle billeder indlæst; ingen priser på forsiden; dashboard renderer med demo-data.
- **Gratis-tier FJERNET** (ejer: misbrugsrisiko med nye konti/devices):
  `gratisVedSignup: 0`, signup-grant er no-op i ledger.ts, al copy om "3 gratis"
  fjernet, tests seeder nu saldo via køb. E-1 i HANDOFF/SPEC er dermed overstyret.
- **Lær uden markdown** (ejer-ordre): content/guides/*.md slettet; indholdet
  konverteret til strukturerede TS-blokke i lib/guides-indhold.ts (rubrik/afsnit/
  liste), renderet som rigtige elementer — dangerouslySetInnerHTML og `marked`-
  dependency fjernet. Samme hentGuides/hentGuide-API.
- **Demo-tilstand** (ejer: "jeg vil ind på dashboardet"): uden Supabase-env og
  uden production serverer lib/supabase/server.ts en demo-bruger + faste
  eksempel-items (4 stk., 2 solgte → statistik-båndet tæller til 550 kr.).
  Med env sat: præcis som før. Middleware var allerede no-op uden env.
- **Forsiden v6.1**: Ærligheds-blokken taget af (ejer: "skriver det senere et
  andet sted") → erstattet af "Sådan foregår det" (B2B-forløb i 3 trin på koks).
  Sektioner nu: B2B-hero (m. billede) → UGC til virksomheder (leverance-linjer
  pr. ydelse) → B2B-FAQ (pris/ejerskab/levering) → Vinted-appen (before/after +
  billedpar + 3 trin) → forløb → slut-CTA. Skarpere copy ("Annoncer, folk ikke
  scroller forbi"; studio-stemme).
- **Genererede eksempelbilleder** (ejer-ordre, overstyrer manifest §2.1.7):
  3 stk. i public/eksempler/ (uldstrik båret, overshirt båret, UGC-still) —
  ALLE mærket synligt "Visualisering · genereret eksempel" + forklaring om at
  ægte output erstatter dem efter S12. Genereret via ejerens OpenAI-nøgle;
  nøglen er IKKE gemt nogen steder (kun brugt i sessionens env) — ejeren er
  rådet til at rotere den, da den stod i chatten.
- **Animationer** (ejer: "mere animationsrigt, professionelt"): indgangs-stagger
  på hero (CSS keyframes), smooth scroll til ankre, tryk-skala 0,98 på knapper,
  eksisterende scroll-reveal/tæller består. Alt bag prefers-reduced-motion.

## Hvor projektet står (nyt overblik, 2026-08-15)
- **Hele fase A er bygget og grøn** (S1–S18): auth/magic link + 18+-gate, guidet
  upload m. komprimering, pipeline (rens → on-model → troskab → badge → tekst)
  mod mocks, transaktionel kreditledger, Stripe testmode-kode, resultatside i
  compliance-rækkefølge, bibliotek/statistik, regenerér-enkeltdele, Lær (8 guides),
  admin-omkostningsside, delbart before/after. 85 unit-tests, lint + typecheck grønne.
- **Blokeret på nøgler:** intet kan køre mod rigtige providers før HANDOFF §6
  (Supabase cloud, Netlify, fal.ai, Stripe, Trigger.dev, Resend, domæne). Gate 1
  (troskab ≥ 70 %) er stadig umålt.
- **Branch-oprydning (i dag):** fejl-branchen `claude/ui-ux-pro-max-skill-install-*`
  er slettet på GitHub (den var sat som default!); default er `main` igen; alt
  arbejde er samlet på branch **`samlet`** (main + tøj-design-overhaul + oprydning).
  `.claude/skills/ui-ux-pro-max/` (fejlagtigt committet skill) er fjernet fra alle
  branches — skill'en er korrekt installeret som plugin i stedet.
- **Docs nulstillet (ejer-ordre):** alle gamle md-filer slettet; SPEC.md v0.2 og
  HANDOFF.md v1.0 genindsat som lov fra ejerens tekst; BACKLOG/DESIGN/STATUS
  nyskrevet. OVERLEVERING.md/REDESIGN.md/CLAUDE.md/README.md er væk (historik i git).

## Senest færdigt
- 2026-08-15 **V6 "Klar & nordisk"** (ejerens dom over V5: "grimt og forvirrende"):
  sentence case overalt (uppercase kun i mono-mærkater), typeskala tæmmet
  (plakat 9rem → 4,5rem maks., kaempe → 3,25rem), fuldblods farveblokke erstattet
  af kalk + hairlines (én mørk blok pr. side), søm-pynt pensioneret (stiplet søm
  kun i before/after + progress; link-hover er solid underline). Se DESIGN.md.
- 2026-08-15 **Forsiden lagt om til B2B-fokus** (ejer-beslutning): hero = UGC-annoncer,
  annoncebilleder og hjemmesider til virksomheder m. mailto-CTA (kontakt.email i
  lib/config.ts); appen som egen sektion (#appen) med before/after + 3 trin;
  **ingen priser på forsiden** (kreditpriser bor på /priser via footer). Nav:
  "Til virksomheder" i stedet for "Priser". Verificeret: lint + typecheck + 85 tests
  grønne; 320 px uden vandret scroll; ingen kr.-priser i forside-DOM.

## Blokeret / afventer ejer
- HANDOFF §6 hjemme-checklisten (Supabase link/db push — 4 migrations klar, Netlify
  env-vars, fal-nøgle → Gate 1/S12, Stripe webhook, Trigger.dev, Resend, domæne)
- Landing-hero skal have ægte before/after fra første rigtige S12-kørsel (S25)
- kontakt.email i lib/config.ts peger på ejerens gmail — skift til domæne-mail når
  domænet er registreret
- B2B-sporet på forsiden lover "fast pris pr. opgave" — ejeren fastsætter selv
  pakkepriser (SPEC Tillæg B: 3.000–5.000 kr.) ved salg; intet beløb er publiceret

## Beslutninger truffet undervejs
- 2026-08-15 (v6.1): Gratis-tier afskaffet (E-1 overstyret af ejer — misbrugsværn);
  første kreditter kræver altid køb. Ledger-API'et er uændret, granten er no-op.
- 2026-08-15 (v6.1): Genererede billeder tilladt på sitet (ejer overstyrer manifest
  §2.1.7) MEN altid med synligt "genereret eksempel"-mærkat — ærligheds-linjen og
  art. 50-mærkningen består. Udskiftes med ægte output efter S12 (se BACKLOG S25).
- 2026-08-15 (v6.1): Lær-indhold bor i TS (lib/guides-indhold.ts), ikke markdown —
  copy-testene læser samme kilde. FR-11's "statisk markdown" er overstyret af ejer.
- 2026-08-15 (v6.1): Demo-tilstand i server.ts er bevidst umulig i production
  (kræver manglende env + non-production) — aldrig en bagdør.
- 2026-08-15: Forsiden fører med fase B-tilbuddet (B2B UGC/hjemmesider) selvom fase A
  (Vinted-appen) er MVP'en — ejer-ordre; M3's omsætning kommer primært fra B2B.
  Priser vises aldrig på forsiden (ejer-ordre).
- 2026-08-15: v6 beholder palette, skrifter og tokens-arkitektur (HANDOFF §2.2.2);
  kun dosering og skala er ændret. ui-ux-pro-max' "Kinetic Brutalism"-forslag afvist
  (manifest §2.1); Swiss Modernism-grid og Minimal Single Column-struktur fulgt.
- Ældre beslutninger (ledger som view, profiles-tabel, ravDyb-kontrastregler,
  detalje-tokenkollision, inline-pipeline uden Trigger-nøgle m.fl.) står i git-
  historikken for den gamle STATUS.md (commit før denne) og gælder stadig.
