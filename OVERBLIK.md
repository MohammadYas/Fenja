# Selja — samlet overblik

**Opdateret:** 25. august 2026 · Erstatter BACKLOG/DESIGN/HANDOFF/MANGLER/PRODUCT/SELJA/SPEC/STATUS/TESTPLAN (findes i git-historikken).

## Gratis prøve uden konto (/prov) — LIVE 25/8

Ét foto → flat-lay-produktbillede (selja.dk-vandmærke, maks 1024 px),
annoncetekst med de sidste 40 % holdt tilbage server-side og fuldt
prisforslag. Resultatet claimes ind som annonce ved signup (signeret cookie).
Forsiden guider primært hertil; TikTok-bio peger på selja.dk/prov.

**Værn** (alle server-side; ~0,35 kr./trial): admin-toggle + dagligt
budgetloft i /admin → Gratis trial (default 200 kr., læses friskt pr.
forsøg), TRIAL_HOURLY_CAP (default 30 fra 26/8 — budgetloftet lukker
stadig døgnet ved 200 kr.),
1 completed trial pr. IP-hash pr. 7 dage (fejlede låser ikke), cookie +
fingerprint. Captcha: uden Turnstile-nøgler springes den over (bevidst
beslutning 25/8); sættes nøglerne, håndhæves den automatisk. Tragten måles
i trial_events (started/completed/blocked/to_signup) og vises i admin.

**Drift:** migration 20260825120000_trial er kørt i prod (tabeller, RLS,
trial-photos-bucket). pg_cron 'ryd-trial-usage' rydder rækker efter 90
dage; FOTOS slettes efter 7 dage af Trigger.dev-jobbet 'trial-oprydning'
(Supabase blokerer SQL-sletning i storage.objects — fundet 25/8).

**Udestår — AKUT (prod-hændelse 26/8):** (1) `npx trigger.dev deploy` (fra
en maskine med .env.local — ELLER fra telefonen: opret en access token på
cloud.trigger.dev, gem den som GitHub-secret TRIGGER_ACCESS_TOKEN, og kør
Actions-workflowet "Trigger.dev deploy"; det kører derefter automatisk på
hvert push til main) — trial-jobbet "trial-pipeline" er IKKE deployet,
og derfor kunne INGEN prøver gennemføres, da linket blev delt bredt 26/8:
verificeret mod prod — kørslen startede aldrig: Trigger.dev AFVISER IKKE et
udeployet task-id, men parkerer kørslen i PENDING_VERSION for evigt, så
handoff'et lignede en succes. Rækken stod i "running", og hver besøgende så
minutters falsk fremdrift og derefter en fejl. Koden aflæser nu kørslens
status efter handoff: venter den på et deploy, annulleres den, og
Netlify-RESERVEN tager over: baggrundsfunktionen trial-koersel-background
(netlify/funktioner-src/, bundtes af "byg:funktioner" i buildet) kører
genereringen på Netlify selv med 15 min-loft og sitets egne nøgler —
prøven kan altså VIRKE uden Trigger.dev-deployet, HVIS kontoen
understøtter background functions (kun et øjeblikkeligt 202 regnes som
startet; ellers markeres rækken failed og den besøgende får en
ØJEBLIKKELIG ærlig fejl). Trigger.dev-deployet er stadig den primære vej. (2) TRIAL_COOKIE_SECRET i
Netlify (dev-fallback signerer indtil da — afgrænset risiko); (3) evt.
Turnstile-nøgler (se .env.example).

**Robusthed under delt link (26/8):** timecap-default hævet 10 → 30/time
(TRIAL_HOURLY_CAP styrer stadig; budgetloftet er fortsat det primære værn).
Kørsler der ikke er STARTET inden 3 min (kø) opgives uden provider-kald og
uden at æde budgettet; klienten venter serverens fulde tidsbudget (4,5 min)
og laver et sidste status-tjek, før den viser en fejl; høsteren fyrer først
EFTER klientens deadline og kan ikke længere være det, der afgør en ventende
besøgendes skæbne. En sent fuldført kørsel kan ikke overskrive en allerede
høstet række (ingen urimelig 7-dages IP-lås for et resultat, ingen så).

## Status på rettelser

| Rettelse | Status |
|---|---|
| Rate limiting på genereringer (DB-trigger) | ✅ Live i prod 23/8 |
| 6 ydelsesindekser | ✅ Live i prod 23/8 |
| Natlig oprydning af rate_limit (pg_cron) | ✅ Live i prod 23/8 |
| Fejllogning i generations.fejl | ✅ Implementeret (verificeret 27/8) |
| Generisk-fallback ved ukendt kategori | ✅ Implementeret (verificeret 27/8) |
| Aktiveringsmail til nye brugere | ✅ Kode findes — LEVERANCE UBEKRÆFTET |
| Høst af hængende trials uden poller | ✅ Rettet 27/8 |
| SEO-pakke implementeret | ❌ Se docs/seo-pakke-selja.md |

## Hvad Selja er

Gensalgsværktøj til tøj: upload et billede, få rensede produktfotos (cleanup), stylede billeder i hjemmemiljø (onmodel: spejl/gulv/stativ/detalje) og færdig annonce med titel, beskrivelse, søgeord og prisinterval (text). Credits via Stripe (abonnement + pakker).

## Status i tal (27/8)

**Brugere:** 10 registrerede, heraf **2 ægte** — carolinefenge22@gmail.com
(23/8) og agurkmolgaard@gmail.com (24/8). De øvrige 8 er ejerens egne konti
(inkl. selja-logintest@example.com, kekee@gmail.com og nrikke26@gmail.com).
**Begge ægte brugere har 0 items og 0 genereringer.** Aktiveringsproblemet
fra 23/8 er altså ikke et enkelttilfælde — det er 2 ud af 2.

**Produktion:** 14 items (alle active, **0 solgt**), alle skabt på to af
ejerens konti. 66 genereringer: 55 lykkedes, 11 fejlede (alle onmodel, alle
20.–22/8 — ingen fejl siden kategori-værnet). Samlet API-forbrug **49,91 kr**,
heraf **17,46 kr brændt på fejl**. Ingen genereringer siden 26/8.

**Gratis prøve (26/8, eneste aktive døgn):** 13 startede fra **7 unikke IP'er**
→ 2 fuldført, 3 fejlet, **8 hang i "running"**. **0 claimet til en konto.**
4,51 kr. Tidslinjen er entydig: de 11 forsøg mellem 17:28 og 19:22 fejlede
eller hang alle, mens begge forsøg efter 19:26 lykkedes — **Netlify-reserven
virkede, da den kom i luften.** Én besøgende prøvede 5 gange i træk
(19:05–19:22) uden at få noget.

**Omsætning: 0 kr fra ægte brugere.** Alle posteringer i credit_ledger med et
Stripe-ref tilhører ejerens egne konti; den ene ægte bruger med kreditter fik
dem tildelt manuelt i admin.

**Trafik:** 327 sidevisninger i alt. /prov har 12 visninger fra 9 unikke —
færre end de 13 trials fra 7 IP'er, så besøgstællingen undertæller. Kilder:
297 direkte (TikTok-bio efterlader ingen referrer), 6 Google, 21 fra
Stripe-checkout. Ingen UTM-tagging overhovedet.

## Kritiske problemer

**P0 — Aktivering (uændret, nu 2 ud af 2):** Begge ægte brugere gennemførte
onboarding og lavede intet. Velkomstmailen ER implementeret (`sendVelkomst` i
lib/auth/efter-bekraeftelse.ts, med startUrl mod /nyt-item), men uden
RESEND_API_KEY mockes afsendelsen lydløst — og `welcomed_at` sættes ALLIGEVEL,
så databasen ikke kan skelne "sendt" fra "mocket". **Tjek at RESEND_API_KEY er
sat i Netlify, før der konkluderes noget om aktivering.**

**P0 — 31 % fejlrate på onmodel:** `generisk@v2` fejler 4/5 (80 %), `overdel@v2` 6/22 (27 %), `bukser@v3` 0/6. Fallback til generisk ved ukendt kategori er en reproducerbar bug — stop jobbet og bed brugeren vælge kategori i stedet.

**LØST — fejllogning:** `generations.fejl` skrives nu ved failed status
(`afslutGenerering`, dækket af tests/unit/generering-fejl.test.ts). De 11
NULL-rækker er alle fra 20.–22/8 og ligger FØR den kode — de forbliver tomme,
men nye fejl logges. Rækken i statustabellen ovenfor var forældet.

**P1 — Inkonsistent cost-logning:** Fejl logger snart 1,94 kr, snart 0,00. Log altid faktisk faktureret beløb.

**P2 — Ingen salgsdata:** Enum har draft/active/sold, men intet er markeret solgt. Gør "marker som solgt" synlig — det er både produktmåling og markedsføringsmateriale.

## Kodefixes der mangler (klar til indsættelse)

**Fejllogning i generate-handler:**
```ts
} catch (err) {
  await supabase.from('generations').update({
    status: 'failed',
    fejl: JSON.stringify({
      message: err?.message ?? String(err),
      code: err?.code ?? null,
      provider_status: err?.status ?? null,
      at: new Date().toISOString(),
    }),
    cost_dkk: err?.billed_cost ?? 0,
  }).eq('id', generationId);
  throw err;
}
```

**Stop generisk-fallback:**
```ts
const KENDTE = ['overdel', 'bukser', 'shorts', 'kjole', 'ydertoej', 'sko'];
if (!KENDTE.includes(kategori)) {
  return { status: 'needs_input', besked: 'Vælg kategori:', valgmuligheder: KENDTE };
}
```

**NB:** DB-triggeren kaster nu `RATE_LIMIT_USER` / `RATE_LIMIT_ONMODEL` / `RATE_LIMIT_GLOBAL` ved overskridelse (20/time pr. bruger, 10 onmodel/time, 150/time globalt) — fang beskeden pænt i UI. Grænser justeres i `supabase/migrations/20260823210000_rate_limits_og_indekser.sql`.

## Ugentlig overvågning

```sql
SELECT split_part(prompt_version, ' ', 2) AS kategori,
  COUNT(*) FILTER (WHERE status = 'failed') AS fejl, COUNT(*) AS total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'failed') / COUNT(*), 1) AS fejlrate_pct,
  ROUND(SUM(cost_dkk) FILTER (WHERE status = 'failed')::numeric, 2) AS spildt_dkk
FROM generations WHERE kind = 'onmodel' AND created_at > now() - interval '7 days'
GROUP BY 1 ORDER BY fejlrate_pct DESC;
```

```sql
SELECT COUNT(*) AS nye_brugere,
  COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM items i WHERE i.user_id = u.id)) AS aktiverede
FROM auth.users u
WHERE u.created_at > now() - interval '30 days' AND u.email NOT LIKE '%example.com';
```

## Vækstplan

**Uge 1:** Fejllogning, generisk-fix, aktiveringsmail, skriv personligt til Caroline.
**Uge 2:** UTM-tags på alle delte links, Google Search Console, "marker som solgt" synlig.
**Uge 3-4:** SEO-landingssider (se docs/seo-pakke-selja.md), dagligt før/efter-indhold på TikTok/Reels, del-knap med vandmærke i appen.
