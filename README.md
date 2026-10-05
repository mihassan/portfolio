# mihassan.com

Source for **Md Imrul Hassan’s** personal portfolio: a small Hugo site for selected software, technical notes, wireless-network research, Bangla poetry, music and photography.

The site is static, has no analytics or external runtime dependencies, and keeps substantive content available when JavaScript is disabled. `Md` is part of the public name—not an honorific—and remains explicit in all textual branding. The non-letter **Confluence** symbol is the favicon and supporting identity mark.

## Requirements

- Hugo **0.165.0** (extended or standard)
- Python 3.11+ for the dependency-free static checks
- Node 22+ and a Chromium/Chrome executable for browser smoke tests
- Deployment tooling: run `npm ci` to install the locked Wrangler **4.131.1** toolchain. An exact `undici` **7.29.1** override patches advisories affecting its older transitive dependency; keep the audit clean when updating it.

The pinned Hugo value is also recorded in `.hugo-version`.

## Run locally

```sh
hugo server --bind 127.0.0.1 --port 1313 --disableFastRender
```

Open <http://127.0.0.1:1313/>. The explicit loopback bind avoids exposing the development server to the local network. Stop it with `Ctrl-C`.

## Build

```sh
SITE_BASE_URL=https://portfolio.mihassan.workers.dev/ npm run build
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

Run the full gate before publishing:

```sh
npm ci
npm run verify
```

The full gate runs in disposable source copies. It includes static and browser checks, the assets-only Workers configuration/lockfile contract, production and preview canonical URLs, minified poem preservation, missing-URL rejection, and a loopback-only `wrangler dev` routing/404 smoke test. It does not deploy. Standalone Workers checks also build from disposable copies. Set `WRANGLER_PATH` to an absolute executable path if dependencies are installed outside this checkout.

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
- The owner deleted the former `mihassan-portfolio` Direct Upload Pages project on 2026-09-13. Its preview URLs are historical evidence, not a current fallback.

Review staged files before every commit. Never add private research archives, `.env` files, alternate contact details, downloaded audio, or generated `public/` output. Repository migration does not authorise a custom-domain attachment, DNS change or production cutover.

## Cloudflare Workers Static Assets

The deployment target is **portfolio**, an assets-only Worker at <https://portfolio.mihassan.workers.dev/>. The account's `mihassan` subdomain was verified through the Cloudflare API; consult `docs/implementation-status.md` for actual release status. Hugo generates `public/`; Wrangler uploads only those assets. There is no Worker script, asset binding, custom-domain route or runtime secret.

For an explicitly authorised deployment:

```sh
npm ci
SITE_BASE_URL=https://portfolio.mihassan.workers.dev/ npm run build
npx wrangler deploy --dry-run
npm run deploy
```

Build and deploy from a disposable checkout if generated files must not touch the working tree. The configuration serves Hugo's trailing-slash routes and the designed `404.html` with HTTP 404. `SITE_BASE_URL` is mandatory: versioned preview URLs are assigned after a build, so production and preview builds deliberately share the production canonical URL. `npm run preview` uploads a non-production version; it is not part of the local verification gate.

### Workers Builds (optional Git integration)

CLI deployment does **not** establish automatic deployment on pushes. If connecting the existing Worker to Workers Builds later:

- Scope the Cloudflare GitHub App to **only** `mihassan/portfolio`.
- Match the dashboard application name and Wrangler name: `portfolio`.
- Production branch: `main`; repository root: `/`.
- Build command: `npm run build`.
- Production deploy command: `npx wrangler deploy`.
- Non-production deploy command: `npx wrangler versions upload`.
- Build variables in both environments: `HUGO_VERSION=0.165.0` and `SITE_BASE_URL=https://portfolio.mihassan.workers.dev/`.
- Use a narrowly scoped deployment token rather than expanding GitHub App or account permissions indiscriminately. No deployment credentials belong in this repository.

Workers Builds uses Workers-specific metadata, not `CF_PAGES_*` variables. During a separately approved domain cutover, update `SITE_BASE_URL`, rebuild and verify before configuring the custom domain or DNS.

Official references:

- <https://developers.cloudflare.com/workers/static-assets/get-started/>
- <https://developers.cloudflare.com/workers/ci-cd/builds/>
- <https://developers.cloudflare.com/workers/ci-cd/builds/build-image/>
- <https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/>
- <https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/>

Creating a Worker or deploying to `workers.dev` does not authorise a custom-domain attachment, DNS change, TLS change or production cutover. Those remain separate actions.
