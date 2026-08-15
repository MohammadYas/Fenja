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
## Launch
[ ] S12 [KRÆVER NØGLER — efter §6] Ende-til-ende mod rigtige providers; kalibrér
        troskabs-tærskel; Gate 2-måling (≤ 2 min)
[x] S13 Landing page + vilkår/privatliv efter DESIGN.md (F-1) — hero er ægte output fra S12
[x] S14 Lær-sektion, 8 guides (F-2) + SEO-basics (F-3)
[x] S15 Misbrugsværn + admin-omkostningsside (E-5, G-1) — Sentry (G-2) afventer ejer-beslutning
[x] S16 Preset 2+3, delbart before/after (C-5, F-4) — polering fra egen brugstest afventer S12
## Redesign
[x] S17 KOMPLET visuel rebuild efter REDESIGN.md ("katalog møder plakat"):
        tokens v2, plakat-typo, farveblokke, prislap/stempel-motiv, Sømmen 2.0,
        mikro-bevægelse. Compliance og tests fredet. DoD i REDESIGN.md §6
