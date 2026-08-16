# STATUS
Sidst opdateret: 2026-08-16 af Claude Code (cloud session)

## Sådan står projektet
- **Gemini-provider + Gate 1-trekamp (branch `feat/gemini-provider`, afventer
  ejerens merge):** Google er nu tredje `ImageProvider`
  (`lib/providers/gemini.ts`, REST via fetch — ingen ny dependency). Model-id'er
  og cost-skøn bor i config (`billedProvidere` i `lib/config.ts`): final =
  gemini-3-pro-image-preview (Nano Banana Pro), preview = gemini-2.5-flash-image
  (Nano Banana); providervalg pr. formål aktiveres med én linje, fal er fortsat
  failover. Gate 1-scriptet kører nu alle 3 providers × presets og viser
  pass-rate + målt cost pr. billede side om side (eksempel:
  `docs/gate1-eksempel-rapport.md`). `preset_stats` fik provider-dimension
  (additiv migration `20260816100000`, IKKE kørt mod databasen endnu — default
  'fal' bevarer eksisterende rækker/kald). Rigtige kald kun bag `--live` +
  `GEMINI_API_KEY` (ny i `.env.example`).
- **Én branch: `main`.** Alt arbejde er konsolideret dertil (ejer-ordre
  2026-08-16) — de 12 gamle feature-/claude-branches er merget og slettet
  både lokalt og på GitHub. Der er ingen åbne PRs.
- **S31 er bygget på branch `claude/laes-lle-md-fortsaet-3lyzud`** (denne
  session) og afventer ejerens merge til `main`: sælgeren kan nu se/vælge sit
  faste hjem under Konto (før: kun deterministisk af user-id). `profiles`
  fik `home_anchor`-kolonne (migration `20260815030000`); et ukendt/tomt valg
  falder overalt tilbage til det deterministiske hjem. Samtidig bærer
  `generations.prompt_version` nu et sammensat tag — `preset@v skabelon@v
  hjem@v` — så pass-rate kan slices pr. version af hver dimension (FR-15).
- **Hele fase A er bygget og grøn:** 232 tests, lint + typecheck rene.
- **SEO + LLM-findbarhed (branch `feat/seo-llm`, oven på omdøbningen):**
  struktureret data (schema.org/JSON-LD) på forside (WebApplication + HowTo +
  kreditpriser i DKK), guides (Article + BreadcrumbList) og priser (Product +
  Offers) — alt afledt af config/copy, ingen opdigtede tal/ratings. Ny
  `/llms.txt` (llmstxt.org) beskriver produktet, trin, priser, compliance og
  nøglesider for sprogmodeller. `metadataBase` + canonical bruger nu
  `SELJA_DOMAIN`. Bygger videre på F-3.
- **Mobilgennemgang (samme branch):** alle sider kørt i Chromium ved 320/375/
  430 px — nul vandret overløb nogen steder. Rettede touch-mål der var under
  44 px: marketing-nav/footer + tilbage-links brugte `min-h-touch content-center`
  på inline-links (ingen effekt → nu `inline-flex … items-center`), forside-
  logoet, oversigtens item-titel-links, S31-hjemvælgeren og billedserie-
  prikkerne. Demotilstandens `/oversigt` crashede (manglende `generations` på
  eksempel-items) — nu guardet, så den keyless demo virker. Delvis kvittering
  på S26's "responsivt ned til 320 px"; Lighthouse-målingen udestår stadig.
- **Supabase er sat op og migreret** (2026-08-16, via Composio):
  projekt `cpqsmtaledmjzirfeztp` (eu-west-1), **alle 8 migrations kørt**
  (preset_stats, home_anchor og welcomed_at kørt 16/8 eftermiddag efter
  merge), 8 tabeller + `credit_balances`-view, RLS aktiv,
  `item-photos`-bucket oprettet. Dashboard:
  https://supabase.com/dashboard/project/cpqsmtaledmjzirfeztp
- **`.env.local` MANGLER** (konstateret 2026-08-16 eftermiddag — filen fra
  formiddagssessionen findes ikke på denne maskine). Appen kører derfor
  demo-mode lokalt. Genskab fra `.env.example`: URL er
  https://cpqsmtaledmjzirfeztp.supabase.co; anon + service_role hentes i
  dashboardet (Settings → API). Composio kunne ikke hente nøglerne
  (permission-klassifikator blokerede reveal).
- **Forside-justeringer (2026-08-16 eftermiddag, ejer-ordrer):**
  hero-mærkatet "Selja til Vinted" og "Skitseret eksempel"-noten er FJERNET
  ("skriger AI"). Billedserie v4 genereret med gemini-3-pro-image (samme
  v3-prompts, se docs/marketing-billeder.md). /log-ind hedder nu "Opret dig
  eller log ind" og forklarer at linket også opretter konto (critique-P1).
  AA-fix på mono-mærkater (tekst/60→70), px-2 på nav-links, aria-oprydning.
  Fuldt critique-snapshot i `.impeccable/critique/` (24/32, dual-agent).
  Ejer-ordrer bekræftet i dag: INGEN mærkater på billederne endnu, INGEN
  priser/pris-signal på forsiden.
- **Næste opgave: S12** (ende-til-ende mod rigtige providers). Kræver
  FAL_KEY + ANTHROPIC_API_KEY i `.env.local` — se BACKLOG.

## Produktet udadtil (ejer-beslutning 2026-08-15/16)
Selja er **ét produkt udadtil: Vinted-appen.** Forsiden er Vinted-landingen
(før/efter-hero, billedserie, 3 trin, "Det får du", Lær-teaser, sælger-CTA).
B2B-studioet er **parkeret uændret på `/studio`**: ikke i nav, ikke i sitemap,
`noindex`, kun et diskret footer-link. B2B-indholdet er ikke slettet, og
løfteformuleringerne er urørte (omskrivning afventer ejer).
`/vinted` redirecter permanent til `/`. Nav: Sådan virker det / Lær / Priser /
Log ind.

## Åbne ejer-beslutninger
- **Katalog-offentliggørelse (besluttet 2026-08-16, bygges i kommende
  katalog-opgave):** brugere skal kunne offentliggøre deres visualisering i
  et katalog på sitet. GDPR-korrekt udgave (ejer-godkendt): toggle er
  **aktivt tilvalg (default FRA)** — aldrig default til; kun den mærkede
  AI-visualisering kan offentliggøres, ALDRIG brugerens rå fotos (NFR-7
  gælder fortsat for ægte fotos). Admin skal kunne skjule/slette. Moderation
  før offentliggørelse via eksisterende providers (Gemini safety-ratings /
  Claude vision) — IKKE DeepSeek (GDPR-overførsel + unødig dependency).
  Forside-kataloget fyldes indtil da med Gemini-genererede billeder
  (ejerens prompts er på vej).
- **S27 gratis-tier:** nu ingen gratis annoncer. Alternativ på bordet: gratis
  kørsel med sløret/vandmærket resultat, betal for at låse op. Byg intet endnu.
- **Mærkning af genererede billeder:** synlig AI-mærkat er MIDLERTIDIGT fjernet
  fra forsidens billeder (ejer-ordre) — imod manifest §2.1.7. Ejeren finder en
  "sleek" løsning; deadline Gate 4. Alt-tekster er neutrale. Provenance: alle
  billeder i `public/eksempler/` er AI-genererede (gpt-image-2, 2026-08-16).
- **Ærligheds-blokken** er midlertidigt taget af forsiden og erstattet af
  "Det får du" — ejeren genplacerer teksten et andet sted senere.
- **`.claude/skills/`** (105 filer) ligger committet i repoet fra en tidligere
  session. Hører formentlig ikke til projektet, men er ikke slettet — ejerens
  beslutning.
- **kontakt.email** i `lib/config.ts` peger på ejerens gmail; skiftes når
  domænet er registreret.

## Billeder og prompts (ejer-princip)
Billederne skal ligne **ægte Vinted-annoncer** — spejl-selfies hvor telefonen
dækker ansigtet, tøj på bøjle, flatlay — aldrig poleret produktfoto.
Realismen kommer fra det uperfekte: blandet lys, levet-i rod i kanten af
billedet, skæv beskæring. Serien er genereret med **gpt-image-2** (1024×1536,
quality high); prompterne og den fælles realisme-blok står i
`docs/marketing-billeder.md`.

I appen er samme princip kodet i `lib/pipeline/skabeloner.ts`:
- **Kategori-skabeloner** (kjole, bukser, jakke, overdel, taske, generisk)
  vælges ud fra itemets kategori-felt; hver har egne visninger og eget
  troskabs-fokus.
- **Fast hjem pr. sælger:** hver bruger får deterministisk ét af 5 hjem, så
  alle deres annoncer ligner samme bolig — presettet vælger sted *i* hjemmet,
  aldrig et nyt hjem. Sælgeren kan siden S31 låse et bestemt hjem under Konto
  (gemmes i `profiles.home_anchor`); intet valg = det deterministiske hjem.
- **Prompterne er på engelsk** (ejer-tuning 2026-08-16): billedmodellerne
  følger engelske instrukser markant bedre. Testet i `tests/unit/skabeloner.test.ts`.
- C-2 gælder ubetinget: prompten beskriver ALDRIG tøjet — referencefotoet
  styrer. C-6: ansigtet er altid skjult eller beskåret væk.

## Vigtige tidligere beslutninger (gælder stadig)
- **Omdøbt Fenja → Selja** (15/8-2026, navnekonflikt): Selja = oldnordisk
  "at sælge". Alle varianter (Fenja/fenja/FENJA) erstattet i kode, copy, docs,
  metadata, mails og eksempler. Domæne-referencer går gennem `SELJA_DOMAIN` i
  `lib/config.ts` (placeholder `selja.studio` indtil ejeren bekræfter købt
  domæne; `NEXT_PUBLIC_SITE_URL` overstyrer). GitHub-repoet omdøber ejeren selv.
- **Gratis-tier afskaffet** (misbrugsværn): `gratisVedSignup: 0`, signup-grant
  er no-op i ledger.ts. E-1 i HANDOFF/SPEC er dermed overstyret.
- **Lær-indhold bor i TS** (`lib/guides-indhold.ts`), ikke markdown —
  FR-11's "statisk markdown" er overstyret.
- **Demo-tilstand:** uden Supabase-env og uden production serverer
  `lib/supabase/server.ts` en demo-bruger + eksempel-items. Bevidst umulig i
  production — aldrig en bagdør. (Nu hvor `.env.local` findes, kører appen mod
  den rigtige database.)
- **Ledger:** saldo ER summen af `credit_ledger`; `delta` er numeric(6,2), og
  al skrivning går gennem den idempotente `tilfoej_kreditter`-funktion.
- **Design:** V6 "Klar & nordisk" — sentence case, tæmmet typeskala, kalk +
  hairlines, én mørk blok pr. side. Se DESIGN.md.

## Kendte huller
- Transaktionsmails er nu **koblet på flowet** (S32, samme branch): velkomst
  ved første login (idempotent via `profiles.welcomed_at`), kvitterings-
  supplement fra Stripe-webhooken, og "annonce klar" / "kredit sat tilbage"
  fra item-pipelinen. Alt kører best-effort (en fejlet mail vælter aldrig
  login/betaling/leverance) og keyless-sikkert (mock uden `RESEND_API_KEY`).
  Selve afsendelsen kræver stadig `RESEND_API_KEY` + domæneverifikation
  (HANDOFF §6). Magic-link-mailen sender Supabase Auth fortsat selv.
  Kendt hjørne: en sjælden Stripe-dublet eller manuel job-genkørsel kan
  gentage en mail (kreditter dobbeltkøres ALDRIG) — fuld én-gang er S34.
- Fase B (`lib/video/`) har interface + mock + prompt-compiler, men ingen
  rigtig provider-implementering (S33). S3-stubben `lib/providers/video.ts`
  lever stadig ved siden af og skal slettes ved implementering.
- Lighthouse-målingen (L1) er lavet **før** Vinted-first-forsiden og skal
  genmåles (S26).
- Gate 1 (troskab ≥ 70 %) er **umålt** — det er S12.
