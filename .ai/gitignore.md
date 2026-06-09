# .gitignore

> Last updated: 2026-06-09 | Protection: STANDARD

## Purpose

Keeps generated dependencies, builds, and temporary test output out of version control.

## What It Does

- Ignores `node_modules`, Vite build output, local environment files, and editor metadata.
- Will ignore `.tmp-tests` emitted by the local test script.

## Important Notes / NEVER Change

- Do not ignore source files or documentation required for the app.

## Change History

| Date | Change | Author |
|------|--------|--------|
| 2026-06-09 | Added `.tmp-tests` ignore entry for compiled Node tests. | Codex |
