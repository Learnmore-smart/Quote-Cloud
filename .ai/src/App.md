# App.tsx

> Last updated: 2026-06-09 | Protection: STANDARD

## Purpose

Owns the quote cloud application state and wires paper controls, font loading, AI weights, layout, and printing together.

## What It Does

- Waits for fonts before fetching weights and measuring.
- Fetches or falls back to quote weights.
- Computes virtual paper size and preview scale.
- Re-runs layout when paper, orientation, author visibility, or quotes change.
- Injects print page rules and triggers printing.

## Dependencies

- Internal: `ControlPanel`, `PaperCanvas`, `layout`, `print`, `weights`, `seed`, `config`, `types`.
- External: React.

## Important Notes / NEVER Change

- Do not run layout before `document.fonts.ready` resolves.
- Layout dimensions should come from the virtual paper size, not from the scaled preview size.

## Change History

| Date | Change | Author |
|------|--------|--------|
| 2026-06-09 | Updated to stable virtual paper pixels, viewport preview scaling, and author-aware relayout. | Codex |
