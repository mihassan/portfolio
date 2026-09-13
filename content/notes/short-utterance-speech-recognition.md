---
title: "Why one spoken word is hard for speech recognition"
description: "What Phonetiq revealed about context, recording quality and the limits of transcript-based pronunciation feedback."
eyebrow: "Speech recognition"
weight: 3
draft: false
---

Phonetiq began with a familiar difficulty: hearing and producing English words that sound nearly alike. Building it has exposed a less obvious problem—speech-recognition systems often have the least information exactly when the learner needs the most precise distinction.

## The problem behind Phonetiq

As a non-native English speaker, I sometimes find similar-sounding words difficult to distinguish. Examples include *desert* and *dessert*, or *suite* and *sweet*.

These are not necessarily difficult because their definitions are unclear. The difficulty is in connecting a small difference in sound to the intended word, then reproducing that distinction confidently.

Phonetiq is an experiment in practising those contrasts through English minimal pairs: two words that differ by one sound or a closely related feature.

The application has a listen-first mode with prerecorded examples and a practice mode that records speech and returns recognition feedback. It supports American, British and Australian English targets and draws from more than 400 seeded pairs across several sound categories.

That description sounds straightforward. The difficult part is determining what a short recording actually contains.

## Recognition usually has context

Speech recognition does more than translate sound directly into letters.

When someone speaks a sentence, the recognition model can use surrounding words to resolve uncertainty. Grammar, common word sequences and the broader subject all make some transcripts more plausible than others.

Consider hearing an unclear word inside a complete sentence. Even if the sound itself is ambiguous, the words around it may reveal what was intended. Remove that sentence and ask the speaker to say only one word, and much of that supporting information disappears.

This is precisely the situation in pronunciation practice. The application may need to distinguish between two intentionally similar words, using a recording that lasts only a moment.

The exercise removes the context that normally helps recognition while demanding a finer distinction than ordinary transcription may require.

## The recording is another variable

The spoken word is only one part of the input.

A browser records through whatever microphone the device provides, in whatever environment the learner happens to occupy. The clip may include:

- delay while the microphone starts
- silence before or after the word
- low recording volume
- background conversation or mechanical noise
- differences in microphone response
- a clipped beginning or ending

These details matter more when the useful signal is extremely short. In a long sentence, one imperfect segment may be supported by the rest. In a single-word recording, a missing consonant or unclear vowel can remove the main evidence the recogniser needs.

Phonetiq’s browser recorder performs signal analysis and processing intended to reduce some of this variability. It detects weak or noise-like recordings, isolates a likely speech window and prepares the clip before upload.

This can improve the input presented to the recogniser. It cannot create phonetic information that the microphone failed to capture.

## Dialect changes the expected answer

English pronunciation is not a single fixed target.

Words and sound contrasts can behave differently across American, British and Australian English. A pair that is distinct in one dialect may be closer, differently realised or unsuitable as a teaching contrast in another.

Phonetiq therefore requires a selected target dialect. That choice affects which word pairs are presented and the context supplied to the recognition model.

The application also maintains separate progress records for the same pair under different dialect targets. This avoids treating performance against one target as automatically equivalent to performance against another.

The dialect model remains a developing part of the project. Supporting three labels in an interface is much easier than representing the full variation within each form of English.

## What happens during practice

Phonetiq does not show two words and ask the learner to say either one while the application guesses their choice.

Instead, practice displays a specific target word. The learner can listen to its prerecorded example and then record an attempt for that target.

The current interface asks the learner to place it inside a short frame:

> “The word is ship.”

The browser records a short clip and sends the processed audio to a Hono API running on Cloudflare Workers. The API uses Cloudflare Workers AI’s Whisper model to transcribe it. The request includes the selected dialect and the two candidate words as prompt context.

After transcription, deterministic matching compares the transcript with the target pair. The result can be classified as:

- an exact match
- a token found within the transcript
- a limited fuzzy match
- no match

The final state matters. When the transcript cannot safely be associated with either candidate, the application can ask the learner to try again instead of forcing an answer.

## Why add a frame sentence?

“The word is…” may seem like unnecessary ceremony. Its purpose is to give the recognition model more structure.

A complete phrase provides a predictable speech pattern before the important word. It gives the microphone more time to become active, provides the recogniser with linguistic context and lets the application extract the word from a known position in the transcript.

The repository’s controlled audio fixtures produced more favourable results with this approach than with isolated words. That finding motivated making the frame sentence the active recognition path.

It is still only evidence from the project’s own evaluation corpus. It does not establish a general accuracy rate, represent the diversity of real learners or prove that the approach works reliably across devices and environments.

The frame sentence is best understood as a practical experiment: if one spoken word contains too little context, add a small amount of controlled context around it.

## Recognition is not pronunciation assessment

A transcript match answers a limited question: did the recognition system produce text associated with the displayed target?

That is not the same as measuring pronunciation directly.

A model might produce the expected spelling despite an imperfect pronunciation. It might also produce the other candidate because of microphone quality, dialect mismatch or its own transcription behaviour. A fuzzy text match adds another layer of interpretation after the audio has already been converted into words.

Phonetiq can therefore experiment with practice feedback, but it should not be described as diagnosing speech or reliably grading pronunciation.

This distinction is central to its current status. The interface and infrastructure exist, but the quality of short-utterance recognition has not yet reached the level where I consider the application genuinely useful.

## Progress and privacy boundaries

Practice progress is stored in the browser by default. A user can optionally sign in with Google to synchronise it through the application’s Cloudflare API and D1 database.

Microphone audio follows a different boundary. It is uploaded to the API and processed through Workers AI; recognition does not happen entirely on the user’s device. The application also uses R2 to serve prerecorded reference audio.

These boundaries should be visible in any description of the project. “Local-first progress” does not mean “on-device speech recognition.”

## What remains open

Phonetiq has become a useful engineering setting for studying the gap between a plausible feature and a dependable one.

The surrounding product can be built: pair selection, reference audio, recording controls, signal processing, dialect filters, progress tracking, optional synchronisation and recognition feedback. The unresolved question remains the one at the centre: can a short recording distinguish similar words consistently enough to help?

The current frame-sentence approach offers one direction, not a final answer.

For now, Phonetiq remains an actively developed experiment. Its most valuable result may be the clarity of the problem it exposed: the shorter and more similar the utterances become, the less speech recognition behaves like simple transcription—and the more carefully its feedback must be described.
