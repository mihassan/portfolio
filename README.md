# mihassan.com

Source for **Md Imrul Hassan’s** personal portfolio: a small Hugo site for selected software, technical notes, wireless-network research, Bangla poetry, music and photography.

The site is static, has no analytics or external runtime dependencies, and keeps substantive content available when JavaScript is disabled. `Md` is part of the public name—not an honorific—and remains explicit in all textual branding. The non-letter **Confluence** symbol is the favicon and supporting identity mark.

## Requirements

- Hugo **0.165.0** (extended or standard; the tested local binary is extended)
- Python 3.11+ for the dependency-free static checks
- Node 22+ and a Chromium/Chrome executable for browser smoke tests

The pinned Hugo value is also recorded in `.hugo-version`.

## Run locally

```sh
hugo server --bind 127.0.0.1 --port 1313 --disableFastRender
```

Open <http://127.0.0.1:1313/>. The explicit loopback bind avoids exposing the development server to the local network. Stop it with `Ctrl-C`.

## Build

```sh
hugo --gc --minify --cleanDestinationDir
```

Hugo writes generated output to `public/`. Do not edit or commit that directory; change `content/`, `data/`, `layouts/`, or `static/` instead.

## Verify

Static build, routes, links, fragments, metadata, name contract, poem checksums, SVG/PNG/ICO files and payload:

```sh
./scripts/check-site.py
```

Responsive browser scenarios, dark mode, reduced motion, keyboard focus, mobile navigation, no JavaScript, blocked JavaScript, hover contrast and designed 404:

```sh
CHROME_PATH=/path/to/chrome-or-chromium node scripts/browser-smoke.mjs
```

On the machine used for the implementation, `CHROME_PATH` defaults to the locally cached Chromium executable. The browser check starts temporary loopback-only Hugo/Chromium processes, writes evidence to `/tmp/homepage-final-qa`, and stops both processes when finished. Override `QA_DIR`, `HUGO_TEST_PORT`, or `CHROME_DEBUG_PORT` if needed.

Run both before publishing:

```sh
./scripts/verify.sh
```

The checks do not validate external destinations, production DNS/TLS, social-platform cache behaviour, Safari, or a full screen-reader/WCAG audit. Those require post-deployment or manual verification; they are not implied by a passing local build.

## Content maintenance

- Homepage headings and calls to action: `data/home.yaml`
- Listed projects and preserved legacy project routes: `content/work/*.md`
- Technical notes: `content/notes/*.md`
- Publications: `data/publications.yaml`
- Confirmed public profiles: `data/profiles.yaml`
- Claim/source maintenance notes: `docs/content-sources.md`
- Identity proof: `docs/identity-proof.html`
- Poem body checksums: `docs/poem-checksums.json`

The twelve Bangla poem bodies are protected by checksums. The two legacy poem files remain unchanged. Poetry is rendered as escaped plain verse, not Markdown: each newline is a verse break and each blank line separates paragraphs/stanzas. Put recording credits in front matter, outside the verse body. Do not correct spelling or punctuation without the owner's approval; run the checks before changing poem text.

## License

Software source code is available under the MIT License. Original articles, project copy, poems and portfolio artwork are © Md Imrul Hassan, all rights reserved unless a file explicitly states otherwise. Third-party material remains under its original terms. See `LICENSE` for the complete scope.

## Repository and staging

The canonical source is [`mihassan/portfolio`](https://github.com/mihassan/portfolio), with the verified site on `main` and fresh history created from this curated tree.

The earlier hosting remains available as rollback evidence:

- `mihassan/mihassan.github.io` `main` remains the old GitHub Pages site at `08bf483f6ed24edf63914852d3afe585a46d8e1f`.
- Its `portfolio-redesign` branch is a historical staging snapshot, not the canonical source.
- The verified preview at <https://portfolio-redesign.mihassan-portfolio.pages.dev/> remains a separate Cloudflare Pages **Direct Upload** deployment. It is not connected to either GitHub repository and does not redeploy on pushes.

Review staged files before every commit. Never add private research archives, `.env` files, alternate contact details, downloaded audio, or generated `public/` output. Repository migration does not authorise a custom-domain attachment, DNS change or production cutover.

## Cloudflare Pages (Git integration)

Native Git integration is intentionally pending confirmation that the Cloudflare GitHub App can be scoped safely to `mihassan/portfolio`. When that integration is created, use:

- Production branch: `main`
- Framework preset: Hugo, or none with the values below
- Root directory: `/` (repository root)
- Build command: `./scripts/build-cloudflare.sh`
- Build output directory: `public`
- `HUGO_VERSION`: `0.165.0` in both Production and Preview environments
- Production-only `SITE_BASE_URL`: initially the new project’s `https://<project>.pages.dev/` URL

The build script uses `SITE_BASE_URL` for `main` and Cloudflare’s generated `CF_PAGES_URL` for preview branches, keeping canonical and absolute URLs within the environment being reviewed. Leave `SITE_BASE_URL` unset in Preview. Change its Production value to `https://mihassan.com/` only during a separately approved custom-domain cutover, then rebuild before changing DNS.

Official references:

- <https://developers.cloudflare.com/pages/framework-guides/deploy-a-hugo-site/>
- <https://developers.cloudflare.com/pages/get-started/git-integration/>
- <https://developers.cloudflare.com/pages/configuration/build-configuration/>
- <https://gohugo.io/commands/hugo/>

Creating the source repository or a `pages.dev` deployment does not itself authorise a custom-domain attachment, DNS change, TLS change or production cutover. Those remain separate actions.
