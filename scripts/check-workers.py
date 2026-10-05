#!/usr/bin/env python3
"""Verify the assets-only Workers deployment contract without deploying."""
from __future__ import annotations

import json
import os
import re
import runpy
import stat
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WRANGLER_VERSION = "4.131.1"
SITE_BASE_URL = "https://portfolio.example.workers.dev/"


def load_json(path: Path) -> dict:
    value = json.loads(path.read_text(encoding="utf-8"))
    assert isinstance(value, dict), f"Expected an object in {path.name}"
    return value


def tree_digest(path: Path) -> list[tuple[str, int, bytes]] | None:
    if not path.exists():
        return None
    return [
        (str(item.relative_to(path)), stat.S_IMODE(item.stat().st_mode), item.read_bytes())
        for item in sorted(path.rglob("*"))
        if item.is_file()
    ]


def main() -> None:
    config = load_json(ROOT / "wrangler.jsonc")
    assert config == {
        "$schema": "./node_modules/wrangler/config-schema.json",
        "name": "portfolio",
        "compatibility_date": "2026-09-13",
        "workers_dev": True,
        "preview_urls": True,
        "assets": {
            "directory": "./public",
            "not_found_handling": "404-page",
            "html_handling": "auto-trailing-slash",
        },
    }, "wrangler.jsonc must remain an assets-only Worker configuration"
    assert not ({"main", "routes", "route", "vars"} & config.keys())
    assert "binding" not in config["assets"]

    package = load_json(ROOT / "package.json")
    assert package == {
        "name": "portfolio",
        "private": True,
        "scripts": {
            "build": "./scripts/build-cloudflare.sh",
            "deploy": "wrangler deploy",
            "preview": "wrangler versions upload",
            "verify": "./scripts/verify.sh",
        },
        "devDependencies": {"wrangler": WRANGLER_VERSION},
        "overrides": {"undici": "7.29.1"},
    }, "package.json differs from the reviewed Workers toolchain"

    lock = load_json(ROOT / "package-lock.json")
    assert lock.get("lockfileVersion") == 3
    assert lock["packages"][""]["devDependencies"] == {"wrangler": WRANGLER_VERSION}
    assert lock["packages"]["node_modules/wrangler"]["version"] == WRANGLER_VERSION
    undici_versions = {value["version"] for name, value in lock["packages"].items() if name.endswith("node_modules/undici")}
    assert undici_versions == {"7.29.1"}, "Keep the reviewed undici security patch"

    build_script = ROOT / "scripts/build-cloudflare.sh"
    assert os.access(build_script, os.X_OK), "build-cloudflare.sh must be executable"
    script_text = build_script.read_text(encoding="utf-8")
    assert "CF_PAGES_" not in script_text, "Pages-only variables remain in the build script"
    assert "SITE_BASE_URL" in script_text

    public_before = tree_digest(ROOT / "public")
    resources_before = tree_digest(ROOT / "resources")
    lock_path = ROOT / ".hugo_build.lock"
    lock_before = lock_path.read_bytes() if lock_path.exists() else None
    contract = runpy.run_path(ROOT / "scripts/check-site.py")
    copy_source = runpy.run_path(ROOT / "scripts/copy-source.py")["copy_source"]
    with tempfile.TemporaryDirectory(prefix="mihassan-workers-build-") as temp:
        source = Path(temp) / "source"
        copy_source(source)
        destination = Path(temp) / "public"
        environment = os.environ.copy()
        environment.pop("SITE_BASE_URL", None)
        environment["HUGO_DESTINATION"] = str(destination)
        missing_url = subprocess.run(
            [str(source / "scripts/build-cloudflare.sh")], cwd=source,
            env=environment, text=True, capture_output=True,
        )
        assert missing_url.returncode != 0 and "SITE_BASE_URL" in missing_url.stderr
        assert not destination.exists(), "Build ran without an explicit canonical URL"
        environment["SITE_BASE_URL"] = SITE_BASE_URL
        for branch in ("main", "preview-check"):
            environment["WORKERS_CI_BRANCH"] = branch
            result = subprocess.run(
                [str(source / "scripts/build-cloudflare.sh")], cwd=source,
                env=environment, text=True, capture_output=True,
            )
            print(result.stdout + result.stderr, end="")
            assert result.returncode == 0 and "WARN" not in result.stdout + result.stderr
            assert len(list(destination.rglob("*.html"))) == len(contract["ROUTES"]) + 1
            for route in contract["ROUTES"]:
                html = contract["route_file"](destination, route).read_text(encoding="utf-8")
                canonical = re.search(r"<link rel=canonical href=([^ >]+)", html)
                assert canonical and canonical.group(1) == SITE_BASE_URL + route.lstrip("/"), route
            for slug in contract["POEMS"]:
                document = contract["Document"]()
                document.feed((destination / "poems" / slug / "index.html").read_text())
                body = (source / "content/poems" / f"{slug}.md").read_text().split("---", 2)[2]
                expected = [stanza.splitlines() for stanza in body.strip().split("\n\n")]
                assert document.poem_stanzas == expected, f"{slug}: minification changed the verse"
            assert (destination / "404.html").is_file()
        print("PASS: production/preview canonicals, missing-URL rejection and minified poem text")

    assert tree_digest(ROOT / "public") == public_before, "Worker check modified source/public"
    assert tree_digest(ROOT / "resources") == resources_before, "Worker check modified source/resources"
    assert (lock_path.read_bytes() if lock_path.exists() else None) == lock_before, "Worker check modified source lock"
    print(f"PASS: assets-only Worker contract and Hugo build with Wrangler {WRANGLER_VERSION}")


if __name__ == "__main__":
    main()
