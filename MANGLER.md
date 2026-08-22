# MANGLER — hvad der står tilbage

Sidst opdateret: 2026-08-22. **Selja er LIVE på https://selja.dk** med
betaling, mails, billedpipeline og admin i drift. Denne liste er hvad der
mangler — ikke hvad der er lavet (se `SELJA.md` for produktet).

---

## GØR DETTE FØR DU LUKKER RIGTIGE BRUGERE IND

1. **Kør Gate 1-troskabstesten** (S12) — den er ALDRIG kørt:
   `npx tsx scripts/gate1-fidelity-test.ts <mappe med ~20 egne tøjfotos> --live`
   Mål: troskab ≥ 70 % for mindst ét preset. Visualiseringen dumpede
   kvalitetstjekket i vores ene produktions-E2E, så tærsklen
   (`pipeline.troskabsTaerskel`) skal kalibreres efter et rigtigt resultat.
2. **Verificér abonnements-fornyelse** ved næste faktura (~21/9): kreditsiden
   skal vise ny kvote. Webhook-fixet er testet, men fornyelsen er første
   naturlige gentagelse.
3. **Rotér nøgler der har været i chat**: Google OAuth client secret,
   TRIGGER_SECRET_KEY, RESEND_API_KEY, Stripe webhook-secret,
   testkonto-passwords.
3b. **Læg nulstillings-mailens skabelon om til token_hash** (22/8: "glemt
   adgangskode virker ikke") — følg `docs/supabase-mail-skabeloner.md`.
   Koden tager nu begge link-former, men på tværs af browsere (Gmail-appens
   indbyggede browser!) virker kun token_hash-linket.

## SYNLIGHED (kræver dine logins)

4. **Google Search Console**: search.google.com/search-console → Add property
   → Domain → selja.dk → DNS TXT hos registraren → verificér → indsend
   `https://selja.dk/sitemap.xml`
5. **Bing Webmaster Tools**: importér fra GSC (nemmest)
6. **DMARC-record** hos registraren: TXT `_dmarc.selja.dk` =
   `v=DMARC1; p=none; rua=mailto:post@selja.dk`
7. Kør `npx tsx scripts/indexnow-ping.ts` efter nye offentlige sider

## DRIFT

8. **Trigger.dev-nøglens udløb**: oprettet med 90 dages udløb → dør
   **19/11-2026**, og så hænger ALLE annoncer. Sæt kalenderpåmindelse eller
   opret en permanent nøgle.
9. **Resend-kontoen** ligger på krausesigne@gmail.com — flyt/dokumentér ejerskab
10. **Modtage-mail på post@selja.dk**: opsæt postkasse/videresendelse, og skift
    derefter `kontakt.email` i `lib/config.ts` fra gmail til post@selja.dk
11. **Momsregistrering**: Stripe opkræver med `automatic_tax` — tjek med
    revisor at CVR/momsforhold er på plads
12. **GDPR P1+P2** fra `docs/gdpr-audit-2026-08-16.md`: databehandleraftaler +
    verifikation af tredjelandsoverførsler pr. leverandør

## OMSÆTNING — venter på din beslutning

13. **Win-back ved opsigelse.** `customer.subscription.deleted` udløser intet.
    Forslag: én ærlig mail ("din kvote gælder perioden ud — dine kreditter
    bortfalder ikke").
14. **Social proof fra rigtige brugere.** Bevidst fravalgt indtil nu (ingen
    fabrikeret proof). Nu hvor der ER brugere: bed de første om lov til at
    citere dem. Billigste konverterings-løftestang der findes.
15. **Favorit-overvågning** er lovet i Pro-copy men ikke bygget (S35) — byg
    den, eller fjern løftet fra `lib/copy/da.ts`.

## FUNKTIONER DER MANGLER

16. **Skift adgangskode** for en bruger der ER logget ind (glemt-flowet virker,
    men der er ingen selvbetjent ændring på Konto).
17. **Notifikation ved ny klage** — de afgøres manuelt i admin, men ingen får
    besked når en lander.
18. **Rate limiting er kun sat på de mest udsatte ruter** (kontakt, besøg).
    `lib/sikkerhed/ratelimit.ts` er klar til at blive sat på flere — fx
    upload-signering og item-oprettelse, hvis misbrug bliver et problem.
