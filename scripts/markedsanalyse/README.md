# Markedsanalyse på Vinted (ejer-værktøj)

Tre små CLI'er der tilsammen giver et ærligt billede af udbud, prisniveau og
efterspørgsel for udvalgte mærke × kategori-søgninger på Vinted DK:

```bash
npm run analyse:hent      # høst aktive annoncer → data/markedsanalyse/raa/*.json
npm run analyse:beregn    # aggregér → data/markedsanalyse/markedsstatistik.json
npm run analyse:rapport   # dansk rapport → data/markedsanalyse/rapport.md
```

Søgningerne redigeres i `soegninger.ts`. Enkelt-søgning uden at redigere:

```bash
npx tsx scripts/markedsanalyse/hent.ts --soeg "acne studios halstørklæde" --kategori Accessories
```

## Spilleregler (indbygget i koden — lav dem ikke om)

- **Lav volumen:** hård grænse på 60 kald pr. kørsel, pause + jitter mellem
  alle kald, stop straks ved 429/403. Køres i hånden — aldrig i CI, aldrig
  fra appen, aldrig på skema.
- **Robots-signaler:** kataloget er tilladt for generiske agenter; `/member`,
  `/checkout` m.fl. røres aldrig. Indholdet bruges til prisstatistik i en
  rapport — ikke til modeltræning.
- **Ingen persondata:** `sanerItem` whitelister varefelter (pris, mærke,
  størrelse, stand, favoritter, alder). Sælger-objektet når aldrig disken.

## Ærlighed i tallene

Vinted viser kun **aktive annoncer** offentligt — tallene er altså
udbudspriser, ikke salgspriser, og rapporten siger det selv. Efterspørgsel
måles som favoritter pr. dag siden upload (annoncer over ét døgn gamle).

`data/markedsanalyse/` er gitignoreret: rå snapshots og rapporter er
øjebliksbilleder, ikke kildekode. Aggregationslogikken er ren og testet i
`tests/markedsanalyse.test.ts` — CI rører aldrig netværket.
