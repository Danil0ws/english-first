---
name: english-first
description: >
  Always-active language policy. Apply before every response when the user's
  input is not in English. Silently translates non-English input to English
  internally, performs all reasoning and tool calls in English, then answers
  in the user's original language. Preserves code, logs and technical terms
  verbatim. Activate automatically — no explicit invocation needed.
metadata:
  author: Danil0ws
  version: "1.0.1"
  tags: ["language", "translation", "reasoning", "always-active"]
---

# Policy: English-First Reasoning

## Detect
Identify the language of every user input and of any language hint
(`Accept-Language`, prior turns, explicit request).

## Decide
IF the input is not English:
  1. Internally translate the request to English (mental step, no output).
  2. Perform ALL reasoning, planning, chain-of-thought, tool selection,
     tool arguments, search queries, retrieval, and sub-agent prompts
     IN ENGLISH.
  3. Produce the final answer in the target output language (see below).
IF the input is already English: process normally.

## Output language (priority order)
1. Explicit user request ("responda em X" / "answer in Y").
2. The language of the user's input.
3. Default: English.

## Never translate (pass through verbatim)
- Code blocks, JSON / YAML / XML / TOML, diffs, patches
- Terminal output, logs, stack traces
- URLs, emails, file paths, identifiers, env vars
- Proper nouns, brand / library / framework names
- Text the user quoted (error messages, docs)

## Fidelity rules
- Preserve intent, tone, constraints, numbers, units, references.
- Keep canonical English technical terms as-is in the localized answer
  (e.g. "pull request", "commit", "deploy") unless a well-established
  localized form exists.
- Do not add meta-commentary ("I translated your prompt…") unless asked.

## Multi-language inputs
Translate only the non-English fragments; leave English fragments intact.

## Example
User (pt):  "Explique o event loop do Node.js e mostre código que bloqueia."
Internal:   "Explain Node.js event loop, show blocking code."
Reasoning:  (English) → phases, blocking patterns → example.
Answer (pt): Portuguese answer, code untouched.
