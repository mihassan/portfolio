---
title: "Three word-grid solvers: Haskell, Kotlin and a browser Worker"
description: "How one family of puzzles changed through functional search, a Kotlin/JS interface and a bounded browser architecture."
eyebrow: "Search architecture"
weight: 2
draft: false
---

The same family of puzzles led me through several representations: an elegant recursive search in Haskell, a Kotlin/JS browser experiment, a constrained Haskell word-chain API and eventually a bounded TypeScript solver running inside a Web Worker.

## Starting with a difficult roll

My interest in word-grid solvers began while playing Q-Less.

Q-Less is a solitaire puzzle played with twelve letter dice. The aim is to arrange all twelve letters into a connected crossword-style grid. During one game, I struggled to find a solution and began wondering how easy it would be to build a solver that felt efficient and fast.

The first version was written in Haskell. That choice was an important part of the experiment. A recursive search over immutable state fits naturally into a functional model, and Haskell offered the possibility of expressing the algorithm as elegant code rather than as a collection of mutable board operations.

The basic problem sounds small: there are only twelve letters. The search space is not. The solver must choose words that can be constructed from the available letters, place them so that they intersect legally and reconsider earlier choices when a promising branch leads nowhere.

This made Q-Less a compact setting for exploring dictionary pruning, depth-first search, placement and backtracking.

## Representing Q-Less as a search

The Q-Less solver progressively constructs a word grid.

It first reduces the dictionary to words compatible with the available letters. During the recursive search, it considers ways to place candidate words across letters already present on the board. A placement consumes unused letters while preserving valid intersections. If the remaining letters cannot be placed, the solver backs up and tries another branch.

A complete candidate is checked as a full board before it is accepted.

This is the aspect of the project I originally found attractive in Haskell. The search can be understood as repeatedly transforming a well-defined state:

- a partial grid
- a set of letters still available
- a collection of candidate words
- a sequence of choices that can be abandoned when necessary

The Haskell implementation was less about proving a novel algorithm than about seeing how clearly that process could be expressed.

In personal use, the completed solver felt fast. I did not establish a formal benchmark, so “fast” remains an impression rather than a measured performance claim.

## Rewriting it in Kotlin

I later rewrote Q-Less while getting into Kotlin.

Kotlin interested me partly because it occupied useful territory between Java and Haskell. It retained access to a practical object-oriented ecosystem while supporting more expressive and functional styles where they fit.

Kotlin/JS added another possibility: the same language could express the solver and run as part of a browser interface. The rewritten project used Kotlin/JS with React, bringing the recursive solver into an application that could display the completed grid directly.

The core ideas remained familiar:

1. Prune the dictionary using the available letters.
2. Search recursively for intersecting words.
3. Place a candidate where it agrees with the existing board.
4. Backtrack when the remaining letters cannot be consumed.
5. Validate the complete grid before returning it.

The Kotlin version worked, and it became the visible Q-Less application. But working was not the same as fitting the way I wanted to develop frontend software. The Kotlin/JS bindings did not suit my preferred style, so I did not keep extending that approach.

Q-Less became a completed experiment: useful as a solver, but also as a record of exploring one algorithm through two languages.

## A different Haskell prototype

A later Haskell Bananagram prototype approached the broader word-grid problem differently.

Unlike Q-Less, Bananagrams is principally a social game, although it can also be played solo. Players work with variable racks and construct their own connected grids. That makes it related to Q-Less, but not identical in scale or structure.

The prototype exposed a solver through a Servant API. Its internal representation was a chain of words rather than a general crossword board.

Each word in the chain shared a specific relationship with the next: the following word had to begin with the final letter of the previous word. At each continuation, the search considered only the first four ranked candidates satisfying that condition. When rendered, the chain alternated between horizontal and vertical directions.

This representation reduced the placement problem substantially. The solver did not have to consider every legal intersection with every occupied board cell. It only had to extend one constrained sequence.

That made the implementation compact, but it also tied the generated grid to the chain model. It was a useful prototype rather than a complete representation of arbitrary Bananagrams arrangements.

The distinction was not simply Haskell versus another language. It was a difference in how the problem itself had been modelled.

## Returning to general grids

The current Bananagram Solver returns to general intersecting word placement.

It accepts a rack of letters and searches for one connected grid that consumes every tile. Candidate words can cross letters already present on the board rather than being restricted to the final letter of a chain. Placements are rejected when they conflict with existing letters, touch unrelated words, extend through occupied endpoints or fail to contribute a new tile.

The solver tries promising placements recursively and backtracks when a branch cannot complete the rack. It first prefers arrangements without two-letter words, then uses two-letter connectors as a fallback.

An independent validator can inspect a proposed result for dictionary membership, exact tile use, connectivity, matching intersections, adjacency, endpoints and rendered geometry.

This is a more faithful representation of a general word-grid problem, but it introduces a much larger search space. That changed the question from simply “how do I recurse?” to “where should the search run, how should it stop, and what should an unsuccessful result mean?”

## Moving search off the interface thread

The current solver is built with TypeScript, Next.js and React. Dictionary preparation and recursive search run inside a module Web Worker rather than on the browser’s main thread.

That execution boundary is one of the most important differences from the earlier projects.

Recursive search can take an unpredictable amount of time. If it runs alongside interface rendering, a difficult rack can make the application appear frozen. Moving the work into a Worker lets the interface remain responsive while the solver continues separately.

The Worker boundary also makes lifecycle questions explicit:

- each request has an identity
- a user can cancel an attempt
- editing the rack can invalidate an older search
- stale results must not overwrite current state
- a failed or terminated Worker must be recreated safely

The application is exported and deployed as static assets through Cloudflare. There is no request-time solver API: the dictionary and search run through the downloaded client application.

## Bounded search and honest results

The earlier question—whether a roll is solvable—becomes delicate once search is deliberately bounded.

The Bananagram solver limits elapsed work, visited states and the number of placements explored at a node. These limits keep a difficult branch from running without a practical endpoint, but they also mean that stopping is not always equivalent to completing the search space.

The interface therefore distinguishes between different outcomes.

A found board is a solution. A search that completes within its configured candidate space may report that it found none. A search that reaches a limit reports that no board was found within the current search limits.

That final statement is intentionally narrower than “there is no solution.”

For me, this is as important as the search algorithm. Software should not turn an internal resource limit into a stronger claim about the underlying puzzle.

## Another kind of experiment

The current Bananagram Solver differs from the earlier projects in authorship as well as architecture.

It is AI-assisted. I guided it at a high level, shaping product direction, user experience, research, constraints and technical priorities in a role closer to a product manager, user researcher and technical lead. AI agents produced the implementation and automated tests.

I did not personally review the generated code or run its test suite. The repository provides evidence about the resulting architecture and automated verification, but I do not present that evidence as personal code-level authorship or assurance.

The project remains an actively evolving engineering experiment, not a production-ready product. It is independent and unofficial, with no affiliation to the makers of Bananagrams.

## What changed across the solvers

It is tempting to describe this progression as a comparison of programming languages:

- Haskell for functional elegance
- Kotlin for a browser-capable rewrite
- TypeScript for the current web ecosystem

The more meaningful progression is in representation and execution.

The first Q-Less solver explored recursive search over a small fixed rack. The Kotlin rewrite brought that search into a browser application. The Haskell Bananagram prototype simplified a larger problem into a constrained chain. The current solver returned to general grids and added explicit boundaries around computation, cancellation, validation and uncertainty.

Each version asked a slightly different question. Together they show that changing the model of a problem can matter more than changing its language—and that once an algorithm reaches an interface, how it runs and how it explains failure become part of the algorithm’s design.
