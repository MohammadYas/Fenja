# FENJA · DESIGN.md — designbeslutninger v6 "Klar & nordisk"

> Erstatter v1–v5. Baggrund: ejeren har forkastet tre retninger — v1 ("fladt,
> dødt"), v2/v3-rekvisitterne ("AI-bokse") og V5's rolige katalog ("grimt og
> forvirrende"). Fællesnævneren i dommene: plakat-råben (kæmpe versaler),
> tunge fuldblods-farveblokke og søm-pynt overalt skabte støj, ikke identitet.
> v6 beholder tokens-disciplinen og manifestet (HANDOFF §2) 100 %, men skifter
> udtryk til klarhed: Swiss-inspireret grid, sentence case, luft frem for farve.
> ui-ux-pro-max-analyse: "Kinetic Brutalism"-forslaget afvist (manifest §2.1);
> strukturelle anbefalinger fulgt: Swiss Modernism-grid, Minimal Single Column-
> landing (én primær CTA pr. sektion), udtalt whitespace, klar hierarki.

## 1. Principper

1. **Klarhed før karakter.** Én ting ad gangen pr. sektion; sektioner adskilles
   af luft og en 1 px hairline — ikke af farveblokke.
2. **Sentence case.** Versaler kun i mono-mærkater (badge-sproget). Display-
   overskrifter skriver som man taler.
3. **Én mørk blok pr. side, maks.** Gran/koks bruges som accent-bånd, ikke tapet.
4. **Søm-pynten er pensioneret.** Den stiplede rav-søm findes nu KUN som
   skillelinje inde i before/after-panelet og som progress-spor i pipelinen.
   Alle andre delelinjer er 1 px solid koks/10–15. Link-hover er almindelig
   solid underline.
5. **Skalaen taler stille.** Hero maks. clamp(2,5rem → 4,5rem); ingen 9rem-plakat.

## 2. Farvetokens (uændret palette, ny dosering)

| Token | Hex | v6-rolle |
|---|---|---|
| `kalk` | `#F1F3F2` | Baggrund overalt (også sektioner der før var hør/gran) |
| `koks` | `#212523` | Tekst; det ene mørke accent-bånd pr. side |
| `gran` | `#24513F` | Knapper, links, aktiv tilstand — aldrig fuldblods sektionsbaggrund på marketing |
| `hoer` | `#D8D3C6` | Kort og felter (1 px kant), ikke sektionsbaggrunde |
| `rav` / `ravDyb` | `#C97F1B` / `#9A6013` | Kun pris-detaljer og before/after-sømmen. AA-reglerne fra v1 gælder (håndhævet i tests) |
| `fejl` | `#8C2F23` | Funktionel fejlfarve, altid med tekst |

## 3. Skrifter (uændret) & typeskala (tæmmet)

Bricolage Grotesque (display) · Instrument Sans (brød) · Spline Sans Mono (tal/mærkater).
Typeskala-ændringer i tokens.ts: `kaempe` = clamp(2rem, 5vw, 3.25rem),
`plakat` = clamp(2.5rem, 7vw, 4.5rem) — plakat-trinnet består af hensyn til
eksisterende brug, men er nu en stor rubrik, ikke en mur. Ingen uppercase på
display-trin.

## 4. Layout

- Marketing: max-w-6xl, 12-kolonners mental model (Swiss Modernism 2.0),
  asymmetri via kolonnespring — ikke via rotationer/skygger.
- Sektionsrytme: py-20/py-24 på desktop, py-14 mobil; hairline mellem sektioner.
- App: uændret max-w-md mobilskal; topbar-delelinje er nu hairline, ikke søm.

## 5. Forsidens informationsarkitektur (ejer-beslutning 2026-08-15)

1. Hero: **til virksomheder** — UGC-annoncer, annoncebilleder og hjemmesider.
   Primær CTA: skriv til os (mailto fra lib/config.ts).
2. Ydelser som redaktionelle rækker (nummereret liste, ikke ikon-grid).
3. **Vinted-appen** som sektion: before/after-panelet (signatur-elementet,
   HANDOFF §2.2.3) + tre trin + CTA til log-ind.
4. Ærlighed/compliance som sidens ene mørke bånd (slank udgave).
5. Slut-CTA (begge målgrupper).
**Ingen priser på forsiden** — kreditpriser bor på /priser (nås via footer og app).

## 6. Interaktion

Uændret fra V5: flade knapper der mørkner på hover, kort-kant der mørkner,
150/300 ms ease-out, scroll-reveal bag scripting+reduced-motion-gates, fokusring
2 px koks. Ingen nye animationer i v6.
