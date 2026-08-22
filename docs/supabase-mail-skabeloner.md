# Supabase mail-skabeloner — SKAL pege på /auth/confirm (token_hash)

Skrevet 22/8-2026 pga. "glemt adgangskode virker ikke".

## Hvorfor

PKCE-links (`{{ .ConfirmationURL }}`) virker KUN i den browser, der bad om
mailen (root cause 11). Åbnes nulstillings-mailen i en anden browser — fx
Gmail-appens indbyggede browser på telefonen — fejler kodevekslingen stumt,
og brugeren smides til /log-ind. Signup-mailen blev lagt om til
token_hash-flowet 21/8; **nulstillings-mailen skal lægges om på samme måde.**

Koden er gjort robust 22/8: `/auth/confirm` tager nu BÅDE `token_hash` og
PKCE-`?code`, og `type=recovery` lander altid på /ny-adgangskode. Men
på-tværs-af-browsere virker KUN med token_hash-linket herunder.

## Gør dette i dashboardet

Supabase → projekt `cpqsmtaledmjzirfeztp` → Authentication → Emails
(Templates):

**Reset Password** — linkets href skal være:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&videre=/ny-adgangskode
```

**Confirm signup** — (lagt om 21/8, tjek at den stadig er) :

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
```

**Change Email Address** — hvis/når den bruges:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change
```

## Tjek også

- Authentication → URL Configuration: **Site URL** = `https://selja.dk`, og
  redirect-allowlisten indeholder `https://selja.dk/auth/confirm` og
  `https://selja.dk/auth/callback` (gerne med `*`).
- Efter ændringen: kør TESTPLAN B3 — bed om nulstilling i én browser, åbn
  mail-linket i en ANDEN, og se at /ny-adgangskode åbner med formularen
  (ikke "linket er udløbet").
