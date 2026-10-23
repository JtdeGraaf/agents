# Rule: Feature modules

Each top-level concept is a **feature module** at `<base-package>.<feature>`, owning the full vertical slice:

```
<base-package>.<feature>.{application, controllers, data, domain, dto, mapper}
<base-package>.common.{config, domain, exception, …}
```

- A feature's internals are private to it. Cross-feature calls go through the other feature's `application/`
  **service interface** — never its `data` or `domain` directly.
- Code shared by every feature lives in `common/` (e.g. `BaseEntity`, exceptions, config), not inside a feature.
- New top-level concept → new feature module mirroring this structure (only the layers it needs).
- If there is a frontend, its feature folders mirror these modules one-to-one.

## Dependency direction

Dependencies point inward and never skip a layer:

```
controllers → application → {data, domain}
mapper bridges domain ↔ dto
```

## Shared constants

A value reused across layers or features — a validation regex, a magic string, a limit — lives **once** as
`public static final` on a Lombok `@UtilityClass` in `common/`, never re-typed at each use site. (`@UtilityClass`
constants stay compile-time constant expressions, so they work in annotations.)

- A limit enforced both at the wire (`@Pattern`/`@Size` in a `dto/`) and in the `domain/` (a value object's compact
  constructor) must reference the **same** constant, so the HTTP contract and the invariant can't drift apart —
  e.g. `CreateAccountRequest` and the `AccountName` value object both use `AccountName.MAX_LENGTH`.
- A constant tied to one value object (its max length, default) stays on that type; promote it to `common/` only
  once a second layer or feature needs it.

Per-layer rules: [controllers](10-controllers.md), [application](20-application.md), [data](30-data.md),
[domain](40-domain.md), [dto](50-dto.md), [mapper](60-mapper.md).
