# PaperCanvas.tsx

> Last updated: 2026-06-09 | Protection: STANDARD

## Purpose

Displays the paper board and all positioned quote items.

## What It Does

- Renders the virtual paper canvas at its true CSS pixel size.
- Scales the preview for the available viewport while keeping layout coordinates unchanged.
- Delegates quote rendering to `QuoteItem`.

## Dependencies

- Internal: `QuoteItem`, `Loader`, `src/types.ts`.
- External: React JSX runtime.

## Important Notes / NEVER Change

- Preview scaling must not alter the layout math.
- The paper canvas must remain `position: relative` so quote transforms are center-relative to it.

## Change History

| Date | Change | Author |
|------|--------|--------|
| 2026-06-09 | Added preview-scale frame around a true-size virtual paper canvas. | Codex |
