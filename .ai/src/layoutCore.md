# layoutCore.ts

> Last updated: 2026-06-09 | Protection: CRITICAL

## Purpose

Contains the exact rectangle collision and Archimedean spiral placement algorithm required by the quote cloud specification.

## What It Does

- Exports `Rectangle` and `QuoteNode` shapes.
- Exports the exact `intersect` AABB check.
- Exports the exact `calculateLayout` spiral placement loop.

## Public API

| Name | Type | Description |
|------|------|-------------|
| `intersect` | function | Exact AABB overlap check using the required inequality logic. |
| `calculateLayout` | function | Sorts quote nodes by descending weight and assigns center-relative `x`/`y` coordinates along the specified spiral. |

## Dependencies

- Internal: none.
- External: none.

## Important Notes / NEVER Change

- Do not alter the AABB inequality operators.
- Do not alter `step = 0.05`, `spiralFactor = 1.2`, or the `r < 5000` loop condition unless the user explicitly changes the specification.
- Do not add fallback placement that can knowingly overlap nodes.

## Change History

| Date | Change | Author |
|------|--------|--------|
| 2026-06-09 | Implemented exact exported AABB and spiral layout module with no fallback placement. | Codex |
