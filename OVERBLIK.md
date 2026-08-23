# Selja — samlet overblik

**Opdateret:** 23. august 2026 · Erstatter BACKLOG/DESIGN/HANDOFF/MANGLER/PRODUCT/SELJA/SPEC/STATUS/TESTPLAN (findes i git-historikken).

## Status på rettelser

| Rettelse | Status |
|---|---|
| Rate limiting på genereringer (DB-trigger) | ✅ Live i prod 23/8 |
| 6 ydelsesindekser | ✅ Live i prod 23/8 |
| Natlig oprydning af rate_limit (pg_cron) | ✅ Live i prod 23/8 |
| Fejllogning i generations.fejl | ❌ Mangler (app-kode) |
| Generisk-fallback ved ukendt kategori | ❌ Mangler (app-kode) |
| Aktiveringsmail til nye brugere | ❌ Mangler |
| SEO-pakke implementeret | ❌ Se docs/seo-pakke-selja.md |

## Hvad Selja er

Gensalgsværktøj til tøj: upload et billede, få rensede produktfotos (cleanup), stylede billeder i hjemmemiljø (onmodel: spejl/gulv/stativ/detalje) og færdig annonce med titel, beskrivelse, søgeord og prisinterval (text). Credits via Stripe (abonnement + pakker).

## Status i tal (23/8)

9 registrerede brugere, heraf **1 ægte** (carolinefenge22@gmail.com, aldrig aktiveret — 0 items). 12 items (alle active, 0 solgt). 60 genereringer, 11 fejlede (alle onmodel). API-forbrug 47,35 kr, heraf **17,46 kr brændt på fejl**. 12 unikke besøgende 23/8, Google organisk leverede den ægte bruger. 61 % mobil.

## Kritiske problemer

**P0 — Aktivering:** Eneste ægte bruger gennemførte onboarding og lavede intet. Ingen aktiveringsmail, intet der trækker mod første upload.

**P0 — 31 % fejlrate på onmodel:** `generisk@v2` fejler 4/5 (80 %), `overdel@v2` 6/22 (27 %), `bukser@v3` 0/6. Fallback til generisk ved ukendt kategori er en reproducerbar bug — stop jobbet og bed brugeren vælge kategori i stedet.

**P0 — Ingen fejllogning:** `generations.fejl` er NULL for alle 11 fejl. Gem exception (message, code, provider_status) ved failed status — ellers er al fejlsøgning gætværk.

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
