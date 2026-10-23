# Rule: `data/` — persistence

`@Repository` interfaces extending `JpaRepository<Entity, Id>`.

- Derived query methods or `@Query` only — no business logic.
- Repositories return **entities** by default. Returning a DTO is allowed **only** as a read projection — a JPQL constructor expression (`SELECT NEW <base-package>.<feature>.dto.XDTO(...)`) or a Spring Data interface/record projection — to avoid over-fetching on reads. The projection target is a `dto/` record; the mapping logic stays in the query, not in Java code here.
- Never accept a DTO as input or persist one — writes go through entities.
- Only `application/` injects repositories. Controllers never do.
