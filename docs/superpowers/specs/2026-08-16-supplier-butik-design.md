# Supplier-butik · designspecifikation

**Status:** Godkendt retning, skrevet 16. august 2026  
**Produkt:** Selja  
**Leverance:** Første selvstændige delprojekt i den samlede Selja-udvidelse

## 1. Formål

Selja får en indlogget supplier-butik, hvor brugere kan købe permanent adgang
til ét kurateret supplier-link ad gangen. Butikken bygges i den eksisterende
Next.js-app på `/suppliers`, så den genbruger Seljas login, Stripe-integration,
Supabase-database, mailsystem og adminadgang.

En tydelig indgang på `Oversigt` fører til supplier-butikken. Billedkreditter
forbliver et separat produkt og kan hverken bruges til supplier-køb eller
optjenes gennem dem.

Leverancen omfatter også det generelle kontaktflow, som supplier-supporten
afhænger af: en kontaktside under Konto, en indbakke i adminpanelet og svar,
der både gemmes i Selja og sendes til brugerens e-mail.

## 2. Bindende produktbeslutninger

1. Supplier-butikken bor i samme deployment og kodebase som Selja.
2. Kataloget er admin-kurateret; suppliers kan ikke selv oprette profiler.
3. Adgang købes enkeltvis og er permanent for den købende Selja-konto.
4. Betaling sker i DKK via Stripe Checkout som et engangskøb.
5. Supplier-køb og billedkreditter har separate tabeller, checkout-typer,
   kvitteringstekster og regnskabsspor.
6. Et købt link kan kun deaktiveres for en bruger efter en gennemført
   refundering eller dokumenteret betalingssvig. En generel deaktivering af
   supplieren sletter ikke købshistorikken.
7. Selja lover adgang til de beskrevne supplier-oplysninger, ikke lager,
   fortjeneste, levering, kvalitet eller accept hos supplieren.
8. Supplier-linket er personligt. Selja forsøger ikke at bygge DRM: en køber,
   som kan åbne et eksternt link, kan teknisk dele det videre. Systemet
   beskytter linket før køb og logger åbninger, men fremsætter ikke et falsk
   løfte om, at deling kan forhindres.
9. Der bygges ikke abonnement eller “køb alle”-pakke i denne leverance.
10. De kommende billedprompts, Gemini-ændringerne, Nyt item, mærkesøgning og
    reparationen af billedkreditternes reservationsflow hører til næste
    selvstændige delprojekt.

## 3. Brugeroplevelse

### 3.1 Indgang fra Oversigt

`/oversigt` viser altid et supplier-kort, både når brugeren har nul items, og
når item-listen er udfyldt. Kortet indeholder:

- overskriften `Find suppliers`;
- en kort dansk forklaring om, at links er undersøgt og sælges enkeltvis;
- CTA'en `Se suppliers`, der går til `/suppliers`;
- ingen opdigtede antal, rabatter eller indtjeningsløfter.

Kortet placeres efter sidens titel og før item-statistik/tomtilstand. Det bliver
ikke et femte punkt i bundnavigationen; Oversigt er den faste indgang.

### 3.2 Katalog

`/suppliers` kræver login og viser kun aktive suppliers. Hvert kort viser de
oplysninger, brugeren skal bruge for at vurdere købet uden at afsløre linket:

- navn;
- kort beskrivelse;
- produktkategori;
- supplierens land;
- om der sendes til Danmark;
- minimumsordre som læsbar tekst;
- senest manuelt verificeret dato;
- pris inklusive moms;
- tilstand: `Se detaljer`, `Købt` eller `Midlertidigt utilgængelig`.

Kataloget kan filtreres på kategori og land. Første version bruger almindelige
server-renderede filtre i query-parametre og tilføjer ikke en tung søgemotor.

### 3.3 Supplier-detalje før køb

`/suppliers/[slug]` viser den fulde redaktionelle beskrivelse, men aldrig den
hemmelige destination. Siden viser også:

- præcis hvad købet låser op;
- pris og at det er et engangskøb;
- senest verificeret dato;
- kendte krav som minimumsordre og leveringsområde;
- en fast note om, at Selja ikke garanterer lager, avance eller et fremtidigt
  samarbejde med supplieren.

En allerede berettiget bruger ser `Åbn supplier` i stedet for købsknappen.

### 3.4 Checkout og digital levering

Før Stripe Checkout skal brugeren aktivt markere en ikke-forudafkrydset boks:

> Jeg ønsker adgang med det samme og accepterer, at min 14 dages
> fortrydelsesret ophører, når supplier-linket låses op.

Købsknappen hedder `Køb adgang · {pris} kr.` og må først aktiveres efter dette
samtykke. Samtykkets version og tidspunkt gemmes på ordren. Ordrebekræftelsen
på e-mail gentager samtykket og produktets vigtigste oplysninger i et varigt
format. Dette følger de officielle krav til omgående digital levering; en
mangelfuld eller død leverance kan fortsat reklameres over.

Efter Stripe sender brugeren tilbage til supplier-detaljen med en ventetilstand.
Klienten kan kort genhente adgangsstatus, men viser ikke linket på baggrund af
retur-URL'en alene. Kun den signerede Stripe-webhook kan give adgang.

### 3.5 Supplier-detalje efter køb

En køber ser:

- `Åbn supplier`, som kalder en adgangskontrolleret redirect-route;
- købsdato og senest verificeret dato;
- de samme supplier-oplysninger som før købet;
- `Problem med linket`, der opretter en kontakthenvendelse med supplier- og
  ordre-kontekst.

Den eksterne URL indlejres ikke i React Server Component-data eller side-HTML.
Redirect-ruten kontrollerer session og adgang ved hvert klik, logger åbningen
og svarer derefter med en 303-redirect.

### 3.6 Kontakt under Konto

`/konto` får et kort med link til `/konto/kontakt`. Kontaktsiden viser brugerens
tidligere samtaler og en formular med emne, kategori og besked. En bruger kan
åbne en samtale og se både egne beskeder og adminsvar.

Kategorierne er `Supplier`, `Betaling`, `Generering` og `Konto`. Et supplier-
problem kan forudfylde supplier og ordre via interne id'er; brugeren kan ikke
indsende en anden brugers ordre-id.

### 3.7 Admin

Det eksisterende `/admin` bliver en lille adminforside med links til:

- `/admin/drift` for den nuværende omkostningsvisning;
- `/admin/suppliers` for katalog og køb;
- `/admin/henvendelser` for kontaktindbakken.

Alle adminruter bruger én fælles serverfunktion, der sammenligner den
autentificerede e-mail med `ADMIN_EMAIL` og returnerer 404 for alle andre.

Supplier-admin kan:

- oprette kladder;
- redigere alle teaser- og detaljefelter;
- gemme eller udskifte den hemmelige HTTPS-URL;
- sætte pris i hele DKK inklusive moms;
- markere en supplier som aktiv eller inaktiv;
- registrere en manuel verificeringsdato;
- se betalte ordrer og åbningstidspunkter;
- åbne en relateret kontaktsamtale;
- refundere en betalt supplier-ordre efter en særskilt bekræftelse.

Kontakt-admin kan filtrere `Åben`, `Besvaret` og `Lukket`, åbne hele tråden,
sende et svar, gensende en fejlet e-mail og lukke/genåbne tråden.

## 4. Arkitektur og ruter

### 4.1 Sider

- `app/(app)/suppliers/page.tsx` — katalog med server-side filtre.
- `app/(app)/suppliers/[slug]/page.tsx` — låst eller oplåst detalje.
- `app/(app)/konto/kontakt/page.tsx` — trådliste og ny henvendelse.
- `app/(app)/konto/kontakt/[id]/page.tsx` — samtale.
- `app/(app)/admin/page.tsx` — adminforside.
- `app/(app)/admin/drift/page.tsx` — eksisterende driftsside flyttet hertil.
- `app/(app)/admin/suppliers/page.tsx` — supplier-liste og redigering.
- `app/(app)/admin/suppliers/[id]/page.tsx` — detaljer, ordrer og refundering.
- `app/(app)/admin/henvendelser/page.tsx` — indbakke.
- `app/(app)/admin/henvendelser/[id]/page.tsx` — tråd og svar.

### 4.2 API-ruter

- `POST /api/suppliers/[id]/checkout` — opret/genbrug ordre og Stripe-session.
- `GET /api/suppliers/[id]/access` — lille statusrespons til returvisningen.
- `GET /api/suppliers/[id]/open` — adgangstjek, log og ekstern redirect.
- `POST /api/kontakt` — opret tråd eller tilføj brugerbesked.
- `POST /api/admin/henvendelser/[id]/svar` — gem og send adminsvar.
- `POST /api/admin/henvendelser/[id]/gensend` — gensend kun fejlet mail.
- `POST /api/admin/suppliers` og `PATCH /api/admin/suppliers/[id]` — CRUD.
- `POST /api/admin/supplier-orders/[id]/refund` — Stripe-refundering.

Den eksisterende Stripe-webhook udvides med en særskilt
`purchase_kind=supplier_access`. Den nuværende pakke-/top-up-/abonnementslogik
ændrer ikke semantik.

### 4.3 Domænemoduler

- `lib/suppliers/catalog.ts` — sikre katalogprojektioner og validering.
- `lib/suppliers/orders.ts` — ordre-, checkout-, adgangs- og refundlogik.
- `lib/suppliers/supabase.ts` — produktionsdatabaseadapter.
- `lib/suppliers/memory.ts` — testadapter med samme idempotensregler.
- `lib/contact/threads.ts` — domænelogik for samtaler og beskeder.
- `lib/contact/supabase.ts` — databaseadapter.
- `lib/admin/auth.ts` — fælles adminbeskyttelse.
- `emails/supplier-adgang.tsx` — ordrebekræftelse og samtykkekopi.
- `emails/kontakt-svar.tsx` — adminsvar med link til tråden.

Komponenter holdes små: supplier-kort, filter, checkout-knap/samtykke,
kontaktformular, adminformular og svarformular får hver sin fil.

## 5. Datamodel

Alle nye tabeller oprettes i én additiv Supabase-migration.

### 5.1 `suppliers`

- `id uuid primary key`
- `slug text unique not null`
- `name text not null`
- `summary text not null`
- `description text not null`
- `category text not null`
- `country_code text not null`
- `ships_to_denmark boolean not null`
- `minimum_order_text text not null`
- `price_dkk integer not null check (price_dkk > 0)`
- `status supplier_status not null` (`draft`, `active`, `inactive`)
- `verified_at timestamptz`
- `created_at`, `updated_at timestamptz`

Der seedes ingen opdigtede suppliers. Kataloget har en ærlig tomtilstand,
indtil admin har oprettet og aktiveret den første.

### 5.2 `supplier_secrets`

- `supplier_id uuid primary key references suppliers on delete cascade`
- `destination_url text not null`
- `updated_at timestamptz not null`

Tabellen har ingen klientlæsbar policy. URL'en valideres som `https:` ved
skrivning og læses kun med serviceklienten efter admin- eller adgangstjek.

### 5.3 `supplier_orders`

- `id uuid primary key`
- `user_id uuid not null`
- `supplier_id uuid not null`
- `status supplier_order_status not null` (`pending`, `paid`, `refunded`,
  `canceled`)
- `name_snapshot text not null`
- `price_dkk integer not null`
- `currency text not null default 'dkk'`
- `withdrawal_consent_version text not null`
- `withdrawal_consented_at timestamptz not null`
- `stripe_checkout_session_id text unique`
- `stripe_payment_intent_id text unique`
- `paid_event_id text unique`
- `refund_id text unique`
- `created_at`, `paid_at`, `refunded_at timestamptz`

En unik indeksregel sikrer højst én aktiv `pending`/`paid` ordre pr.
`user_id + supplier_id`. Prisen er et snapshot og ændres ikke, hvis admin
senere ændrer katalogprisen.

### 5.4 `supplier_access`

- `user_id uuid not null`
- `supplier_id uuid not null`
- `order_id uuid unique not null`
- `granted_at timestamptz not null`
- `revoked_at timestamptz`
- primærnøgle `(user_id, supplier_id)`

En aktiv adgang er en række uden `revoked_at`. En ny betaling efter en tidligere
refundering må reaktivere den samme adgangsrække, men kun gennem webhook-RPC'en.

### 5.5 `supplier_link_opens`

- `id bigint generated always as identity primary key`
- `user_id uuid not null`
- `supplier_id uuid not null`
- `opened_at timestamptz not null default now()`

Loggen indeholder ikke destinationen, IP-adresse eller user-agent.

### 5.6 `contact_threads` og `contact_messages`

En tråd indeholder `id`, `user_id`, kategori, emne, status, valgfri
`supplier_id`, valgfri `supplier_order_id` samt tidsstempler. En besked
indeholder `thread_id`, `sender_role` (`user`/`admin`), ren tekst,
`email_status` (`not_applicable`/`pending`/`sent`/`failed`), valgfrit
`email_provider_id` og tidsstempel.

Databasebegrænsninger sikrer, at en kontekstordre tilhører trådens bruger.

## 6. Adgang og RLS

- Autentificerede brugere kan læse aktive rækker i `suppliers`.
- Brugere kan læse egne ordrer, egne adgangsrækker, egne kontakttråde og egne
  kontaktbeskeder.
- Brugere kan ikke skrive ordrer, adgang, secrets eller adminbeskeder direkte.
- `supplier_secrets` er utilgængelig for `anon` og `authenticated`.
- Alle betalingstilstandsændringer sker gennem serviceklient/RPC efter
  serverside-kontrol.
- Adminsider må først oprette serviceklienten efter `ADMIN_EMAIL`-kontrollen.
- Server Components får kun eksplicitte sikre supplier-felter; der bruges
  aldrig `select('*')` på supplier-data.

## 7. Betalings- og adgangsflow

1. Checkout-ruten validerer session, supplierstatus og samtykke.
2. Har brugeren allerede adgang, returneres supplierens interne detalje-URL.
3. En transaktionel RPC opretter eller returnerer den samme ventende ordre for
   bruger + supplier.
4. Stripe Checkout oprettes med idempotency key `supplier-order:{orderId}` og
   metadata med ordre-id og `purchase_kind=supplier_access`.
5. Webhooken kræver `payment_status=paid`, slår ordren op og sammenligner
   bruger, supplier, valuta og beløb med snapshots. Metadata alene er aldrig
   autoritativ.
6. En transaktionel RPC markerer ordren betalt og giver adgang. Samme event,
   session eller ordre er et no-op ved gentagelse.
7. Ordrebekræftelsen sendes best-effort. Mailfejl må ikke fjerne adgang og kan
   ses/gensendes fra admin.
8. Ved refundering kalder adminruten Stripe med idempotency key
   `supplier-refund:{orderId}`. Lokal status og adgang ændres først, når Stripe
   har accepteret refunderingen. Gentagne klik er no-ops.

Denne model forhindrer dobbeltbetaling fra dobbeltklik, giver aldrig adgang fra
en manipuleret succes-URL og blander ikke supplier-køb ind i credit ledgeren.

## 8. Kontakt- og svarflow

En ny tråd kræver 1–120 tegn i emnet og 10–2.000 tegn i beskeden. En konto kan
oprette højst fem nye tråde pr. UTC-døgn og sende højst 20 brugerbeskeder pr.
døgn. Begrænsningen håndhæves på serveren.

Ved adminsvar sker rækkefølgen sådan:

1. Beskeden gemmes som `pending` i samme transaktion, der sætter tråden til
   `answered`.
2. HTML-mailen renderes med brugerindhold som escaped tekst.
3. Ved succes gemmes provider-id og `sent`; ved fejl gemmes `failed`.
4. API-ruten fortæller admin, hvis mailen fejlede, men den gemte besked
   forsvinder ikke. Admin kan gensende præcis den samme besked idempotent.

Brugeren kan altid læse svaret i Selja, selv hvis maillevering er nede.

## 9. Inaktive og mangelfulde suppliers

En inaktiv supplier forsvinder fra kataloget for ikke-købere. Eksisterende
købere ser den i deres købshistorik som `Midlertidigt utilgængelig`, men får
ikke redirectet til et kendt dødt eller usikkert link.

Admin kan enten:

- rette URL/oplysninger, sætte en ny verificeringsdato og genaktivere;
- besvare brugeren med en forklaring;
- refundere ordren, hvilket tilbagekalder adgangen efter accepteret refund.

Seljas vilkår og checkout-copy skal sige, at permanente køb giver permanent
kontoadgang til den vedligeholdte supplierpost, men at eksterne suppliers kan
ændre eller lukke deres websites. Mangelfuld levering håndteres fortsat efter
de gældende regler for digitalt indhold.

## 10. Prisvisning og tillid

Admin vælger prisen pr. supplier ud fra den konkrete research og værdi; appen
opfinder ikke én fælles standardpris før katalogindholdet findes. Alle priser:

- er hele DKK og vises inklusive moms;
- vises før checkout og på Stripe-siden;
- ledsages af det præcise indhold, senest verificeret dato og kendte krav;
- må ikke ledsages af “garanteret fortjeneste”, kunstig knaphed eller falske
  førpriser.

Supplier-salg skal evalueres efter refund-rate, support-rate og gentagne køb —
ikke kun omsætning. En høj support/refund-rate for en supplier er signal til at
deaktivere den.

## 11. Fejlhåndtering

- Ukendt/inaktiv supplier før køb: 404.
- Manglende samtykke: 400 med dansk feltfejl.
- Stripe ikke konfigureret: 503 uden at oprette betalt adgang.
- Afbrudt checkout: ordren forbliver ventende og kan genbruges; ingen adgang.
- Webhook med forkert beløb/valuta/kontekst: afvises og logges; ingen adgang.
- Betalt webhook gentaget: 200/no-op.
- Manglende secret på en ellers aktiv supplier: redirect blokeres, hændelsen
  logges, og brugeren får kontaktmulighed.
- Mailfejl: beskeden er stadig synlig i tråden og kan gensendes.
- Refundfejl hos Stripe: lokal ordre/adgang forbliver uændret.

## 12. Teststrategi

Implementeringen følger red–green–refactor. Domænelogikken testes mod memory-
adaptere; ruter og komponenter får målrettede tests.

Mindstekrav:

- kataloget afslører aldrig secret URL i låst HTML/data;
- kun aktive suppliers vises til ikke-købere;
- normal og tom Oversigt viser supplier-indgangen;
- samtykkeboksen er obligatorisk og ikke forudafkrydset;
- to samtidige checkout-forsøg genbruger samme ordre/session;
- manipuleret metadata, beløb eller valuta giver ingen adgang;
- webhook-retry giver præcis én ordre og én adgang;
- betalt bruger kan åbne redirect; anden bruger får 404;
- inaktiv supplier redirectes ikke, men købshistorikken bevares;
- refund er idempotent og tilbagekalder først efter Stripe-succes;
- brugere kan kun se egne ordrer og tråde;
- supplier-køb ændrer aldrig `credit_ledger`;
- adminsvar gemmes før mail, og mailfejl kan gensendes uden dobbelt besked;
- rate limits, længdegrænser og adminbeskyttelse håndhæves;
- migrationens RLS testes mod autentificeret bruger og serviceklient;
- fuld `npm test`, `npm run typecheck`, `npm run lint` og `npm run build` er
  grønne før leverancen kaldes færdig.

## 13. Udrulning

1. Kør migrationen i lokal/test-Supabase.
2. Deploy kode med supplier-kataloget tomt og adminruterne skjult for andre.
3. Opret første supplier som kladde, verificer link og checkout i Stripe
   testmode.
4. Kontrollér webhook-retry, kvittering, redirect, kontakt og refundering.
5. Aktivér supplieren manuelt.
6. Kør en rigtig lille betaling og refundering før flere suppliers oprettes.

Der udføres ingen automatisk produktion-migration, Stripe-produktændring eller
deploy fra implementeringsarbejdet; ejeren udfører disse trin efter test.

## 14. Acceptkriterier

Leverancen er færdig, når:

1. en indlogget bruger kan gå fra Oversigt til supplier-kataloget;
2. brugeren kan vurdere en supplier uden at få dens URL;
3. et betalt, webhook-bekræftet engangskøb giver permanent kontoadgang;
4. dobbeltklik, webhook-retries og manipulerede retur-URL'er ikke kan give
   dobbeltbetaling eller gratis adgang;
5. billedkreditsaldoen er uændret før og efter supplier-køb;
6. admin kan vedligeholde katalog, secret, status, ordrer og refunderinger;
7. brugeren kan kontakte Selja under Konto, og admin kan svare fra adminpanelet;
8. svaret både er synligt i Selja og forsøges sendt på e-mail;
9. en død supplier kan deaktiveres, rettes eller refunderes uden at skjule
   købshistorikken;
10. sikkerheds-, enheds-, type-, lint- og buildverifikationerne består.

## 15. Kilder til checkoutkrav

- Forbrug.dk, “Forbrugeraftaleloven”:
  https://forbrug.dk/regler/opslagsvaerk-forbrugerleksikon/forbrugeraftaleloven
- Forbrug.dk, “Køb af digitalt indhold”:
  https://forbrug.dk/emner/nethandel-og-digitale-tjenester/koeb-og-levering-af-digitalt-indhold
- EU Your Europe, distance- og digitalsalg:
  https://europa.eu/youreurope/business/selling-in-eu/selling-goods-services/ecommerce-distance-selling/index_en.htm

Kilderne bruges til produkt- og checkoutdesign og erstatter ikke konkret
juridisk rådgivning før lancering.
