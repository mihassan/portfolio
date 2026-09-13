---
title: "Q-Less Solver"
description: "A recursive solver for the twelve-dice Q-Less word puzzle."
eyebrow: "Puzzles · Kotlin"
status: "Completed experiment"
links:
  - label: "Open the solver"
    url: "https://qless.mihassan.com"
  - label: "Browse the source"
    url: "https://github.com/mihassan/qless-solver"
stack: ["Kotlin", "Kotlin/JS", "Backtracking"]
image: "images/portfolio/projects/qless.svg"
image_alt: ""
featured: false
listed: true
weight: 4
draft: false
---

**Q-Less Solver** began with a difficult roll. While playing the twelve-dice solitaire word puzzle, I struggled to find a valid arrangement and became curious about how easily a solver that felt efficient and fast could be constructed.

## An elegant Haskell beginning

The first implementation was written in Haskell. A recursive search over immutable state fits naturally into a functional model, and Haskell made it possible to express the algorithm as elegant code.

The solver prunes its dictionary to words compatible with the available letters, recursively places words across matching letters, and backtracks when a branch cannot consume the full roll. A candidate is accepted only after the complete grid is validated.

In personal use, the result feels fast. I have not established a formal benchmark, so that remains an impression rather than a measured performance claim.

## Rewriting it in Kotlin

I later rebuilt Q-Less while learning Kotlin. The language appealed to me as a bridge between Java’s practical ecosystem and some of the expressive qualities I value in Haskell. Kotlin/JS also offered a way to write both the solver and its React browser interface in one language.

The bindings worked, but they did not suit my preferred style of frontend development, so I did not keep extending that approach. The application displays the full grid when it finds one and otherwise reports that no solution was found.

Q-Less is now a completed experiment: a useful puzzle companion and a record of exploring the same recursive idea across functional and browser-oriented implementations.

The solver is an independent project, not an official product of the game’s publisher.
