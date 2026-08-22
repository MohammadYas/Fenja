# TESTPLAN — før TikTok-slides og rigtige brugere

Skrevet 2026-08-22. Alt herunder testes PÅ https://selja.dk i en almindelig
mobilbrowser (helst en telefon, der aldrig har været logget ind), for det er
sådan TikTok-trafikken kommer. Rækkefølgen er prioriteret: sektion A–C er
blokerende; D–G bør være grønne, før der sendes trafik; H er første uge.

Hurtigste vej: én komplet "ny bruger"-gennemspilning (B1 → C6) fanger 80 %
af alt. Brug et rigtigt kort og et rigtigt stykke tøj.

---

## A. Blokerende (kendte huller — fra MANGLER.md)

- [ ] **A1. Gate 1-troskabstesten er ALDRIG kørt.** Kør
  `npx tsx scripts/gate1-fidelity-test.ts <mappe med ~20 egne tøjfotos> --live`
  og se, at troskaben er ≥ 70 % for mindst ét preset. Visualiseringen dumpede
  kvalitetstjekket i den ene produktions-E2E, så det her er den vigtigste
  enkelt-test overhovedet: den afgør om produktet holder, hvad TikTok viser.
- [ ] **A2. Rotér nøgler der har været i chat**: Google OAuth client secret,
  TRIGGER_SECRET_KEY, RESEND_API_KEY, Stripe webhook-secret,
  testkonto-passwords. (Gør det FØR trafik, ikke efter.)
- [ ] **A3. Favorit-overvågning er lovet i Pro-copy men ikke bygget** (S35).
  Beslut: byg den, eller fjern løftet fra `lib/copy/da.ts` (funktioner-listen
  på /priser), inden betalende Pro-kunder ser det.

## B. Konto og adgang (ny telefon, inkognito)

- [ ] **B1. Signup med e-mail + kode**: opret konto, modtag bekræftelsesmail,
  klik linket **i en ANDEN browser** end den, du oprettede i (token_hash-
  fixet skal holde), og land logget ind.
- [ ] **B2. Google-login**: opret via Google på en frisk konto; tjek at
  onboardingen spørger om 18+ og køn.
- [ ] **B3. Glemt kode**: FØRST: læg nulstillings-mailens skabelon om til
  token_hash (`docs/supabase-mail-skabeloner.md` — 2 minutter i Supabase-
  dashboardet). SÅ: bed om nulstilling i én browser, åbn mail-linket i en
  ANDEN, sæt ny kode, og log ind med den.
- [ ] **B4. Log ud/ind igen** på telefonen, og tjek at /oversigt husker alt.

## C. Penge og annoncer (det, der IKKE må fejle med rigtige brugere)

- [ ] **C1. Køb Plus (måned) med et rigtigt kort**: kvoten (12) står på
  /kreditter umiddelbart efter Stripe-checkout. Kvittering fra Stripe lander.
- [ ] **C2. Lav en HEL annonce på telefonen**: 2–4 fotos af et rigtigt stykke
  tøj → rensede billeder + visualisering + tekst leveres; kreditter trækkes
  først ved levering; tiden føles som løftet (~2 min).
- [ ] **C3. Regenerér én del** (ny visualisering ELLER ny tekst): koster ½
  kredit, og fejler den, refunderes den automatisk.
- [ ] **C4. Køb en ekstra pakke** (fx Prøv 5/49) som abonnent: krediteres.
- [ ] **C5. OPSIG abonnementet i Stripe-portalen** (Kreditter → Administrér)
  og tjek dagens fix: du kan STADIG købe kreditter og se abonnent-panelerne,
  indtil den betalte måned udløber. Kreditterne forsvinder ikke.
- [ ] **C6. Tegn abonnement IGEN efter opsigelsen** (win-back-vejen virker).
- [ ] **C7. Ikke-abonnent kan IKKE købe pakker**: log ind med en konto uden
  abonnement og bekræft, at køb afvises (også hvis man rammer
  `/api/stripe/checkout` direkte).
- [ ] **C8. Fornyelsen ~21/9**: sæt en kalenderpåmindelse — første naturlige
  fornyelse skal give ny kvote (webhook-fixet er testet, men aldrig set live).

## D. Mails (Resend + Supabase SMTP)

- [ ] **D1.** Bekræftelses- og nulstillingsmails lander (ikke spam) hos
  Gmail OG en ikke-Gmail (fx Outlook).
- [ ] **D2.** Ugens Salgsplan lander mandag 06 UTC hos en abonnent-konto.
- [ ] **D3.** Udløbsvarslet (dagligt 07 UTC) rammer en konto med kreditter
  tæt på udløb (kan fremprovokeres i admin/DB).
- [ ] **D4.** DMARC-record er sat (`_dmarc.selja.dk`), så mails ikke taber
  troværdighed, når volumen stiger.

## E. Dagens nye funktioner (deployet 22/8 — tjek på selja.dk efter deploy)

- [ ] **E1.** /oversigt som Plus-abonnent viser: Salgsplan → Suppliers-kort →
  Garderobe-radar → Sæson-kalender → **Pris-trappe** (nyt).
- [ ] **E2.** Som Pro vises DERUDOVER **Flip-beregner** (efter radaren),
  Bundle-bygger og Konkurrent-tjek. En Plus-konto ser dem IKKE.
- [ ] **E3.** Pris-trappens fremhævede trin passer med annoncens liggetid.
- [ ] **E4.** Forsiden på telefon: cardigan-eksemplet er valgt først, og
  anmeldelserne står UNDER før/efter-eksemplet.
- [ ] **E5.** "Hvad koster det?"-striben står før slut-CTA'en med de rigtige
  priser (59/119 kr., 12/30 billeder).
- [ ] **E6.** Delebilledet: send selja.dk-linket til dig selv i en DM/iMessage
  og se FØR/EFTER-collagen som preview (kan tjekkes på opengraph.xyz).

## F. TikTok-klargøring (før første slide)

- [ ] **F1.** Læg TikTok-linket med UTM: `https://selja.dk/?utm_source=tiktok`
  så /admin-besøgstallene kan skelne TikTok fra alt andet.
- [ ] **F2.** Åbn selja.dk i TikTok's IN-APP-browser (del linket i en DM til
  dig selv i TikTok): siden skal rendere, og HELE flowet fra F1 til betaling
  skal kunne gennemføres derinde — in-app-browseren er der, hvor trafikken
  faktisk lander. Test især Google-login her; blokeres den, skal
  e-mail-signup bære hele vejen.
- [ ] **F3.** Alt indhold i sliderne skal holde ærlighedsreglerne: ingen
  indtjeningsløfter, AI-billeder mærkes, "2 minutter" kun om selve annoncen.
- [ ] **F4.** Sitemap er indsendt i Google Search Console og Bing (MANGLER
  §4–5), så søgninger på "Selja" efter en viral video rammer selja.dk.

## G. Sikkerhed og nedbrudsveje (10 minutter, betaler sig)

- [ ] **G1.** /admin giver 404 for en almindelig konto.
- [ ] **G2.** Misbrugsværn: dagligt budgetloft (200 kr.) og 15 annoncer/dag
  er aktive — lav 2-3 annoncer hurtigt og se, at intet vælter.
- [ ] **G3.** Trigger.dev-nøglen udløber **19/11-2026** — kalenderpåmindelse
  ELLER opret permanent nøgle nu (ellers hænger alle annoncer den dag).
- [ ] **G4.** GDPR-selvbetjening: eksportér og slet en testkonto fra /konto.
- [ ] **G5.** Klage-flowet: send en klage og se den lande i admin.

## H. Første uge med rigtige brugere

- [ ] **H1.** Tjek /admin dagligt: besøg, oprettelser, klager, AI-omkostning
  pr. annonce (skal ligge under ~2 kr.).
- [ ] **H2.** Følg første RIGTIGE kundes fulde flow i logs/Stripe (ikke dit
  eget) — første fremmede betaling er den ægte test af webhooken.
- [ ] **H3.** Bed de første tilfredse brugere om lov til at blive citeret
  (MANGLER §14) — ægte social proof afløser anmeldelses-forklaringen.
- [ ] **H4.** Win-back-mail ved opsigelse (MANGLER §13): beslut og byg, når
  de første opsigelser kommer.

---

**Stopregel:** Fejler A1 (troskab), C1, C2 eller C5, så vent med at sende
trafik — alt andet kan fikses, mens siden er live.
