# STATUS
Sidst opdateret: 2026-08-15 af Claude Code (lokal session, branch `samlet`)

## Nu
- **4 PRs åbne mod `samlet`, afventer ejer-review** (sessions må ikke merge egne
  PRs, §5.2): #1 /vinted-landing · #2 fase B-fundament (VideoProvider + UGC-
  prompt-compiler, 115 tests på branchen) · #3 preset-system til Gate 1
  (presets.ts → mappe m. bevaret API, preset_stats-migration, gate1-script m.
  --live-flag) · #4 transaktionsmails (5 skabeloner, mock-Resend, /dev/emails,
  120 tests på branchen). Bygget parallelt i worktrees; ingen overlappende filer
  ud over docs/sessions/ og tests/unit/ (distinkte filnavne) — #4 rører desuden
  vitest.config.ts (jsx: automatic) og .env.example (RESEND_FROM).
- Derefter: S12 [KRÆVER NØGLER] — ejeren kører hjemme-checklisten (HANDOFF §6) først.
- v6.1-runden er pushet til `origin/samlet` (ejer-godkendt 2026-08-15). Næste
  session fortsætter herfra — læs denne fil + HANDOFF.md før kode.

## Session-handoff /vinted (2026-08-15, aften — additiv-opgave, branch feat/vinted-side)
Selvstændig landing for Vinted-appen på /vinted: eget hero m. before/after-panel
(DUBLET i components/vinted/foer-efter.tsx — bevidst kopi jf. opgaven), billedpar
fra serie v2, 3 trin, ærlighed-som-fordel, Lær-teaser (3 guides), CTA + diskret
Fenja Studio-linje. Egen copy-fil lib/copy/vinted.ts; metadata på siden.
AFVIGELSE fra opgaveteksten: den bad om billeder "med eksisterende mærkat uændret"
— ejerens senere direkte ordre (ingen synlig mærkat, serie v2) vandt.
**Afventer integration:** nav, forside-teaser, redirect #appen→/vinted, sitemap,
dublet-oprydning (foer-efter-panelet findes nu 2 steder) — se BACKLOG S28.

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
