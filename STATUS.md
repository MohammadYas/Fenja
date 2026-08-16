# STATUS
Sidst opdateret: 2026-08-16 af Claude Code (cloud session)

## Sådan står projektet
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
- **Hele fase A er bygget og grøn:** 219 tests, lint + typecheck rene.
- **Mobilgennemgang (samme branch):** alle sider kørt i Chromium ved 320/375/
  430 px — nul vandret overløb nogen steder. Rettede touch-mål der var under
  44 px: marketing-nav/footer + tilbage-links brugte `min-h-touch content-center`
  på inline-links (ingen effekt → nu `inline-flex … items-center`), forside-
  logoet, oversigtens item-titel-links, S31-hjemvælgeren og billedserie-
  prikkerne. Demotilstandens `/oversigt` crashede (manglende `generations` på
  eksempel-items) — nu guardet, så den keyless demo virker. Delvis kvittering
  på S26's "responsivt ned til 320 px"; Lighthouse-målingen udestår stadig.
- **Supabase er sat op og migreret** (2026-08-16, via Composio):
  projekt `cpqsmtaledmjzirfeztp` (eu-west-1), alle 5 migrations kørt,
  7 tabeller + `credit_balances`-view, RLS aktiv, `item-photos`-bucket
  oprettet. URL + anon + service_role-nøgle står i `.env.local`
  (gitignoreret). Dashboard:
  https://supabase.com/dashboard/project/cpqsmtaledmjzirfeztp
- **Næste opgave: S12** (ende-til-ende mod rigtige providers). Kræver
  FAL_KEY + ANTHROPIC_API_KEY i `.env.local` — se BACKLOG.

## Produktet udadtil (ejer-beslutning 2026-08-15/16)
Fenja er **ét produkt udadtil: Vinted-appen.** Forsiden er Vinted-landingen
(før/efter-hero, billedserie, 3 trin, "Det får du", Lær-teaser, sælger-CTA).
B2B-studioet er **parkeret uændret på `/studio`**: ikke i nav, ikke i sitemap,
`noindex`, kun et diskret footer-link. B2B-indholdet er ikke slettet, og
løfteformuleringerne er urørte (omskrivning afventer ejer).
`/vinted` redirecter permanent til `/`. Nav: Sådan virker det / Lær / Priser /
Log ind.

## Åbne ejer-beslutninger
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
