# BACKLOG — fase A
Opgaver tages oppefra i "Åbent". Færdigt står nederst som kvittering, ikke som arbejde.
Læs `STATUS.md` + `HANDOFF.md` før du tager en opgave.

## Åbent — næste op

[ ] **S12 · Ende-til-ende mod rigtige providers** [KRÆVER FAL_KEY + ANTHROPIC_API_KEY]
    Kør hele pipelinen mod virkelige providers på ~20 egne tøjfotos:
    `npx tsx scripts/gate1-fidelity-test.ts <mappe> --live`, bedøm rapporten
    manuelt, skriv pass-raten i STATUS. Kalibrér `pipeline.troskabsTaerskel`
    i lib/config.ts efter resultatet. Mål samtidig Gate 2 (komplet annonce
    ≤ 2 min). Supabase er allerede sat op og migreret — se HANDOFF §6.
    → Gate 1: ≥ 70 % pass for mindst ét preset, ellers slås on-model fra og
      MVP = rens + tekst.

[ ] **S25 · Ægte billeder på forsiden** (efter S12) DEADLINE: Gate 4 / lancering
    Udskift `public/eksempler/*` med ægte output fra første rigtige kørsel.
    Indtil da kører AI-genererede billeder UDEN synlig mærkat (ejer-ordre,
    midlertidigt). Ejeren skal beslutte en "sleek" mærkningsløsning.

[ ] **S26 · Launch-gates** (HANDOFF §8)
    Lighthouse mobil ≥ 90 skal genmåles — L1 blev målt FØR Vinted-first-
    forsiden. Plus resten af §8-listen: compliance-tests, uinstrueret
    brugertest på egen telefon, slop-gennemgang, vilkår/privatliv/moms,
    budgetloft + kill-switch testet.

[ ] **S27 · Gratis-tier-model** [AFVENTER EJER — byg intet før valget er truffet]
    Nu: ingen gratis annoncer. Alternativ på bordet: kør pipelinen gratis, men
    lever sløret/vandmærket resultat, betal for at låse op.

[ ] **S33 · Fase B: implementér VideoProvider mod fal**
    `lib/video/` har det fulde interface, mock og prompt-compiler. Ved
    implementering: slet S3-stubben `lib/providers/video.ts` og flyt dens
    imports over.

[ ] **S35 · Favorit-overvågning (Plus/Pro)**
    Feature-flags pr. tier findes i `lib/config.ts` (`abonnementer.tiers[]
    .favoritOvervaagning`): Plus 25 favoritter/dagligt mail-overblik/statisk
    prisanbefaling; Pro uden loft/realtid/dynamisk + konkurrent-varsler +
    batch-prisredigering. Selve featuren (Vinted-URL-overvågning,
    notifikationer, batch-redigering) er IKKE bygget.

[ ] **S36 · /priser: abonnements-sektion + pakkenavne**
    Vis Plus/Pro (md./år, annoncer/md., pr.-annonce-pris, funktioner) og
    pakkenavne med "Anbefalet"-mærkat på Sælger — copy findes allerede i
    `da.priserSide.abonnement` + `da.kreditter.pakkeNavne`. Overvej også
    abonnements-checkout-UI (API-ruten understøtter det allerede) og
    abonnementspriser i JSON-LD/llms.txt. Skåret fra pricing v3-leverancen
    på ejer-ordre.

[ ] **S37 · Årsabonnement: månedskvoter mellem fakturaer**
    invoice.paid giver kun kvote ved betaling — ét årskøb skal stadig give
    12 månedlige kvoter. Kræver scheduled job (Trigger.dev) der granter
    idempotent pr. abonnement+måned.

[ ] **S38 · aiCostWatch-alarm + preview-tilstand**
    Config findes (`aiCostWatch`, `preview` i lib/config.ts). Byg: rullende
    14-dages costvagt med mail til kontakt-adressen, og preview-flowet
    (3 gratis pr. konto, dagligt globalt budget).

[ ] **S34 · Transaktionsmails præcis én gang (idempotens)**
    I dag (S32) kan en sjælden Stripe-dublet-event gentage kvitterings-
    supplementet, og en manuel job-genkørsel (G-3) kan gentage leverancemailen.
    Før `tilfoej_kreditters` `v_indsat`-signal op gennem `LedgerDb`/
    `registrerKoeb`/`haandterStripeEvent`, og gat leverancemailen på en
    `notified_at` på item/generation — så hver mail sendes præcis én gang.
    Lav berøring af pengevejen → egen opgave, egen PR.

## Færdigt (fase A er komplet og grøn)

Fundament S1–S6 · App S7–S11, S18 (regenerér enkeltdele), B-9 (batch) ·
Launch S13 (landing), S14 (Lær + SEO), S15 (misbrugsværn + admin), S16
(presets 2+3, delbart before/after), S28 (Vinted-first-integration), S29
(session-notater konsolideret), S30 (kategori-skabeloner + hjem-ankre),
S31 (hjem som brugervalg under Konto + sammensat prompt_version, FR-15),
S32 (transaktionsmails koblet på auth/webhook/pipeline, best-effort) ·
L1 (Lighthouse keyless-måling), L2 (gate1-script) ·
Markedsanalyse M1 (Vinted-scripts) + M2 (markedspriser i prisforslaget) ·
Design V6 "Klar & nordisk" → Vinted-first (2026-08-16).

Detaljer og begrundelser: `STATUS.md` og git-historikken.
