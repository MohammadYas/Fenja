# MANGLER FØR PUBLISH
Sidst opdateret: 2026-08-21 (launch-dag). Kritisk vej øverst — tages oppefra.

## KRITISK VEJ — ALT LUKKET 21/8. APPEN ER LIVE PÅ https://selja.dk
1. [x] **Push main til GitHub** — gjort 20/8 nat; arbejdstræ rent og synkront,
   build + 379 tests grønne.
2. [x] **DEPLOYET — https://selja.dk (+ www + selja.netlify.app).** Site
   `selja`, alle env-vars sat. To fælder fikset: (a) `netlify deploy --build`
   bygger LOKALT → `.env.production.local` styrer `NEXT_PUBLIC_*`;
   (b) løs `package-lock.json` i C:\Users\mo gav forkert workspace-root →
   502 på alt (`outputFileTracingRoot`, bfea359). STADIG MANUELT DEPLOY:
   `netlify deploy --prod` fra Fenja-mappen — kobl repoet i Netlify-UI'en
   for auto-deploy ved push.
3. [x] **Trigger.dev LIVE** — projekt Selja (`proj_zmmrdmvkjhnxepwlxssi`),
   2 tasks (`item-pipeline`, `item-regen`), `TRIGGER_SECRET_KEY` (tr_prod)
   sat i Netlify. `syncEnvVars` skubber nøglerne til jobmiljøet ved hvert
   `npx trigger.dev@4.5.12 deploy`. Pakker pinnet til CLI-versionen.
4. [x] **Stripe webhook OPRETTET af ejeren:** `https://selja.dk/api/webhooks/stripe`
   (destination `we_1U6uOmQu1PV9huwJxb66BP3B`, 4 events, API-version
   2026-07-29.dahlia). `STRIPE_WEBHOOK_SECRET` sat i Netlify + `.env.local`.
5. [x] **selja.dk AKTIVT** — Punktum/MitID-aktivering gjort af ejeren; A/CNAME
   korrekte hos registraren; Netlify serverer domænet med HTTPS.
6. [x] **Supabase auth-config rettet via Composio:** `site_url` var
   `http://localhost:3000` (Google-login smed brugere til localhost efter
   det nye domæne) → nu `https://selja.dk`; allowlist =
   localhost:3000/**, selja.dk/**, www.selja.dk/**, selja.netlify.app/**.
7. [x] **Resend LIVE:** selja.dk verificeret (DKIM/SPF/MX), nøgle sat i
   Netlify + Trigger.dev, `RESEND_FROM="Selja <post@selja.dk>"`. Testmail
   sendt og leveret til ejerens gmail (id 182ce635…). OBS: Resend-kontoen
   er oprettet på krausesigne@gmail.com.

## EFTER LAUNCH (vigtigst først)
- [ ] **TÆND e-mail-bekræftelse FØR rigtige brugere lukkes ind** (ejer 21/8:
      slået fra igen for nem test). Uden den kan enhver oprette konto på en
      andens e-mail, og Google-login linker så offerets identitet ind i den
      fremmede konto. Alt er klar (SMTP, danske skabeloner, UI håndterer
      begge tilstande) — det er ÉT flip: Supabase auth-config
      mailer_autoconfirm=false (via Composio eller dashboardet).

- [x] **21/8 aften-runde (alle ejer-ordrer leveret):** e-mail-bekræftelse TIL
      (lukker konto-overtagelse via andres e-mail; Supabase sender nu via
      produktets eget maildomæne, danske skabeloner), glemt adgangskode
      (S39) bygget, forsiden strammet (Lær-teaser + eksperiment ud),
      abonnement-rækker mobil-ombygget, feedback-formular på Konto (+tabel
      med RLS kørt mod cloud), admin: kommasepareret ADMIN_EMAIL (begge
      ejer-adresser), nøgletal, content-prompts til Claude/ChatGPT,
      Garderobe-radar + salgsstatistik for abonnenter. GitHub er nu koblet
      til Netlify: push til main auto-deployer (sharp-workaround overflødig).

- [x] **E2E-VERIFICERET I PRODUKTION 21/8 (autonom runde):** login, oversigt,
      kreditside, konto, wizard → rigtig annonce leveret via Trigger.dev
      (tekst+pris fra DeepSeek; visualisering dumpede troskabstjek → kredit
      auto-refunderet = ærligheds-flowet virker). delebillede (sharp på
      lambda) svarer 200. 9. root cause fundet+fikset undervejs: lokal
      Windows-deploy manglede linux-sharp → ALLE oprettelser 500´ede
      (scripts/vendor-sharp-linux.sh + outputFileTracingIncludes, c0e5978).
- [x] **Ny abonnent-feature 21/8: Ugens Salgsplan på mail** — Trigger.dev-
      schedule (mandag 06 UTC) sender hver aktiv abonnents Smart Salgsplan
      via Resend; stille uger sender intet. Vises på kreditsiden under
      „Med i begge“.
- [x] **IndexNow pinget 21/8** (202, 13 URL´er) — Bing/Yandex + ChatGPT-
      søgning. Kør scripts/indexnow-ping.ts igen ved nye offentlige sider.
- [ ] **Google Search Console:** kræver ejerens Google-login — tilføj
      selja.dk som domain property og indsend sitemap.xml.

- [ ] **Glemt adgangskode (S39) FINDES IKKE** — hverken rute eller UI. Nu
      hvor Resend virker, er den ublokeret. En e-mail+kode-bruger der mister
      koden er stadig låst ude (Google-login er eneste redning).
- [ ] **Verificér betalingskæden end-to-end:** ét rigtigt køb (mindste
      abonnement) → webhooken leverer → kreditter på kontoen → kvittering.
      Stripe-dashboardet viser leveringsstatus pr. event.
- [ ] **Gate 1 (S12) er ALDRIG kørt** — se §3 nedenfor.
- [ ] **Kobl GitHub-repoet på Netlify-sitet** (auto-deploy, bygger i skyen).
- [ ] **Rotér nøgler der har været igennem chatten:** Google client secret
      (20/8) samt TRIGGER_SECRET_KEY, RESEND_API_KEY og Stripe
      webhook-secret (alle 21/8).
- [ ] Trigger.dev-nøglens udløb: hvis den blev oprettet med 90 dages udløb,
      dør pipelinen stille 19/11-2026 — sæt kalenderpåmindelse eller opret
      permanent nøgle.

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
