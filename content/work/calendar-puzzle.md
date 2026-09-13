---
title: "Calendar Puzzle"
description: "A Haskell solver and analysis project for a physical calendar puzzle."
eyebrow: "Tiling · Haskell"
status: "Completed experiment"
links:
  - label: "Open Calendar Puzzle"
    url: "https://calendar-puzzle.mihassan.com/"
  - label: "Browse the source"
    url: "https://github.com/mihassan/calendar-puzzle"
stack: ["Haskell", "Exhaustive search", "Tiling"]
image: "images/portfolio/projects/calendar-puzzle.svg"
image_alt: ""
featured: true
listed: true
weight: 2
draft: false
---

I bought a physical calendar puzzle and found it unexpectedly difficult to solve consistently. That frustration led to broader questions: how many solutions exist for each date, whether recurring arrangements could be identified, and whether those patterns might suggest useful manual heuristics.

**Calendar Puzzle** is the resulting Haskell solver and analysis project.

## Why Haskell

The puzzle is naturally expressed as a constrained exhaustive search over possible piece placements. Haskell’s pure functional model made the state transitions and search rules especially clear, allowing the implementation to remain close to the structure of the puzzle itself.

The project goes beyond finding one board for one date. It can enumerate solutions and support analysis across the calendar, turning a physical tiling puzzle into a compact computational study.

## What the analysis changed

The program answered my questions about solution counts and recurring patterns. It did not materially improve my ability to solve the physical puzzle by hand.

That mismatch is part of what makes the experiment interesting: understanding a search space computationally is not the same as developing human intuition for it. The project is now in good condition and considered complete.
