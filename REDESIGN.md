# FENJA · REDESIGN.md — komplet visuel rebuild (v2-brief)

> **Status:** Ejerens dom over v1: fladt, dødt, kedeligt. Denne fil er opdraget til en
> komplet visuel rebuild. Den ERSTATTER DESIGN.md's afsnit 4–7 når den udføres;
> tokens-disciplinen, kontrastkravene og manifestet (HANDOFF §2) gælder stadig 100 %.
> Udføres som ÉN dedikeret session: læs denne fil + HANDOFF §2 + DESIGN.md, byg, screenshot på 390 px, sammenlign med "Dødstegn"-listen nederst.

---

## 1. Diagnose: hvorfor v1 er kedelig

v1 tolkede "lavmælt" som "fravær". Alt er samme lyse gråtone, samme smalle spalte, samme rytme: label → tekst → kort → knap. Ingen skala-spring, ingen farvemod, intet der bevæger sig, intet at røre ved. Det ligner en pæn formular, ikke et produkt med holdninger. **Lavmælt betyder selvsikker — ikke fraværende.**

De tre dødssynder i v1, som rebuild'et skal udrydde:
1. **Ingen skala-kontrast.** Display-tekst på 28–48 px er ikke display. Ingenting dominerer, så ingenting betyder noget.
2. **Farverne bruges ikke.** Gran og rav findes kun som knap og stiplet linje. 95 % af skærmen er kalk. Paletten er god — den er bare aldrig sluppet løs.
3. **Nul taktilitet og nul bevægelse.** Produktet handler om TØJ — stof, sømme, prismærker — og UI'et føles som et regneark.

## 2. Retning v2: **"Katalog møder plakat"**

Tænk: dansk plakattradition + fysisk tøjkatalog + prismærker fra genbrug. Stadig nordisk, stadig ærligt — men med plakatens skala-mod og butikkens fysiske detaljer. Referencer at have i baghovedet (ikke kopiere): danske museumsplakater, Hay/Frama-kataloger, håndstemplede prislapper i genbrugsbutikker.

**Fem bærende greb** (alle skal kunne ses på ETHVERT view):

### 2.1 Plakat-typografi
- Bricolage Grotesque bruges som PLAKAT: hero-overskrifter 64–96 px på mobil (`clamp(3.5rem, 16vw, 9rem)`), linjehøjde 0,95, tracking -0.02em, optisk akse høj (opsz 96). Gerne ét ord pr. linje. Overskriften ER hero-grafikken.
- Nye typeskala-trin i tokens: `plakat` (clamp som ovenfor) og `kaempe` (clamp(2.5rem, 10vw, 5rem)). Behold de gamle trin til brødtekst/UI.
- Ét fremhævet ord pr. hero må få rav eller stå i Instrument-kursiv — aldrig hele linjer.
- Mono-uppercase (Spline) er system-stemmen: alle labels, priser, statusser, sektionsmarkører (`01 — SÅDAN VIRKER DET`).

### 2.2 Farveblokke
- Sektioner skifter GRUND, ikke kun indhold: kalk → gran (med kalk-tekst) → hør → kalk. Mindst én gran-blok pr. marketing-side og i app'ens tomme/succes-tilstande.
- Rav bruges modigt dekorativt: kæmpe mono-tal, stempler, markeringer — aldrig brødtekst (AA-reglen fra DESIGN.md §2 står ved magt; `ravDyb` til tekst).
- Ingen nye farver. Modet ligger i MÆNGDEN, ikke i paletten.

### 2.3 Prislappen (nyt fysisk motiv)
Tøjets mest genkendelige objekt: **prislappen/hangtag'en**. Genbruges konsekvent:
- Prisforslag vises som prislap: hør-flade, 1 px koks-kant, afklippet hjørne (clip-path), hul + "snor" (lille cirkel-outline), let rotation (-2° til 2°, deterministisk pr. element, aldrig animeret rotation).
- Kreditpakker, saldo-badge og "3 GRATIS"-stemplet bruger samme motiv.
- Stempel-varianten: mono-uppercase i rav-outline-boks, roteret ~-3°, som et håndstempel ("3 GRATIS ANNONCER", "SOLGT", "AI-VISUALISERING" beholder dog sin lovpligtige sorte badge uændret).

### 2.4 Sømmen 2.0 + stof-tekstur
- Sømmen består, men bliver fysisk: dobbelt stiplet linje (to parallelle med 3 px afstand) og bruges også som HOVER/AKTIV-markering (nav, links, kort).
- Kalk-flader får en NÆSTEN usynlig vævning: SVG-noise/grid-tekstur i koks på 2–3 % opacity (inline data-URI, ingen billedfiler). Skal kunne anes, ikke ses — det dræber det sterile.
- Kort/paneler: behold ingen-skygge-reglen, men giv dem kant-personlighed: 1,5 px koks-kant + 4 px offset-"skygge" i ren gran eller hør (solid, ikke blur — plakat-tricket). Kun på interaktive kort.

### 2.5 Bevægelse (mikro, aldrig cirkus)
- Alt interaktivt reagerer: knapper løfter 2 px + offset-skygge vokser; kort får søm-understregning; links får søm i stedet for standard underline på hover.
- Scroll-reveal på marketing: sektioner fader/løfter 12 px ind, 300 ms ease-out, stagger 60 ms — KUN transform/opacity, `IntersectionObserver`, én gang, respekterer `prefers-reduced-motion` (alt vises da med det samme).
- Progress-visningen i pipelinen: en søm der "syr sig selv" hen over skærmen (stiplet linje der fylder trin for trin) i stedet for prikker.
- Tal tæller op (saldo, statistik) over 400 ms. Ingen parallax, ingen scroll-hijack, ingen marquee.

## 3. Side-for-side (prioriteret rækkefølge)

1. **Landing:** Plakat-hero: "SÆLG DIT TØJ HURTIGERE" over 3 linjer i plakat-størrelse, "HURTIGERE" i rav. Before/after-rammen skubbes op i heroen, let roteret (1,5°), med prislap-stempel "2 MIN". Sådan-virker-det: kæmpe rav-mono-tal (01/02/03) der stikker halvt ud af venstre kant, indhold forskudt asymmetrisk. Priser-sektionen: gran-blok med prislapper. CTA-sektion: hør-blok, plakat-typo.
2. **App-skal:** topbar får søm-underkant; saldo som lille prislap. Bundnav: aktiv fane = søm-overkant + gran, ikonerne beholdes.
3. **Nyt item:** foto-rollekortene bliver taktile (offset-skygge, hover-løft); "Lav min annonce" som stor fuld-bredde plakat-knap. Progress = syende søm.
4. **Resultatside:** sektionsmarkører i mono (`01 — DINE FOTOS`), prisforslag som stor prislap, kopiér-knapper med stempel-feedback ("KOPIERET" stemples på).
5. **Oversigt/konto/kreditter:** statistik-kortet som gran-blok med kæmpe mono-tal; "solgt for X kr." er heltestallet. Kreditpakker som prislapper.
6. **Lær:** guide-kort med offset-skygge + nummererede rav-tal; artikelsider får plakat-rubrik.

## 4. Tekniske krav (ufravigelige)

- ALT deriverer stadig fra `lib/design/tokens.ts`: nye tokens for plakat-skala, offset-skygge (`skygge: "4px 4px 0 0"`-koncept), rotationstrin (−3°, −2°, 1,5°), tekstur-opacity, bevægelses-varigheder (150/300 ms + stagger 60 ms). Ingen ad hoc-værdier i komponenter.
- Kontrasttesten (tokens.test.ts) skal bestå uændret; nye kombinationer (kalk-på-gran-blokke osv.) tilføjes til testen.
- `prefers-reduced-motion` slår AL bevægelse fra (testbar: alle animationer bag én utility/komponent).
- Mobil-først: plakat-typo må ALDRIG give vandret scroll på 320 px — brug clamp og test 320/390/430.
- Lighthouse mobil ≥ 90 må ikke ryge: teksturer som inline-SVG, ingen nye fonte, ingen JS-biblioteker til animation (rå IntersectionObserver + CSS).
- Compliance-elementer er FREDEDE: AI-badgen (sort/kalk), compliance-rækkefølgen, fejl-i-tekst. De må styles, aldrig svækkes.
- Rotation og offset-skygger: deterministiske (pr. indeks/id), aldrig random pr. render.

## 5. Dødstegn-tjek (kør FØR commit — ét ja = byg om)

AI-slop-tegnene fra HANDOFF §2.1 gælder stadig (gradients, glass, emojis, buzzwords, de tre default-æstetikker). Oveni, specifikt for denne rebuild:
1. Kunne heroen ligge på enhver SaaS hvis man skiftede ordene ud? (= typografien er for lille/pæn)
2. Er der en skærm helt uden gran, rav eller et fysisk motiv (søm/prislap/stempel)? (= tilbage til regnearket)
3. Er rotationerne/stemplerne OVERALT? (= maskeret kaos; motivet virker fordi det er doseret — maks. 1–2 stempler pr. view)
4. Bevæger noget sig uden at brugeren gjorde noget (ud over scroll-reveal)? (= cirkus)
5. Ligner offset-skyggen "neubrutalism-template" (sort skygge + pastel + pill-knapper)? (= brug gran/hør-skygger, blød radius 8 px, aldrig pill, aldrig ren sort skygge)

## 6. Definition of Done for rebuild-sessionen

Tokens v2 + alle sider i §3 bygget om · alle eksisterende tests grønne (kontrasttest udvidet) · 390 px-screenshots af landing, nyt-item, resultat, oversigt vedlagt PR · slop-tjek fra §5 besvaret konkret i PR-beskrivelsen · STATUS.md opdateret · ingen ændringer i pipeline/compliance-logik.
