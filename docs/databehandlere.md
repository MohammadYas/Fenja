# Databehandlere · Selja

Fortegnelse over databehandlere (GDPR art. 28) og overførselsgrundlag
(art. 44-49). Denne fil er **compliance-loggen** — den er ikke gyldig
dokumentation i sig selv: den bliver det, når ejeren har sat dato og link ind
på hver linje. Datatilsynet spørger efter præcis den slags oversigt, og den er
det billigste punkt at have på plads.

Sidst rørt: 2026-08-16 (kode-audit; alle verifikationsfelter står stadig åbne).

## Sådan udfyldes den

For hver leverandør: find deres DPA (kaldes ofte "Data Processing Addendum"),
accepter den i dashboardet eller download den underskrevne udgave, og skriv
**dato + link/filnavn** i tabellen. Gem PDF'erne ét sted (fx en mappe i
regnskabet) — de skal kunne fremvises, ikke findes forfra.

## Leverandører i drift

| Leverandør | Formål | Persondata de ser | Placering | DPA (dato/link) | Overførselsgrundlag |
|---|---|---|---|---|---|
| Supabase | Database, login, billedlager | E-mail, adgangskode (hashet), billeder, annoncedata, kredithistorik | EU (eu-west-1, Irland) | [ ] | EU — intet nødvendigt |
| Netlify | Hosting af selve siden | IP og request-metadata | USA/globalt CDN | [ ] | [ ] DPF eller SCC |
| Trigger.dev | Kører genereringsjobs | Kun annonce-id (verificeret i koden: `trigger/item-pipeline.ts`) | [ ] | [ ] | [ ] |
| Stripe | Betaling, abonnement, kvitteringer | E-mail, købshistorik, betalingsdata (vi ser aldrig kortnummer) | EU/USA | [ ] | [ ] DPF eller SCC |
| Resend | Transaktionsmails | E-mail, mailindhold | USA | [ ] | [ ] DPF eller SCC |
| Google (Gemini) | Billedmodel: rens + visualisering | Brugerens tøjfotos | USA | [ ] | [ ] DPF eller SCC |
| fal.ai | Billedmodel (failover) | Brugerens tøjfotos | USA | [ ] | [ ] — **afklar før live** |
| Anthropic (Claude) | Tekstmodel: annoncetekst, troskabstjek | Annoncedata + fotos til troskabstjek | USA | [ ] | [ ] DPF eller SCC |

## Det, koden faktisk sender (verificeret 2026-08-16)

- **Billedmodellerne** får billedbytes (Gemini: base64 inline, `lib/providers/gemini.ts`)
  og prompten. Prompten beskriver aldrig brugeren og indeholder ingen navne
  eller e-mails — kun tøjkategori, preset og hjem-anker.
- **Tekstmodellen** får mærke, størrelse, stand, kategori, fejlbeskrivelse,
  labeltekst og evt. købspris (`lib/pipeline/listing-text.ts`) — ingen e-mail.
- **Trigger.dev** får kun `{ itemId, presetId }` (og ved regenerering
  `requestId`). Ingen billeder, ingen e-mail i job-payloaden.
- **Resend** får modtagerens e-mail og mailens HTML (`lib/emails/send.ts`).
- **Stripe** får e-mail via checkout; webhooken læser kun kunde-id og beløb.
- **Netlify** ser almindelig trafikmetadata. Ingen analytics, ingen
  tredjeparts-scripts, ingen tracking-cookies (verificeret: kun Supabase'
  session-cookie sættes, `middleware.ts`).

## Underdatabehandlere

Alle otte har selv underdatabehandlere (fx cloududbydere). Deres lister ligger
offentligt; vi behøver ikke gengive dem, men privatlivspolitikken skal blive
ved med at nævne kategorierne, og et skift af leverandør skal føres ind her.

## Når en leverandør skiftes ud

1. Ny linje i tabellen med DPA og overførselsgrundlag, før første kald.
2. Ret navnet i privatlivspolitikken (`lib/copy/da.ts` → `privatliv`).
3. Notér datoen i `docs/gdpr-audit-2026-08-16.md`.
