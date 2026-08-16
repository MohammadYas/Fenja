# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Unge private Vinted-sælgere (ca. 15–30 år) i Danmark, der sælger brugt tøj
fra eget skab. Situationen: telefonen i hånden, 2–4 hurtige fotos i dagslys,
ingen tålmodighed til foto-redigering eller tekstforfatning. Jobbet: få en
færdig, troværdig Vinted-annonce uden arbejde. (Ejer-bekræftet 2026-08-16:
lejlighedssælgeren er den primære bruger — ikke volumen-/gensalgs-sælgere.)

## Product Purpose

Selja (omdøbt fra Fenja 15/8-2026 — oldnordisk "at sælge") laver en færdig
Vinted-annonce på ~2 minutter ud fra brugerens egne
fotos: rensede billeder i Vinted-format, tøjet vist båret, plus titel,
beskrivelse og prisforslag der lyder som brugeren selv. Brugeren kopierer
bare ind på Vinted. Succes = annoncen er reelt klar til at lægge op, og
køberen kan stole på den.

## Positioning

Troskab og ærlighed er moatet:

- **C-2 (ubetinget):** prompten beskriver ALDRIG tøjet — referencefotoet
  styrer. **C-6:** ansigter altid skjult eller beskåret væk.
- Fejl og slid **oplyses ærligt** i annonce-teksten — aldrig glattet over.
- Teksten lyder som sælgeren, ikke som en reklame.
- Prisforslag er forankret i rigtige markedsdata (lib/data/markedspriser.ts,
  indsamlet via scripts/markedsanalyse/).
- Gate 1: troskab ≥ 70 % er en målbar kvalitetsgrænse (preset_stats i DB,
  scripts/gate1-fidelity-test.ts). Endnu umålt (S12).

## Operating Context

Fotografér (helhed, bagside, label, fejl — dagslys nok) → Selja arbejder
(~90 sekunder) → kopiér til Vinted. Dansk marked, dansk sprog udadtil;
interne billedprompts er på engelsk (ejer-tuning: modellerne følger engelsk
bedre). Kategori-skabeloner pr. tøjtype; hver sælger får deterministisk ét
fast "hjem", så alle deres annoncer ligner samme bolig
(lib/pipeline/skabeloner.ts).

## Capabilities and Constraints

- Next.js + Supabase (projekt cpqsmtaledmjzirfeztp, eu-west-1); login via
  email/magic link; RLS på alle tabeller; demo-mode uden Supabase-env i
  non-production.
- Kreditmodel uden gratis-tier (gratisVedSignup: 0, misbrugsværn); saldo er
  summen af credit_ledger; al skrivning via idempotent tilfoej_kreditter.
  Den nuværende 1:1-økonomi er midlertidig; en model med flere kreditter og
  taktiske valg designes senere. Forsiden nævner derfor ikke et fast forhold.
- **Vinted-first er permanent produktsandhed** (ejer-bekræftet 2026-08-16):
  produktet ER Vinted-appen. B2B-studioet ligger parkeret på /studio
  (noindex, ikke i nav) — det er ikke produktets fremtid.
- Manifestet (HANDOFF §2) + SPEC er "lov", men STATUS.md's
  beslutnings-sektion registrerer ejerens overstyringer og læses først.
- Åbne produktbeslutninger (må ikke afgøres i design): S27-alternativ til
  gratis-tier (sløret/vandmærket gratis-kørsel); taktisk kreditmodel; "sleek"
  AI-mærkat på genererede billeder (deadline Gate 4); kontakt.email er
  midlertidigt ejerens gmail til domænet er registreret.

## Brand Commitments

Navnet Selja (domæne-placeholder `selja.studio` via `SELJA_DOMAIN` i
lib/config.ts til ejeren bekræfter købt domæne). Dansk, sentence case, talesprogsnær tone — "lyder som dig,
ikke som en reklame". Visuel identitet bor i DESIGN.md (v6 "Klar & nordisk")
og er ejer-godkendt efter fire forkastede retninger — bindende incumbent.

## Evidence on Hand

- Billedserien public/eksempler/*.webp er AI-genereret (gpt-image-2,
  2026-08-16; prompts i docs/marketing-billeder.md) — det er visualiseringer,
  IKKE rigtige kundeeksempler. Synlig mærkning er midlertidigt fjernet efter
  ejerordre; ejeren laver den endelige løsning før udgivelse.
- Ingen rigtige testimonials, kundetal eller før/efter-cases endnu —
  fremtidigt arbejde må ikke fabrikere dem.
- Lær-guides er ægte indhold i lib/guides-indhold.ts (TS-data, ikke markdown).
- Markedsprisdata + analyse-scripts i scripts/markedsanalyse/.

## Product Principles

1. **Ærlighed sælger.** Fejl oplyses; intet glattes over — hverken i
   annoncer eller i markedsføring af Selja selv.
2. **Troskab er målbar.** Tøjet på billedet er brugerens tøj (C-2);
   kvalitet måles som pass-rate pr. preset, ikke som smag.
3. **Brugerens stemme.** Output lyder som sælgeren — dansk, uformelt,
   aldrig reklamesprog.
4. **To minutter, ikke to timer.** Alt friktion mellem foto og færdig
   annonce er en fejl.
5. **Ingen fabrikeret proof.** Genererede billeder mærkes; ægte evidens
   afventer drift.

## Accessibility & Inclusion

AA-kontrast er håndhævet i tests for rav-farven (se DESIGN.md §2);
scroll-animationer bag reduced-motion-gates. Ingen yderligere
produktspecifikke krav fastlagt.
