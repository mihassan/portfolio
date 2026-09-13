#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"

./scripts/check-site.py
node --check scripts/browser-smoke.mjs
node scripts/browser-smoke.mjs
