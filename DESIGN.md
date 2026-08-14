# FENJA · DESIGN.md — designbeslutninger v1.0

> Produceret af design-sessionen (S2) efter HANDOFF §2. Al UI-kode deriverer fra
> `/lib/design/tokens.ts` — ingen ad hoc-farver eller -størrelser. Ændringer her kræver PR med begrundelse.

---

## 1. Retning: nordisk redaktionelt & taktilt

Vi følger HANDOFF §2.2.2's startretning — og har efterprøvet den mod alternativerne frem for at tage den ukritisk:

- Værktøjsdata (ui-ux-pro-max, marketplace-mønster) foreslog en generisk blå marketplace-palette med Inter/Playfair. **Afvist**: Inter-som-identitet er eksplicit forbudt (§2.1.8), og "blå SaaS" er præcis det skabelonlook, manifestet vil undgå. Fra samme analyse **beholder** vi de strukturelle anbefalinger: fladt udtryk uden skygge-teater, synligt fokus, kontrast ≥ 4,5:1, touch-mål ≥ 44 px, hurtige rolige transitioner (150–200 ms).
- Retningen er begrundet i produktet: tøj er tekstil, brugerne er unge Vinted-sælgere med bullshit-radar, og produktets stærkeste bevis er ægte before/after-billeder. Designet skal derfor være lavmælt, materielt og redaktionelt — ikke "tech".

Bevidst afstand til de tre forbudte AI-default-æstetikker (§2.1.9): baggrunden er kølig grågrøn kalk — ikke cremet; accenten er granGRØN med rav kun til pris-detaljer — ikke terracotta, ikke syregrøn/vermillion på næsten-sort; og layoutet bruger blød radius og tekstile delelinjer — ikke avis-hairlines med nul radius.

## 2. Farvetokens (6 navngivne + 1 funktionel)

| Token | Hex | Rolle |
|---|---|---|
| `kalk` | `#F1F3F2` | Baggrund. Kølig, grålig kalk — ikke cremet |
| `koks` | `#212523` | Tekst og ikoner. Næsten-sort med grøn undertone |
| `gran` | `#24513F` | Primær: knapper, links, aktiv tilstand |
| `hoer` | `#D8D3C6` | Flader: kort, felter, sekundære baggrunde (hør) |
| `rav` | `#C97F1B` | KUN dekorative pris/CTA-detaljer og stor pris-display (≥ 24 px) — under 4,5:1 på kalk, aldrig til brødtekst |
| `ravDyb` | `#9A6013` | Tekst-sikker rav til pristal i normal størrelse (4,65:1 på kalk) |
| `fejl` | `#8C2F23` | Funktionel fejlfarve (7,4:1 på kalk). Altid med tekst/ikon, aldrig farve alene |

Kontrast-krav er håndhævet i `tests/unit/tokens.test.ts` (WCAG-beregning i kode — kan ikke glide).
Der findes ingen mørk tilstand i fase A; én gennemarbejdet lys tilstand frem for to halve.

## 3. Skrifter (self-hostede, OFL — licensfiler i /public/fonts)

| Rolle | Skrift | Begrundelse |
|---|---|---|
| Display (overskrifter, tal-hero) | **Bricolage Grotesque** (variabel 200–800) | Karakterfuld grotesk med menneskelige detaljer — redaktionel, ikke corporate. Ikke Inter, ikke en AI-default |
| Brødtekst & UI | **Instrument Sans** (variabel 400–700 + kursiv) | Rolig, åben læseskrift der holder sig i baggrunden |
| Tal, priser, badges | **Spline Sans Mono** (variabel 400–700) | Tabulære tal til priser/statistik (ingen layout-hop); mono-uppercase er badge-sproget |

Kun latin-subset (~175 kB samlet, woff2, `font-display: swap` via next/font). Dansk (æøå) ligger i latin-subsettet.

## 4. Typeskala & spacing

Typeskala (rem, mobil-først — display-trin bruger Bricolage, resten Instrument):
`detalje 0.8125 / basis 1.0 / lead 1.125 / titel 1.375 / display 1.75 / hero 2.25 / mega 3.0`
Basis er 16 px (undgår iOS-zoom), linjehøjde 1,6 på brødtekst, 1,1–1,2 på display.

Spacing: 4 px-grid (Tailwinds skala). Sidens rytme: sektioner 48–96 px, kort-padding 16–24 px, felt-gap 8–12 px. Touch-mål ≥ 44 px (håndhævet i komponenterne). Maks. tekstbredde: 65 ch.

Radius: `blød 8 px` (kort, felter, knapper), `stram 4 px` (badges). Ingen pill-former, ingen nul-radius-avislook.

## 5. Layoutkoncept

Mobil-først én-kolonne (320–430 px er kernen). Indhold i én rolig strøm; på desktop centreret smal kolonne (max-w-2xl for flows, max-w-5xl for marketing). Fladt: ingen skygger som dekoration — flader adskilles med `hoer` + 1 px `koks/15`-kant. Bevægelse: kun tilstandsskift, 150–200 ms ease-out, alt respekterer `prefers-reduced-motion`.

## 6. Signatur-element: Sømmen

Before/after af rigtigt tøj er produktets stærkeste bevis (HANDOFF §2.2.3) — og skillelinjen mellem før og efter er vores visuelle signatur: **Sømmen**, en lodret stiplet linje i `rav` der citerer en tekstilsøm. Den genbruges lavmælt som horisontal sektionsdeler og som markør på aktive trin i pipelinen. Én idé, gennemført konsekvent — ikke ti dekorationer.

## 7. Basiskomponenter (eneste UI-output af S2)

`/components/ui/`: `button.tsx` (primær/sekundær/stille + fejl-variant), `field.tsx` (synlig label, hjælpetekst, fejl under feltet med `aria-describedby`), `card.tsx` (hør-flade med kant), `badge.tsx` (mono-uppercase; inkl. `visualisering`-variant til AI-mærkningen, C-4). Alle: min. 44 px touch-mål på interaktive elementer, synligt `focus-visible`-ring (2 px koks, 2 px offset), tekster kommer ALTID fra `/lib/copy/da.ts` — komponenterne tager tekst som props.

## 8. Slop-selvkritik (§2.3)

1. *Grøn-som-primær kunne ligne enhver "bæredygtigheds-app".* Modtræk: gran er mørk og redaktionel (ikke frisk-grøn), og identiteten bæres af Bricolage + Sømmen, ikke af farven alene.
2. *Flat design + Tailwind kan blive rå shadcn-default.* Modtræk: ingen shadcn; egne komponenter fra tokens, hør-flader med kant i stedet for skygger, mono-badges.
3. *En stiplet linje kunne være ren pynt.* Modtræk: Sømmen har ét semantisk job (skillelinjen før/efter — beviset) og bruges kun dér samt som sektionsdeler; aldrig som baggrundsmønster.
