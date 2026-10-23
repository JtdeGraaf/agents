# Rule: Forms & validation — Zod + react-hook-form

Validation is **Zod** (not yup). Wherever possible, validate against schemas generated from the backend's
OpenAPI spec so the wire contract and the client validation share one source of truth.

## Schemas

- Prefer the **generated Zod schemas** in `@/api/generated/zod.gen` for request/response shapes — they track
  the backend automatically on `bun run api:generate`.
- Hand-write a Zod schema only for input the backend doesn't model (pure UI state) or to tighten a generated
  one; co-locate it with the feature that uses it.

## Forms

- Use **react-hook-form** with `@hookform/resolvers/zod`:
  `useForm({ resolver: zodResolver(schema) })`.
- Render fields with the `components/ui/` inputs (`Input`, `Label`, …); show messages from RHF's
  `formState.errors`. Validation messages are **i18n keys**, not hard-coded strings (see i18n rule).
- Submit through a **feature mutation hook** (TanStack Query), not a bare `fetch`.

**Self-check:** a new form should reference a Zod schema (generated where possible), use `zodResolver`, and
submit via a feature hook. No manual `if (!value) …` validation ladders.
