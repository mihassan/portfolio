#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
WRANGLER_PATH=${WRANGLER_PATH:-"$ROOT/node_modules/.bin/wrangler"}
[ -x "$WRANGLER_PATH" ] || { echo "Run npm ci or set WRANGLER_PATH" >&2; exit 1; }
WRANGLER_PATH=$(python3 -c 'from pathlib import Path; import sys; print(Path(sys.argv[1]).resolve())' "$WRANGLER_PATH")
export WRANGLER_PATH

TEMP=$(mktemp -d "${TMPDIR:-/tmp}/portfolio-verify.XXXXXX")
trap 'rm -rf -- "$TEMP"' EXIT HUP INT TERM
python3 "$ROOT/scripts/copy-source.py" "$TEMP/source"
cd "$TEMP/source"

./scripts/check-site.py
./scripts/check-workers.py
node --check scripts/browser-smoke.mjs
node scripts/browser-smoke.mjs
./scripts/workers-smoke.sh
