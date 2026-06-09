# weights.ts

> Last updated: 2026-06-09 | Protection: STANDARD

## Purpose

Assigns AI quote weights through OpenRouter, with deterministic local fallback when the network or key is unavailable.

## What It Does

- Sends the quote dataset to OpenRouter.
- Requests integer weights 1, 2, or 3.
- Parses JSON arrays returned by the model.
- Falls back to local heuristic scoring.

## Dependencies

- Internal: `src/config.ts`, `src/types.ts`.
- External: browser `fetch`.

## Important Notes / NEVER Change

- Never block rendering if OpenRouter fails.
- Only accept weights 1, 2, or 3.
- Keep the model in the allowed family from the user spec.

## Change History

| Date | Change | Author |
|------|--------|--------|
| 2026-06-09 | Cleaned OpenRouter prompt, retained `google/gemini-flash-1.5`, and rebuilt deterministic local fallback scoring. | Codex |
