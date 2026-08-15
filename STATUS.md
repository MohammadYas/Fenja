# STATUS
Sidst opdateret: 2026-08-15 af Claude Code (lokal session, branch `samlet`)

## Nu
- Intet i gang. Næste opgave: S12 [KRÆVER NØGLER] — ejeren kører hjemme-checklisten (HANDOFF §6) først.

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
- 2026-08-15: Forsiden fører med fase B-tilbuddet (B2B UGC/hjemmesider) selvom fase A
  (Vinted-appen) er MVP'en — ejer-ordre; M3's omsætning kommer primært fra B2B.
  Priser vises aldrig på forsiden (ejer-ordre).
- 2026-08-15: v6 beholder palette, skrifter og tokens-arkitektur (HANDOFF §2.2.2);
  kun dosering og skala er ændret. ui-ux-pro-max' "Kinetic Brutalism"-forslag afvist
  (manifest §2.1); Swiss Modernism-grid og Minimal Single Column-struktur fulgt.
- Ældre beslutninger (ledger som view, profiles-tabel, ravDyb-kontrastregler,
  detalje-tokenkollision, inline-pipeline uden Trigger-nøgle m.fl.) står i git-
  historikken for den gamle STATUS.md (commit før denne) og gælder stadig.
