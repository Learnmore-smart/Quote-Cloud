# layoutCore.test.ts

> Last updated: 2026-06-09 | Protection: STANDARD

## Purpose

Regression tests for the exact quote cloud collision and spiral placement behavior.

## What It Does

- Verifies touching AABB edges count as intersection under the specified math.
- Verifies quote nodes sort by descending weight and place the heaviest item at the origin.
- Verifies placed padded boxes do not overlap.

## Dependencies

- Internal: `src/layoutCore.ts`.
- External: Node built-in `node:test` and `node:assert`.

## Important Notes / NEVER Change

- Tests should check observable behavior of the exact algorithm, not copied implementation details.

## Change History

| Date | Change | Author |
|------|--------|--------|
| 2026-06-09 | Added regression tests for AABB edge contact, weight sorting, origin placement, and padded non-overlap. | Codex |
