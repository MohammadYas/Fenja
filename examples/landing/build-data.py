#!/usr/bin/env python3
"""Embed ui-ux-pro-max datasets into the landing page.

Reads data/colors.csv and data/typography.csv and rewrites the blocks between
the PALETTES/FONTS markers in index.html with compact JSON arrays. Standard
library only. Run from the repo root after updating the datasets:

  python3 examples/landing/build-data.py
"""

import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / ".claude/skills/ui-ux-pro-max/data"
PAGE = Path(__file__).parent / "index.html"

palettes = []
with (DATA / "colors.csv").open(newline="", encoding="utf-8") as fh:
    for row in csv.DictReader(fh):
        note = re.sub(r"\s*\[[^]]*\]", "", row["Notes"]).strip()
        palettes.append({
            "n": row["Product Type"],
            "t": note,
            "p": row["Primary"], "op": row["On Primary"],
            "s": row["Secondary"], "os": row["On Secondary"],
            "a": row["Accent"], "oa": row["On Accent"],
            "b": row["Background"], "f": row["Foreground"],
            "c": row["Card"], "cf": row["Card Foreground"],
            "m": row["Muted"], "mf": row["Muted Foreground"],
            "br": row["Border"],
            "d": row["Destructive"], "od": row["On Destructive"],
            "r": row["Ring"],
        })

fonts = []
with (DATA / "typography.csv").open(newline="", encoding="utf-8") as fh:
    for row in csv.DictReader(fh):
        fonts.append({
            "n": row["Font Pairing Name"],
            "c": row["Category"],
            "h": row["Heading Font"],
            "b": row["Body Font"],
            "k": row["Mood/Style Keywords"],
            "u": row["Best For"],
            "g": row["Google Fonts URL"],
        })

styles = []
with (DATA / "styles.csv").open(newline="", encoding="utf-8") as fh:
    for row in csv.DictReader(fh):
        if row.get("Status", "active").strip().lower() not in ("", "active"):
            continue
        styles.append({
            "n": row["Style Category"],
            "k": row["Keywords"],
            "u": row["Best For"][:130],
            "x": row["Do Not Use For"][:110],
            "e": row["Effects & Animation"][:110],
        })

ux = []
with (DATA / "ux-guidelines.csv").open(newline="", encoding="utf-8") as fh:
    for row in csv.DictReader(fh):
        ux.append({
            "c": row["Category"],
            "i": row["Issue"],
            "p": row["Platform"],
            "d": row["Description"][:160],
            "y": row["Do"][:160],
            "x": row["Don't"][:160],
            "s": row["Severity"],
        })

charts = []
with (DATA / "charts.csv").open(newline="", encoding="utf-8") as fh:
    for row in csv.DictReader(fh):
        charts.append({
            "n": row["Best Chart Type"],
            "t": row["Data Type"],
            "k": row["Keywords"],
            "w": row["When to Use"][:120],
            "l": row["Library Recommendation"].split(";")[0][:60],
            "a": row["Accessibility Risk"].replace("risk:", ""),
        })

landing = []
with (DATA / "landing.csv").open(newline="", encoding="utf-8") as fh:
    for row in csv.DictReader(fh):
        landing.append({
            "n": row["Pattern Name"],
            "k": row["Keywords"],
            "o": row["Section Order"],
            "c": row["Primary CTA Placement"][:60],
        })

html = PAGE.read_text(encoding="utf-8")
for tag, data in (("palettes", palettes), ("fonts", fonts), ("styles", styles),
                  ("ux", ux), ("charts", charts), ("landing", landing)):
    payload = json.dumps(data, separators=(",", ":"), ensure_ascii=False)
    block = f"/*<{tag}>*/const {tag.upper()}={payload};/*</{tag}>*/"
    pattern = rf"/\*<{tag}>\*/.*?/\*</{tag}>\*/"
    if not re.search(pattern, html, flags=re.S):
        raise SystemExit(f"error: {tag} markers not found in index.html")
    html = re.sub(pattern, lambda _: block, html, count=1, flags=re.S)
    print(f"embedded {len(data)} {tag} ({len(payload)//1024} KB)")
PAGE.write_text(html, encoding="utf-8")
print(f"wrote {PAGE.relative_to(ROOT)}")
