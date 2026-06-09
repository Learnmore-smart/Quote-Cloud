# measure.ts

> Last updated: 2026-06-09 | Protection: CRITICAL

## Purpose

Measures quote text dimensions with `@chenglou/pretext` for deterministic multiline packing.

## What It Does

- Converts AI weights into font sizes and font weights.
- Prepares text with Pretext after fonts have loaded.
- Uses Pretext `layout` and `walkLineRanges` to determine height, line count, actual max line width, and rendered line text.
- Measures optional author metadata for author-visible layouts.

## Public API

| Name | Type | Description |
|------|------|-------------|
| `prepareQuotes` | function | Prepares each quote with the current font config. |
| `fontSizeForWeight` | function | Maps base font size and AI weight to render font size. |
| `maxWidthForWeight` | function | Computes multiline wrapping width. |
| `measureQuoteText` | function | Measures prepared multiline text and materializes line text. |
| `measureAuthorLine` | function | Measures author line width and height. |

## Dependencies

- Internal: `src/types.ts`.
- External: `@chenglou/pretext`.

## Important Notes / NEVER Change

- Measurement must use Pretext, not DOM bounding boxes.
- Keep CSS font declarations synchronized with the measurement font strings.
- Use `walkLineRanges` for line widths so boxes shrink-wrap the actual multiline text.

## Change History

| Date | Change | Author |
|------|--------|--------|
| 2026-06-09 | Replaced line measurement with Pretext `layout`, `walkLineRanges`, and `materializeLineRange`; added author line measurement. | Codex |
