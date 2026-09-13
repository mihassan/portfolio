#!/usr/bin/env python3
"""Build and statically verify the portfolio without third-party packages."""
from __future__ import annotations

import hashlib
import json
import re
import shutil
import struct
import subprocess
import tempfile
import urllib.parse
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROUTES = [
    "/",
    "/work/",
    "/work/bananagram-solver/",
    "/work/calendar-puzzle/",
    "/work/phonetiq/",
    "/work/qless-solver/",
    "/work/qibla-direction/",
    "/work/advent-of-code/",
    "/work/haskell-on-cloud-run/",
    "/work/crystal-cave/",
    "/work/ozbloom/",
    "/work/barebone-fsm/",
    "/notes/",
    "/notes/directing-ai-assisted-project/",
    "/notes/three-word-grid-solvers/",
    "/notes/short-utterance-speech-recognition/",
    "/research/",
    "/creative/",
    "/about/",
    "/career/",
    "/elsewhere/",
    "/poems/",
    "/poems/jirno-sriti/",
    "/poems/bedonar-rong/",
]
REQUIRED_ASSETS = {
    "/favicon.ico", "/apple-touch-icon.png",
    "/images/portfolio/favicon.svg", "/images/portfolio/favicon-32x32.png",
    "/images/portfolio/mark.svg", "/images/portfolio/hero-abstract.svg",
    "/images/portfolio/social-card.png", "/images/portfolio/social-card.svg",
    "/images/portfolio/projects/bananagram.svg",
    "/images/portfolio/projects/calendar-puzzle.svg",
    "/images/portfolio/projects/advent-of-code.svg",
    "/images/portfolio/projects/haskell-cloud-run.svg",
    "/images/portfolio/projects/crystal-cave.svg",
}


class Document(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.refs: list[tuple[str, str]] = []
        self.ids: set[str] = set()
        self.images: list[dict[str, str]] = []
        self.external_blanks: list[dict[str, str]] = []
        self.h1_count = 0
        self.primary_links: list[tuple[str, str | None]] = []
        self.featured_project_slugs: list[str] = []
        self.work_project_slugs: list[str] = []
        self.note_entry_slugs: list[str] = []
        self._primary_depth = 0

    def handle_starttag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        attrs = {key: value or "" for key, value in attrs_list}
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if attrs.get("data-project-slug"):
            self.featured_project_slugs.append(attrs["data-project-slug"])
        if attrs.get("data-work-project"):
            self.work_project_slugs.append(attrs["data-work-project"])
        if attrs.get("data-note-entry"):
            self.note_entry_slugs.append(attrs["data-note-entry"])
        if tag == "nav" and attrs.get("aria-label") == "Primary":
            self._primary_depth = 1
        elif self._primary_depth:
            self._primary_depth += 1
        if tag == "h1":
            self.h1_count += 1
        attr = {"a": "href", "link": "href", "img": "src", "script": "src"}.get(tag)
        if attr and attrs.get(attr):
            self.refs.append((tag, attrs[attr]))
        if tag == "img":
            self.images.append(attrs)
        if tag == "a":
            if self._primary_depth:
                self.primary_links.append((attrs.get("href", ""), attrs.get("aria-current") or None))
            if attrs.get("target") == "_blank":
                self.external_blanks.append(attrs)

    def handle_endtag(self, tag: str) -> None:
        if self._primary_depth:
            self._primary_depth -= 1


def route_file(build: Path, route: str) -> Path:
    if route == "/":
        return build / "index.html"
    if route.endswith(".html"):
        return build / route.lstrip("/")
    return build / route.lstrip("/") / "index.html"


def png_size(path: Path) -> tuple[int, int]:
    data = path.read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", f"Bad PNG signature: {path}"
    return struct.unpack(">II", data[16:24])


def check_ico(path: Path) -> list[int]:
    data = path.read_bytes()
    reserved, image_type, count = struct.unpack_from("<HHH", data)
    assert (reserved, image_type, count) == (0, 1, 3), "favicon.ico must contain three real icon entries"
    sizes = []
    for index in range(count):
        width, height, _, _, planes, bits, length, offset = struct.unpack_from("<BBBBHHII", data, 6 + index * 16)
        width = width or 256
        height = height or 256
        assert width == height and planes == 1 and bits == 32
        payload = data[offset:offset + length]
        assert payload.startswith(b"\x89PNG\r\n\x1a\n")
        sizes.append(width)
    return sizes


def main() -> None:
    version = subprocess.run(["hugo", "version"], cwd=ROOT, check=True, text=True, capture_output=True).stdout.strip()
    pinned = (ROOT / ".hugo-version").read_text().strip()
    match = re.search(r"hugo v([0-9.]+)", version)
    assert match and match.group(1) == pinned, f"Expected Hugo {pinned}, got {version}"
    with tempfile.TemporaryDirectory(prefix="mihassan-build-") as temp:
        build = Path(temp)
        result = subprocess.run(
            ["hugo", "--source", str(ROOT), "--destination", str(build), "--cleanDestinationDir", "--printPathWarnings"],
            cwd=ROOT, text=True, capture_output=True,
        )
        print(result.stdout, end="")
        if result.stderr:
            print(result.stderr, end="")
        assert result.returncode == 0, "Hugo build failed"
        assert "WARN" not in result.stdout + result.stderr, "Hugo emitted warnings"

        html_files = sorted(build.rglob("*.html"))
        assert len(html_files) == 25, f"Expected 24 content routes + 404, got {len(html_files)} HTML files"
        assert not (build / "categories").exists() and not (build / "tags").exists(), "Empty taxonomies were generated"
        for route in ROUTES + ["/404.html"]:
            assert route_file(build, route).is_file(), f"Missing route: {route}"
        for asset in REQUIRED_ASSETS:
            assert (build / asset.lstrip("/")).is_file(), f"Missing asset: {asset}"

        documents: dict[str, Document] = {}
        texts: dict[str, str] = {}
        for path in html_files:
            route = "/404.html" if path.name == "404.html" else "/" + str(path.parent.relative_to(build)).strip(".") + "/"
            if route == "//":
                route = "/"
            text = path.read_text(encoding="utf-8")
            doc = Document()
            doc.feed(text)
            documents[route] = doc
            texts[route] = text
            assert doc.h1_count == 1, f"{route}: expected one h1, got {doc.h1_count}"
            assert "Md Imrul Hassan" in text, f"{route}: full-name branding missing"
            assert "honorificPrefix" not in text, f"{route}: Md incorrectly modelled as honorific"
            assert "personality-atlas" not in text and "monogram.svg" not in text, f"{route}: retired identity still referenced"
            assert "data-reveal" not in text, f"{route}: content visibility still tied to reveal JS"
            assert 'name="description"' in text and 'rel="canonical"' in text, f"{route}: metadata incomplete"
            assert 'property="og:image"' in text, f"{route}: social image missing"
            for image in doc.images:
                assert "alt" in image, f"{route}: image missing alt attribute"
                assert image.get("width") and image.get("height"), f"{route}: image missing intrinsic dimensions: {image.get('src')}"
            for anchor in doc.external_blanks:
                rel = set(anchor.get("rel", "").split())
                assert {"noopener", "noreferrer"}.issubset(rel), f"{route}: unsafe target=_blank link: {anchor.get('href')}"
            assert len(doc.primary_links) == 6, f"{route}: expected six primary links, got {len(doc.primary_links)}"
            assert len({href for href, _ in doc.primary_links}) == 6, f"{route}: duplicate primary nav destination"
            if route != "/404.html":
                current_count = sum(current == "page" for _, current in doc.primary_links)
                expected_current = 0 if route.startswith("/notes/") else 1
                assert current_count == expected_current, (
                    f"{route}: expected {expected_current} current primary destinations, got {current_count}"
                )

        for source_route, doc in documents.items():
            for tag, raw in doc.refs:
                parsed = urllib.parse.urlparse(raw)
                if parsed.scheme in {"mailto", "tel", "data", "javascript"}:
                    continue
                if parsed.scheme in {"http", "https"} and parsed.netloc not in {"mihassan.com", "www.mihassan.com"}:
                    continue
                if parsed.scheme and parsed.scheme not in {"http", "https"}:
                    continue
                local = urllib.parse.urljoin(f"https://mihassan.com{source_route}", raw)
                target = urllib.parse.urlparse(local)
                path = urllib.parse.unquote(target.path)
                candidate = build / path.lstrip("/")
                if path.endswith("/"):
                    candidate /= "index.html"
                elif not candidate.suffix:
                    candidate = candidate / "index.html"
                assert candidate.exists(), f"{source_route}: broken {tag} reference {raw}"
                if target.fragment and candidate.suffix == ".html":
                    target_route = "/404.html" if path == "/404.html" else (path if path.endswith("/") else path + "/")
                    assert target.fragment in documents[target_route].ids, f"{source_route}: missing fragment {raw}"

        expected_featured = ["bananagram-solver", "calendar-puzzle", "phonetiq"]
        assert documents["/"].featured_project_slugs == expected_featured, (
            f"Homepage featured projects differ: {documents['/'].featured_project_slugs}"
        )
        expected_work = [
            "bananagram-solver", "calendar-puzzle", "phonetiq", "qless-solver",
            "qibla-direction", "advent-of-code", "haskell-on-cloud-run", "crystal-cave",
        ]
        assert documents["/work/"].work_project_slugs == expected_work, (
            f"Work archive projects differ: {documents['/work/'].work_project_slugs}"
        )
        assert "ozbloom" not in documents["/work/"].work_project_slugs
        assert "barebone-fsm" not in documents["/work/"].work_project_slugs
        hidden_project_paths = {"/work/ozbloom/", "/work/barebone-fsm/"}
        for slug in expected_work:
            route = f"/work/{slug}/"
            local_link_paths = {
                urllib.parse.urlparse(raw).path
                for tag, raw in documents[route].refs
                if tag == "a" and not urllib.parse.urlparse(raw).netloc
            }
            assert hidden_project_paths.isdisjoint(local_link_paths), (
                f"{route}: links to an unlisted project: {hidden_project_paths & local_link_paths}"
            )
        expected_notes = [
            "directing-ai-assisted-project",
            "three-word-grid-solvers",
            "short-utterance-speech-recognition",
        ]
        assert documents["/notes/"].note_entry_slugs == expected_notes, (
            f"Notes archive entries differ: {documents['/notes/'].note_entry_slugs}"
        )

        person_match = re.search(r'<script type="application/ld\+json">(.*?)</script>', texts["/"], re.S)
        assert person_match, "Person structured data missing"
        person = json.loads(person_match.group(1))
        assert person["@type"] == "Person" and person["name"] == "Md Imrul Hassan"
        assert "honorificPrefix" not in person
        for poem_route in ["/poems/jirno-sriti/", "/poems/bedonar-rong/"]:
            assert '<html lang="bn">' in texts[poem_route][:100]
            assert '<header class="site-header" data-site-header lang="en-US">' in texts[poem_route]
            assert '<footer class="site-footer" lang="en-US">' in texts[poem_route]
            assert '<meta property="og:locale" content="bn_BD">' in texts[poem_route]

        expected = json.loads((ROOT / "docs/poem-checksums.json").read_text())
        for name, digest in expected.items():
            body = (ROOT / "content/poems" / name).read_bytes().split(b"---", 2)[2]
            assert hashlib.sha256(body).hexdigest() == digest, f"Poem body changed: {name}"

        for svg in (ROOT / "static/images/portfolio").rglob("*.svg"):
            ET.parse(svg)
        for identity_path in ["static/images/portfolio/favicon.svg", "static/images/portfolio/mark.svg"]:
            identity = ROOT / identity_path
            tree = ET.parse(identity)
            assert not list(tree.getroot().iter("{http://www.w3.org/2000/svg}text")), f"Letters found in Confluence symbol: {identity_path}"
            source = identity.read_text()
            assert "<title>Confluence</title>" in source, f"Confluence title missing: {identity_path}"
            for colour in ["#0F5F59", "#8FC1B4", "#D98462"]:
                assert colour in source, f"Confluence colour {colour} missing: {identity_path}"
        assert png_size(ROOT / "static/apple-touch-icon.png") == (180, 180)
        assert png_size(ROOT / "static/images/portfolio/favicon-32x32.png") == (32, 32)
        assert png_size(ROOT / "static/images/portfolio/social-card.png") == (1200, 630)
        assert check_ico(ROOT / "static/favicon.ico") == [16, 32, 48]
        assert (ROOT / "static/images/portfolio/favicon.svg").stat().st_size < 2048
        assert (ROOT / "static/images/portfolio/hero-abstract.svg").stat().st_size < 40 * 1024

        initial_bytes = sum((build / item).stat().st_size for item in [
            "index.html", "css/style.css", "js/site.js", "images/portfolio/hero-abstract.svg",
            "images/portfolio/favicon.svg", "images/portfolio/mark.svg",
        ])
        assert initial_bytes < 500 * 1024
        print(f"PASS: {len(ROUTES)} content routes + 404, curated Work/Notes sets, links, fragments, identity, poems and assets")
        print(f"PASS: initial local homepage payload {initial_bytes / 1024:.1f} KiB")
        print(f"PASS: {version}")


if __name__ == "__main__":
    main()
