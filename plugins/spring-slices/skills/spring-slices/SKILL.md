---
name: spring-slices
description: Architecture and conventions for Java Spring Boot backends organised as DDD feature slices (<base-package>.<feature>.{controllers, application, data, domain, dto, mapper}). Thin controllers, services own logic and transactions, domain entities and value objects own their invariants, hand-written mappers, coded localisable errors, boxed types with NullAway, Testcontainers integration tests. Use when writing, reviewing or scaffolding Java / Spring Boot / JPA backend code, REST controllers, services, entities, DTOs or backend tests.
---

# Spring slices

Written for **Java 25, Spring Boot 4, Maven, JPA/Hibernate, PostgreSQL + Flyway, Lombok, NullAway, JUnit 5 +
AssertJ + Testcontainers**. On older stacks keep the architecture and adapt the syntax (e.g. `/** */` docs before
Java 23).

The `house-style` skill applies too; these rules add the Spring layering on top. A project's own `CLAUDE.md` and
`.claude/rules/` win over both.

## Layer responsibilities (NON-NEGOTIABLE)

Read the relevant rule **before** working in that layer:

- [rules/00-feature-modules.md](rules/00-feature-modules.md) — feature-module structure & inward dependency direction
- [rules/10-controllers.md](rules/10-controllers.md) — `controllers/` HTTP edge, thin; API versioning
- [rules/20-application.md](rules/20-application.md) — `application/` services own the logic
- [rules/30-data.md](rules/30-data.md) — `data/` persistence (entities + read-projection DTOs)
- [rules/40-domain.md](rules/40-domain.md) — `domain/` entities & value objects own their invariants
- [rules/50-dto.md](rules/50-dto.md) — `dto/` wire contracts
- [rules/60-mapper.md](rules/60-mapper.md) — `mapper/` domain ↔ dto translation
- [rules/70-tests.md](rules/70-tests.md) — unit & integration test conventions
- [rules/80-error-handling.md](rules/80-error-handling.md) — coded, localisable errors (`ErrorCode`)
- [rules/90-control-flow.md](rules/90-control-flow.md) — guard clauses in Java
- [rules/95-comments.md](rules/95-comments.md) — markdown `///` doc comments, never `/** */`

## House rules

- **No primitive fields except `boolean`.** Any instance field, `record` component or builder field that holds a
  number or `char` uses the boxed wrapper (`Integer`, `Long`, …). A primitive can't be absent: a missing JSON field
  deserializes to `0` and slips past `@PositiveOrZero`/`@Min`, and it's invisible to NullAway. Required = boxed +
  `@NotNull`; optional = boxed + `@Nullable`. Locals, loop counters, `static final` constants (needed in
  annotations) and computed return values stay primitive.
- **Fractional values use `BigDecimal`**, never `Double`/`Float`: exact, always finite, so `NaN`/`Infinity` can't
  dodge an invariant. Whole numbers use `Integer`/`Long`.
- **Non-null by default** (NullAway with the base package annotated); `@Nullable` (JSpecify) opts in.
- **No MapStruct** — mappers are hand-written `@Component`s.
- Persistence schema changes go through Flyway migrations, never `ddl-auto`.
- Verify with `./mvnw verify` (integration tests need Docker for Testcontainers).
