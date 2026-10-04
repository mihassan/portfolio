# Agent guidance

## Project
- Personal portfolio for **Md Imrul Hassan**. Preserve the exact name; “Md” is part of it.
- Canonical repository: `mihassan/portfolio`.
- Hugo static site targeting Cloudflare Workers Static Assets and Workers Builds.
- Keep deployment assets-only: no Worker runtime code unless explicitly requested.

## Read first
- `README.md`: setup, verification and deployment instructions.
- `docs/implementation-status.md`: current progress, blockers and verification evidence.
- `docs/content-sources.md`: claim provenance and content constraints.
- `LICENSE`: separate software, content and artwork licensing.

Treat recorded deployment status as historical until verified. Do not assume
local changes are committed, pushed or deployed.

## Content and design
- Preserve the letter-free Confluence identity, existing routes, accessibility,
  responsive behavior, dark mode and no-JavaScript usability.
- Preserve both Bengali poem bodies byte-for-byte; validate their checksums.
- Keep exactly eight curated Work projects and the three selected homepage
  projects. Legacy unlisted routes must remain accessible.
- Separate owner assertions, public evidence and interpretation.
- Preserve explicit AI-assisted authorship and project maturity limitations.
- Never invent achievements, benchmarks, reliability claims or commitments.

## Verification
- Follow the pinned versions and commands in README.
- Install deployment tooling with `npm ci`; run `npm run verify`.
- Run builds and runtime checks in disposable directories where possible.
- Do not weaken assertions or delete failing tests to obtain a pass.
- Report failures and distinguish fresh verification from historical results.

## Privacy and Git
- Never publish credentials, private research, alternate contact details or
  personal filesystem paths.
- Before committing, verify repository-local author and committer identities
  use the owner's GitHub noreply address.
- Stage explicit paths and inspect the staged diff.
- Never edit or commit generated `public/`, dependency directories, Hugo caches,
  Wrangler state, environment files or test artifacts.
- Commit or push only when explicitly authorized.

## Hosting boundaries
- Preserve the old `mihassan.github.io` repository as rollback unless instructed
  otherwise.
- Do not attach custom domains, change DNS/TLS, cut over production, delete
  resources or rewrite published history without explicit approval.
- Verify the actual deployment URL; do not infer hostname availability.
- Keep temporary progress and blockers in `docs/implementation-status.md`,
  not in this file.
