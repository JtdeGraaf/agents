# Rule: Domain modelling — types own their invariants (DDD)

The domain is the heart of the system: behaviour-rich, framework-light, named in the language the business (or the
game) actually uses. Push logic and invariants **into** the domain types; keep them out of services, handlers and UI
where they would leak and get duplicated.

## Entities & aggregates

- **No public setters.** State changes through intention-revealing methods (`order.cancel()`, `account.rename(...)`),
  construction through a static factory or a guarded constructor (`Order.place(...)`).
- **Always valid.** Reject bad input or an illegal transition *inside* the method. Never let a caller put the object
  into a bad state and validate afterwards.
- Throw for programming errors and broken invariants; return `false` from a `try…` method when untrusted input is
  expected to be wrong sometimes (a late network frame, a double click).
- An **aggregate root** is the only way into its boundary. Expose collections read-only.
- Reference other aggregates and other features **by id**, never by holding their object graph.

## Value objects

- Prefer a value object over a bare primitive for any concept with rules or that is easy to mix up: ids, money,
  email, names, limits, date ranges. No primitive obsession.
- Immutable, equality by value, validated in the constructor — a value object can't exist in an invalid state.
- Give them the behaviour tied to their data (`Money.add`, `DateRange.overlaps`, `Limits.allows(x)`), so the rule
  lives with the type instead of scattered across services.

## Enums & branching

Give enums behaviour where the language allows it; otherwise put the logic on the type that owns the enum and switch
over it in **one** place — never `if (type == …)` ladders spread around the codebase.

## Shared constants

A value reused across layers — a limit, a regex, a protocol number — lives **once**, on the type it belongs to
(`DisplayName.MAX_LENGTH`). Promote it to a shared constants holder only when a second type or feature needs it. A
limit enforced both at the wire and in the domain must reference the **same** constant, so the contract and the
invariant can't drift apart.

## Numbers

- Exact decimals (money, ratios) use an exact decimal type, never binary floats. Physics and graphics use floats.
- Units go in the name (`timeoutSeconds`, `durationMs`) or a one-line doc when not obvious.

## Boundaries

The domain knows nothing of HTTP, DTOs, packets, persistence frameworks, UI or logging. Translation to wire types
happens in a mapper at the edge.
