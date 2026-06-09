# QuoteItem.tsx

> Last updated: 2026-06-09 | Protection: CRITICAL

## Purpose

Renders a single packed quote at its exact center-relative layout coordinate.

## What It Does

- Positions the quote with `left: 50%`, `top: 50%`, and the required transform formula.
- Applies measured width, height, font size, line height, and author metrics.
- Renders static text with no hover, focus, glow, or animation behavior.

## Dependencies

- Internal: `src/types.ts`.
- External: React JSX runtime.

## Important Notes / NEVER Change

- Keep the transform shape: `translate(calc(-50% + xpx), calc(-50% + ypx))`.
- Do not add interactive hover/focus/animation behavior to quote elements.
- Rendered author space must match layout measurement when author visibility is enabled.

## Change History

| Date | Change | Author |
|------|--------|--------|
| 2026-06-09 | Switched to `left: 50%`, `top: 50%`, and the specified center transform; wired measured author styles. | Codex |
