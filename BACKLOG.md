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
[x] S18 B-8 Regenerér enkeltdele til reduceret kreditpris (ny visualisering i
        andet preset / ny tekst); numeric-ledger, idempotent træk kun ved succes
[x] B-9 Batch: fotografér flere i træk — vente-tilstanden inviterer til
        næste item (pipelinen kører færdig serverside), og oversigten viser
        "På vej" på kladder med kørende generering
## Launch
[ ] S12 [KRÆVER NØGLER — efter HANDOFF §6] Ende-til-ende mod rigtige providers; kalibrér
        troskabs-tærskel; Gate 2-måling (≤ 2 min). NÆSTE OPGAVE — Supabase er
        allerede sat op og migreret (2026-08-16, se STATUS)
[x] L1  Lighthouse-gaten (HANDOFF §8) målt keyless: mobil ≥ 90 på alle
        marketing-sider (perf 91–96, a11y/BP/SEO 100); a11y-fund rettet
        (kontrast /60→/70, heading-rækkefølge, dl-struktur på /priser).
        OBS: målt FØR Vinted-first-forsiden — genmåles i S26
[x] L2  scripts/gate1-fidelity-test.ts: ved konsolideringen 2026-08-16 beholdtes
        preset-system-versionen (presets × 2 referencevægte, HTML-rapport,
        preset_stats) — naeste-task-versionens pipeline-tilgang står i git-
        historikken, genbrug idéer ved behov. Ejeren kører den med FAL_KEY +
        ~20 rigtige fotos (S12 trin 1–2)
## Markedsanalyse (ejer-værktøj, 2026-08-15)
[x] M1  Vinted-markedsanalyse som scripts (hent → analysér → dansk rapport):
        lav volumen m. hård kaldsgrænse, sælgerdata filtreres væk ved kilden,
        median/kvartiler/efterspørgsel pr. søgning og stand; 11 tests,
        data/-output gitignoreret; valideret mod rigtigt katalog (1.817 stk.)
[x] M2  Markedsstatistik ind i prisforslaget (D-4): eksporter.ts genererer
        committet lib/data/markedspriser.ts (min. 30 annoncer pr. interval);
        findMarkedsinterval matcher mærke (normaliseret) + kategori-ord, og
        prompten får en dateret markedslinje mærket som udbudspriser —
        første eksport fra dagens høst (10 intervaller) committet
[x] S13 Landing page + vilkår/privatliv efter DESIGN.md (F-1) — hero SKAL
        opdateres med ægte output fra S12
[x] S14 Lær-sektion, 8 guides (F-2) + SEO-basics (F-3)
[x] S15 Misbrugsværn + admin-omkostningsside (E-5, G-1) — Sentry (G-2) fravalgt af ejer
[x] S16 Preset 2+3, delbart before/after (C-5, F-4)
[x] V6  Design-overhaul "Klar & nordisk" (2026-08-15, ejerens dom over V5) + B2B-fokus
        på forsiden (UGC-annoncer og hjemmesider til virksomheder), ingen priser på
        forsiden — se DESIGN.md og STATUS.md
## Efter S12
[ ] S25 Udskift landing-billedserien med ægte output fra første rigtige kørsel.
        DEADLINE: senest Gate 4 (dag 21/lancering) — indtil da kører genererede
        billeder UDEN synlig mærkat (ejer-ordre 2026-08-15, midlertidigt; "sleek
        løsning" for mærkning afventer ejer — se STATUS)
[x] S28 /vinted-integration — LUKKET af STRATEGISKIFTET (feat/vinted-first,
        2026-08-15): Vinted-landingen ER forsiden, /vinted redirecter til /,
        dubletten samlet i components/foer-efter.tsx, B2B parkeret på /studio
        (noindex, kun footer-link). Se STATUS.md
[ ] S29 Slet docs/sessions/-notaterne fra feat/faseb-fundament, feat/preset-system
        og feat/emails når PR'erne merges — indholdet er konsolideret i STATUS.md
        (2026-08-15)
[x] S30 Kategori-skabeloner + fast hjem pr. sælger i on-model-prompten
        (feat/onmodel-skabeloner, 2026-08-16 — ejerens prompt-bibliotek oversat
        til C-2/C-6; docs/marketing-billeder.md dokumenterer forside-prompterne)
[ ] S31 Hjem-anker som brugervalg: lad sælgeren se/skifte sit hjem under Konto
        (kræver profiles-kolonne + migration; i dag deterministisk af user-id).
        Genbesøg efter merge af feat/preset-system (prompt-version bør så
        inkludere skabelon@v + hjem@v i generations.prompt_version, FR-15)
[ ] S27 Gratis-tier-model besluttes af ejer: nuværende = ingen gratis annoncer;
        alternativ på bordet = kør pipeline gratis men lever sløret/vandmærket,
        betal for at låse op (fuld friktion for misbrug, værdi-først for ærlige).
        BYG INTET før ejer har valgt
[ ] S26 Lighthouse mobil ≥ 90 på marketing-sider + launch-gates (HANDOFF §8)
