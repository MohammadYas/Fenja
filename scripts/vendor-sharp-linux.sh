#!/usr/bin/env bash
# Lægger sharps linux-binærer i node_modules ved siden af win32-binaren, så
# en LOKAL `netlify deploy --build` fra Windows producerer et bundle der kan
# køre på Netlifys linux-lambdaer. Uden dem dør alle sharp-ruter ved load
# (fundet 21/8: /api/items → 500 på hver oprettelse).
#
# SKAL køres igen efter `npm install` — npm fjerner fremmede platform-pakker.
# Bliver overflødig den dag Netlify-sitet er git-koblet og bygger i skyen.
set -euo pipefail

ROD="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(node -e "console.log(JSON.parse(require('fs').readFileSync('$ROD/node_modules/sharp/package.json')).version)")"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
cd "$TMP"

npm pack "@img/sharp-linux-x64@$VERSION" --silent
LIBVIPS="$(tar -xzOf img-sharp-linux-x64-*.tgz package/package.json | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(Object.values(JSON.parse(d).optionalDependencies)[0]))")"
npm pack "@img/sharp-libvips-linux-x64@$LIBVIPS" --silent

for pakke in sharp-linux-x64 sharp-libvips-linux-x64; do
  mkdir -p "$ROD/node_modules/@img/$pakke"
  tar -xzf img-$pakke-*.tgz
  cp -r package/* "$ROD/node_modules/@img/$pakke/"
  rm -rf package
done

echo "OK: linux-binærer på plads ($(ls "$ROD/node_modules/@img" | tr '\n' ' '))"
