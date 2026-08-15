# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this repository is

Fenja is a Claude Code design toolkit: seven design skills installed under `.claude/skills/` (see `README.md` for the full index). There is no application code — the skills, their scripts, and their datasets are the product.

## Conventions

- Skill scripts are invoked with **project-relative paths** from the repo root, e.g. `python3 .claude/skills/ui-ux-pro-max/scripts/search.py ...` — never `~/.claude/...`.
- Python scripts use the standard library only, except AI generation in the `design` skill which needs `google-genai` + `pillow` and a `GEMINI_API_KEY`.
- Node `.cjs` scripts (`brand`, `design-system`) expect a project with `docs/brand-guidelines.md` and `assets/design-tokens.json`; they are consumed by projects that adopt this toolkit, not by this repo itself.
- Generated example output lives under `examples/` (e.g. `examples/design-system/fenja/MASTER.md`). Do not write generated artifacts to the repo root.
- `__pycache__/` and `.pytest_cache/` are gitignored; never commit bytecode caches.

## Testing

Run the offline test suites before committing changes to skill scripts:

```bash
python3 -m pytest .claude/skills/design-system/scripts/tests/ \
                  .claude/skills/brand/scripts/tests/ \
                  .claude/skills/ui-ux-pro-max/scripts/tests/test_text_layout_resilience.py \
                  .claude/skills/ui-ux-pro-max/scripts/tests/test_web_stack_freshness.py
```

`test_catalog_refresh.py` and `test_relevance_evaluator.py` require upstream maintenance scripts that are not shipped here — they cannot run in this repo and that is expected.

Quick smoke tests:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "fintech dashboard" --design-system
python3 .claude/skills/design/scripts/logo/search.py "tech modern" --domain style
python3 .claude/skills/design-system/scripts/search-slides.py "investor pitch"
```

## Self-contained workflows

The `banner-design` and `design` skills are self-contained: HTML→PNG export uses the bundled `.claude/skills/banner-design/scripts/export-banner.py` (standard library; shells out to a local Chromium/Chrome, auto-detected via `PLAYWRIGHT_BROWSERS_PATH`/`CHROME_BIN`). AI image generation remains optional and requires `GEMINI_API_KEY`.
