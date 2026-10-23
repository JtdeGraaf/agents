# Rule: `controllers/` — HTTP edge, thin (NON-NEGOTIABLE)

`@RestController` only: map HTTP ↔ DTO, validate input (`@Valid`), delegate to a service interface, return
`ResponseEntity`. **No business logic.**

A method that does more than one delegating call is a smell. If it does any of these, the logic belongs in a service:
- parsing/validating/inspecting tokens, claims, headers
- conditional branching on domain state (`if (!type.equals(...)) throw ...`)
- repository / `data` access — controllers never inject a `*Repository`
- entity ↔ DTO mapping — use a `@Component` mapper
- orchestrating multiple services or constructing domain results

Other:
- Inject the **service interface**, never the impl, never a repository.
- Authorization annotations (`@PreAuthorize`) live here — this is the real security boundary; frontend route guards
  are only UX.

## Paths & API versioning

- Map **only the resource path** — `@RequestMapping("/orders")`, `@RequestMapping("/orders/{orderId}/lines")`.
  **Never hard-code `/api` or a version** (`/api/v1/...`).
- The `/api/{version}` prefix is applied centrally to every controller in the base package (one `WebMvcConfigurer`
  that adds a base-package path prefix, e.g. `common/config/ApiVersioningConfig`), so a plain `@RestController`
  under `controllers/` is served at `/api/v1/<resource>`. Unsupported versions are rejected with 400.
- **Don't add a `version` attribute** to mappings while the API has a single version. Add
  `@GetMapping(version = "2")` on a specific method **only** when that endpoint genuinely diverges across versions.
- There is no per-controller opt-out: anything in the base package is served under `/api/v1`. A browser-facing/HTML
  endpoint that shouldn't be versioned doesn't belong in this package.

**Self-check:** every method body should read as "take request → call one service method → wrap response." If not,
move it down a layer.
