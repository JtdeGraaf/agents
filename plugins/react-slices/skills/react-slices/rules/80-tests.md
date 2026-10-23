# Rule: Tests — Vitest + React Testing Library

Vitest (jsdom) + React Testing Library + `@testing-library/jest-dom` + `@testing-library/user-event`.
Setup in `src/test/setup.ts` (auto-cleanup). Co-locate as `*.test.ts(x)` next to the unit. Run `bun run test`.

## Principle: test behaviour at the right layer (NON-NEGOTIABLE)

Follow the **testing-trophy** shape — many cheap logic tests, a strong core of integration tests, smoke tests
only where they earn it, near-zero pure-render assertions. The bar for any test: **it fails when behaviour or
logic breaks, and only then** — never because copy was reworded, a class renamed, or markup restructured.
Static checks (`tsc`, ESLint) already cover a whole class of bugs; don't re-assert what the types guarantee.

We test what the code _does_, not how the markup _looks_.

## Layers — where each kind of test goes

- **Logic — unit tests, thorough.** Pure functions (`lib/`), schemas, token storage, i18n parity, any
  derivation or branch. No React; fast and many — push edge cases here.
  (`lib/utils.test.ts`, `api/client.test.ts`, `i18n/i18n.test.ts`.)
- **Integration — the highest-value layer; the default for anything with behaviour.** Render a component
  _with its real hooks_ and mock only the **network boundary** with **MSW** (`msw`; handlers + server in
  `src/test/`). Drive it with `user-event`; assert the user-visible outcome with `findBy*` / `waitFor`. This
  is where features are actually proven — the OAuth exchange + single-flight 401-refresh flow, forms
  (submit → mutation → result/error), UI that branches on server state. **Mock HTTP, never the generated SDK
  or React internals** — mocking modules tests your mocks, not your app.
- **Smoke — only where there is real crash risk.** A component that can throw on mount (Base UI structural
  contracts, non-trivial conditional render) is worth a render-without-crashing test. A trivial presentational
  wrapper (`Card`, `Label`, `Input`) has no logic and cannot crash — **write no test for it.** A pile of "it
  renders" tests is itself the churn this rule exists to prevent; the right number is zero.
- **Regression — reproduce runtime-only bugs.** A bug that slips past typecheck/build (e.g. the Base UI
  `MenuGroupContext is missing` throw) earns the minimal render test that reproduces it. See
  `dropdown-menu.test.tsx`.
- **E2E — out of scope here.** Critical end-to-end journeys belong in Playwright, run separately — not in the
  Vitest suite.

## How to assert without coupling to markup

- **Locate** elements through the accessibility tree, in priority order: `getByRole('button', { name })` →
  `getByLabelText` → `getByText` → (last resort) `getByTestId`. Using an element's accessible name to _find_
  it is good — it exercises a11y for free. That is different from **coupling to copy**, which means making
  "this exact string is on screen" the _point_ of the test. Finding the logout item by name and asserting
  _the click logged the user out_ is fine; asserting the heading equals a specific sentence is not.
- **Assert outcomes**, not appearance: a handler ran, the route changed, a region appeared/disappeared, a
  request fired with the expected body (assert that in the MSW handler). Never class names, inline styles, or
  DOM structure.
- **Async:** `findBy*` / `waitFor` — never arbitrary timeouts. `user-event` over `fireEvent`.
- Base UI overlays (Menu/Dialog) often won't open via a synthetic click in jsdom — render them open with
  `defaultOpen` / `open` to assert their behaviour.

## Don't

- Don't snapshot components — the brittle, low-signal assertion this rule targets. (Inline snapshots of _pure
  data_ output — a normalized object, a generated key — are fine.)
- Don't test the generated client, Base UI internals, or anything the types already guarantee.
- Don't assert exact copy, classes, or DOM shape as the goal of a test.

Name tests by behaviour (`logs the user out`, `retries once after a 401`, `clears both tokens`), not by render
(`renders its label`).

**Self-check:** before each assertion, ask _"does this fail only when behaviour breaks?"_ If it would also
fail on a typo fix, a rename, or a restyle — and that's all it checks — delete it. If a component has no logic
and can't crash, don't test it.
