---
title: "Phonetiq"
description: "An evolving experiment in English minimal-pair practice and short-utterance recognition."
eyebrow: "Speech · Learning"
status: "Active development"
links:
  - label: "Visit Phonetiq"
    url: "https://phonetiq.mihassan.com/"
  - label: "Browse the source"
    url: "https://github.com/mihassan/phonetiq"
stack: ["React", "Workers AI", "Speech recognition"]
image: "images/portfolio/projects/phonetiq.svg"
image_alt: ""
featured: true
listed: true
weight: 3
draft: false
---

As a non-native English speaker, I sometimes find similar-sounding words difficult to distinguish—pairs such as *desert* and *dessert*, or *suite* and *sweet*. **Phonetiq** explores whether a focused listening and speaking tool can make those contrasts easier to practise.

The application presents English minimal pairs across American, British and Australian targets. Learners can hear prerecorded examples, practise a displayed word and track progress locally, with optional account-based synchronisation.

## The short-utterance problem

Very short utterances are difficult for general speech-recognition systems. Similar words provide little linguistic context, while microphone quality, background noise, pronunciation, dialect and model behaviour can all influence the transcript.

Phonetiq currently asks the learner to place the displayed target in a short framing sentence—“The word is…”—before sending the recording to a Cloudflare Worker. Workers AI transcribes the audio, after which deterministic matching compares the transcript with the target and its paired contrast. An uncertain result can become `no_match` rather than being forced into one of the two words.

This is an experiment, not a reliable pronunciation grader. A transcript match does not directly measure phonetic correctness, and microphone audio is uploaded for remote recognition rather than remaining entirely on the device.

## A Cloudflare-shaped system

The React and Vite frontend works with a Hono API on Cloudflare Workers. Workers AI provides transcription, D1 holds the word-pair data and optional synced progress, and R2 serves prerecorded reference audio. Progress remains in browser storage unless a user chooses Google sign-in and cloud synchronisation.

## Current state

The application is still being improved and has not reached the level where I consider it genuinely useful. Recognition of short, closely related utterances remains the central technical challenge, so Phonetiq belongs here as active development rather than a finished learning product.
