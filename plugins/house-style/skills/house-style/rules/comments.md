# Rule: Comments — rare, short (NON-NEGOTIABLE)

Most code needs **no comment**. The name says what, the code says how. A comment earns its place only by carrying
information the code cannot: a *why*, a constraint, a unit, a domain rule, a deliberate trade-off, a trap.

## Syntax

Use the language's own doc-comment form and keep it terse. Stack skills pin the exact syntax (markdown `///` in
Java 23+, XML `///` in C#, TSDoc `/** */` only where tooling needs it). Implementation notes inside a body use a
line comment on its own line, above the code they explain. Tags like `@param` / `<returns>` appear **only** when they
say something the signature doesn't.

## Write this, not that

| Don't | Do |
|---|---|
| Restate the signature ("Returns the name.") | Nothing |
| Narrate the code line by line | Nothing |
| Essays on rationale, history, alternatives or future plans | One clause, or a `TODO:` |
| Getter / setter / DTO-field / packet-field docs | Only the non-obvious ones (unit, "null when…") |
| `@param x the x` tags that echo the names | Nothing |
| Banner comments (`// ---- helpers ----`) | Nothing |
| Commented-out code | Delete it |

Keep, and keep short:
- **Units, scales, time zones, coordinate spaces** — seconds vs ticks, ×1000 fixed-point, "local zone, not UTC".
- **Non-obvious why** — why this order of calls, why 72 hours, why not the obvious library.
- **Domain rules with an external source** — a regulation, a partner's export quirk, a game rule.
- **Traps** — a call that must happen first, an engine/framework gotcha, a value intentionally unspecified.
- **Deliberate limitations** — ideally as `TODO:`.

## Length budget

- Type doc: **1–3 lines**. What it is and the one thing a reader would get wrong.
- Method doc: **1–2 lines**, or none when the name and types already say it.
- Constant doc: **1 line**, usually the unit or the reason for the number.
- More than ~4 lines is a smell: the explanation belongs in a better name, a value object, a test, or `docs/`.

**Self-check:** delete the comment. If nothing was lost, it shouldn't have been there. If a fact was lost, keep that
fact — in one line.
