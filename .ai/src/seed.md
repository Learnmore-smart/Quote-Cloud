# seed.ts

> Last updated: 2026-06-09 | Protection: STANDARD

## Purpose

Stores the bundled quote dataset rendered by the printable quote cloud.

## What It Does

- Exports `SEED_QUOTES` as the initial quote list.
- Preserves author and text fields for AI weighting and rendering.

## Dependencies

- Internal: `src/types.ts`.
- External: none.

## Important Notes / NEVER Change

- Keep the dataset aligned with the user-provided quote list.
- Do not add weights here; weights are assigned dynamically through `weights.ts`.

## Change History

| Date | Change | Author |
|------|--------|--------|
| 2026-06-09 | Corrected the atmoszh quote text to match the supplied dataset. | Codex |
