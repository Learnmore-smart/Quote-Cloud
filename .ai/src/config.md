# config.ts

> Last updated: 2026-06-09 | Protection: STANDARD

## Purpose

Stores paper-size constants and OpenRouter configuration for the quote cloud app.

## What It Does

- Defines A4, A3, and Letter paper dimensions.
- Defines CSS `@page` size labels.
- Reads `VITE_OPENROUTER_API_KEY`.
- Provides paper pixel dimensions for the virtual canvas.

## Dependencies

- Internal: `src/types.ts`.
- External: Vite `import.meta.env`.

## Important Notes / NEVER Change

- Paper aspect ratios must match their physical dimensions.
- Pixel dimensions should use CSS 96 DPI conversion from millimeters for print-aligned virtual paper.

## Change History

| Date | Change | Author |
|------|--------|--------|
| 2026-06-09 | Added 96-DPI paper canvas sizing helper with orientation support. | Codex |
