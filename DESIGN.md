# SELJA · DESIGN.md — designbeslutninger v6 "Klar & nordisk"

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

## 5. Forsidens informationsarkitektur (Vinted-first, ejer-beslutning 2026-08-15/16)

Forsiden ER Vinted-landingen — B2B-studioet er parkeret på /studio (noindex,
kun footer-link). Rækkefølgen:

1. Hero: rubrik + lead + CTA til log-ind, med **before/after-panelet**
   (signatur-elementet, HANDOFF §2.2.3) i den brede kolonne. Ingen
   mono-mærkat over rubrikken og ingen "skitseret eksempel"-note under
   panelet (ejer-ordre 2026-08-16: fjernet — "skriger AI"). Tidsløftet gælder
   selve annoncen, når brugeren er logget ind og har kreditter.
2. **Tøjet vist båret:** 4 stykker fra serien i statisk grid under en synlig
   produktoverskrift. Ingen AI-/ærlighedsmærkat i denne runde; ejeren laver den
   endelige mærkning før udgivelse (se STATUS).
3. Sådan virker det: 3 trin som nummererede redaktionelle rækker (nav-anker).
4. **Sådan bruger du resultatet:** sidens ene mørke bånd forklarer billede 1,
   supplerende billeder og at brugeren selv lægger annoncen på Vinted.
5. Lær-teaser: 3 guides + vej til alle.
6. Slut-CTA med neutral kreditvarsling (kun sælgere; studioets vej bor i
   footeren).
**Ingen kronepriser eller fast kreditforhold på forsiden.** Den siger kun, at
kreditter kræves, købes når brugeren er klar og ikke er et abonnement.

## 6. Interaktion

Uændret fra V5: flade knapper der mørkner på hover, kort-kant der mørkner,
150/300 ms ease-out, scroll-reveal bag scripting+reduced-motion-gates, fokusring
2 px koks. Marketingnavigationen markerer den aktuelle side; "Sådan virker
det" forkortes visuelt til "Sådan" på mobil, men bevarer sit fulde tilgængelige
navn. Ingen nye animationer i v6.
