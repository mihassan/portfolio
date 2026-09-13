---
title: "Bananagram Solver"
description: "An AI-assisted browser experiment that searches for a connected word grid from a rack of letters."
eyebrow: "Search · AI-assisted development"
status: "Actively evolving"
links:
  - label: "Open the solver"
    url: "https://bananagram.mihassan.workers.dev/"
stack: ["TypeScript", "Web Workers", "Cloudflare"]
image: "images/portfolio/projects/bananagram.svg"
image_alt: ""
featured: true
listed: true
weight: 1
draft: false
---

**Bananagram Solver** is an unofficial engineering experiment inspired by Bananagrams, the social word game in which players race to construct their own connected grids. Given a rack of letters, the application searches for one valid board that uses every tile.

## From word chains to general grids

The project grew from my earlier work on Q-Less and a small Haskell Bananagram prototype. Those experiments established the core interest—constructing intersecting words through recursive search—but the current solver uses a more general board model and a substantially different browser architecture.

The earlier Haskell prototype exposed a Servant API and reduced the problem to chains: each word began with the final letter of the previous one, and the rendered chain alternated direction. This version instead considers placements across letters anywhere on the existing board.

## Search in the browser

The solver uses bounded backtracking against a documented ENABLE2K-derived dictionary. It rejects conflicting or disconnected placements and can independently validate a completed board’s inventory, connectivity, words and geometry.

Dictionary preparation and search run in a Web Worker rather than on the main browser thread. The interface remains responsive, an attempt can be cancelled, and stale results cannot replace newer work. The application first prefers boards without two-letter words, then retries with connectors.

It returns the first valid board found. It does not optimise compactness or appearance. If a limit is reached, it reports that no board was found within the current search limits rather than claiming that the rack is impossible.

## An AI-assisted experiment

This project also explores a different way of directing software development. I guided the product direction, user research, experience, constraints and technical priorities in a role closer to a product manager, user researcher and technical lead. AI agents handled implementation and automated testing. I did not personally review the generated code or execute its test suite.

TypeScript and Next.js made this workflow easier to pursue, while a static client application fit my preference for deploying web experiments through Cloudflare. The deployed application has no request-time solver backend; the downloaded client performs the dictionary search locally.

## Current state

Bananagram Solver is publicly playable and actively evolving. Automated verification and release-hardening records exist in its source, but I treat it as an engineering experiment rather than a production-ready product.

The project is independent and is not affiliated with the makers of Bananagrams.
