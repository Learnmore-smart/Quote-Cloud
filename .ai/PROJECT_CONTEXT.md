# Quote Cloud Project Context

> Last updated: 2026-06-09 | Protection: STANDARD

## Purpose

Printable Quote Cloud Generator is a Vite + TypeScript + React app that renders a static typographic quote cloud on virtual paper sizes for preview and printing.

## Current Task

Implement the requested zero-interaction, zero-overlap quote cloud flow:

- Wait for `document.fonts.ready` before measurement.
- Fetch quote weights from OpenRouter with local fallback.
- Measure multiline text with `@chenglou/pretext`.
- Pack quotes with the exact AABB intersection and Archimedean spiral algorithm from the user specification.
- Iteratively fit base font size to the selected paper bounds.
- Render each quote absolutely from the paper center with the specified transform.
- Remove hover/focus/glow/animation behavior and keep print output high contrast.

## Constraints

- Do not replace the provided collision or spiral math with custom placement logic.
- Keep code TypeScript strict-compatible.
- Avoid new runtime dependencies.
- Preserve the supplied Chinese quote dataset.

