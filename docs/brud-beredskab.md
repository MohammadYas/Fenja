# Brud på persondatasikkerheden · beredskab

GDPR art. 33: et brud skal anmeldes til Datatilsynet **inden 72 timer**, efter
du er blevet opmærksom på det — også selvom du ikke har alle detaljer endnu.
Art. 34: er risikoen høj for de berørte, skal de også have direkte besked.

Denne side er hele planen. Den skal kunne følges klokken to om natten.

## Hvad tæller som et brud

Ikke kun hackerangreb. Også: en fejl der viser én brugers billeder til en
anden, en service-nøgle der havner et forkert sted (repo, chat, log), en
utilsigtet sletning uden backup, en fejlsendt mail med persondata, eller en
leverandør der melder om brud hos sig (Supabase, Stripe, Resend, Netlify …).

## Sådan opdages det

- Supabase: log ind på projektet og se logs/alerts (`cpqsmtaledmjzirfeztp`).
- Netlify og Trigger.dev: fejl- og kørselslogs.
- Admin-siden `/admin`: uventet forbrug kan være misbrug af en konto.
- Henvendelser fra brugere ("jeg kan se en andens annonce").
- Leverandørmails om sikkerhedshændelser — læs dem, arkivér dem ikke ulæst.

## Trin, når mistanken er der

1. **Skriv tidspunktet ned.** 72-timersfristen løber fra det øjeblik, du
   forstår, at der nok er sket et brud. Notér også hvordan du fik det at vide.
2. **Stop blødningen.** Roter nøgler (Supabase service-nøgle, Stripe, Resend,
   provider-nøgler), luk den fejlende funktion, sæt evt. budgetloftet til 0 som
   kill-switch.
3. **Afgræns.** Hvilke data, hvor mange personer, hvilken periode? Kig i
   Supabase-logs og i `generations`/`items` — ikke gæt.
4. **Vurdér risikoen.** Billeder af tøj og en e-mail er lav risiko; en
   adgangskodelæk eller billeder koblet til navn og adresse er høj.
5. **Anmeld inden 72 timer**, hvis det ikke er "usandsynligt", at brugerne
   påvirkes: virk.dk → Datatilsynets anmeldelsesformular. Har du ikke alle
   svar, så anmeld alligevel og eftersend.
6. **Varsl brugerne**, hvis risikoen er høj: klar besked på dansk om hvad der
   skete, hvad de bør gøre (fx skifte adgangskode), og hvor de kan spørge.
7. **Skriv det ned bagefter** — også de brud, der ikke anmeldes. Art. 33, stk.
   5 kræver en intern log: hvad skete, hvorfor, hvad blev gjort. Læg noten i
   `docs/` med dato i filnavnet.

## Roller

Ejeren er både opdager, beslutningstager og anmelder — der er ikke andre. Er
ejeren utilgængelig, gælder trin 2 (stop blødningen) frem for alt andet;
anmeldelsen kan følge, så snart fristen kan nås.

## Kontakter

| Hvem | Hvor |
|---|---|
| Datatilsynet | datatilsynet.dk · anmeldelse via virk.dk |
| Supabase support | dashboardet for projekt `cpqsmtaledmjzirfeztp` |
| Stripe support | dashboardet |
| Berørte brugere | e-mail via Resend (skabelon skrives, når behovet opstår) |
