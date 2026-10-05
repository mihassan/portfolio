#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
WRANGLER=${WRANGLER_PATH:-"$ROOT/node_modules/.bin/wrangler"}
[ -x "$WRANGLER" ] || {
    echo "Wrangler not found; run npm ci or set WRANGLER_PATH" >&2
    exit 1
}
WRANGLER=$(python3 -c 'from pathlib import Path; import sys; print(Path(sys.argv[1]).resolve())' "$WRANGLER")

TEMP=$(mktemp -d "${TMPDIR:-/tmp}/mihassan-workers-smoke.XXXXXX")
SERVER_PID=
cleanup() {
    if [ -n "$SERVER_PID" ]; then
        kill "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
    rm -rf -- "$TEMP"
}
trap cleanup EXIT HUP INT TERM

PORT=${WORKERS_TEST_PORT:-$(python3 - <<'PY'
import socket
with socket.socket() as server:
    server.bind(("127.0.0.1", 0))
    print(server.getsockname()[1])
PY
)}
BASE_URL="http://127.0.0.1:$PORT"

python3 "$ROOT/scripts/copy-source.py" "$TEMP/source"
(
    cd "$TEMP/source"
    SITE_BASE_URL="$BASE_URL/" HUGO_DESTINATION="$TEMP/public" ./scripts/build-cloudflare.sh
)
cp "$ROOT/wrangler.jsonc" "$TEMP/wrangler.jsonc"
(
    cd "$TEMP"
    exec env WRANGLER_SEND_METRICS=false "$WRANGLER" dev \
        --config "$TEMP/wrangler.jsonc" \
        --ip 127.0.0.1 \
        --port "$PORT" \
        --local \
        --show-interactive-dev-session=false
) >"$TEMP/wrangler.log" 2>&1 &
SERVER_PID=$!

python3 - "$ROOT" "$BASE_URL" "$TEMP/wrangler.log" <<'PY'
import runpy
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

root, base_url, log_path = Path(sys.argv[1]), sys.argv[2], Path(sys.argv[3])
contract = runpy.run_path(root / "scripts/check-site.py")
routes = contract["ROUTES"]

def fetch(path: str) -> tuple[int, bytes]:
    try:
        with urllib.request.urlopen(base_url + path, timeout=10) as response:
            return response.status, response.read()
    except urllib.error.HTTPError as error:
        return error.code, error.read()

for _ in range(120):
    try:
        status, _ = fetch("/")
        if status == 200:
            break
    except (OSError, urllib.error.URLError):
        pass
    time.sleep(0.25)
else:
    raise AssertionError("wrangler dev did not become ready\n" + log_path.read_text(errors="replace"))

for route in routes:
    status, body = fetch(route)
    assert status == 200, (route, status)
    assert b"Md Imrul Hassan" in body, route

for asset in sorted(contract["REQUIRED_ASSETS"] | {"/css/style.css", "/js/site.js"}):
    status, body = fetch(asset)
    assert status == 200 and body, (asset, status)

status, body = fetch("/definitely-not-a-portfolio-route/")
assert status == 404, status
assert b"This trail ends here." in body
print(f"PASS: Workers served {len(routes)} routes, required assets, and the designed 404")
PY
