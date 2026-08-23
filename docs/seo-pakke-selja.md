# SEO-pakke til selja.dk

Strategien: ram søgninger folk laver FØR de kender Selja — "sælg tøj online", "hvad er mit tøj værd", "gode billeder til Vinted" — og konvertér med værktøjet, der løser præcis dét.

## 1. Meta-tags til eksisterende sider

**Forsiden `/`**
```html
<title>Selja — Sælg dit tøj hurtigere med AI-billeder og færdige annoncer</title>
<meta name="description" content="Upload et billede af dit tøj. Selja laver professionelle produktbilleder, skriver annoncen og foreslår den rigtige pris. Klar til Vinted, Trendsales og DBA på under et minut.">
```

**`/priser`**
```html
<title>Priser — Selja</title>
<meta name="description" content="Se hvad Selja koster. Billige abonnementer og klippekort — betal kun for de annoncer, du laver. Ingen binding.">
```

**`/laer`**
```html
<title>Lær at sælge tøj online — guides fra Selja</title>
<meta name="description" content="Guides til at sælge brugt tøj: bedre billeder, skarpere priser og annoncer der bliver set. Skrevet til Vinted, Trendsales og DBA.">
```

**Vigtigt:** Åbn `/priser` og `/laer` for ikke-indloggede. Kun 4 besøg nåede prissiden.

## 2. Landingssider (under /laer/)

### A: `/laer/saelg-toej-online`
**Meta-titel:** Sælg tøj online i 2026 — den komplette guide (Vinted, Trendsales, DBA)

**H1: Sælg dit tøj online — sådan gør du (og sådan sælger det hurtigere)**

Har du en bunke tøj, du gerne vil af med? Du er ikke alene — danskerne sælger brugt tøj som aldrig før. Men der er stor forskel på at lægge tøj til salg og at få det solgt.

**H2: Hvor skal du sælge?**
Vinted er gratis og har flest købere til hverdagstøj. Trendsales er stærkest til mærkevarer, hvor køberne betaler mere. DBA fungerer bedst til lokale handler. Læg gerne samme vare op flere steder — husk at fjerne annoncen når den er solgt.

**H2: Billederne afgør alt**
Købere scroller forbi hundredvis af annoncer — dit billede har under ét sekund. De tre klassiske fejl: rodet baggrund, dårligt lys og fladt, krøllet tøj. Tøj sælger, når køberen kan se hvordan det sidder. Har du ikke tid til at style hvert stykke? Det er præcis dét Selja gør: upload ét billede, få rene produktbilleder som fra en butik.

**H2: Skriv en annonce, der bliver fundet**
Titlen skal indeholde det folk søger på: mærke, type, størrelse, farve. "Ganni midikjole str. 38 sort" bliver fundet — "Fin kjole sælges" gør ikke. Beskrivelsen: stand, mål, materiale og fejl (ærlighed sparer returkøb).

**H2: Prisen**
Se hvad SOLGTE varer gik for — ikke hvad folk beder om. Hverdagstøj: 20-40 % af nypris. Mærkevarer i god stand: 40-60 %. Selja slår priser op og foreslår et realistisk interval med begrundelse.

**H2: Kom i gang på ét minut**
Upload et billede — Selja klarer resten: billeder, annonce, søgeord, pris. [Prøv Selja gratis]

**FAQ:**
- Hvad sælger bedst brugt? Mærkevarer, klassikere i neutrale farver, overtøj og sko i god stand. Jakker sælges aug-okt, sommertøj mar-maj.
- Er det gratis at sælge på Vinted? Ja — køberen betaler beskyttelsesgebyret.
- Hvor lang tid tager et salg? Gode billeder + rigtig pris: dage til få uger.

### B: `/laer/gode-billeder-vinted-trendsales`
**Meta-titel:** Gode billeder til Vinted og Trendsales — 7 tips der får tøjet solgt

**H1: Sådan tager du billeder, der sælger dit tøj**
1. **Ryd baggrunden** — hvid væg, rent gulv eller lagen.
2. **Brug dagslys** — ved et vindue. Aldrig loftslys om aftenen, aldrig blitz.
3. **Vis tøjet i form** — på person, buste eller bøjle. Fladt tøj ligner en klud.
4. **Flere vinkler** — for, bag, mærkat, detalje. Fire billeder minimum.
5. **Vis fejl ærligt** — skaber tillid, forhindrer retur.
6. **Stryg tøjet** — krøller signalerer "ligget i en pose i to år".
7. **Eller lad Selja gøre det** — upload ét mobilbillede, få butikskvalitet: spejl, gulv, stativ eller detalje i et pænt hjem.

### C: `/laer/hvad-er-mit-toej-vaerd`
**Meta-titel:** Hvad er mit brugte tøj værd? Sådan prissætter du rigtigt

**H1: Hvad er dit tøj værd?**

**Efter stand:** Ny m. mærke 50-70 % · Som ny 40-60 % · God stand 20-40 % · Slidt 10-20 %.

**Mærket betyder mest:** Fast fashion (H&M, Zara) mister værdien — sælg i bundter. Mellemmærker (Ganni, Samsøe, Wood Wood) holder prisen. Designer/outdoor (Acne, Rains, Patagonia) kan gå over 60 %.

**Tjek solgte annoncer** — ikke aktive. En vare der har ligget 3 måneder er prissat forkert.

**Lad Selja regne det ud:** prisinterval med begrundelse ud fra mærke, kategori og stand.

### D (outline): `/laer/vinted-tips`
10 Vinted-tricks: bump søndag aften, pakkestørrelse/porto, forhandlingskultur, de første 3 billeder afgør alt. CTA: annonce klar til copy-paste.

### E (outline): `/laer/trendsales-eller-vinted`
Sammenligning: gebyrer, målgruppe, mærkeniveau, sikkerhed. Høj købsintention, lav konkurrence.

## 3. robots.txt og sitemap

```
User-agent: *
Allow: /
Disallow: /konto
Disallow: /oversigt
Disallow: /kreditter
Disallow: /onboarding
Disallow: /intern/
Disallow: /items/

Sitemap: https://selja.dk/sitemap.xml
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://selja.dk/</loc><priority>1.0</priority></url>
  <url><loc>https://selja.dk/priser</loc><priority>0.9</priority></url>
  <url><loc>https://selja.dk/laer</loc><priority>0.8</priority></url>
  <url><loc>https://selja.dk/laer/saelg-toej-online</loc><priority>0.8</priority></url>
  <url><loc>https://selja.dk/laer/gode-billeder-vinted-trendsales</loc><priority>0.8</priority></url>
  <url><loc>https://selja.dk/laer/hvad-er-mit-toej-vaerd</loc><priority>0.8</priority></url>
  <url><loc>https://selja.dk/laer/vinted-tips</loc><priority>0.7</priority></url>
  <url><loc>https://selja.dk/laer/trendsales-eller-vinted</loc><priority>0.7</priority></url>
</urlset>
```

## 4. JSON-LD

**Forside:**
```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"SoftwareApplication","name":"Selja","operatingSystem":"Web","applicationCategory":"BusinessApplication","description":"Selja laver professionelle produktbilleder, annoncetekst og prisforslag til dit brugte tøj — klar til Vinted, Trendsales og DBA.","url":"https://selja.dk","offers":{"@type":"Offer","priceCurrency":"DKK"}}
</script>
```

**Guide-sider (FAQPage, eksempel side A):**
```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
{"@type":"Question","name":"Hvad sælger bedst brugt?","acceptedAnswer":{"@type":"Answer","text":"Mærkevarer, klassikere i neutrale farver, overtøj og sko i god stand. Jakker sælges bedst aug-okt, sommertøj mar-maj."}},
{"@type":"Question","name":"Er det gratis at sælge på Vinted?","acceptedAnswer":{"@type":"Answer","text":"Ja, Vinted tager ikke salær fra sælgeren — køberen betaler et beskyttelsesgebyr."}},
{"@type":"Question","name":"Hvor lang tid tager det at sælge et stykke tøj?","acceptedAnswer":{"@type":"Answer","text":"Med gode billeder og realistisk pris typisk dage til få uger."}}]}
</script>
```

## 5. Teknisk tjekliste

1. **Google Search Console** — tilføj selja.dk, indsend sitemap. Viser hvilke søgeord der giver klik (5 Google-besøg i dag uden indsats!)
2. **Én kanonisk version** — 301-redirect www.selja.dk og selja.netlify.app til selja.dk
3. `lang="da"` på html-tagget
4. **OG-billede** — før/efter produktfoto som og:image
5. **Alt-tekster** på alle billeder
6. **Mobilhastighed** — 61 % af trafikken er mobil; kør PageSpeed Insights
7. **Intern linking** — guides linker til hinanden + /priser

## 6. Rækkefølge

Uge 1: Meta + robots + sitemap + Search Console (2 timer). Uge 2: Side A+B. Uge 3: Side C + JSON-LD. Uge 4: D+E + skriv næste guide ud fra Search Console-data. SEO virker efter 4-12 uger — og bliver ved med at levere brugere som Caroline.
