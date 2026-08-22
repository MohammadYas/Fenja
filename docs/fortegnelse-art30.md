# Fortegnelse over behandlingsaktiviteter · Selja

GDPR art. 30. Kravet gælder også små virksomheder, når behandlingen ikke er
lejlighedsvis — og en tjeneste med konti og betaling er ikke lejlighedsvis.
Fortegnelsen skal kunne udleveres til Datatilsynet på forlangende.

Udfyldt ud fra koden 2026-08-16. **Ejeren skal sætte navn, adresse og CVR ind**
under "dataansvarlig", når virksomheden er registreret.

## Dataansvarlig

| Felt | Værdi |
|---|---|
| Navn | Selja — [ ] juridisk navn |
| Adresse | [ ] |
| CVR | [ ] |
| Kontakt om persondata | visual.studio.tuturials@gmail.com (skiftes til domænemail) |
| Databeskyttelsesrådgiver | Ikke påkrævet (ingen kerneaktivitet med systematisk overvågning i stor skala) |

## Behandlingsaktiviteter

### 1. Brugerkonto og login
- **Formål:** oprette og drive brugerens konto, holde sessionen i live.
- **Retsgrundlag:** art. 6, stk. 1, litra b (aftale).
- **Registrerede:** private sælgere, 18+.
- **Kategorier:** e-mail, hashet adgangskode, aldersbekræftelse, oprettelsestidspunkt, valgt hjem-anker.
- **Modtagere:** Supabase (EU), Netlify.
- **Sletning:** ved kontosletning, inden 24 timer (selvbetjent under Konto).
- **Sikkerhed:** RLS pr. bruger, adgangskoder hashet af Supabase Auth, session i cookie, HTTPS.

### 2. Annonceproduktion (billeder og tekst)
- **Formål:** rense fotos, lave visualisering og skrive annoncetekst til brugerens eget salg.
- **Retsgrundlag:** litra b (aftale).
- **Kategorier:** tøjfotos uploadet af brugeren (kan vise dele af brugerens hjem og krop), annoncedata (mærke, størrelse, stand, fejl, kategori, evt. købspris), genereret tekst og billede.
- **Modtagere:** Supabase (lager, EU), Google/fal.ai (billedmodel, USA), Anthropic (tekstmodel + troskabstjek, USA), Trigger.dev (kun annonce-id).
- **Sletning:** ved kontosletning, inden 24 timer; billeder fjernes fra privat bucket, rækker via cascade.
- **Bemærk:** ingen træning på brugerdata; genererede billeder er mærket synligt i UI'et (AI-forordningen art. 50). Leverede billedfiler bærer ingen metadata overhovedet — hverken egen mærkning, EXIF/XMP/IPTC/ICC eller leverandørens C2PA-provenance (ejer-beslutning 22/8, lib/pipeline/metadata.ts).

### 3. Kreditter, abonnement og betaling
- **Formål:** sælge og afregne kreditter og abonnementer.
- **Retsgrundlag:** litra b (aftale) og litra c (bogføringsloven) for bilag.
- **Kategorier:** e-mail, købs- og forbrugshistorik (ledger), abonnementsstatus, Stripe-referencer. Kortdata ser vi aldrig.
- **Modtagere:** Stripe, Supabase.
- **Sletning:** ledger slettes med kontoen; **bilag opbevares i 5 år** efter regnskabsårets udløb hos Stripe og i regnskabet.

### 4. Transaktionsmails
- **Formål:** velkomst, "annonce klar", kvitteringssupplement, kreditrefusion.
- **Retsgrundlag:** litra b (aftale) — servicebeskeder, ikke markedsføring.
- **Kategorier:** e-mail, annoncetitel, links.
- **Modtagere:** Resend.
- **Sletning:** følger kontoen; Resends egne logs efter deres frister.

### 5. Drift, fejlsøgning og omkostningsstyring
- **Formål:** holde tjenesten kørende, finde fejl, håndhæve dagligt budgetloft (misbrugsværn).
- **Retsgrundlag:** litra f (legitim interesse i en tjeneste, der virker og ikke misbruges).
- **Kategorier:** genereringslogs (type, status, tidspunkt, omkostning, promptversion) knyttet til annonce-id og dermed indirekte til bruger-id. Ingen billeder i logs.
- **Modtagere:** Supabase, Trigger.dev, Netlify.
- **Sletning:** følger annoncen og kontoen.

## Generelle sikkerhedsforanstaltninger (art. 32)

- Row level security på alle tabeller; service-nøglen forlader aldrig serveren.
- Privat billed-bucket; adgang kun via midlertidigt signerede links.
- Secrets kun i miljøvariabler, aldrig i repoet (`.env.example` er tom for værdier).
- Admin-siden er låst til én e-mail (`ADMIN_EMAIL`); alle andre får 404.
- Dagligt globalt budgetloft med kill-switch mod misbrug.
- Migrations gør skemaet reproducerbart; Supabase står for backup.

## Overførsler til tredjelande

Se `docs/databehandlere.md`. Grundlaget pr. leverandør skal verificeres og
dateres dér — det er fortegnelsens svageste punkt lige nu.
