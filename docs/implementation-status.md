# Portfolio implementation — Md Imrul Hassan

Approved scope: the completion plan dated 2026-09-11 plus the owner-approved Work and Notes expansion. Source backups: `../HomePage.backup-before-remediation-20260910` and `../HomePage.backup-before-work-notes-20260913-144812`.

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
