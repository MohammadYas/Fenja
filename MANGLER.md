# MANGLER FØR PUBLISH
Sidst opdateret: 2026-08-20 (morgen). Ejer-prioritering: Resend er på vej;
"resten laver vi senere". Kritisk vej øverst — tages oppefra.

## 0. Nyt siden 19/8
- [ ] **Kør migration `20260820010000_klager.sql` mod cloud-DB'en** (klage/
      kredit retur-flowet virker først derefter). Kun ejeren deployer (§6) —
      eller giv Claude ordre til at køre den via Composio.
- [ ] **Konverterings-planen ("sælg drømmen")**: leveret som plan i chatten
      20/8 — afventer ejerens go før forsiden ændres.
- [ ] **"Fra vores brugere"-undertekst** på anmeldelses-billedet: afvist som
      fabrikeret proof (ingen brugere endnu). Genbesøg når ægte bruger-
      anmeldelser findes; linjen bor i lib/copy/vinted.ts.
- [x] Billedserie komplet (48 → 73 credits), forside animationsrig, gratis
      prisberegner-værktøj, nyt-item-wizard, klage-flow (kode), top-up kun
      for abonnenter, log ud på Konto.

## 1. Nøgler (blokerer alt rigtigt)
- [ ] **STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET** — hentes i Stripe-dashboardet
      (LIVE mode; price-id'er findes allerede i `.env.local`). Uden dem: intet køb.
- [ ] **Stripe webhook-endpoint** — oprettes i Stripe mod deployet URL →
      `/api/webhooks/stripe`. Kræver at sitet er deployet først.
- [ ] **Provider-nøgler (AI-motoren — uden dem kører alt på mock):**
      - `GEMINI_API_KEY` — AL billedgenerering (final + preview) + vision
        (troskabs-tjek, label-aflæsning). Ejer 19/8: fal droppet, Gemini eneste.
      - `DEEPSEEK_API_KEY` — DeepSeek skriver titel/beskrivelse/prisforslag
        med avanceret prompt. Ejer 19/8: erstattede Claude.
- [ ] **RESEND_API_KEY + domæneverifikation** — PÅ VEJ (ejer). Låser op:
      transaktionsmails (S32) + glemt adgangskode (S39).
- [ ] **TRIGGER_SECRET_KEY (skalering, 20/8):** i produktion med mange
      brugere SKAL pipelinen køre via Trigger.dev (koden er klar — sæt
      nøglen). Uden den kører jobs i serverprocessen: genoptag-knappen
      redder hængende kørsler, men jobs overlever ikke genstarter.
- [ ] **Kør migration `20260820100000_bulletproof_oprettelse.sql`** —
      giver idempotent oprettelse (kladde_id-unikhed) + gemte visningsvalg
      til genoptag. Koden virker før migrationen, garantierne gælder efter.

## 2. Deploy
- [ ] **Netlify-site kobles til GitHub-repoet** (ejer: "bare uploade github til
      netlify og så virker det").
- [ ] **FLAG (Claude, 2026-08-19):** Netlify læser ikke nøgler fra Supabase.
      Next.js-serverkoden kører hos Netlify, så env-vars (Supabase URL/anon/
      service-key, Stripe, FAL/GEMINI/ANTHROPIC, Resend, ADMIN_EMAIL) skal
      sættes i Netlify-sitets Environment variables — engangsopgave i deres UI.
      Uden dem deployer sitet, men kører demo-mode: intet login, intet køb,
      ingen AI. Ejer beslutter — men det kan ikke undværes teknisk.
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
