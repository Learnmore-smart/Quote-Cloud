# types.ts

> Last updated: 2026-06-09 | Protection: STANDARD

## Purpose

Defines shared TypeScript types for quotes, placed quote boxes, paper sizes, and orientation.

## What It Does

- Describes source quotes and AI weights.
- Describes measured and positioned quote render data.
- Describes paper selection types.

## Dependencies

- Internal: none.
- External: none.

## Important Notes / NEVER Change

- `PlacedQuote.x` and `PlacedQuote.y` are center-relative offsets.
- Add author measurement fields only when needed for renderer/layout agreement.

## Change History

| Date | Change | Author |
|------|--------|--------|
| 2026-06-09 | Added optional author metric fields to `PlacedQuote`. | Codex |
