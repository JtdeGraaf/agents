# Rule: `features/` — vertical slices

A feature owns everything specific to one concept: its data hooks and its feature-specific components. Layout
mirrors the backend's feature modules.

```
features/<feature>/
├── use<Feature>.ts      # data hooks over the generated SDK (TanStack Query)
├── <Feature>Dialog.tsx  # feature-specific components
└── …
```

## Data hooks wrap the generated SDK + TanStack Query

- Build hooks on the **generated TanStack Query helpers** (`@/api/generated/@tanstack/react-query.gen`):
  `useQuery({ ...getCurrentUserOptions(), … })`, mutations via the generated `*Mutation` helpers — typically a query
  plus a mutation that invalidates it.
- Do **not** call `fetch` or hand-roll URLs/query keys; the generated helpers own keys + request shape.
- A mutation invalidates the queries it affects (`queryClient.invalidateQueries({ queryKey: … })`).
- Set `enabled` / `staleTime` in the hook, not at every call site.

## Components

- Compose from `components/ui/` primitives; never reach into another feature's internals — share via `components/`
  or `lib/`.
- All copy via `useTranslation()`; all auth via `useAuth()`.

## Shared-context features follow the auth shape

When a feature needs shared context, split it so Fast Refresh and types stay clean: `x-context.ts` (context + types),
`useX.ts` (hook), `XProvider.tsx` (provider component), UI components in their own files.

**Self-check:** any component fetching data does it through a `features/<x>/use<X>.ts` hook, and that hook is a thin
wrapper over a generated SDK/query helper.
