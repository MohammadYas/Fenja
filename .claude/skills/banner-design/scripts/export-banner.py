#!/usr/bin/env python3
"""Export an HTML banner to PNG at exact pixel dimensions using headless Chromium.

Standard library only — shells out to a Chromium/Chrome binary. The binary is
located via --chrome, the CHROME_BIN environment variable, PLAYWRIGHT_BROWSERS_PATH,
or common install names, in that order.

Usage:
  python3 export-banner.py --input banner.html --width 1500 --height 500 \
      --output assets/banners/campaign/minimalist-1500x500.png
  python3 export-banner.py --url http://localhost:8765/banner.html \
      --width 820 --height 312 --output fb-cover.png --scale 2
"""

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def find_chrome(explicit=None):
    """Return a usable browser binary, preferring headless_shell.

    headless_shell maps --window-size directly to the viewport; full Chrome in
    new-headless mode reserves UI height inside the window, which would leave a
    blank strip at the bottom of exact-size exports.
    """
    candidates = []
    if explicit:
        candidates.append(explicit)
    if os.environ.get("CHROME_BIN"):
        candidates.append(os.environ["CHROME_BIN"])
    pw_root = os.environ.get("PLAYWRIGHT_BROWSERS_PATH")
    if pw_root:
        root = Path(pw_root)
        for pattern in ("chromium_headless_shell-*/chrome-linux/headless_shell",
                        "chromium-*/chrome-linux/chrome"):
            candidates.extend(sorted(root.glob(pattern), reverse=True))
        candidates.append(root / "chromium")
    for name in ("chromium", "chromium-browser", "google-chrome",
                 "google-chrome-stable", "chrome"):
        found = shutil.which(name)
        if found:
            candidates.append(found)
    for candidate in candidates:
        path = Path(candidate)
        if path.is_file() and os.access(path, os.X_OK):
            return str(path)
    return None


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--input", help="Path to a local HTML file")
    source.add_argument("--url", help="URL to capture (e.g. a local dev server)")
    parser.add_argument("--width", type=int, required=True, help="Viewport width in px")
    parser.add_argument("--height", type=int, required=True, help="Viewport height in px")
    parser.add_argument("--output", required=True, help="Output PNG path")
    parser.add_argument("--scale", type=int, default=1,
                        help="Device scale factor (2 = retina export at 2x pixels)")
    parser.add_argument("--chrome", help="Explicit path to a Chromium/Chrome binary")
    parser.add_argument("--timeout", type=int, default=60,
                        help="Maximum seconds to wait for the capture")
    args = parser.parse_args()

    chrome = find_chrome(args.chrome)
    if not chrome:
        sys.exit("error: no Chromium/Chrome binary found. Pass --chrome or set CHROME_BIN.")

    if args.input:
        html = Path(args.input)
        if not html.is_file():
            sys.exit(f"error: input file not found: {html}")
        target = html.resolve().as_uri()
    else:
        target = args.url

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="banner-export-") as profile:
        cmd = [
            chrome,
            "--no-sandbox",
            "--disable-gpu",
            "--hide-scrollbars",
            f"--user-data-dir={profile}",
            f"--window-size={args.width},{args.height}",
            f"--force-device-scale-factor={args.scale}",
            f"--screenshot={output.resolve()}",
            "--virtual-time-budget=5000",
            target,
        ]
        if "headless_shell" not in Path(chrome).name:
            cmd.insert(1, "--headless=new")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=args.timeout)

    if result.returncode != 0 or not output.is_file():
        sys.stderr.write(result.stderr)
        sys.exit(f"error: screenshot failed (exit {result.returncode})")

    size_kb = output.stat().st_size / 1024
    print(f"exported {output} ({args.width}x{args.height} @{args.scale}x, {size_kb:.0f} KB)")


if __name__ == "__main__":
    main()
