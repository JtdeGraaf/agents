---
name: react-slices
description: Architecture and conventions for React + TypeScript single-page apps organised by responsibility — thin file-based routes, feature slices with TanStack Query hooks over a generated OpenAPI client, components that only render, logic in hooks and pure lib/ modules, headless-primitive UI wrappers, Tailwind v4 tokens, Zod forms, typed i18n with locale parity, behaviour-level Vitest + MSW tests. Use when writing, reviewing or scaffolding React / TypeScript frontend code, routes, components, hooks, forms, styling, translations or frontend tests.
---

# React slices

Written for **Bun, Vite, React 19, TypeScript, TanStack Router (file-based) + TanStack Query, hey-api generated
client, Zod + react-hook-form, Base UI + Tailwind v4 + CVA, i18next, Vitest + React Testing Library + MSW**. With a
different router, primitive library or package manager keep the architecture and swap the names.

The `house-style` skill applies too; these rules add the frontend layering on top. A project's own `CLAUDE.md` and
`.claude/rules/` win over both.

```
routes/  →  features/  →  { api/, components/, lib/, i18n/ }
components/ui/  wraps headless primitives
```

## Layer responsibilities (NON-NEGOTIABLE)

Read the relevant rule **before** working there:

- [rules/00-structure.md](rules/00-structure.md) — project structure, where things live, dependency direction
- [rules/10-routes.md](rules/10-routes.md) — `routes/` thin file-based route modules
- [rules/20-features.md](rules/20-features.md) — `features/` vertical slices: data hooks + feature UI
- [rules/30-api.md](rules/30-api.md) — `api/` generated client (never edit) + hand-written `client.ts` (auth/tokens)
- [rules/40-components.md](rules/40-components.md) — `components/` shared UI + `components/ui/` primitive wrappers
- [rules/45-component-responsibility.md](rules/45-component-responsibility.md) — components render only; keep them small
- [rules/46-destructive-actions.md](rules/46-destructive-actions.md) — delete/discard go through `ConfirmDialog`
- [rules/50-styling.md](rules/50-styling.md) — Tailwind v4 `@theme` tokens, `cn()`, no inline hex
- [rules/60-forms.md](rules/60-forms.md) — Zod (generated) + react-hook-form
- [rules/70-i18n.md](rules/70-i18n.md) — all copy externalised, locale key parity, coded backend errors
- [rules/80-tests.md](rules/80-tests.md) — Vitest + React Testing Library + MSW, testing-trophy shape
- [rules/90-control-flow.md](rules/90-control-flow.md) — early returns in TS and JSX

## House rules

- **Never hand-edit generated files** (`src/api/generated/`, `routeTree.gen.ts`). Change the source, regenerate.
- Tokens live **only** in `api/client.ts`. Read auth state through `useAuth()`, never storage directly.
- Verify before declaring done: `typecheck`, `lint`, `test` and `build` scripts all green (plus `format`). Those four
  are the CI gate.
