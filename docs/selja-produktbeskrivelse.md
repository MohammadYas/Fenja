# Selja — hvad produktet er og hvad det gør

**Formål med dette dokument:** samlet, faktuel beskrivelse af Selja, skrevet så
den kan gives direkte til en chatbot som videngrundlag. Alle tal og regler er
læst ud af koden 27. august 2026 — ikke gengivet fra hukommelsen. Ændrer priser
eller regler sig i `lib/config.ts`, skal dette dokument opdateres.

---

## 1. Kort fortalt

Selja er et dansk værktøj, der laver færdige salgsannoncer til brugt tøj ud fra
almindelige telefonbilleder. Brugeren tager billeder af et stykke tøj, udfylder
nogle få felter, og Selja leverer rensede produktfotos, en stylet visualisering
af tøjet, en færdigskrevet annoncetekst med søgeord og et konkret prisforslag —
klar til at sætte ind på Vinted eller en anden genbrugsplatform.

Det er bygget til privatpersoner, der har tøj liggende, de gerne vil sælge, men
som falder fra, fordi det tager for lang tid at fotografere ordentligt, skrive
en god tekst og finde den rigtige pris.

Selja er en webapp (ikke en app i App Store). Den ligger på **selja.dk** og
virker i telefonens browser.

---

## 2. Hvem det er til

**Primær bruger:** privatperson, typisk kvinde, der sælger tøj på Vinted. Har en
telefon, ikke et kamera. Har ikke et hvidt studie eller et pænt værelse at
fotografere i. Vil gerne have flere penge for tøjet, men gider ikke bruge en
halv time pr. stykke.

**Den konkrete bremse Selja fjerner:** et dårligt billede taget på en rodet seng
i dårligt lys sælger dårligere end et pænt billede — men de fleste har ikke
mulighed for at tage det pæne billede. Selja laver det pæne billede ud fra det
dårlige.

**Ikke til:** professionelle butikker med eget studie, engroshandel, eller
platforme der forbyder redigerede produktbilleder.

---

## 3. Hvad brugeren konkret får pr. annonce

Når en annonce er færdig, ligger der:

1. **Rensede produktfotos** — brugerens egne billeder med baggrunden fjernet og
   lyset rettet, så tøjet står rent frem. Det er disse, der anbefales som
   billede 1 på Vinted, fordi de viser den faktiske vare.
2. **En stylet visualisering** — tøjet vist i et pænt hjemmemiljø i en af fire
   stilarter (se afsnit 6). Det er et genereret billede, tænkt som supplement,
   ikke som erstatning for det ægte foto.
3. **En annoncetitel** — kort og søgbar.
4. **En annoncebeskrivelse** — færdigskrevet salgstekst.
5. **Søgeord** — de ord køberne faktisk søger på.
6. **Et prisinterval i kroner** med en begrundelse for, hvorfor prisen ligger
   der.

Billedfilerne leveres som JPEG i et format, der passer til Vinteds visning.

---

## 4. Sådan foregår det, trin for trin

1. Brugeren opretter et nyt item og uploader 2–4 billeder fra telefonen.
2. Brugeren udfylder mærke, størrelse, stand, varetype og eventuelle fejl eller
   mangler ved tøjet.
3. Brugeren vælger, hvilke billedstilarter der ønskes.
4. Selja kører sin pipeline: rensning af fotos → visualisering og annoncetekst
   (parallelt) → levering.
5. Der trækkes 1 kredit, når annoncen er leveret.
6. Brugeren finder annoncen på sin oversigt og kan kopiere teksten og hente
   billederne.

Typisk tager en annonce et par minutter. Fejler visualiseringen, leveres
annoncen alligevel med det, der lykkedes — og kreditten refunderes automatisk
for den del, der ikke kom. Man betaler aldrig for noget, man ikke fik.

---

## 5. Den gratis prøve uden konto

På **selja.dk/prov** kan man prøve Selja uden at oprette en konto og uden at
opgive et betalingskort.

- Man uploader **ét** billede af ét stykke tøj.
- Man får et flat-lay-produktbillede tilbage, en annoncetekst og et fuldt
  prisforslag.
- Billedet er i reduceret opløsning (maks 1024 px) og bærer et selja.dk-vandmærke.
- Af annoncebeskrivelsen vises kun de første ca. 60 %. De sidste 40 % forlader
  aldrig serveren — de er ikke sløret i browseren, de er simpelthen ikke sendt.
- Prisforslaget vises derimod **fuldt ud**. Det er den vigtigste oplysning, og
  den holdes ikke tilbage.
- Opretter man derefter en konto, bliver resultatet automatisk lagt ind på
  kontoen som en færdig annonce — med det rene billede uden vandmærke og hele
  teksten. Det koster ingen kreditter, fordi prøven allerede er betalt.

Prøven er begrænset til én gennemført prøve pr. IP-adresse pr. 7 dage, og der
er et dagligt budgetloft. En prøve, der fejler, låser ikke — man har et ærligt
forsøg mere.

---

## 6. De fire billedstilarter

| Stilart | Hvad det er |
|---|---|
| **Spejlbillede** | Tøjet vist båret foran et spejl. Ansigtet er **altid** skjult. |
| **På gulvet** | Tøjet lagt pænt frem på gulv eller seng, set lige oppefra (flat-lay). |
| **På bøjle** | Tøjet hængt op på en bøjle mod en rolig baggrund. |
| **Nærbillede** | Tæt på stof og detaljer: syninger, knapper, print. |

Den gratis prøve bruger altid "På gulvet". De øvrige tre kræver en konto.

Ved spejlbilleder kan brugeren angive køn og hårfarve, så modellen ligner
brugeren selv i stedet for en tilfældig person.

---

## 7. Hvilke varer Selja understøtter

Varerne er delt i fem grupper:

**Tøj:** toppe og T-shirts · skjorter og bluser · strik og cardigans ·
sweatshirts og hoodies · bukser og jeans · shorts · nederdele · kjoler og
heldragter · jakker, blazere og veste · frakker og overtøj · sportstøj ·
badetøj · undertøj og nattøj

**Sko:** sneakers · sko · støvler · sandaler

**Tasker:** hånd- og skuldertasker · rygsække · andre tasker

**Accessories:** bælter, tørklæder og hovedbeklædning · smykker, ure og
solbriller · andre accessories

**Børn og baby:** tøj · overtøj · sko · accessories

Vælger man en varetype, Selja ikke har en skabelon til, afvises jobbet **før**
der bruges penge, og brugeren bliver bedt om at vælge en anden kategori. Det er
med vilje: en generisk skabelon gav dårlige resultater og blev fjernet.

---

## 8. Priser

### Kreditter

**1 kredit = 1 færdig annonce.** Der følger ingen gratis kreditter med, når man
opretter en konto — alle annoncer kræver købte kreditter. Kreditter gælder
**12 måneder** fra købsdatoen.

At regenerere en enkelt del af en annonce (et nyt billede eller en ny tekst)
koster **½ kredit**.

### Kreditpakker (engangskøb, intet abonnement)

| Pakke | Antal annoncer | Pris | Pr. annonce |
|---|---|---|---|
| Prøv | 5 | 49 kr | 9,80 kr |
| Sælger *(anbefalet)* | 15 | 89 kr | 5,93 kr |
| Bunke | 40 | 169 kr | 4,23 kr |
| Lager | 100 | 349 kr | 3,49 kr |

Derudover findes en **top-up på 10 annoncer for 69 kr**. Den vises kun for
indloggede brugere på kreditsiden, når saldoen er ved at være brugt op — aldrig
på den offentlige prisside.

### Abonnementer

| Abonnement | Annoncer pr. måned | Pr. måned | Pr. år |
|---|---|---|---|
| Plus | 12 | 59 kr | 590 kr |
| Pro | 30 | 119 kr | 1.190 kr |

Årsprisen svarer til ti måneder — man får to måneder gratis ved at betale for
et år.

Månedskvoten bruges før købte kreditter. Ubrugt kvote følger med til næste
måned, men den samlede abonnementssaldo kan højst blive det dobbelte af
månedskvoten, så kvoten ikke bliver en ubegrænset opsparing.

Betaling håndteres af Stripe.

---

## 9. Ekstra funktioner for abonnenter

**Smart Salgsplan.** En automatisk beregnet liste over, hvad brugeren konkret
bør gøre nu med sine annoncer. Den bygger på tre ting, brugeren allerede har:
sine egne annoncer, en sæsontabel pr. kategori, og indsamlede markedspriser.
Reglerne er bevidst enkle, så rådet altid kan forklares:

- En aktiv annonce, der har ligget i 14 dage eller mere og ligger over markedets
  median → **"Sæt prisen ned"**, med et konkret tal.
- En aktiv annonce i højsæson for sin kategori → **"Sælg nu"**.
- En aktiv annonce, hvor sæsonen er 1–2 måneder væk → **"Klargør"**.
- Resten → **"Vent"**, med angivelse af den bedste måned.
- Kladder tæt på sæsonen → **"Klargør"**.

Abonnenter får planen på mail hver mandag morgen.

**Garderobe-radar.** En løbende liste over hvilke mærker og kategorier der er
mest værd lige nu, vægtet efter sæsonen — vist direkte på oversigten.

**Guides.** Artikler om prissætning, fototeknik og salg, tilgængelige på
selja.dk/laer.

---

## 10. Hvad Selja ikke gør

Vær ærlig om grænserne — det er vigtigt for en chatbot ikke at love for meget:

- Selja **sælger ikke** tøjet for brugeren og lægger det ikke op på Vinted
  automatisk. Brugeren kopierer selv annoncen derover.
- Selja **håndterer ikke** forsendelse, betaling mellem køber og sælger, eller
  kommunikation med købere.
- Den stylede visualisering er et **genereret** billede. Det viser, hvordan
  tøjet kan tage sig ud — det er ikke et foto af den faktiske vare i brug.
  Derfor anbefales det rensede, ægte foto altid som billede 1.
- Ansigter vises aldrig på spejlbilleder.
- Selja garanterer ikke en salgspris. Prisforslaget er et interval baseret på
  markedsdata og en begrundelse, ikke et løfte.
- Der findes ikke et gratis niveau med løbende gratis annoncer. Den gratis
  prøve er ét enkelt forsøg uden konto.

---

## 11. Privatliv og data

- Brugerens billeder ligger i privat lagring og deles ikke offentligt.
- Den gratis prøves fotos slettes automatisk efter 7 dage.
- Besøgsstatistikken er **cookieløs**: der gemmes hverken cookies, browserlager
  eller IP-adresser. Unikke besøgende tælles med en hash, der skiftes ved
  midnat, så den samme person ikke kan følges fra dag til dag.
- Ved den gratis prøve gemmes IP-adressen aldrig i klartekst — kun en forkortet
  hash, nok til at tælle, umulig at vende tilbage.
- Login sker med e-mail og adgangskode.
- Der ligger en GDPR-audit, en fortegnelse efter artikel 30, en liste over
  databehandlere og et brud-beredskab i `docs/`.

**Om AI-mærkning:** billedfilerne bærer hverken synligt badge eller Seljas egen
metadata. Mærkningen står i brugerfladen i stedet. Bemærk at billeder genereret
via Google fortsat kan bære Googles egen C2PA-signatur i filen.

---

## 12. Teknisk, kort

Kun relevant hvis chatbotten bliver spurgt om det tekniske:

- Webapp bygget i Next.js, hostet på Netlify.
- Database, login og fillagring i Supabase (PostgreSQL).
- Betaling via Stripe.
- Transaktionsmails via Resend.
- Tunge billedjobs kører som baggrundsjobs.
- Billedgenerering sker gennem udskiftelige udbydere; hvilken model der bruges,
  vælges i administrationen uden at koden skal ændres.
- Der er et dagligt budgetloft på API-forbrug: rammes det, sættes nye annoncer
  på pause i stedet for at brænde penge.

---

## 13. Svar på almindelige spørgsmål

**"Er billederne rigtige?"**
De rensede produktfotos er brugerens egne billeder med baggrunden fjernet — det
er den ægte vare. Den stylede visualisering er genereret og viser, hvordan tøjet
kan tage sig ud. Brug altid det rensede foto som billede 1.

**"Koster det noget at prøve?"**
Nej. På selja.dk/prov får man ét gratis resultat uden konto og uden
betalingskort.

**"Hvad koster det så?"**
Fra 49 kr for 5 annoncer. Den anbefalede pakke er 15 annoncer for 89 kr. Sælger
man fast, er et abonnement billigere: Plus giver 12 annoncer om måneden for
59 kr.

**"Hvor lang tid tager en annonce?"**
Et par minutter fra upload til færdig annonce.

**"Hvad hvis resultatet er dårligt?"**
En enkelt del kan regenereres for en halv kredit. Fejler noget i leveringen,
refunderes kreditten automatisk — man betaler aldrig for noget, man ikke fik.

**"Kan jeg bruge det til sko og tasker?"**
Ja. Sko, tasker, accessories og børnetøj er understøttet ud over almindeligt tøj.

**"Bliver mit ansigt vist?"**
Nej. Ansigtet er altid skjult på spejlbilleder.

**"Udløber mine kreditter?"**
Ja, 12 måneder efter købsdatoen.

**"Lægger Selja annoncen op på Vinted for mig?"**
Nej. Selja laver annoncen færdig — du kopierer den selv over på Vinted.

---

*Sidst opdateret 27. august 2026. Tal og regler er læst ud af `lib/config.ts`,
`lib/data/varetyper.ts`, `lib/pipeline/visninger.ts` og `lib/trial/`. Ændres de
i koden, gælder koden — ikke dette dokument.*
