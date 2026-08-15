# Fenja · Teknisk kravspecifikation & MVP-plan — v0.2
**Produkt:** Fenja — hjælper Vinted-sælgere med at sælge mere: upload mobilfotos af dit tøj → få rensede salgsbilleder, en nordisk AI-outfit-visualisering af det konkrete stykke tøj, og en færdig annoncetekst. Plus strategier og sourcing-viden, der gør salg på Vinted til en reel indtægt.
*(Navn: jættekvinden Fenja driver møllen Grotte, der maler hvad ejeren ønsker. Kort, nordisk, internationalt udtaleligt. Tjek fenja.ai / getfenja.com, virk.dk og EUIPO før commit.)*
**Ejer:** Dig (solo, vibecoder, remote) · **Dato:** 14. august 2026 · **Version 0.2**
**Ændring fra v0.1:** Vinted-modulet er nu MVP (fase A). Video-annoncemotoren (Seedance) er flyttet til fase B som B2B-spor — dens fulde krav er bevaret i Tillæg B.
---
## 1. Vision & strategi
**Fase A (MVP, uge 1–3): Fenja for Vinted.** Selvbetjent web-app til private sælgere. Billeder, ikke video — billigere, hurtigere, enklere pipeline, kæmpe målgruppe, og din TikTok-slideshow-evne er den perfekte akkvisitionskanal til præcis dét publikum.
**Fase B (uge 3+): B2B-annoncemotoren.** Seedance-videopipelinen (Tillæg B) sælges som annoncepakker til virksomheder — dit hurtige cashflow, mens B2C-appen vokser.
**Fase C (senere): Udland.** Vinted findes i 20+ lande; appen bygges sprogsagnostisk fra dag 1 (da/en i UI, flere senere).
**Strategisk kerne: compliance er produktet.** Konkurrenter (fx Vintedify) sælger AI-fotos i en gråzone. Fenja bygges som *den ansvarlige mulighed*: ægte fotos først, AI som mærket supplement, fejl fremhævet — ikke skjult. Når Vinted en dag strammer grebet, er Fenja den app der overlever, og det er også det etisk rigtige overfor unge brugere, hvis konti er deres indtægt.
---
## 2. Mål & succeskriterier (30 dage)
| ID | Mål | Målepunkt |
|---|---|---|
| M1 | Lancering | App live med betaling senest dag 21 |
| M2 | Brugere | ≥ 200 registrerede, ≥ 25 betalende (kreditkøb) inden dag 30 |
| M3 | Omsætning samlet (B2C + B2B) | ≥ 10.000 kr. — realistisk fordeling: 1.000–3.000 kr. fra appen, resten fra 1–2 B2B-annoncepakker solgt manuelt |
| M4 | AI-cost pr. komplet annonce (rens + on-model + tekst) | ≤ 2 kr. |
| M5 | Tid fra upload til færdig annonce | ≤ 2 min |
| ID | Kvalitetsmål | Målepunkt |
|---|---|---|
| K1 | Tøj-troskab: on-model-billedet viser det KONKRETE stykke tøj (print, farve, snit genkendeligt) | ≥ 70 % pass i blindtest på 20 stykker tøj; billeder under tærsklen leveres ikke |
| K2 | Compliance: ingen leverance uden ægte foto som billede 1, AI-mærkning på, fejl nævnt i tekst | 100 % — håndhævet i kode, ikke i vejledning |
| K3 | Annoncetekst-kvalitet | Stikprøve: 8/10 tekster kan bruges uden redigering |
**Ikke-mål (30 dage):** mobilapp (web-first, mobiloptimeret), automatisk upload til Vinted (ingen offentlig API — copy-paste-flow i stedet), crosslisting til Trendsales/DBA (fase C), video, teams, engelsk marketing.
---
## 3. Brugerrejser
**UR-1 · Vinted-sælgeren (kerne):** Åbner fenja-appen på mobilen → opretter konto (magic link) → nyt item → tager/uploader 2–4 fotos (guidet: helhed, bagside, label, evt. fejl) → udfylder 4 hurtige felter (mærke, størrelse, stand, evt. fejl) → ~90 sek. senere: rensede fotos, 1–2 nordiske on-model-billeder (mærket "AI-visualisering"), færdig titel + beskrivelse + prisforslag → kopierer alt til Vinted med ét tryk pr. element → markerer som solgt (statistik).
**UR-2 · Strategi-sporet:** Bruger åbner "Lær"-sektionen: korte guides (sourcing i genbrug/kilosalg/dødsbo, prissætning, hvornår Vinted Pro, foto-teknik). Gratis — det er akkvisition og retention, ikke produktet.
**UR-3 · Dig (B2B, fase B):** Uændret fra v0.1 — brief → video-annoncer → leverance (Tillæg B).
---
## 4. Funktionelle krav (MVP = fase A)
| ID | Krav | Prio |
|---|---|---|
| FR-1 | Guidet foto-upload: 2–4 billeder pr. item med rolle (helhed/bagside/label/fejl); mobilkamera direkte; komprimering klientside | P0 |
| FR-2 | Foto-rens: baggrundsrens til neutral flade + lys/farvekorrektion på ægte fotos. Må ALDRIG retouchere slid, pletter eller fejl — kun global korrektion | P0 |
| FR-3 | On-model-generering: billedmodel med det ægte foto som styrende reference genererer 1–2 billeder af en AI-person i nordisk æstetik (præcis stil-preset, §9), der bærer det konkrete stykke tøj. Automatisk troskabs-tjek (K1) før levering; fejlede genereringer koster ikke brugerens kreditter | P0 |
| FR-4 | AI-mærkning: synligt "AI-visualisering"-badge indlejret i hjørnet af alle genererede billeder + metadata. Kan ikke slås fra (EU AI-forordningen art. 50, i kraft 2/8-2026) | P0 |
| FR-5 | Annoncetekst: Claude genererer titel, beskrivelse (mærke/størrelse/stand/materiale fra felter + label-foto), søgeord og prisforslag. Fejl fra brugerens felter SKAL indgå i beskrivelsen | P0 |
| FR-6 | Compliance-rækkefølge: output præsenteres altid som: ægte fotos først (med instruks "brug dette som billede 1 på Vinted"), AI-billeder efter. In-app tekst forklarer Vinteds regler kort | P0 |
| FR-7 | Kreditsystem: 3 gratis annoncer ved signup; derefter kreditpakker (fx 10 annoncer = 29 kr., 30 = 69 kr.) via Stripe Checkout; kreditter trækkes kun ved leveret resultat | P0 |
| FR-8 | Konto & bibliotek: magic link-login, alle items gemt med status (kladde/aktiv/solgt), gen-download | P0 |
| FR-9 | Copy-paste-flow: ét-tryks kopiering af titel, beskrivelse og billeddownload i Vinted-venlig rækkefølge (ingen Vinted-API findes — flowet skal føles som "næsten automatisk") | P0 |
| FR-10 | Omkostningsmåler + budgetloft pr. bruger og globalt (misbrugsværn) | P0 |
| FR-11 | "Lær"-sektion: 5–8 korte guides (sourcing: genbrug, kilosalg, loppemarked, dødsbo; prissætning; Vinted Pro-grænsen; fototeknik). Statisk markdown-indhold, let at udvide | P1 |
| FR-12 | Nordiske stil-presets: 3–5 valgbare æstetikker (minimal studio, københavnsk gade, hyggelig stue, natur) — samme tøj, forskellig setting | P1 |
| FR-13 | Delbart resultat: auto-genereret before/after-billede optimeret til TikTok-slideshows (viral loop: brugernes resultater er din marketing) | P1 |
| FR-14 | Statistik: solgt-markering, samlet salgsværdi ("du har solgt for X kr. med Fenja") — retention + socialt bevis | P1 |
| FR-15 | Prompt-/preset-versionering med pass-rate-statistik pr. version (genbrugt princip fra v0.1) | P1 |
**Bevidst udeladt:** alt der opfordrer til kommercielt salg på private konti (dropshipping-suppliers, "bestillingsvarer", bulk-listing af nye varer) — det er brud på Vinteds vilkår og ville udsætte brugerne for bans. Sourcing-indholdet (FR-11) handler om brugt/vintage og om at skifte til Vinted Pro, når man krydser grænsen.
---
## 5. Ikke-funktionelle krav
| ID | Krav |
|---|---|
| NFR-1 | 100 % remote/cloud; ingen lokal GPU |
| NFR-2 | Komplet annonce (rens + on-model + tekst) på ≤ 2 min ved normal belastning; jobs parallelle |
| NFR-3 | Idempotente jobs; webhook-dubletter må ikke koste dobbelt (hverken dine API-kr. eller brugerens kreditter) |
| NFR-4 | Privat objektlager, signerede URLs; sletning af konto fjerner alle billeder (GDPR — målgruppen inkluderer unge, så datadisciplin er ufravigelig; ingen brug af brugerbilleder til andet end brugerens egen leverance) |
| NFR-5 | Faste omkostninger ≤ 500 kr./md. ved lav trafik (Netlify/Supabase/Trigger.dev free tiers) |
| NFR-6 | Provider-abstraktion: `ImageProvider`-interface så billedmodel kan skiftes (samme princip som `VideoProvider` i Tillæg B) |
| NFR-7 | Aldersgrænse jf. Vinteds egne vilkår (18+, forældresamtykke-flow udelades — under 18 afvises ved signup) |
| NFR-8 | Mobil-first UI: hele kerneflowet skal fungere fejlfrit på en telefon, det er dér målgruppen er |
---
## 6. Arkitektur
```
[Next.js app på Netlify]  (UI + lette API-routes; mobil-first)
  ├──> [Supabase]  Auth (magic link) · Postgres · Storage
  │      (alt via Supabase CLI: lokal dev, migrations i git, genererede typer)
  ├──> [Trigger.dev]  item-pipeline som ét job:
  │       1. rens (baggrund + lys)  ──┐
  │       2. on-model-generering     ├── parallelle kald til ImageProvider (fal)
  │       3. troskabs-tjek (K1)      ──┘   (Seedream-klasse billedmodel + bg-removal)
  │       4. AI-badge + eksportformater (sharp — ffmpeg IKKE nødvendig i fase A)
  │       5. annoncetekst (Claude API)
  │       6. kredit-træk (kun ved succes)
  ├──> [Stripe]  Checkout til kreditpakker · webhooks → credits
  └──> [Resend]  magic links + "din annonce er klar"
```
Forskel fra v0.1: ingen ffmpeg-worker, ingen Railway, ingen ElevenLabs i fase A — billedpipelinen er væsentligt lettere end video. Railway/ffmpeg tilføjes først med Tillæg B.
## 7. Datamodel (kerne)
```
users(id, email, credits, created_at, age_confirmed)
items(id, user_id, brand, size, condition, defects_text, status[draft|active|sold],
      sold_price_dkk, created_at)
item_photos(id, item_id, role[full|back|label|defect], original_url, cleaned_url)
generations(id, item_id, kind[cleanup|onmodel|text], preset_id, provider_job_id,
            status, fidelity_score, cost_dkk, output_url, prompt_version)
presets(id, name, version, style_prompt, pass_rate)
credit_ledger(id, user_id, delta, reason[signup|purchase|delivery|refund], stripe_ref, ts)
guides(slug, title, body_md, order)
```
Invariant: kreditter trækkes i samme transaktion som leverancen markeres komplet; fejlet generering → automatisk refund-linje i ledger.
---
## 8. Billedpipeline & compliance (kernen)
### 8.1 Modelvalg
- **Baggrundsrens:** dedikeret bg-removal-model (fal har flere) + let global lyskorrektion. Bevidst INGEN generativ retouch på ægte fotos — det holder FR-2's "vis varen som den er".
- **On-model:** referencestyret billedmodel i Seedream/nano-banana-klassen via fal (samme leverandørforhold som Tillæg B's video). Det ægte foto er styrende reference; prompten styrer person, positur og nordisk setting — aldrig tøjets udseende.
- **Troskabs-tjek (K1):** automatisk sammenligning mellem ægte foto og on-model-billede (vision-model-kald: "samme print/farve/snit? fejl synlige der hvor de skal være?"). Under tærskel → 1 automatisk retry med strammere reference-vægt → ellers leveres kun rensede fotos + tekst, og on-model-kreditten refunderes. Et misvisende AI-billede er værre end intet AI-billede.
### 8.2 Compliance-regler (kodede, jf. Vinteds katalogregler + EU AI-forordning)
1. Ægte foto altid først i leverancen med eksplicit "billede 1 på Vinted"-instruks (Vinted kræver at første foto viser hele den faktiske vare, taget af sælgeren selv).
2. AI-billeder altid med synligt badge + metadata (AI-forordningens mærkningskrav, i kraft siden 2/8-2026).
3. Fejl/slid: brugerens fejl-foto og fejl-felt SKAL med i leverancen — uviste fejl giver køber returret som "ikke som beskrevet", så ærlighed er også salgsrådgivning.
4. Ingen features der understøtter kommercielt salg på private konti (Vinteds forbud).
5. In-app disclaimer: "Vinteds regler ændrer sig — Fenja følger dem, det bør du også" + link.
### 8.3 Vinted-API-realitet
Vinted har ingen offentlig API til oprettelse af annoncer, og scraping/automatisering af brugerkonti er vilkårsbrud. Derfor FR-9's polerede copy-paste-flow — og derfor er "automatisk upload" et permanent ikke-mål, indtil Vinted evt. åbner en API.
---
## 9. Preset-/promptsystem (nordisk æstetik)
Hvert preset = fast promptskabelon med blokke: (1) reference-instruks ("personen bærer PRÆCIS beklædningen fra @image1 — bevar print, farve, snit, længde; opfind intet"), (2) person-anker (neutral, divers rotation, aldrig kendte personer), (3) nordisk setting (fx "lys minimalistisk lejlighed, hvide vægge, blødt gråvejrslys" / "københavnsk gade, cykler, dæmpet palette"), (4) fotostil (naturligt lys, telefonkamera-realisme — matcher Vinted-feedets look, ikke glossy e-com), (5) negativ-liste (ingen tekst, ingen logoer udover tøjets egne, ingen ansigtsforskønnelse af tøjets pasform). Versioneret med pass-rate-statistik (FR-15) — troskab pr. preset er dit kvalitets-moat.
---
## 10. Unit economics
Pr. komplet annonce: bg-rens ~0,05–0,15 kr. × 3 fotos + on-model 2 genereringer (inkl. retry-buffer) ~0,3–1 kr. + troskabs-tjek ~0,05 kr. + Claude-tekst < 0,2 kr. ≈ **0,7–1,7 kr. total** → M4 (≤ 2 kr.) holder. Kreditpakke 10 annoncer = 29 kr. → direkte cost ~7–17 kr. → bruttomargin 40–75 % på LAVESTE pakke, bedre på større. Gratis-tier (3 annoncer) koster dig ~2–5 kr. pr. signup — billig akkvisition, men FR-10's globale loft beskytter mod misbrug. Faste omkostninger: uændret under 500 kr./md.
---
## 11. Tech stack
Uændret fra v0.1 og bekræftet: Next.js + TypeScript på **Netlify** (langvarige jobs i Trigger.dev, ikke Netlify Functions) · **Supabase via CLI** (migrations i git, genererede typer, lokal dev med `supabase start`) · Trigger.dev · fal.ai bag `ImageProvider` · Claude API (tekst — API-forbrug er separat fra dit Claude Max-abonnement, men < 0,2 kr./annonce) · Stripe · Resend · Tailwind + shadcn/ui · sharp til badge/eksport. Railway/ffmpeg/ElevenLabs: først i fase B.
---
## 12. 30-dages plan med gates
**Uge 1 — Billedpipelinen (ingen UI).** Dag 1–3: on-model-eksperimentet — 20 stykker rigtigt tøj (lån/brug din egen garderobe) gennem referencestyret generering; mål troskab. **Gate G1 (dag 3): ≥ 70 % troskab opnåeligt med mindst ét preset — ellers omdefineres MVP til rens + tekst uden on-model (stadig et produkt!).** Dag 4–7: bg-rens, troskabs-tjek, tekstgenerering, badge — hele kæden fra terminalen. **Gate G2 (dag 7): 1 komplet annonce end-to-end på ≤ 2 min.**
**Uge 2 — Appen.** Auth, upload-flow, kreditter, Stripe, copy-paste-UI, mobilpolering. **Gate G3 (dag 14): en ven uden instruktion gennemfører upload→Vinted-annonce på egen telefon.**
**Uge 3 — Lancering + distribution.** Lær-sektion (FR-11), 3 presets (FR-12), before/after-delebilleder (FR-13). TikTok-motoren tændes: 2–3 daglige slideshows ("solgte denne trøje på 4 timer — se billederne før/efter", sourcing-tips, Vinted-strategi). **Gate G4 (dag 21): live med betaling + 10 første rigtige brugere (venner/padel-netværk/TikTok).**
**Uge 4 — Vækst + B2B-cash.** Iterér på det brugerne faktisk gør; statistik (FR-14). Sideløbende: sælg 1–2 B2B-annoncepakker manuelt (leveret med billedpipelinen + manuel video/slideshow) for at nå M3's omsætningsmål. **Gate G5 (dag 30): M1–M5 evalueret; beslut om fase B (video-motor) eller mere B2C-vækst.**
Gate-regel uændret: fix det blokerende, skær P1, flyt aldrig en gate > 3 dage.
---
## 13. Risici
| # | Risiko | Sandsynl. | Mitigering |
|---|---|---|---|
| R1 | Tøj-troskab for lav (print/logo forvanskes) — den vigtigste tekniske risiko | Middel-høj | G1-eksperimentet FØR alt andet; troskabs-tjek + refund; fallback-MVP uden on-model |
| R2 | Vinted strammer/håndhæver mod AI-billeder | Middel | Compliance-by-design (§8.2) er hele positioneringen; ægte-foto-først gør Fenja robust; følg Vinteds regelændringer månedligt |
| R3 | B2C tjener for lidt på 30 dage | Høj | Indregnet: M3 dækkes primært af manuelle B2B-pakker; appen måles på brugere/betalende, ikke omsætning, i måned 1 |
| R4 | Konkurrence (Vintedify m.fl.) | Middel | Nordisk fokus, dansk indhold, TikTok-distribution, compliance-brand; hastighed |
| R5 | Misbrug af gratis-tier / genererings-misbrug | Middel | FR-10 lofter, e-mailverifikation, rate limits |
| R6 | GDPR/unge brugere | Lav-middel | NFR-4 + NFR-7; ingen sekundær brug af billeder |
| R7 | Scope-krybning mod video/crosslisting | Høj | Ikke-mål i §2; Tillæg B venter på G5 |
---
## 14. Tillæg B · Video-annoncemotoren (fase B — tidligere v0.1-MVP)
Hele Seedance-videopipelinen fra v0.1 er bevaret som fase B: brief → Claude-scripts → prompt-compiler (8-bloks UGC-system) → Seedance 2.0 via fal (t2v/i2v/r2v, native lipsynket audio, 4–15 s, referencer @image1…) → QC-grid → ffmpeg-assembly (captions, 9:16) → B2B-leverance. Nøglebeslutninger der står ved magt: provider-adapter (fal → billig reseller ved volumen), dansk tale-eksperiment med ElevenLabs-fallback som første handling når fase B starter, unit economics ~3–44 kr./annonce afhængig af tier, salgspris 3.000–5.000 kr. pr. pakke. Fordelen ved den nye rækkefølge: fase A bygger 80 % af fundamentet (auth, jobs, providers, kreditter/betaling, storage), så fase B primært er pipeline-arbejde.
---
*Spec slut. Byg gate for gate — troskab før app, app før vækst, billeder før video.*
