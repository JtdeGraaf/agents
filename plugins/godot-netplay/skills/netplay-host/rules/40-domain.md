# Rule: `Domain/` — entities & value objects own their invariants (DDD)

The general rule is house-style's domain-modelling rule. The game domain is framework-free (no engine, no platform
SDK, no logging, no packets), named in the game's own language — round, contestant, task, reaction.

## Entities & aggregates in C#

- **No public setters.** Properties are `{ get; private set; }` or get-only; state changes through
  intention-revealing methods (`contestant.SetReady(true)`, `round.Finish()`).
- Construct through a factory or a guarded constructor (`Round.Start(...)`, `PlayerSession.Create(...)`). Use a
  `private`/`internal` constructor when only the factory or the aggregate root may create the object.
- **Always valid.** Throw (`ArgumentOutOfRangeException`, `InvalidOperationException`) for programming errors, or
  return `false` from a `Try…` method when untrusted client input is expected to be wrong sometimes
  (`round.TryRecord`, `round.TryReact`).
- An **aggregate root** is the only way into its boundary. Collections are exposed as `IReadOnlyList<T>`.
- Other aggregates and features are referenced **by id**.

## Value objects in C#

- Ids (`PlayerId`, `ConnectionId`), names, limits, scoring rules — anything with rules or easy to mix up.
- `readonly record struct` for small values, `sealed record` when `default` would be invalid. A
  `readonly record struct` still has a `default` — only use one where that default is harmless or never reaches the
  domain.
- Validate in the constructor; give them their behaviour (`Limits.Allows(x)`, `Volume.Contains(point)`).

## Content definitions

Content types are deserialized straight from JSON (`init` properties), so their invariants are checked by one
factory (`ContentLibrary.Create`) that asks each type to validate itself and reports **every** error at once for
content authors. A content library that exists is valid.

## Enums

C# enums can't carry behaviour: put the logic on the type that owns the enum, and `switch` over it in one place
rather than `if (type == …)` ladders spread around.

## Numbers

Physics and positions are `float` / `System.Numerics`. Host clock times are `double` (hours of uptime need
sub-millisecond precision). Units go in the name (`TimeLimitSeconds`) or a one-line doc.
