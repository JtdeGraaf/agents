# Rule: `routes/` — file-based route modules, thin (NON-NEGOTIABLE)

TanStack Router with file-based routing. The router plugin generates `routeTree.gen.ts` on dev/build — **never edit
`routeTree.gen.ts` by hand**.

## File → path conventions

- `__root.tsx` — root route: renders `<Layout><Outlet/></Layout>` + `notFoundComponent`.
- `index.tsx` → `/`; `dashboard.tsx` → `/dashboard`; `order.$orderId.tsx` → `/order/$orderId`
  (`$param` = dynamic segment); `oauth2.redirect.tsx` → `/oauth2/redirect`.
- Each module exports a `Route` via `createFileRoute('/path')({ ... })` (or `createRootRoute`).

## Route guards are UX, never authorization

Authenticated routes carry a `beforeLoad` that throws `redirect({ to: '/' })` when there is no session. Centralise
this in the guard instead of per-page `if (!isAuthenticated)` checks, which drift once there is more than one role.

**The real boundary is authorization on the backend.** A guard only avoids rendering a page that would fail anyway —
never treat it as the thing keeping data safe.

## A route module is thin

It wires data to UI and nothing more:

- Define the page component **inline** in the file (not exported); export only `Route`.
- Get data from **feature hooks** (`features/<x>/use<X>.ts`) — never call the generated SDK or `fetch` directly in a
  route.
- Read auth via `useAuth()`; copy via `useTranslation()`.
- Validate URL/search params with `validateSearch` so they are typed.

**Do not** put business logic, data fetching, or mapping in a route. If a route grows that, move it into a feature
hook/component.

**Self-check:** the page component reads as "call feature hooks → render components." Navigation uses
`<Link to="/…">` / `useNavigate()` (typed) — never `window.location` except for leaving the SPA (e.g. OAuth start).
