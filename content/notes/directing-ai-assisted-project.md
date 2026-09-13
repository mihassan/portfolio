---
title: "Directing an AI-assisted project without pretending I wrote the code"
description: "A candid account of product direction, generated implementation and honest attribution in Bananagram Solver."
eyebrow: "AI-assisted development"
weight: 1
draft: false
---

Bananagram Solver is an experiment in software search, but also in a different kind of authorship: guiding a project whose implementation and automated tests were produced by AI agents.

## A different role

I did not approach Bananagram Solver as a conventional solo development project.

My role was closer to a combination of product manager, user researcher and technical lead. I defined what the application should do, shaped the experience, set constraints, directed priorities and made high-level decisions about the system. AI agents handled the implementation and automated testing.

I did not personally review the generated code or execute its test suite.

That distinction matters. It would be easy to present the finished application, list its technologies and allow visitors to assume that I wrote and verified every line. That would overstate my contribution and conceal the part of the project I find most interesting: what it means to direct software development when implementation can be delegated to AI.

## Beginning with the problem

Bananagram Solver grew from my earlier experiments with word-grid puzzles.

I had previously built a Q-Less solver after struggling with a real roll of its twelve dice. The first version used Haskell, whose functional style suited the recursive search. I later rewrote it in Kotlin while exploring Kotlin/JS and the possibility of using Kotlin for browser interfaces.

Bananagrams presented a related but larger problem. Instead of arranging a fixed twelve-dice roll, the solver accepts a variable rack and searches for a connected word grid that consumes every tile.

The current application runs as a static browser client. Its search executes inside a Web Worker, away from the main interface thread. It loads an ENABLE2K-derived dictionary, explores candidate placements through bounded backtracking and validates solved boards. Users can cancel an attempt, and the application distinguishes a completed search from one that reached its limits.

Those are properties of the implemented system, but listing them does not explain my relationship to the code that provides them.

## Direction is not implementation

There is real work in deciding what a product should be.

For this project, that included deciding that the solver should be manual-first and browser-based; that a long-running search should not freeze the interface; that cancellation and stale results needed explicit treatment; and that an unsuccessful bounded search must not be described as proof that no solution exists.

It also included product and experience questions: what the user enters, what the result should communicate, which controls deserve prominence and how uncertainty should appear in the interface.

These decisions shaped the system that AI agents produced. They are part of the project’s authorship, but they are not equivalent to writing its implementation.

I cannot honestly claim detailed familiarity with every branch of its recursive search or every test assertion. I can describe the intended product, the constraints I set and the architecture recorded in the repository. I can also point to automated checks as evidence that those checks exist and have produced recorded results. I should not turn that evidence into a claim that I personally verified the software.

## Why this stack

TypeScript and Next.js made this style of AI-assisted development easier to pursue. Client-side web applications have broad support across JavaScript and TypeScript tooling, and these technologies are well represented in the material available to coding models.

The project also aligned with my deployment preferences. Cloudflare has become my preferred platform for deploying web experiments, and a static client application fits its hosting model well.

That combination reduced friction between product direction, generated implementation and deployment. It did not remove the need for engineering constraints. If anything, delegating implementation made those constraints more important: the desired behaviour and the boundaries around it had to be expressed clearly enough to guide the agents.

## Evidence without borrowed confidence

An AI-generated project can accumulate many signs of engineering maturity: typed interfaces, validators, unit tests, browser tests, continuous-integration workflows and deployment checks. Bananagram Solver has such evidence in its repository.

But evidence needs precise language.

I can say that the repository contains an independent board validator. I can say that its workflows define automated checks. I can describe the bounded result states exposed by the solver. I cannot say that I personally inspected the validator, audited the complete implementation or ran those checks myself.

This is not an argument that automated evidence is meaningless. It is an argument against quietly converting machine-produced evidence into personal expertise.

If I later review the implementation or reproduce its verification independently, I can update that account. Until then, the accurate description is narrower.

## Authorship and accountability

Authorship is not a single switch between “made by me” and “not made by me.” A project can contain several kinds of contribution:

- identifying the problem
- defining the intended users and experience
- establishing constraints
- choosing technical direction
- producing implementation
- reviewing the implementation
- designing and running verification
- operating the deployed result

In Bananagram Solver, my contribution is concentrated near the beginning of that list. AI agents performed much of the work near the implementation and automated-verification end.

That does not make the project irrelevant to my portfolio. It changes what the project demonstrates.

It demonstrates product direction, problem framing, prioritisation and the ability to guide an AI-assisted development process. It also demonstrates the importance of keeping a record of who—or what—performed each kind of work.

Accountability remains more difficult. Directing a system does not grant automatic confidence in everything it contains. If the software makes a claim that cannot be supported, or behaves in a way I have not examined, high-level authorship is not a substitute for review.

For that reason, I describe Bananagram Solver as an actively evolving engineering experiment rather than a production-ready product.

## A vocabulary for future experiments

“Vibe coding” is useful shorthand for a style of development driven by intent, iteration and AI assistance. On its own, however, the phrase says little about what the human participant actually did.

For future projects, I want to be more specific:

> I guided the product, experience and technical priorities. AI agents implemented and tested the software. I did not personally review the code or run the tests.

Other projects may have different boundaries. I might write part of the implementation, review generated changes, reproduce the verification or contribute mainly to a concept and its visual direction. Each deserves its own account.

The objective is not to minimise human direction or dismiss generated work. It is to avoid claiming a form of craftsmanship that did not occur.

## What the project represents

Bananagram Solver remains interesting to me as a search problem and as a continuation of earlier word-grid experiments. Its less visible experiment is the development process itself.

How much software can be shaped from a high level? Which decisions still require human judgement? What evidence is meaningful when the person directing the project has not personally reviewed its implementation? And how should that work appear in a portfolio?

I do not yet have final answers. Honest attribution is at least a useful place to begin.
