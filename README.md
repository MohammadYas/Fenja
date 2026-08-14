# Fenja

Claude Code design toolkit: a curated suite of seven design skills installed under `.claude/skills/`. Together they cover the full path from brand identity to shipped UI — tokens, styling, presentations, banners, logos, and UI/UX intelligence.

## Installed skills

| Skill | Purpose |
|-------|---------|
| [`ui-ux-pro-max`](.claude/skills/ui-ux-pro-max/SKILL.md) | UI/UX design intelligence with a searchable local dataset: 79 styles, 192 product palettes, 74 font pairings, 119 UX guidelines, 105 icons, 25 chart types, 22 stack guides. Generates complete design systems via `scripts/search.py --design-system`. |
| [`design`](.claude/skills/design/SKILL.md) | Umbrella skill that routes design tasks. Built-in modules for logo generation (55 styles), corporate identity programs (50 deliverables), slides, banners, SVG icons, and social photos. AI generation requires `GEMINI_API_KEY`. |
| [`brand`](.claude/skills/brand/SKILL.md) | Brand voice, visual identity, messaging frameworks, and consistency audits. Syncs `docs/brand-guidelines.md` to design tokens via Node scripts. |
| [`design-system`](.claude/skills/design-system/SKILL.md) | Three-layer token architecture (primitive → semantic → component), CSS variable generation, token validation, and a slide decision system driven by CSV data. |
| [`ui-styling`](.claude/skills/ui-styling/SKILL.md) | shadcn/ui + Tailwind CSS implementation guidance: components, theming, dark mode, accessibility, and responsive patterns. |
| [`slides`](.claude/skills/slides/SKILL.md) | Strategic HTML presentations with Chart.js, layout patterns, and copywriting formulas. |
| [`banner-design`](.claude/skills/banner-design/SKILL.md) | Banners for social media, ads, website heroes, and print — 22 art direction styles with exact platform dimensions. |

## How the skills fit together

```
brand ──────────► design-system ──────────► ui-styling
(identity)        (tokens, specs)           (shadcn/ui + Tailwind code)
    │                   │
    │                   └────► slides (token-compliant presentations)
    │
    └────► design ─► logo / CIP / icons / banners / social photos
                        ▲
ui-ux-pro-max ──────────┘  (style, palette, typography and UX guidance for everything)
```

Typical flows:

- **New design system:** `brand` (define identity) → `design-system` (tokens) → `ui-styling` (implement).
- **New page or product UI:** `ui-ux-pro-max` `--design-system` search → build with `ui-styling`.
- **Brand package:** `design` logo generation → CIP mockups → pitch deck via `slides`.

## Prerequisites

- **Python 3** (standard library only) for the search and generation scripts in `ui-ux-pro-max`, `design`, `design-system`, and `ui-styling`. On Windows use `python` instead of `python3`.
- **Node.js** for the token and brand sync scripts (`.cjs`) in `brand` and `design-system`.
- **`GEMINI_API_KEY`** (optional) only for AI image generation in the `design` skill: `pip install google-genai pillow`.

Some optional workflow steps in `banner-design` and `design` reference companion skills that are not part of this repository (`frontend-design`, `ai-artist`, `ai-multimodal`, `chrome-devtools`, `assets-organizing`). The core workflows work without them.

## Verifying the installation

The bundled test suites run offline:

```bash
pip install pytest
python3 -m pytest .claude/skills/design-system/scripts/tests/ \
                  .claude/skills/brand/scripts/tests/ \
                  .claude/skills/ui-ux-pro-max/scripts/tests/test_text_layout_resilience.py \
                  .claude/skills/ui-ux-pro-max/scripts/tests/test_web_stack_freshness.py
```

Quick smoke test of the design-system generator:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "fintech dashboard" --design-system
```

Note: `test_catalog_refresh.py` and `test_relevance_evaluator.py` in `ui-ux-pro-max` are upstream maintenance tests that require refresh scripts not shipped with the installed skill; they are expected to be skipped here.
