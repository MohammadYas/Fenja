# MANGLER FØR PUBLISH
Sidst opdateret: 2026-08-19. Ejer-prioritering: Resend er på vej; "resten laver vi senere".
Kritisk vej øverst — tages oppefra.

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
- [ ] **Ejerens prompts til forside-kataloget** — 2 modtaget 19/8 (P1 soveværelse,
      P2 entre — `docs/katalog-prompts.md` med justerbare hår-variabler).
      Mangler stadig: kjole, jakke, bukser/overdel som hovedmotiv, taske,
      mande-variant, bøjle/flatlay/close-up, stue- og gade-sted, FØR-billede —
      fuld liste i docs/katalog-prompts.md.
- [ ] **S25:** udskift `public/eksempler/*` med ægte output fra første rigtige
      kørsel (efter Gate 1).
- [ ] **AI-mærkat:** synlig mærkning er midlertidigt fjernet fra forsiden —
      "sleek" løsning SKAL på plads inden lancering (EU AI-forordning art. 50).
- [ ] **Ærligheds-blokken** genplaceres på forsiden før udgivelse.

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
