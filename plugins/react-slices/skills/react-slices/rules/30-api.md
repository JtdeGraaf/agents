# Rule: `api/` — generated client + hand-written client (NON-NEGOTIABLE)

The API layer is the single boundary to the backend. It has two parts with strict ownership.

## `api/generated/` — generated, never hand-edited

- Produced by `@hey-api/openapi-ts` (an `api:generate` script) from the backend's OpenAPI spec. Plugins:
  `client-fetch`, `typescript` (types), `sdk`, `zod` (validation schemas), `@tanstack/react-query`.
- It is **committed** (so fresh clones + CI compile without a running backend) but treated as build output: do not
  edit it, do not reformat it, lint/prettier ignore it.
- To change it: change the **backend** (DTOs, controllers, OpenAPI annotations), run the backend, regenerate.
  Review the diff like any code.
- Consume backend types from `@/api/generated/types.gen` — never redeclare backend DTOs.
- The error-code union is generated too, which is what makes the `errors.*` i18n parity test possible (see the i18n
  rule).

## `api/client.ts` — the only hand-written file here

Owns transport concerns and **all** token handling:

- The token storage keys (`<app>_access_token` / `<app>_refresh_token`) and helpers (`getAccessToken`, `setTokens`,
  `clearTokens`); these strings live nowhere else.
- Request interceptor attaches `Authorization: Bearer <access>`.
- Response interceptor: on **401**, a **single-flight** refresh (the backend rotates the pair — persist the new one),
  retry once; on failure clear tokens and dispatch an auth-expired event the auth provider listens to.

## Token rules (apply everywhere)

- Components/features **never** touch storage for tokens — go through `useAuth()`. Only `api/client.ts` knows the
  keys.
- Only the OAuth start and the OAuth redirect route deal with tokens-in-URL; everywhere else tokens are implicit via
  the interceptor.

**Self-check:** if you typed `localStorage.getItem('<app>_…')` or `fetch('/api/…')` outside `api/client.ts`, it
belongs behind the client or a feature hook.
