# FENJA · OVERLEVERING.md — komplet session-handoff

> Læs denne fil FØRST i enhver ny session. Derefter: HANDOFF.md (loven),
> STATUS.md (log), SPEC.md/DESIGN.md/REDESIGN.md ved behov.
> Tidligere arbejds-branches er merget til `main`; nyeste arbejde ligger på
> `claude/naeste-task-dcfccg` (pushet). Ingen PR uden at ejeren beder om det.

---

## 1. Hvor projektet står LIGE NU

**Hele fase A er bygget og grøn — inkl. S17 (visuel rebuild v2), slop-rebuilds
S19–S24, af-skabelonisering V1–V4, udvidelser U1–U4, batch-flowet S25 (B-9)
og regenerering S18 (B-8). De keyless kvalitetsgates er målt og bestået:**

- **Lighthouse-gaten (HANDOFF §8) er BESTÅET og HÅNDHÆVES I CI:** alle syv
  marketing-sider ligger på 95–98 i performance og 100 i a11y/BP/SEO
  (mobil-emulering). CI's `lighthouse`-job kører `@lhci/cli autorun` med
  tærskel ≥ 90 (lighthouserc.json) — og bygger dermed også appen keyless.
- **Slop-gennemgang af hele sitet (§8) er kørt** — se STATUS.md.

**S12 (NÆSTE OPGAVE — KRÆVER NØGLER):** Ende-til-ende mod rigtige providers.
Blokeret indtil ejeren kører hjemme-checklisten (HANDOFF §6). Når nøglerne findes:
1. Kør `scripts/gate1-fidelity-test.ts` med ~20 rigtige tøjfotos → Gate 1 (troskab ≥ 70 %); skriv pass-raten i STATUS.md
2. Kalibrér `pipeline.troskabsTaerskel` i `lib/config.ts` ud fra målingen
3. Mål Gate 2 (komplet annonce ≤ 2 min) på rigtig mobil
4. Skift landing-heroens ærligt mærkede pladsholder til ÆGTE before/after fra første rigtige kørsel (den sidder i `app/(marketing)/page.tsx`, hero-figuren)
5. Derefter de sidste gates før launch: én uinstrueret bruger gennemfører
   flowet på egen telefon (HANDOFF §8) — resten af §8 er grønt

**S17 er FÆRDIG (2026-08-15):** komplet visuel rebuild efter REDESIGN.md ("katalog
møder plakat"). Dødstegn-tjekket fra REDESIGN §5 er besvaret i STATUS.md. REDESIGN.md
er hermed udført — DESIGN.md §1–3 (tokens/skrifter/kontrast) gælder stadig; §4–7's
layoutbeskrivelser er erstattet af REDESIGN-retningen som bygget.

Verifikation: `npm run lint && npm run typecheck && npm test` (85 tests) og
`npm run build` — alt grønt uden nogen nøgler. CI kører det samme plus
Lighthouse-gaten.

## 2. Arkitektur på 60 sekunder

Next.js 15 App Router + TS strict + Tailwind v3 (config-as-code) · Supabase (auth/db/storage, 5 migrations i `/supabase/migrations`) · Trigger.dev (jobs) · fal.ai + Claude bag interfaces · Stripe · sharp.

- **Providers** (`lib/providers/`): `ImageProvider` (fal: rens + on-model), `TextProvider` (Claude: annoncetekst, troskabs-vision, label-OCR), `VideoProvider` (fase B, tomt interface). `hentImageProvider()/hentTextProvider()` vælger AUTOMATISK mock uden nøgler (`MOCK_PROVIDERS=1` tvinger mock). Tests/CI kører altid mod mocks.
- **Pipeline** (`lib/pipeline/`): `run.ts` er hjertet — budgetloft-tjek → rens (parallel) → [visualisering ∥ tekst] → badge → leverance m. kredit-træk. Delvis leverance ved fejlet visualisering = automatisk refund (B-6). Alt bag `PipelineDb`/`PipelineStorage`-interfaces; fakes i `tests/fakes/`. Uden `TRIGGER_SECRET_KEY` kører `/api/items` pipelinen inline (dev/mock).
- **Kreditter** (`lib/credits/`): saldo = SUM af `credit_ledger` (aldrig et felt). Al skrivning via SQL-funktionen `tilfoej_kreditter` (advisory lock + idempotency key). Nøglerne ejes af `ledger.ts`.
- **Compliance er kodet, ikke vejledt:** badge + EXIF AI-mærkning i `badge.ts`, D-2 fejl-i-tekst i `listing-text.ts`, resultatsidens rækkefølge håndhævet af kildetekst-test (`compliance.test.ts`), buzzword/emoji-forbud håndhævet på `da.ts` OG guides (`copy.test.ts`).
- **AL brugervendt tekst** i `lib/copy/da.ts` (NFR-12). ALLE farver/typo/spacing/skygger/rotationer fra `lib/design/tokens.ts` — Tailwind-temaet deriverer derfra.

### Design-systemet v2 (S17) — hvor tingene bor
- **Tokens v2** (`lib/design/tokens.ts`): typeskala-trin `plakat`/`kaempe` (clamp — aldrig vandret scroll på 320 px), `skygge` (offset 4/6 px, solid), `rotation` (stempel −3°, lap −2°/1,5°, ramme 1,5°), `tekstur` (0.015), `bevaegelse` (150/300 ms, 60 ms stagger, 400 ms tæller).
- **Motiver:** `components/ui/prislap.tsx` (hangtag: hør, afklippet hjørne, hul — geometri i globals.css `.prislap`), `components/ui/stempel.tsx` (mono-uppercase outline-stempel), Sømmen 2.0 i globals.css (`.soem`, `.soem-vandret` = dobbelt stiplet; `.soem-link` = hover/aktiv; `.soem-spor`/`.soem-fyld` = syende progress), `.kort-taktil` (koks-kant + offset-skygge, kun interaktive kort), `bg-tekstur` (inline-SVG vævning, deriveret i tailwind.config fra tokens).
- **Bevægelse:** `components/reveal.tsx` (scroll-reveal, rå IntersectionObserver, én gang), `components/taeller.tsx` (tal tæller op). ALT bag prefers-reduced-motion; reveal skjuler desuden kun bag `@media (scripting: enabled)` — uden JS vises alt.
- **System-stemmen:** mono-uppercase sektionsmarkører (`components/sektions-markoer.tsx` + `01 — …`-h2'er på resultatsiden).

## 3. Faldgruber fundet undervejs (spar tiden)

- **Navnekollision i Tailwind:** et farve-token og et typeskala-trin må ALDRIG dele navn — `roller.detalje` er derfor ikke mappet som farve (vagt-kommentar i `tailwind.config.ts`).
- **Rav (#C97F1B) består ikke AA på kalk** — `ravDyb` til tekst; rav kun dekorativt/display. **Nyt i v2:** ravDyb på hør er KUN til store pristal (≥ 24 px, 3,46:1 = AA large); brødtekst på hør er altid koks. Kontrasttesten håndhæver begge.
- **Prislap-geometrien bor i globals.css** (`.prislap`), ikke i komponenten — clip-path + hul skal følges ad. Komponentens `taet`-variant bruges i topbaren.
- **Rotationer er deterministiske klasser** (`rotate-lap-v` osv. fra tokens) — tilføj aldrig vilkårlige/random rotationer, og maks. 1–2 stempler pr. view (REDESIGN §5.3).
- **Badge skal skalere:** `paafoerBadge` skalerer ned på små billeder. Rør ikke uden `badge.test.ts`.
- **Middleware no-op'er uden Supabase-env**; `next start` efter env-ændring kræver rebuild.
- **`next dev` og `next start` deler `.next`** — kører man dev efter build, er prod-buildet væk, og slettede ruter kan efterlade stale typer i `.next/types` (typecheck fejler): `rm -rf .next && npm run build` løser det.
- **Ejeren skriver på dansk/mobil, ofte kort.** Én opgave = én commit med conventional message. Push til SAMME branch. Ingen PR uden at ejeren beder om det.

## 4. Nøgler & ejer-checkliste (blokerer kun S12)

`.env.example` dokumenterer alt. Ejeren mangler (HANDOFF §6): Supabase cloud (`supabase link && supabase db push` — 5 migrations klar; lokal `db reset` kræver Docker og er IKKE verificeret endnu), Netlify + env-vars, `FAL_KEY` → kør Gate 1, `ANTHROPIC_API_KEY`, Stripe testmode (kun webhook-endpoint + nøgler), Trigger.dev (`TRIGGER_SECRET_KEY` + `TRIGGER_PROJECT_REF`), Resend, domæne (`NEXT_PUBLIC_SITE_URL`), `ADMIN_EMAIL`, `DAILY_BUDGET_CAP_DKK` (default 200).

## 5. Kør det selv

```
npm install
npm test            # 85 unit tests, mocks, ingen nøgler
npm run build       # fuldt build uden nøgler
npm run start       # marketing-sider virker keyless; app-sider kræver Supabase
```
Mobil-screenshots: Playwright (chromium), viewport 390×844 — og tjek ALTID
`document.documentElement.scrollWidth` på 320 px (plakat-typoen må aldrig give
vandret scroll). App-sider kan screenshottes keyless via en midlertidig
preview-rute uden auth (slettes igen før commit — mønstret fra S17).

## 6. Rækkefølgen herfra

1. Ejer kører §6-checklisten → **S12** (se §1 — trin 1–4)
2. Resterende §8-gates: én uinstrueret bruger gennemfører flowet
   (Lighthouse-gaten og slop-gennemgangen er allerede grønne)
3. Sentry (G-2) er bevidst udskudt — ejer-beslutning
4. Derefter: fase B (videomotoren, SPEC Tillæg B)

*Én opgave, én commit, opdatér STATUS — og intet slop.*
