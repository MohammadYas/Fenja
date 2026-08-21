# MANGLER FØR PUBLISH
Sidst opdateret: 2026-08-21 (deploy-runde). Kritisk vej øverst — tages oppefra.

## KRITISK VEJ LIGE NU
1. [x] **Push main til GitHub** — gjort 20/8 nat (13 commits). Historikken er
   scannet: ingen nøgler i arbejdstræ eller historik, `.env.local` har
   aldrig været committet. Arbejdstræet er rent og synkront med origin/main
   pr. 21/8; `npm run build` og alle 379 tests er grønne.
2. [ ] **Netlify-site kobles til repoet + ALLE env-vars sættes i Netlify.**
   Uden env-vars deployer sitet, men kører demo-mode: intet login, intet
   køb, ingen AI. `netlify env:import .env.local` sætter dem i én kommando —
   husk at rette `NEXT_PUBLIC_SITE_URL` til den deployede URL bagefter.
3. [ ] **TRIGGER_SECRET_KEY — HARD BLOCKER PÅ NETLIFY, ikke "skalering".**
   `lib/pipeline/start.ts` kører uden nøglen pipelinen som fire-and-forget i
   selve request-processen. Det virker i en dev-server, men en Netlify-
   function fryses/dræbes i samme øjeblik svaret er sendt — og én billed-
   kørsel tager ~150 s pr. billede. Uden nøglen bliver ALLE annoncer i
   produktion hængende i "på vej". Trigger.dev-projektet skal oprettes,
   `trigger.config.ts` pege på det, og `npx trigger.dev@latest deploy`
   køres, før betalende brugere slippes ind.
4. [ ] **Stripe webhook mod den deployede URL** → `/api/webhooks/stripe`.
   Kan først oprettes når URL'en findes. `STRIPE_SECRET_KEY` er nu SAT i
   `.env.local`; kun `STRIPE_WEBHOOK_SECRET` er tom. Uden webhooken bliver
   et gennemført køb aldrig til kreditter.
5. [ ] **Supabase → Authentication → URL Configuration:** Netlify-URL'en ind
   som Site URL + Redirect URL, ellers fejler Google-login i produktion.
6. [ ] **RESEND_API_KEY + domæneverifikation — MANGLER STADIG.** Uden den
   sendes INGEN mails: ingen velkomstmail, ingen kvittering, og "glemt
   adgangskode" (S39) findes slet ikke — hverken rute eller UI. En bruger
   der mister sin kode kan i dag ikke komme ind igen. Google-login er en
   delvis redning, men kun for dem der brugte Google.
## 0. Status på database og auth (verificeret 20/8 nat)
- [x] **Supabase-skemaet er KOMPLET** — alle 14 migrations kørt og
      verificeret kolonne for kolonne (profiles, items, item_photos,
      generations, credit_ledger, credit_balances, klager, preset_stats)
      + `item-photos`-bucket (privat). Intet mangler i databasen.
- [x] **Google-login live** — provider aktiv, client id/secret sat,
      authorize-endpointet svarer 302 mod Google med korrekt redirect.
      Apple fravalgt (ejer 20/8: kræver betalt Apple Developer).
- [ ] **Supabase → Authentication → URL Configuration:** dit Netlify-domæne
      skal tilføjes som Redirect URL ved deploy, ellers fejler Google-login
      i produktion (localhost virker allerede).
- [ ] **Rotér Google client secret** — blev delt i klartekst i chatten 20/8.
- [ ] **Konverterings-planen ("sælg drømmen")**: leveret som plan i chatten
      20/8 — afventer ejerens go før forsiden ændres.
- [ ] **"Fra vores brugere"-undertekst** på anmeldelses-billedet: afvist som
      fabrikeret proof (ingen brugere endnu). Genbesøg når ægte bruger-
      anmeldelser findes; linjen bor i lib/copy/vinted.ts.
- [x] Billedserie komplet (48 → 73 credits), forside animationsrig, gratis
      prisberegner-værktøj, nyt-item-wizard, klage-flow (kode), top-up kun
      for abonnenter, log ud på Konto.

## 1. Nøgler (blokerer alt rigtigt)
- [x] **Provider-nøgler (AI-motoren) SAT og roteret 20/8:** `GEMINI_API_KEY`
      (al billedgenerering + vision) og `DEEPSEEK_API_KEY` (annoncetekst).
      Ligger i gitignoret `.env.local`. Skal også ind i Netlify ved deploy.
- [ ] **RESEND_API_KEY + domæneverifikation — MANGLER (ejer 20/8).**
      Konsekvens uden den: ingen velkomstmail (S32), ingen kvitteringer,
      og glemt-adgangskode (S39) eksisterer ikke — mister en bruger sin
      kode, er kontoen låst ude permanent. Domænet skal verificeres hos
      Resend, før mails kan sendes fra andet end en testadresse.
- [ ] **STRIPE_SECRET_KEY** — hentes i Stripe-dashboardet (LIVE mode;
      price-id'erne findes allerede i `.env.local`). Feltet står klar i
      `.env.local`, mangler kun værdien. Uden den: intet køb.
- [ ] **STRIPE_WEBHOOK_SECRET** — kan FØRST laves efter deploy: Stripe →
      Webhooks → endpoint mod `<url>/api/webhooks/stripe` → Signing secret.
- [ ] **TRIGGER_SECRET_KEY (skalering, 20/8):** i produktion med mange
      brugere SKAL pipelinen køre via Trigger.dev (koden er klar — sæt
      nøglen). Uden den kører jobs i serverprocessen: genoptag-knappen
      redder hængende kørsler, men jobs overlever ikke genstarter.
- [x] **Alle migrations kørt** (se §0) — inkl. klager, bulletproof
      oprettelse og profil-generering. Verificeret mod cloud-DB'en.

## 2. Deploy (EJER-BESLUTNING 20/8: Netlify hoster; alle envs/edge
##    functions/secrets bor i SUPABASE og lægges ind via Composio senere)
- [ ] **Netlify-site kobles til GitHub-repoet.**
- [ ] **FLAG (Claude, gentaget 20/8):** uanset hvor nøglerne OPBEVARES
      (Supabase secrets), læser Next.js-serverkoden `process.env` ved
      runtime hos Netlify — så værdierne skal stadig ind i Netlify-sitets
      Environment variables ved deploy (engangsopgave/synk). Uden dem
      deployer sitet, men kører demo-mode: intet login, intet køb, ingen AI.
- [x] **Migrationer kørt mod cloud (20/8 via Composio på ejer-ordre):**
      `20260820100000_bulletproof_oprettelse.sql` og
      `20260820110000_profil_generering.sql` — verificeret (kladde_id,
      visninger, koen, haar_farve + unik-indeks findes).
- [ ] **Domæne** — stadig `SELJA_DOMAIN`-placeholder (`selja.studio`) i
      `lib/config.ts`; `kontakt.email` peger på gmail, skiftes ved domæne.

## 3. Gate 1 — første rigtige kørsel (S12)
- [ ] Kør `npx tsx scripts/gate1-fidelity-test.ts <mappe-med-~20-egne-tøjfotos> --live`
      (kræver nøglerne fra pkt. 1). Mål: troskab ≥ 70 % for mindst ét preset.
      Under 70 % → on-model slås fra, MVP = rens + tekst.
      Skriv pass-raten i STATUS.md; kalibrér `pipeline.troskabsTaerskel`.
- [ ] Gate 2 måles samtidig: komplet annonce ≤ 2 min.

## 4. Billeder + prompts (det ejeren huskede)
- [x] **Katalog-prompts KOMPLETTE 19/8** — alle 13 i `docs/katalog-prompts.md`
      (P1+P2 fra ejeren; P3–P13 skrevet af Claude: kjole, bukser, overdel,
      taske, mand ×3, bøjle, flatlay, close-up, stue, opgang, FØR-billede).
      Justerbare {hår}-variabler. NÆSTE: generér serien med gemini-3-pro-image.
- [ ] **S25:** udskift `public/eksempler/*` med ægte output fra første rigtige
      kørsel (efter Gate 1).
- [x] **AI-mærkat (20/8):** sleek løsning på plads — stille noter ved
      før/efter-panelet ("Eksempel: alle billeder er genereret med Selja."),
      billedserien og bund-strømmen. Ingen badges. (Art. 50-kravet dækket
      for forsiden; appens genererede billeder har fortsat deres badge.)
- [x] **Ærligheds-blokken (20/8)** genplaceret som rolig stribe efter det
      mørke bånd (omskrevet til Selja-æraen, uden gratis-tier).

## 4b. Auth (nyt 20/8 nat)
- [x] **Google-login bygget og live** — knap på log-ind, callback veksler
      koden, 18+-gaten fanges i onboardingen (OAuth kan ikke bære svaret
      med, og "log ind"-fanen opretter også konti — fundet i data:
      en Google-bruger stod med `age_confirmed = false`).
- [x] **Auto-login** — sessionen fornyes i middleware og en indlogget
      bruger springer login-formularen over.
- [ ] **Apple-login: FRAVALGT** (ejer 20/8) — kræver betalt Apple Developer
      Program. Genbesøg kun hvis iOS-app bliver aktuelt.

## 5. Launch-gates (HANDOFF §8 — S26)
- [ ] Lighthouse mobil ≥ 90 genmåles (L1 målt før Vinted-first-forsiden)
- [ ] Uinstrueret brugertest: én person gennemfører flowet på egen telefon
- [ ] Slop-gennemgang af hele sitet mod §2.1-listen
- [ ] Budgetloft + kill-switch testet

## SENERE (ejer-beslutning 2026-08-19: "resten laver vi senere")
- S37 årsabonnement-kvoter (Trigger.dev-job) — skal dog løses FØR nogen køber årsplan
- GDPR: P1+P2 (DPA-dato/link i `docs/databehandlere.md` + tredjelandsgrundlag)
  — P3+P4 er skrevet 16/8 sen aften; se `docs/gdpr-audit-2026-08-16.md`
- S27 gratis-tier-alternativ (afventer ejer-valg)
- S34 mails præcis-én-gang · S35 favorit-overvågning · S33 video (fase B)
