# STATUS
Sidst opdateret: 2026-08-14 af cloud-session (S1 + S2)
## Nu
- Intet i gang. Næste opgave: S3 (provider-lag: ImageProvider + fal + mock, VideoProvider-interface)
## Senest færdigt
- 2026-08-14 branch `claude/ga-i-fang-og-beug-uxux-ha52r9`: projektdokumenter committet (HANDOFF, SPEC, STATUS, BACKLOG)
- 2026-08-14 samme branch, S1: scaffold — Next.js 15 App Router + TS strict + Tailwind, mappestruktur fra HANDOFF §3, netlify.toml, supabase config + første migration (profiles/items/item_photos/generations/presets/credit_ledger/guides, RLS på alle tabeller), .env.example, CI (lint+typecheck+test), copy-manifest-test på da.ts
- 2026-08-14 samme branch, S2: design — DESIGN.md, /lib/design/tokens.ts (eneste kilde), self-hostede OFL-skrifter (Bricolage Grotesque/Instrument Sans/Spline Sans Mono), basiskomponenter Button/Field/Card/Badge, WCAG-kontrasttest på tokens
## Blokeret / afventer ejer
- Ejerens hjemme-checkliste (HANDOFF §6): Supabase cloud-projekt + `supabase link`/`db push`, Netlify-site + env-vars, fal.ai-nøgle + Gate 1-test, Stripe testmode, Trigger.dev, Resend, domæne
- Verificér migrations lokalt med `supabase db reset` (kræver Docker — ikke muligt i cloud-sessionen)
## Beslutninger truffet undervejs
- 2026-08-14: Kreditsaldo gemmes IKKE som tal på profilen (SPEC §7 viser `users.credits`) — saldo er summen af credit_ledger via viewet `credit_balances`, jf. E-3's invariant. HANDOFF vinder ved konflikt.
- 2026-08-14: `users`-tabellen hedder `profiles` og spejler `auth.users` via trigger — Supabase Auth ejer selve brugeren.
- 2026-08-14: Palette udvidet med `ravDyb` (#9A6013): rav (#C97F1B) består ikke WCAG AA på kalk-baggrund, så pristal i normal størrelse bruger ravDyb; rav er reserveret til dekoration og stor display. Håndhævet i tests.
- 2026-08-14: ui-ux-pro-max' generiske forslag (blå marketplace-palette, Inter/Playfair) afvist med henvisning til manifestet §2.1.8/§2.1.9; strukturelle anbefalinger (flat, kontrast, fokus, touch-mål) beholdt. Se DESIGN.md §1.
- 2026-08-14: Signatur-element: "Sømmen" — stiplet tekstilsøm i rav som skillelinje i before/after og sektionsdeler. Se DESIGN.md §6.
