# layout.ts

> Last updated: 2026-06-09 | Protection: CRITICAL

## Purpose

Coordinates quote measurement, exact spiral packing, iterative font-size fitting, and final center alignment for the printable cloud.

## What It Does

- Normalizes AI quote weights.
- Measures each quote for the current base font size.
- Runs the exact `calculateLayout` function.
- Computes cloud bounds and adjusts base font size for fit and fill.
- Returns `PlacedQuote` objects ready for center-based absolute rendering.

## Public API

| Name | Type | Description |
|------|------|-------------|
| `iterativeFitLayout` | function | Builds the final packed layout for a paper canvas. |

## Dependencies

- Internal: `src/layoutCore.ts`, `src/measure.ts`, `src/types.ts`.
- External: none directly.

## Important Notes / NEVER Change

- Keep all placement coordinates as center-relative offsets.
- Preserve exact collision/spiral math in `layoutCore.ts`; this file may only orchestrate measurement and fitting around it.
- Include author space in measured boxes when authors are visible so toggling authors cannot create overlap.

## Change History

| Date | Change | Author |
|------|--------|--------|
| 2026-06-09 | Refactored to use `layoutCore.ts`, iterate font size against virtual paper bounds, center final bounds, and include author space when visible. | Codex |
