---
target: forsiden (app/(marketing)/page.tsx)
total_score: 24
max_score: 32
na_heuristics: 7,9
p0_count: 0
p1_count: 2
timestamp: 2026-08-16T14-23-02Z
slug: app-marketing-page-tsx
---
Method: dual-agent (A: designreview-agent · B: detector-agent)

# Critique — Selja-forsiden (app/(marketing)/page.tsx)

## Design Health Score

| # | Heuristik | Score | Fund |
|---|---|---|---|
| 1 | Synlighed af systemstatus | 3 | Gode hover/fokus-tilstande; ingen aktiv-markering i nav |
| 2 | Match med virkelig verden | 4 | "str m tror jeg"-panelet, tal frem for tillægsord — exceptionelt |
| 3 | Brugerkontrol og frihed | 3 | Ingen blindgyder; mobil mister nav-ankeret |
| 4 | Konsistens og standarder | 2 | Selja/Fenja-skifte igangværende; h2-stil veksler uden logik |
| 5 | Fejlforebyggelse | 2 | Paywall efter signup er uvarslet — CTA lover "første annonce" |
| 6 | Genkendelse frem for genkaldelse | 3 | Alt synligt; billedstriben kræver gæt |
| 7 | Fleksibilitet | n/a | Persuade-flade, ét lineært job |
| 8 | Æstetisk/minimalistisk | 4 | v6-restraint reelt eksekveret |
| 9 | Fejl-recovery | n/a | Ingen fejltilstande på forsiden |
| 10 | Hjælp og dokumentation | 3 | Ægte guides gratis; men intet kostnads-signal |
| **Total** | | **24/32** | **Good (75 %)** |

## Design-specificitet: Forfattet til dette produkt — utvetydigt
Før-teksten er ægte Vinted-vernakular; tal frem for tillægsord; kilosalg/loppemarked/dødsbo; "Ind på Vinted" beskriver den reelle manuelle handling. Eneste generiske element: billedstriben (4 umærkede fotos uden kontekst).

Deterministisk scan: CLI 0 fund i 5 filer. Browser-overlay 5 fund: 1× cramped-padding (0px lodret padding på nav/CTA-links), 3× gray-on-color (text-hoer #D8D3C6 på gran #24513F), 1× em-dash-overuse (20 på siden). Vurdering: hoer-på-gran er ~5,9:1 (AA-godkendt) — designets bevidste off-white på det ene mørke bånd, falsk positiv. Cramped-padding bekræfter A's tap-måls-fund. Em-dashes er v6-copystil, lav prioritet. Detectoren fangede IKKE de reelle kontrastfejl (koks/60-mærkater ~4,06:1) — dem fandt kun A.

## Priority Issues

1. **[P1] Forventningsbrud ved konvertering.** "Opret dig og lav din første annonce" → side med overskrift "Log ind", og bagefter uvarslet kreditkøb (ingen gratis-tier, nul kostnads-signal på forsiden). Fix: pris-neutral ærlig linje ved slut-CTA ("Du køber kreditter når du er klar — intet abonnement") + /log-ind-overskrift "Opret dig eller log ind" + løfte-ekko.
2. **[P1] Fire umærkede AI-billeder modsiger ærligheds-moatet.** Footer siger "Alle visualiseringer er mærket — synligt", billedstriben er umærket (midlertidig ejer-ordre). Fix: én figcaption i panel-notens stil. NB: ejer-beslutning — deadline Gate 4.
3. **[P2] Billedstriben mangler kontekst.** Ingen overskrift/caption; stale aria-label "Vinted-appen" (B2B-æra). Fix: mono-mærkat "Tøjet vist båret — eksempler" + ret aria-label.
4. **[P2] Mono-mærkater fejler AA.** 13 px uppercase koks/60 på kalk ≈ 4,06:1 (< 4,5:1). Fix: tekst/70 (~5,5:1). Guide-numre tekst/50 ~3,1:1 samme problem.
5. **[P3] Smalle tap-mål i topbar.** "Lær" 24 px bred, ingen vandret padding (detector: 0px lodret padding bekræfter). Fix: px-2 på nav-links.

## Persona-røde flag
- **Jordan:** billedstriben uforklaret; "Log ind"-overskrift efter "Opret dig"-CTA; panelet viser ikke at BILLEDER også leveres.
- **Riley:** screenshotter footer-løftet vs. umærkede billeder → dårlig Reddit-tråd; "2 minutter" dækker ikke første gang (signup+betaling); /priser-FAQ'ens "ikke billede 1"-nuance står intet sted på forsiden.
- **Casey:** "Lær" klemt mellem "Priser" og "Log ind" → fejltryk; ellers: CTA over folden, 44 px høj, ingen vandret scroll ved 375 px.

## Mindre observationer
- DESIGN.md §5 foreskriver stadig B2B-hero — forældet ift. Vinted-first; ret før næste designer "retter tilbage".
- Billedserie-karrusellen (velbygget) bruges ikke på forsiden — statisk grid i stedet.
- Guide-numre ikke aria-hidden (trin-numre er) — inkonsekvent.
- h2 "Sådan virker det" (13 px mono) visuelt mindre end h3-trin-titlerne — inverteret hierarki.
- "Det får du"-båndet gentager hero-punkterne næsten 1:1 — tre sektioner siger samme tre ting.

## Spørgsmål der kan låse mere op
1. Hvis ærlighed er moatet, hvorfor er sidens mest visuelle element dens eneste uærlige? Én mærkningslinje gør striben til bevis på moatet.
2. Er "ingen priser på forsiden" den ejer-beslutning der koster mest tillid? "Intet abonnement" er et salgsargument for målgruppen.
3. Hvorfor viser "Efter"-siden i hero-panelet ikke ét mærket eksempelbillede? Så demonstrerer panelet hele leverancen, og billedstriben kan udgå.
