# BACKLOG — fase A
## Fundament
[x] S1  Scaffold: Next.js App Router + TS strict + Tailwind + mappestruktur fra HANDOFF §3,
        netlify.toml, supabase init + første migration (users, items, item_photos,
        generations, presets, credit_ledger, guides — se SPEC §7), .env.example,
        CI (lint+typecheck+test), STATUS.md + denne BACKLOG committet
[x] S2  Design-session: følg HANDOFF §2 → DESIGN.md med tokens + begrundelser,
        implementér /lib/design/tokens.ts + basis-komponenter (knap, felt, kort,
        badge) SOM ENESTE OUTPUT — ingen sider endnu
[x] S3  Provider-lag: ImageProvider-interface + fal-implementering + mock med
        fixtures; VideoProvider-interface (tom impl.); unit tests mod mock
[x] S4  Pipeline-kerne: cleanup.ts, onmodel.ts (preset v1), fidelity.ts,
        listing-text.ts (Claude, D-1/D-2-validering), badge.ts (sharp) —
        alt testet mod mocks
[x] S5  Trigger.dev-job: item-pipeline med parallelle trin, idempotens,
        delvis leverance (B-6), omkostningslog (G-1)
[x] S6  Kreditter: ledger.ts med transaktionel trækning/refund (E-3/E-4) + tests
## App
[x] S7  Auth + konto: magic link, 18+-gate, konto-side, slet konto (A-1..A-5)
[x] S8  Nyt item-flow: guidet upload m. roller, komprimering, metadatafelter,
        "Lav min annonce" med progress (B-1..B-4)
[x] S9  Resultatside i compliance-rækkefølge + kopiér-flow + checkliste (B-5)
[x] S10 Bibliotek + solgt-markering (B-7)
[x] S11 Stripe Checkout + webhooks + saldo-UI (E-1/E-2/E-6) — testmode, mock i CI
[x] S18 B-8 Regenerér enkeltdele til reduceret kreditpris (ny visualisering i
        andet preset / ny tekst); numeric-ledger, idempotent træk kun ved succes
## Launch
[ ] S12 [KRÆVER NØGLER — efter §6] Ende-til-ende mod rigtige providers; kalibrér
        troskabs-tærskel; Gate 2-måling (≤ 2 min)
[x] S13 Landing page + vilkår/privatliv efter DESIGN.md (F-1) — hero er ægte output fra S12
[x] S14 Lær-sektion, 8 guides (F-2) + SEO-basics (F-3)
[x] S15 Misbrugsværn + admin-omkostningsside (E-5, G-1) — Sentry (G-2) afventer ejer-beslutning
[x] S16 Preset 2+3, delbart before/after (C-5, F-4) — polering fra egen brugstest afventer S12
## Slop-rebuild (desktop) — ejerens dom 2026-08-15: "det ligner AI"
Diagnose fra 1280 px-gennemgang + AI-tegn-research: (a) hero-rammen er et kæmpe
TOMT felt, (b) alt indhold ligger i venstre kolonne med død højreside hele vejen
ned (= mobil blæst op), (c) Lær er en centreret stak identiske kort (skabelon-
tegnet), (d) footeren er en tynd linkrække, (e) rå browser-radios på log-ind.
[x] S19 Hero-figuren får indhold: skematiske stregtegninger af tøj i rammen
        (DIT FOTO-halvdel med kontekst-rod, RENSET-halvdel ren) — stadig ærligt
        mærket pladsholder; desktop-hero i to kolonner (plakat + ramme)
[x] S20 Tørresnoren: prislapperne hænger fra en vandret søm-snor i varierede
        højder (forside + /priser) — tøj på snor som fysisk motiv
[x] S21 Desktop-rytme: Ærlighed-blokken asymmetrisk med lodret søm; slut-CTA
        med prislap-detalje; sådan-virker-det-tallene større på lg
[x] S22 Lær som katalog-indeks: kort-stakken erstattes af nummererede rækker
        med søm-delelinjer (ingen bokse), 2 kolonner på lg
[x] S23 Footer-blok: gran med stort FENJA-ordmærke, grupperede links og
        mærknings-linjen — ikke en tynd enkeltrække
[x] S24 Log-ind: 18+-valg som taktile valgkort oven på native radios (a11y)

## Udvidelser (fase A-plus, keyless) — 2026-08-15
[x] U1  FAQ-sektion på /priser (ærlige svar på de spørgsmål, siden ikke selv
        besvarer) + FAQPage-JSON-LD; sitemap-huller lukket (/priser, /log-ind)
[x] U2  Guide-navigation: forrige/næste nederst på hver guide + Article-JSON-LD
[x] U3  A11y-finish: skip-link til indholdet i marketing- og app-layoutet
[x] U4  Oversigt: statusfilter (Alle/Kladde/Aktiv/Solgt) med antal pr. chip
## Af-skabelonisering v3 — ejerens dom 2026-08-15: "ligner stadig AI"
Diagnose: detaljerne var på plads, men FORMSPROGET var skabelon — ens
sektionsrytme (label→rubrik→brød), flade farvebånd, clip-art-skitser i heroen,
samme radius/skygge overalt. v3 angriber formen, ikke detaljerne.
[x] V1  Hero-typografi med spænding: midterlinjen som ren kontur
        (.tekst-kontur, med @supports-fallback), lodret katalog-marginalia
        i sidekanten på lg
[x] V2  Hero-figuren: skitserne erstattet af annonce-transformationen — sjusket
        hør-seddel (mono, lowercase, skraveret "foto") overlappet af den
        færdige leverance (titel, punkter, prisforslag-tag, søm-kant);
        ærligt mærket "skitseret eksempel"
[x] V3  Ærligheds-blokken på koks — sidens ene mørke udsagn, så farvebåndene
        ikke gentager samme rytme (kalk→koks→gran→hør)
[x] V4  Stregkode-detalje på kreditpakkernes hangtags (forside + /priser) —
        deterministisk mønster, aria-hidden
## Redesign
[x] S17 KOMPLET visuel rebuild efter REDESIGN.md ("katalog møder plakat"):
        tokens v2, plakat-typo, farveblokke, prislap/stempel-motiv, Sømmen 2.0,
        mikro-bevægelse. Compliance og tests fredet. DoD i REDESIGN.md §6
