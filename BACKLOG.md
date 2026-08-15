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

[ ] **S32 · Kobl transaktionsmails på flowet**
    `emails/` + `lib/emails/send.ts` er bygget og testet, men intet kalder dem
    endnu. Kræver RESEND_API_KEY + domæneverifikation (HANDOFF §6).

[ ] **S33 · Fase B: implementér VideoProvider mod fal**
    `lib/video/` har det fulde interface, mock og prompt-compiler. Ved
    implementering: slet S3-stubben `lib/providers/video.ts` og flyt dens
    imports over.

## Færdigt (fase A er komplet og grøn)

Fundament S1–S6 · App S7–S11, S18 (regenerér enkeltdele), B-9 (batch) ·
Launch S13 (landing), S14 (Lær + SEO), S15 (misbrugsværn + admin), S16
(presets 2+3, delbart before/after), S28 (Vinted-first-integration), S29
(session-notater konsolideret), S30 (kategori-skabeloner + hjem-ankre),
S31 (hjem som brugervalg under Konto + sammensat prompt_version, FR-15) ·
L1 (Lighthouse keyless-måling), L2 (gate1-script) ·
Markedsanalyse M1 (Vinted-scripts) + M2 (markedspriser i prisforslaget) ·
Design V6 "Klar & nordisk" → Vinted-first (2026-08-16).

Detaljer og begrundelser: `STATUS.md` og git-historikken.
