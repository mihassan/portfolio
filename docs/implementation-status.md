# Portfolio implementation — Md Imrul Hassan

Approved scope: the completion plan dated 2026-09-11 plus the owner-approved Work and Notes expansion. Source backups: `../HomePage.backup-before-remediation-20260910` and `../HomePage.backup-before-work-notes-20260913-144812`.

## Public copy cleanup — local update

- Removed visible editorial scaffolding from Elsewhere, Research, Career, About, Creative, Poems archive and project artwork captions. Simplified profile descriptions and song credits into direct public prose.
- Retained internal provenance, project maturity/search/speech limitations, AI-assisted project authorship, recording credits and the AI-edited portrait disclosure. All twelve poem files remain untouched.
- Full verification passed with Hugo 0.165.0: 34 routes plus 404, 41 Chromium scenarios, minified poem checks and Workers routing. Cleanup and portrait changes remain uncommitted and undeployed.

## About portrait — local update

- Added the owner-selected AI-edited portrait on About, with a visible disclosure and descriptive alt text. Local WebP derivative: 710×720, approximately 59 KiB, with metadata removed; original image untouched.
- Full Hugo 0.165.0/Workers gate passed across 34 content routes and 41 Chromium scenarios, including new 320px and dark About cases. Desktop/mobile screenshot inspection passed. Portrait is not requested by the homepage.
- This update is local only: not committed, pushed or deployed.

## Personality-led portfolio refinement

- Owner-approved literary framing connects software, puzzles, writing, music and photography through noticing and expression, without psychological claims or invented personal history.
- Homepage now selects জীর্ণ স্মৃতি, ঘুমকন্যা and চল চলে যাই to show memory, tenderness and movement. About explains the connection with concrete images from the poems; Creative is no longer framed as merely outside engineering.
- Preserved all poem files, the six-destination navigation, Confluence identity, Work curation and existing responsive design. A real photograph and personal anecdotes remain deferred until the owner supplies a selection and context.
- Hugo 0.165.0 full verification passed: 34 content routes plus 404, all 39 Chromium scenarios, minified poem preservation and local Workers routing. Desktop/mobile screenshot review found no blocking layout issues.
- Source commit `a4ef45d` was pushed to canonical `main` and deployed to https://portfolio.mihassan.workers.dev/ as version `635e6259-b059-4257-863a-c4271aec237e`. All 34 live HTTPS routes matched the reviewed production build byte-for-byte; canonical URLs, required assets and designed HTTP 404 passed. Custom domain and DNS are unchanged.

## Current poetry and music update

- Twelve poems are now available: ten owner-supplied texts plus the two unchanged legacy files. Body checksums, stanza/line comparisons and archive coverage protect the collection.
- Creative links to the official recordings of Kal Sara Raat and মায়ার বাঁধন with separate writing, tune and performance credits. No recordings, embeds or external fonts are hosted here.
- Final verification after the Creative callout correction passed with Hugo 0.165.0 in a disposable source copy: 34 content routes plus the designed 404, 39 Chromium scenarios, and a 49.1 KiB initial homepage payload.
- The former `mihassan-portfolio` Pages project was owner-deleted; its URLs below are historical. The Workers migration is now included in this canonical checkout; its release evidence is recorded next.
- The remaining sections describe earlier milestones. Their preview processes, URLs and hosting observations must not be treated as current availability.

## Workers release

- Selectively ported the assets-only deployment configuration from the separate migration workspace, without replacing the newer poems, content or browser checks.
- Fixed verification isolation: the full gate and standalone Workers build/runtime checks use filtered disposable source copies. A before/after comparison confirmed that every source file and pre-existing generated directory remained unchanged.
- Pinned Wrangler 4.131.1 with an exact undici 7.29.1 override after the original dependency lock acquired security advisories. A fresh `npm ci` and full `npm audit` passed with zero reported vulnerabilities.
- Hugo 0.165.0 passed the complete static, minified production/preview canonical, missing-URL rejection, twelve-poem rendering, 39-scenario Chromium and 34-route local Workers gates. `wrangler deploy --dry-run` passed with no bindings.
- Cloudflare API inspection confirmed the account subdomain `mihassan` and that no Worker named `portfolio` existed before this release. Reviewed source commit `68bcf92` was pushed to canonical `main` and deployed to **https://portfolio.mihassan.workers.dev/**. Wrangler uploaded 60 generated files; deployed version: `08b1c00c-5017-48c0-b1bc-afde2ce0cfe6`.
- Post-deployment HTTPS verification passed: all 34 content routes matched the reviewed production build byte-for-byte, required assets and canonical URLs matched, and an unknown route returned the designed page with HTTP 404. This does not imply a Safari or full screen-reader audit.
- No custom-domain, DNS, TLS, old GitHub Pages or other Cloudflare application changes are included. Workers Builds/GitHub App integration is not established by a CLI deployment.

## Work units

1. **Complete — Content, routes and data**
   - Preserved both poem bodies; SHA-256 values are in `poem-checksums.json`.
   - Added substantive Creative and Elsewhere routes; rebuilt Research from `data/publications.yaml`.
   - Curated eight listed projects: Bananagram Solver, Calendar Puzzle, Phonetiq, Q-Less Solver, Qibla Direction, Advent of Code, Haskell on Cloud Run and Crystal Cave. OzBloom and barebone-fsm retain their URLs but are unlisted.
   - Added three full technical Notes covering AI-assisted direction, the evolution of the word-grid solvers and short-utterance speech recognition.
   - Recorded project maturity, authorship, privacy and claim limitations in `content-sources.md`.
2. **Complete — Identity and assets**
   - The owner selected **Confluence**, a non-letter symbol formed by three asymmetric currents inside a rounded frame. Full-name lockups remain **Md Imrul Hassan**.
   - Integrated Confluence across the favicon, header/footer mark, touch icon and social preview; its rationale and Quiet Curiosity palette are documented in `favicon-symbol-concepts/CONCEPT.md`.
   - Inspected native 16/24/32/48px light/dark proofs in `identity-proof.html`; the frame and three-current structure remain distinct at favicon scale.
   - Created the restrained curved-band hero and project illustrations; retired the earlier letter badge and personality atlas from production.
   - Exported a real 16/32/48-entry `favicon.ico`, 32px fallback, opaque 180px touch icon with safe area and 1200×630 social PNG. Final Confluence proof: `/tmp/homepage-confluence-identity-proof.png`.
3. **Complete — Integrated site**
   - Rebuilt the homepage and every linked page against the content/data contract; the homepage features Bananagram Solver, Calendar Puzzle and Phonetiq, while Work lists all eight curated projects.
   - Added a restrained homepage Notes band, a dedicated Notes archive and long-form reading layouts without adding a seventh primary-menu destination.
   - Extended the compact responsive editorial system for status labels, multi-link project actions, project facts, Notes cards and long-form articles.
   - Uses one six-destination main menu with correct states and a native fallback; content is visible with JS disabled or blocked.
   - Applied explicit dark colours, reduced motion, visible focus, responsive intrinsic art and mixed English/Bengali language markup.
4. **Complete — Verification and local handoff**
   - `./scripts/verify.sh` passed on 2026-09-13 with Hugo 0.165.0: 24 content routes plus 404, zero build warnings, zero broken links/fragments/assets, exact curated Work/Notes sets and preserved poem hashes.
   - Twenty-three Chromium scenarios passed at 320/390/720/768/1024/1200/1440px, including dark mode, reduced motion, no JS, blocked JS, menus, keyboard focus, contrast-sensitive hover, Work/Notes archives, representative project/Note pages and 404 behaviour.
   - Human visual inspection covered representative desktop, mobile, full-page and dark states for Home, Work, Notes, project pages and long-form Notes; no blocking presentation defects remained.
   - Small accent labels retain their verified contrast treatment. With the expanded content and five new project vectors, the initial local homepage payload measures 49.0 KiB.
   - Evidence: `/tmp/homepage-work-notes-verify.log`, `/tmp/homepage-final-qa/browser-report.json`, `/tmp/homepage-final-qa/visual/` and `/tmp/homepage-confluence-identity-proof.png`.
   - The coding-agent workflow ran the checks; this record does not claim that the owner personally reviewed Bananagram’s code or executed its project tests.

## Running local demo

Verified URL: **http://127.0.0.1:1313/**

Current server PID: `92809`; PID/log directory: `/tmp/mihassan-homepage-demo/`. It is listening only on `127.0.0.1` and renders to memory.

Restart:

```sh
hugo server --source . --bind 127.0.0.1 --port 1313 --disableFastRender --renderToMemory --disableLiveReload
```

Stop the current background preview:

```sh
kill "$(cat /tmp/mihassan-homepage-demo/server.pid)"
```

## Dedicated source migration

This verified tree is prepared for `mihassan/portfolio` `main` as the canonical source with fresh Git history. Publishing that repository does not change hosting.

The earlier staging and production state remains intact as rollback evidence:

- `mihassan/mihassan.github.io` branch `portfolio-redesign` retains the redesign snapshot; its `main` remains the old GitHub Pages source at `08bf483f6ed24edf63914852d3afe585a46d8e1f`.
- Cloudflare Pages project `mihassan-portfolio` remains a **Direct Upload** project with the verified preview at <https://portfolio-redesign.mihassan-portfolio.pages.dev/>. It is not linked to GitHub and does not redeploy on pushes.
- Credential-free public verification covered all 24 content routes, the designed 404, 25 static assets, canonical metadata, curated Work/Notes sets and Cloudflare delivery. Evidence: `/tmp/mihassan-homepage-publication/public-preview-verification.log`.
- The existing `www` GitHub Pages site and previously observed apex error remain unchanged. No custom domain, DNS, TLS or production-hosting change is part of the repository migration.

Native Cloudflare Git integration remains pending confirmation that its GitHub App access can be limited safely to `mihassan/portfolio`. The intended build uses `./scripts/build-cloudflare.sh`, Hugo 0.165.0 and output directory `public`. Production initially receives the new project’s `pages.dev` URL through `SITE_BASE_URL`; previews use `CF_PAGES_URL`. Changing `SITE_BASE_URL` to `https://mihassan.com/` is reserved for a separately approved cutover.

## Explicit limitations

Safari and a full screen-reader/WCAG certification were not automated; README identifies these as manual checks rather than claiming they passed. External profiles, production DNS/TLS and real social-platform unfurls require post-deployment verification. No deployment is implied by the working local demo.
