# FENJA · OVERLEVERING.md — komplet session-handoff

> Læs denne fil FØRST i enhver ny session. Derefter: HANDOFF.md (loven),
> REDESIGN.md (næste opgave), STATUS.md (log), SPEC.md/DESIGN.md ved behov.
> Alt ligger på branch `claude/ga-i-fang-og-beug-uxux-ha52r9` (pushet). Ingen PR oprettet endnu.

---

## 1. Hvor projektet står LIGE NU

**Hele fase A er bygget og grøn — undtagen to ting:**
1. **S17 (NÆSTE OPGAVE):** Komplet visuel rebuild efter `REDESIGN.md` — ejeren har dømt v1-designet fladt og kedeligt. Retning: "katalog møder plakat". ALT står i REDESIGN.md inkl. Definition of Done og dødstegn-tjek. Start her.
2. **S12 (KRÆVER NØGLER):** Ende-til-ende mod rigtige providers + Gate 1 (troskab ≥ 70 %) + Gate 2 (≤ 2 min). Blokeret indtil ejeren kører hjemme-checklisten (HANDOFF §6).

Verifikation: `npm run lint && npm run typecheck && npm test` (73 tests) og `npm run build` — alt grønt uden nogen nøgler. CI kører det samme.

## 2. Arkitektur på 60 sekunder

Next.js 15 App Router + TS strict + Tailwind v3 (config-as-code) · Supabase (auth/db/storage, 4 migrations i `/supabase/migrations`) · Trigger.dev (jobs) · fal.ai + Claude bag interfaces · Stripe · sharp.

- **Providers** (`lib/providers/`): `ImageProvider` (fal: rens + on-model), `TextProvider` (Claude: annoncetekst, troskabs-vision, label-OCR), `VideoProvider` (fase B, tomt interface). `hentImageProvider()/hentTextProvider()` vælger AUTOMATISK mock uden nøgler (`MOCK_PROVIDERS=1` tvinger mock). Tests/CI kører altid mod mocks.
- **Pipeline** (`lib/pipeline/`): `run.ts` er hjertet — budgetloft-tjek → rens (parallel) → [visualisering ∥ tekst] → badge → leverance m. kredit-træk. Delvis leverance ved fejlet visualisering = automatisk refund (B-6). Alt bag `PipelineDb`/`PipelineStorage`-interfaces; Supabase-impl i `supabase-db.ts`; fakes i `tests/fakes/`. Trigger.dev-jobbet (`trigger/item-pipeline.ts`) kobler kun rigtige deps på. Uden `TRIGGER_SECRET_KEY` kører `/api/items` pipelinen inline (dev/mock).
- **Kreditter** (`lib/credits/`): saldo = SUM af `credit_ledger` (aldrig et felt). Al skrivning via SQL-funktionen `tilfoej_kreditter` (advisory lock + unik idempotency key → dubletter er no-ops, træk uden dækning afvises atomisk). Nøglerne ejes af `ledger.ts` (`signup:`, `koeb:<stripe-event>`, `levering:<item>`, `refund-onmodel:<item>`).
- **Compliance er kodet, ikke vejledt:** badge + EXIF AI-mærkning i `badge.ts` (kan ikke fravælges), D-2 fejl-i-tekst-validering i `listing-text.ts` (retry → hård fejl), resultatsidens rækkefølge håndhævet af kildetekst-test (`compliance.test.ts`), buzzword/emoji-forbud håndhævet på `da.ts` OG guides (`copy.test.ts`).
- **AL brugervendt tekst** i `lib/copy/da.ts` (NFR-12). ALLE farver/typo/spacing fra `lib/design/tokens.ts` — Tailwind-temaet deriverer derfra.

## 3. Faldgruber fundet undervejs (spar tiden)

- **Navnekollision i Tailwind:** et farve-token og et typeskala-trin må ALDRIG dele navn (`text-detalje` farvede tekst rav i stedet for at sætte størrelse). Derfor er `roller.detalje` ikke mappet som farve — vagt-kommentar står i `tailwind.config.ts`.
- **Rav (#C97F1B) består ikke AA på kalk** — brug `ravDyb` (#9A6013) til tekst, rav kun dekorativt/display ≥ 24 px. Kontrasttesten i `tokens.test.ts` fejler CI hvis nogen roder.
- **Badge skal skalere:** `paafoerBadge` skalerer ned på små billeder (composite kastede ellers). Rør ikke uden at køre `badge.test.ts`.
- **Middleware no-op'er uden Supabase-env** — ellers 500 på alt i keyless preview. `next start` efter env-ændring kræver rebuild (middleware bundles).
- **Storage-stier vs. URLs:** DB gemmer stier; `SupabasePipelineDb.hentItem` signerer til URLs for providers; `hentBillede` håndterer begge.
- **Ejeren skriver på dansk/mobil, ofte kort.** Én opgave = én commit med conventional message. Push til SAMME branch. Ingen PR uden at ejeren beder om det.

## 4. Nøgler & ejer-checkliste (blokerer kun S12)

`.env.example` dokumenterer alt. Ejeren mangler (HANDOFF §6): Supabase cloud (`supabase link && supabase db push` — 4 migrations klar; lokal `db reset` kræver Docker og er IKKE verificeret endnu), Netlify + env-vars, `FAL_KEY` → kør Gate 1, `ANTHROPIC_API_KEY`, Stripe testmode (kun webhook-endpoint + nøgler — koden bruger inline price_data + automatic tax), Trigger.dev (`TRIGGER_SECRET_KEY` + `TRIGGER_PROJECT_REF`), Resend, domæne (`NEXT_PUBLIC_SITE_URL`), `ADMIN_EMAIL` (admin-siden 404'er ellers), `DAILY_BUDGET_CAP_DKK` (default 200).

## 5. Kør det selv

```
npm install
npm test            # 73 unit tests, mocks, ingen nøgler
npm run build       # fuldt build uden nøgler
npm run start       # marketing-sider virker keyless; app-sider kræver Supabase
```
Mobil-screenshots: se `scratchpad`-mønstret fra sidste session — Playwright med `executablePath: "/opt/pw-browsers/chromium"`, viewport 390×844. Screenshots på 390 px er obligatoriske for UI-arbejde (fandt en rigtig bug sidst).

## 6. Rækkefølgen herfra

1. **S17** — rebuild efter REDESIGN.md (kan køres NU, ingen nøgler). DoD: REDESIGN.md §6.
2. Ejer kører §6-checklisten → **S12** — rigtige providers, kalibrér `pipeline.troskabsTaerskel` i `lib/config.ts`, mål Gate 2, skift landing-heroens pladsholder til ÆGTE before/after.
3. Kvalitetsgates før launch: HANDOFF §8 (Lighthouse ≥ 90, én uinstrueret bruger gennemfører flowet, slop-gennemgang af hele sitet).
4. Sentry (G-2) er bevidst udskudt — ejer-beslutning.

*Én opgave, én commit, opdatér STATUS — og intet slop.*
