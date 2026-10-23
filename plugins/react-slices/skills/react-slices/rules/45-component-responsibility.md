# Rule: Components render — everything else is delegated (NON-NEGOTIABLE)

A React component is a **rendering function**. Its job is: take props/hook results → return markup, hold minimal
local UI state, and wire events to handlers. Anything that isn't rendering is delegated.

## Belongs in a component

- JSX / layout, conditional rendering, lists.
- **Local UI-only state**: open/closed, hover, focus, which tab is active, controlled-input value.
- Thin event handlers that **call** a hook/service function (`onClick={() => logout()}`), not handlers that contain
  the logic themselves.

## Does NOT belong in a component — delegate it

- **Data fetching / mutations** → a feature hook (`features/<x>/use<X>.ts`) over the generated SDK.
- **Business rules, derivations, calculations, formatting, parsing, mapping** → a pure module in `lib/`
  (framework-agnostic TypeScript — the frontend's "services"; e.g. formatting a score, grouping items by week).
- **Stateful non-trivial logic** (orchestration, effects, subscriptions, debounced flows) → a custom hook.
- **Token/storage/transport** → `api/client.ts` (see the api rule).

Two homes for delegated logic:

- **Hooks (`use*.ts`)** when it needs React (state, effects, query cache, context).
- **Pure `lib/` modules** when it doesn't — inputs in, outputs out, no React import, unit-tested directly (fast, no
  render). Prefer pushing logic here so it's reusable.

## Keep components small

- One component = one responsibility. If it renders several distinct regions, extract subcomponents.
- Extract a custom hook when a component accumulates state/effect logic; extract a `lib/` function when it
  accumulates calculation/formatting.
- A component that mixes layout **and** logic, needs comments to follow, or grows past roughly a screen or two of
  markup is a refactor signal. **Giant 1000-line components are a defect, not a style choice** — split by region
  (subcomponents) and by concern (hooks + `lib/`).

**Self-check:** if you deleted all the JSX, a well-built component has almost nothing left — the remaining logic
already lives in a hook or a `lib/` function you could test without rendering anything.
