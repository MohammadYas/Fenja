# Gate 1 · eksempel-rapport (mock-tilstand)

Eksempel-kørsel af trekamps-udgaven af `scripts/gate1-fidelity-test.ts` mod
mock-providers — ingen nøgler, deterministiske scores (så tallene her siger
intet om virkelig troskab; de viser rapportens form). Kørt 2026-08-16 med
3 syntetiske testfotos:

```
npx tsx scripts/gate1-fidelity-test.ts <mappe-med-toejfotos>
```

## Providere side om side (målt cost pr. billede + model-pass-rate)

| provider | billeder | målt cost pr. billede | runs | passes | pass-rate |
|---|---|---|---|---|---|
| fal (Seedream) | 18 | 0,45 kr. | 18 | 10 | 56 % |
| Nano Banana Pro (gemini-3-pro-image-preview) | 18 | 0,95 kr. | 18 | 9 | 50 % |
| Nano Banana (gemini-2.5-flash-image) | 18 | 0,28 kr. | 18 | 13 | 72 % |

I mock-tilstand er costen providerens skøn fra config; live måles den faktiske
`costDkk` pr. kald (G-1/NFR-11).

## preset_stats (med provider-dimension)

| provider | preset@version | runs | passes | avg_fidelity | pass-rate |
|---|---|---|---|---|---|
| fal | hyggelig-stue@v1 | 6 | 3 | 0,713 | 50 % |
| gemini-final | hyggelig-stue@v1 | 6 | 3 | 0,723 | 50 % |
| gemini-preview | hyggelig-stue@v1 | 6 | 5 | 0,783 | 83 % |
| fal | koebenhavnsk-gade@v1 | 6 | 4 | 0,757 | 67 % |
| gemini-final | koebenhavnsk-gade@v1 | 6 | 3 | 0,740 | 50 % |
| gemini-preview | koebenhavnsk-gade@v1 | 6 | 3 | 0,727 | 50 % |
| fal | lys-minimalisme@v1 | 6 | 3 | 0,687 | 50 % |
| gemini-final | lys-minimalisme@v1 | 6 | 3 | 0,710 | 50 % |
| gemini-preview | lys-minimalisme@v1 | 6 | 5 | 0,783 | 83 % |

## Konsol-uddrag

```
Gate 1-trekamp: 3 fotos × 3 providers × 3 presets × 2 vægte (mock)
  jakke-03.png · fal · lys-minimalisme · vægt 0.65: 0.79 pass
  jakke-03.png · gemini-final · lys-minimalisme · vægt 0.65: 0.82 pass
  jakke-03.png · gemini-preview · lys-minimalisme · vægt 0.65: 0.74 pass
  …

Providere side om side:
  fal (Seedream): billeder=18 cost/billede=0,45 kr. runs=18 passes=10 pass-rate=56 %
  Nano Banana Pro (gemini-3-pro-image-preview): billeder=18 cost/billede=0,95 kr. runs=18 passes=9 pass-rate=50 %
  Nano Banana (gemini-2.5-flash-image): billeder=18 cost/billede=0,28 kr. runs=18 passes=13 pass-rate=72 %
```

Scriptet skriver desuden en HTML-rapport (`gate1-rapport.html`) med de samme
tabeller plus alle genererede billeder grupperet pr. foto → provider → preset,
med felter til manuel troskabs-scoring pr. (provider, preset) — Gate 1-dommen
er stadig menneskelig: ≥ 70 % for mindst ét preset (SPEC §12).
