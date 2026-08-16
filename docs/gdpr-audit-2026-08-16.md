# GDPR-audit · Selja · 2026-08-16

Spørgsmålet fra ejeren: **"Kan Datatilsynet komme efter mig?"**

Kort svar: **Lav risiko — og lavere efter denne runde.** Kernen er sund
(privacy-by-design: EU-database, RLS, ingen modeltræning på brugerdata,
selvbetjent sletning, minimal datamængde, ingen tracking-cookies). De reelle
udeståender er nu **papir, ikke kode**: databehandleraftaler og verifikation af
tredjelandsoverførsler. Det er typiske småvirksomheds-huller, som Datatilsynet
normalt møder med vejledning eller påbud frem for bøde — medmindre der sker et
brud, eller nogen klager.

Filen er compliance-loggen. Opdatér den, når et punkt lukkes.

## Runde 1 (16/8, dokument-runden)

Rettet: dataansvarlig + kontakt i politikken, retsgrundlag pr. formål,
opbevaringsfrister (bogføringslov vs. 24-timers-slet — løftet var før juridisk
umuligt at holde), tredjelands-afsnit, cookie-afsnit, abonnementsvilkår
(fortrydelsesret, fornyelse, prisvarsel, nem opsigelse via Stripe-portal) og
kontosletning, der nu også opsiger aktive abonnementer.

## Runde 2 (16/8 aften, kode-runden)

Denne runde gik gennem **koden** i stedet for teksterne: hvem sender vi hvad
til, hvad gemmer vi, hvad sker der faktisk ved sletning, og passer politikken
på virkeligheden.

### Fundet og rettet

1. **Sletningen holdt ikke sit eget løfte** (art. 17, alvorligst).
   `storage.list()` henter 100 rækker ad gangen, og slette-ruten listede uden
   paginering. En sælger med over 100 annoncer ville få billeder efterladt i
   bucket'en efter en "fuld sletning inden 24 timer" — præcis den slags
   uoverensstemmelse mellem løfte og praksis, der gør en klage farlig.
   Rettet i `lib/konto/slet.ts` (paginering + sletning i portioner, 5 tests).
   Samtidig: fejler storage-oprydningen, slettes auth-brugeren **ikke** længere
   først — ellers ville billederne blive forældreløse uden nogen til at rydde op.
2. **Ingen selvbetjent indsigt eller dataportabilitet** (art. 15 og 20).
   Politikken lovede rettighederne, men der var kun "skriv til os". Nu ligger
   der et udtræk under Konto → `/api/konto/eksport`: JSON med konto, alle
   annoncer (inkl. fejlbeskrivelse, prisforslag, genereringer) og hele
   kredithistorikken, plus midlertidigt signerede billedlinks. Filen forklarer
   sig selv (art. 12) og nævner, at bilag holdes 5 år hos Stripe.
   Interne omkostningstal er bevidst holdt ude; links er ikke permanente,
   så den private bucket forbliver privat.
3. **Politikken navngav ikke alle modtagere** (art. 13). Netlify (hosting),
   Trigger.dev (jobkørsel) og Anthropic (tekstmodel) manglede. Nu står alle
   otte med formål — og hvad de hver især faktisk får at se.

### Verificeret i koden (ingen ændring nødvendig)

| Påstand | Hvor det blev tjekket |
|---|---|
| Ingen tracking, ingen tredjeparts-scripts, ingen fremmede fonte | `app/layout.tsx`, `app/fonts.ts` (self-hostet), `middleware.ts` — kun Supabase' session-cookie |
| Job-payloads indeholder ingen persondata | `trigger/item-pipeline.ts`: kun `{ itemId, presetId }` |
| Ingen persondata i logs | Ét `console.error` i hele app- og lib-koden, uden persondata |
| Uploads kan ikke lægges i en andens mappe | `app/api/upload-signering/route.ts` låser stien til `user.id`; `api/items` afviser fremmede stier |
| Item-ruterne kører som brugeren (RLS er den reelle adgangskontrol) | `solgt`, `delebillede`, `status`, `regenerer` |
| Admin-siden lækker ikke e-mails | `app/(app)/admin/page.tsx` viser bruger-id'er, ikke adresser, og er låst til `ADMIN_EMAIL` |
| Kortdata røres aldrig | Stripe Checkout + webhook med signaturkontrol |
| Prompter til modellerne indeholder ingen personoplysninger om sælgeren | `lib/pipeline/skabeloner.ts` (anonyme personankre, aldrig genkendelige personer) |

## Skal stadig lukkes (papir, ikke kode)

### P1 — Databehandleraftaler (art. 28)
Skabelonen ligger nu i **`docs/databehandlere.md`** med alle otte leverandører.
Ejeren skal acceptere/hente hver DPA og skrive dato + link ind. Uden dem er
det den nemmeste ting for Datatilsynet at påtale.

### P2 — Tredjelandsoverførsler (art. 44-49)
Samme fil, egen kolonne. Verificér pr. leverandør på dpf.gov (eller kræv SCC).
**fal.ai er den usikre** — er grundlaget uklart, så hold Gemini som primær
provider og fal som ren failover, eller drop fal.

### P3 — Fortegnelse over behandlingsaktiviteter (art. 30)
**Skrevet: `docs/fortegnelse-art30.md`** — fem aktiviteter, udfyldt ud fra
koden. Mangler kun juridisk navn, adresse og CVR.

### P4 — Brud-beredskab (art. 33-34)
**Skrevet: `docs/brud-beredskab.md`** — hvad tæller som brud, hvordan det
opdages, syv trin inden for 72 timer, kontakter.

### P5 — Praksis efter Gate 1
Når rigtige providers kører (S12), så verificér at genererings-logs og
Trigger.dev-runs ikke holder persondata længere end politikken siger. Payloads
er allerede rene; det er leverandørernes egne logfrister, der skal tjekkes.

## Nabolove (ikke Datatilsynet, men reel risiko)

- **AI-mærkning (AI-forordningen art. 50 + markedsføringsloven):** synlig
  mærkat på forsidens genererede billeder er midlertidigt fjernet (ejerordre).
  App-leverancen mærker stadig synligt + EXIF (C-4) — det er den vigtige del.
  Marketing-billeder uden mærkning er **Forbrugerombudsmandens** bord.
  "Sleek løsning" skal leveres FØR launch.
- **Forbrugeraftaleloven (abonnement):** dækket — 14 dages fortrydelse,
  automatisk fornyelse oplyst, opsigelse lige så let som tilmelding, 30 dages
  prisvarsel.
- **Bogføringsloven:** 5 års bilag — afstemt i vilkår, politik og dataudtræk.
- **Autoconfirm-signup (ejerordre, ingen mailverifikation):** en forkert
  indtastet e-mail kan koble en fremmed adresse til en konto, som så modtager
  servicemails. Ingen GDPR-blocker, lav risiko nu — genovervej ved skala.

## Konklusion

Ingen akut ulovlighed. Efter denne runde er der ikke længere afstand mellem
det, politikken lover, og det koden gør — det var den eneste reelle
eksponering. Tilbage står papirarbejdet (P1+P2, en eftermiddag med
dashboards) og AI-mærkningen på marketing-billederne før udgivelse.
