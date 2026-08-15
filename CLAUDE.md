# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Read this first — the project law

**Fenja is the Next.js app in this repo** — a Danish product that helps people
sell their clothes faster on Vinted (photo pipeline, listing text, credits).
It is NOT the design toolkit under `.claude/skills/`; that toolkit is supporting
tooling only.

Before writing any code, read in this order:

1. `OVERLEVERING.md` — complete session handoff: where the project stands, next task
2. `HANDOFF.md` — the project bible; its rules win over any session's own ideas
   (incl. §2, the anti-AI-slop design manifest — a hard P0 requirement)
3. `STATUS.md` — living log; update it with every completed task
4. `SPEC.md` / `DESIGN.md` / `REDESIGN.md` — as needed

Conventions from the handoff: one task = one commit (conventional message),
all user-facing copy lives in `lib/copy/da.ts`, all colors/typography/spacing
derive from `lib/design/tokens.ts`, Danish UI language, no PR unless the owner
asks.

## Verify (no keys required — mocks are automatic)

```bash
npm install
npm run lint && npm run typecheck && npm test   # 77 unit tests
npm run build
```

Mobile screenshots: Playwright with the pre-installed Chromium
(`PLAYWRIGHT_BROWSERS_PATH`), viewport 390×844; always check
`document.documentElement.scrollWidth` at 320 px (poster typography must never
cause horizontal scroll). Marketing pages run keyless; app pages can be
screenshotted via a temporary auth-free preview route (delete before commit).

## The design toolkit (secondary)

`.claude/skills/` holds seven design skills (see `README.md`) used to support
design work. Skill scripts are invoked with project-relative paths, Python
stdlib only. Offline test suites:

```bash
python3 -m pytest .claude/skills/design-system/scripts/tests/ \
                  .claude/skills/brand/scripts/tests/ \
                  .claude/skills/ui-ux-pro-max/scripts/tests/test_text_layout_resilience.py \
                  .claude/skills/ui-ux-pro-max/scripts/tests/test_web_stack_freshness.py
```

Generated example output lives under `examples/` (incl. the toolkit showcase
page at `examples/landing/`, unrelated to the Fenja product site).

`__pycache__/`, `.pytest_cache/`, `node_modules/` and `.next/` are gitignored;
never commit caches or build output.
