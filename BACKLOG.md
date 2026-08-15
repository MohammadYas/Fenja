# BACKLOG — fase A
## Fundament
[x] S1  Scaffold: Next.js App Router + TS strict + Tailwind + mappestruktur fra HANDOFF §3,
        netlify.toml, supabase init + første migration, .env.example, CI
[x] S2  Design-session: DESIGN.md med tokens + begrundelser, /lib/design/tokens.ts +
        basis-komponenter (knap, felt, kort, badge)
[x] S3  Provider-lag: ImageProvider + fal + mock; VideoProvider-interface; unit tests
[x] S4  Pipeline-kerne: cleanup, onmodel (preset v1), fidelity, listing-text, badge
[x] S5  Trigger.dev-job: item-pipeline, idempotens, delvis leverance (B-6), omkostningslog
[x] S6  Kreditter: ledger.ts med transaktionel trækning/refund (E-3/E-4) + tests
## App
[x] S7  Auth + konto: magic link, 18+-gate, konto-side, slet konto (A-1..A-5)
[x] S8  Nyt item-flow: guidet upload, komprimering, metadatafelter, progress (B-1..B-4)
[x] S9  Resultatside i compliance-rækkefølge + kopiér-flow + checkliste (B-5)
[x] S10 Bibliotek + solgt-markering (B-7)
[x] S11 Stripe Checkout + webhooks + saldo-UI (E-1/E-2/E-6) — testmode, mock i CI
[x] S18 B-8 Regenerér enkeltdele til reduceret kreditpris; numeric-ledger
## Launch
[ ] S12 [KRÆVER NØGLER — efter HANDOFF §6] Ende-til-ende mod rigtige providers; kalibrér
        troskabs-tærskel; Gate 2-måling (≤ 2 min). NÆSTE OPGAVE når ejeren har kørt
        hjemme-checklisten
[x] S13 Landing page + vilkår/privatliv (F-1) — hero SKAL opdateres med ægte output fra S12
[x] S14 Lær-sektion, 8 guides (F-2) + SEO-basics (F-3)
[x] S15 Misbrugsværn + admin-omkostningsside (E-5, G-1) — Sentry (G-2) fravalgt af ejer
[x] S16 Preset 2+3, delbart before/after (C-5, F-4)
[x] V6  Design-overhaul "Klar & nordisk" (2026-08-15, ejerens dom over V5) + B2B-fokus
        på forsiden (UGC-annoncer og hjemmesider til virksomheder), ingen priser på
        forsiden — se DESIGN.md og STATUS.md
## Efter S12
[ ] S25 Udskift landing-hero med ægte before/after fra første rigtige kørsel
[ ] S26 Lighthouse mobil ≥ 90 på marketing-sider + launch-gates (HANDOFF §8)
