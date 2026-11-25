#!/bin/sh
# Pulls the heavy showroom assets (car models + textures) from the live objets.art
# deploy into objets-art/cars so the showroom runs locally. Static drop, no build.
# objets.art forwards to the Netlify host below.
set -e
HOST="${OBJETS_HOST:-https://enchanting-lily-504d5a.netlify.app}"
DIR="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$DIR/cars"
cd "$DIR/cars"
for k in aurora beast harvest plasmatic sleigh stardrift; do
  curl -fsS -o "$k.json" "$HOST/cars/$k.json"
  for f in $(node -e "const g=require('./$k.json');console.log([...g.images.map(i=>i.uri),...g.buffers.map(b=>b.uri)].join(' '))"); do
    [ -s "$f" ] || curl -fsS -o "$f" "$HOST/cars/$f"
  done
  echo "ok $k"
done
