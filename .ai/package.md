# package.json

> Last updated: 2026-06-09 | Protection: STANDARD

## Purpose

Defines project metadata, scripts, and dependencies.

## What It Does

- Runs Vite development and production build commands.
- Lists React, Vite, TypeScript, and Pretext dependencies.
- Will expose a no-new-dependency test script using `tsc` plus Node's built-in test runner.

## Important Notes / NEVER Change

- Avoid adding new dependencies unless the user explicitly approves them.
- Keep scripts Windows-compatible.

## Change History

| Date | Change | Author |
|------|--------|--------|
| 2026-06-09 | Added `test` script using `tsc -p tsconfig.test.json` and Node's built-in test runner. | Codex |
