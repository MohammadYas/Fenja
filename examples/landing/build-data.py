#!/usr/bin/env python3
"""Embed the ui-ux-pro-max palette dataset into the landing page.

Reads data/colors.csv and rewrites the block between the PALETTES markers in
index.html with a compact JSON array. Standard library only. Run from the repo
root after updating the dataset:

  python3 examples/landing/build-data.py
"""

import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CSV = ROOT / ".claude/skills/ui-ux-pro-max/data/colors.csv"
PAGE = Path(__file__).parent / "index.html"

rows = []
with CSV.open(newline="", encoding="utf-8") as fh:
    for row in csv.DictReader(fh):
        note = re.sub(r"\s*\[[^]]*\]", "", row["Notes"]).strip()
        rows.append({
            "n": row["Product Type"],
            "t": note,
            "p": row["Primary"], "op": row["On Primary"],
            "a": row["Accent"], "oa": row["On Accent"],
            "b": row["Background"], "f": row["Foreground"],
            "c": row["Card"], "cf": row["Card Foreground"],
            "m": row["Muted"], "mf": row["Muted Foreground"],
            "br": row["Border"],
        })

payload = json.dumps(rows, separators=(",", ":"), ensure_ascii=False)
block = f"/*<palettes>*/const PALETTES={payload};/*</palettes>*/"

html = PAGE.read_text(encoding="utf-8")
new = re.sub(r"/\*<palettes>\*/.*?/\*</palettes>\*/", lambda _: block, html, count=1, flags=re.S)
if new == html and block not in html:
    raise SystemExit("error: palette markers not found in index.html")
PAGE.write_text(new, encoding="utf-8")
print(f"embedded {len(rows)} palettes ({len(payload)//1024} KB) into {PAGE.relative_to(ROOT)}")
