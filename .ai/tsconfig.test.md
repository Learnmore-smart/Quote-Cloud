# tsconfig.test.json

> Last updated: 2026-06-09 | Protection: STANDARD

## Purpose

Compiles pure TypeScript test targets to a temporary directory for Node's built-in test runner.

## What It Does

- Emits selected testable modules and tests into `.tmp-tests`.
- Uses Node ESM settings so emitted tests can run under `node --test`.

## Important Notes / NEVER Change

- Keep this narrow to pure modules that do not require browser APIs.
- Do not include the full Vite app unless the module import paths are Node ESM compatible.

## Change History

| Date | Change | Author |
|------|--------|--------|
| 2026-06-09 | Added narrow NodeNext test config for `src/layoutCore.ts` and tests. | Codex |
