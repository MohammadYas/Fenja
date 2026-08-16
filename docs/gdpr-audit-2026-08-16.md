# GDPR-audit · Selja · 2026-08-16

Spørgsmålet fra ejeren: **"Kan Datatilsynet komme efter mig?"**

Kort svar: **Lav-til-moderat risiko.** Kernen er sund (privacy-by-design:
EU-database, RLS, ingen modeltræning på brugerdata, selvbetjent sletning,
minimal datamængde, ingen tracking-cookies). De reelle udeståender er
**dokumentation** (databehandleraftaler, fortegnelse) og **verifikation af
tredjelandsoverførsler** — typiske småvirksomheds-huller, som Datatilsynet
normalt møder med vejledning/påbud frem for bøde, medmindre der sker et brud,
eller nogen klager. Punkterne herunder lukker hullerne.

Denne session har allerede rettet: dataansvarlig + kontakt i politikken,
retsgrundlag pr. formål, opbevaringsfrister (bogføringslov vs. 24-timers-slet
— løftet var før juridisk umuligt at holde), tredjelands-afsnit, cookie-afsnit,
abonnementsvilkår (fortrydelsesret, fornyelse, prisvarsel, nem opsigelse via
Stripe-portal) og kontosletning, der nu også opsiger aktive abonnementer.

## 1. Det, der er i orden (behold det sådan)

| Område | Status |
|---|---|
| Datalokation | Supabase eu-west-1 (EU); privat bucket, signerede links |
| Adgangskontrol | RLS på alle tabeller; service-nøgle kun server-side |
| Dataminimering | E-mail, billeder, annoncedata, ledger — ikke mere |
| Ingen træning/deling | Billeder bruges kun til brugerens egen leverance |
| Sletning | Selvbetjent under Konto; storage + cascade inden 24 t; opsiger nu også abonnement |
| Cookies | Kun nødvendig login-session → ingen banner-pligt (cookiebekendtgørelsens undtagelse) |
| Politikker | Opdateret 16/8: dataansvarlig, retsgrundlag, frister, tredjelande, rettigheder, klageadgang |
| Betaling | Stripe håndterer kort; vi ser aldrig kortnumre; kvittering fra Stripe |
| 18+-gate | Aktivt tilvalg ved signup (age_confirmed) — ikke en børnetjeneste |

## 2. Skal lukkes (prioriteret)

### P1 — Databehandleraftaler (GDPR art. 28)
Der skal foreligge/accepteres DPA'er med: **Supabase, Stripe, Resend, Netlify,
Google (Gemini), fal.ai, Anthropic, Trigger.dev**. De store har standard-DPA'er,
der accepteres i dashboardet eller gælder via deres vilkår — men det skal
**dokumenteres** (gem PDF/link + dato i docs/databehandlere.md). Uden dem er
det den nemmeste ting for Datatilsynet at påtale.

### P2 — Tredjelandsoverførsler (art. 44-49)
Politikken siger nu DPF/SCC — det skal **verificeres** pr. leverandør:
- Google & Anthropic & Stripe: DPF-certificerede (tjek dpf.gov-listen, notér dato).
- fal.ai: tjek deres DPA/SCC-status — **er den uklar, så lad Gemini være
  primær provider og fal kun failover, eller kræv SCC**.
- Resend: amerikansk — tjek DPF/SCC.
Notér konklusionerne i samme docs-fil.

### P3 — Fortegnelse over behandlingsaktiviteter (art. 30)
Selv små virksomheder skal have den, når behandlingen ikke er lejlighedsvis.
En side er nok: formål, kategorier, modtagere, frister, sikkerhed. Skabelon
ligger hos Datatilsynet. (30 min. arbejde — gør det før lancering.)

### P4 — Brud-beredskab (art. 33: 72 timer)
Skriv 10 linjer i docs/: hvem opdager (Supabase-alerts/logs), hvem beslutter,
hvordan anmeldes til Datatilsynet inden 72 timer, hvornår berørte varsles.

### P5 — Slet-flowets praksis skal matche løftet
Kontosletning rydder storage + DB via cascade — **verificér efter S12/Gate 1**,
at genererings-logs og Trigger.dev-runs ikke holder person-data længere end
politikken siger (tekniske logs er dækket af litra f, men billeder må ikke
ligge i job-payloads).

## 3. Nabolove (ikke Datatilsynet, men reel risiko)

- **AI-mærkning (AI-forordningen art. 50 + markedsføringsloven):** Synlig
  mærkat på forsidens genererede billeder er midlertidigt fjernet (ejerordre).
  App-leverancen mærker stadig synligt + EXIF (C-4) — det er den vigtige del.
  Men marketing-billeder uden mærkning er **Forbrugerombudsmandens** bord
  (vildledning). Ejerens "sleek løsning inden Gate 4" skal leveres FØR launch.
- **Forbrugeraftaleloven (abonnement):** Nu dækket — 14 dages fortrydelse,
  automatisk fornyelse oplyst, opsigelse lige så let som tilmelding
  (Stripe-portalknap), 30 dages prisvarsel. Behold det.
- **Bogføringsloven:** 5 års bilag — nu afstemt i vilkår/politik; Stripe +
  regnskab er arkivet.
- **Autoconfirm-signup (ingen mailverifikation, ejerordre):** ingen
  GDPR-blocker, men en forkert indtastet e-mail kan koble en fremmed adresse
  til en konto. Lav risiko nu (alt koster penge); genovervej ved skala.

## 4. Konklusion

Ingen akut ulovlighed i produktet som det står; klage- og bødescenarier er
usandsynlige, hvis P1-P4 dokumenteres (en eftermiddags arbejde) og
AI-mærkningen leveres før udgivelse. Størst reel eksponering lige nu:
manglende DPA-/overførselsdokumentation (P1+P2) og marketing-billeder uden
mærkning (nabolov). Denne fil er compliance-loggen — opdatér den, når
punkterne lukkes.
