# Rule: `domain/` — entities & enums, own their invariants (DDD)

Model this layer Domain-Driven. The domain is the heart of the system — behavior-rich, framework-light, expressed in the ubiquitous language. Push logic and invariants **into** the domain; keep it out of services where it would leak.

## Entities & aggregates
- Entities extend `BaseEntity`, `@Id @GeneratedValue(IDENTITY)`.
- **No public setters.** Mutate through explicit, intention-revealing business methods (`rename(...)`, `changePlan(...)`); construct through static factories (`Workspace.create(...)`).
- `@NoArgsConstructor(access = PROTECTED)`, restricted/`PACKAGE` builder — never expose unguarded construction.
- An aggregate root guards its own invariants and is the only entry point for changing anything inside its boundary. External code references other aggregates by id, not by holding the object graph.
- Always keep an entity in a valid state — reject invalid transitions inside the method (throw), don't let a service set the object into a bad state and validate afterwards.

## Value objects
- Prefer **self-contained value objects** over bare primitives for any concept with rules (money, email, name, plan limits, date ranges, identifiers). No "primitive obsession."
- Value objects are **immutable** (Java `record`s), have **no identity** — equality is by value — and validate themselves in the constructor (compact constructor that throws on bad input).
- They own the behavior tied to their data (e.g. a `Money` that adds, a `DateRange` that tests overlap) so the rules live with the type, not scattered in services.
- A value object can't be in an invalid state once constructed.

## Enums, domain events, language
- Enums and small domain concepts live here too; give them behavior where it belongs rather than `switch`ing on them elsewhere.
- Domain raises domain events / exceptions in domain terms.
- Names come from the ubiquitous language — match what the business calls things.

## Boundaries
Domain knows nothing of HTTP, DTOs, persistence concerns, or Spring web. JPA mapping annotations are tolerated on entities, but no logic depends on the framework. Mapping to `dto/` happens in `mapper/`, never here.
