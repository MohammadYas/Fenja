# STATUS
Sidst opdateret: 2026-08-16 af Claude Code (lokal session)

## Sådan står projektet
- **Én branch: `main`.** Alt arbejde er konsolideret dertil (ejer-ordre
  2026-08-16) — de 12 gamle feature-/claude-branches er merget og slettet
  både lokalt og på GitHub. Der er ingen åbne PRs.
- **Hele fase A er bygget og grøn:** 203 tests, lint + typecheck rene.
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
  aldrig et nyt hjem.
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
- Transaktionsmails (`emails/`) er bygget og testet, men **intet kalder dem
  endnu** (S32).
- Fase B (`lib/video/`) har interface + mock + prompt-compiler, men ingen
  rigtig provider-implementering (S33). S3-stubben `lib/providers/video.ts`
  lever stadig ved siden af og skal slettes ved implementering.
- Lighthouse-målingen (L1) er lavet **før** Vinted-first-forsiden og skal
  genmåles (S26).
- Gate 1 (troskab ≥ 70 %) er **umålt** — det er S12.
