# Rule: Comments — rare, short, markdown `///` (NON-NEGOTIABLE)

What earns a comment is in the house-style comments rule: a *why*, a unit, a domain rule, a trap. This file pins the
Java syntax.

## Syntax: markdown doc comments (`///`)

Java 23+ supports JEP 467 markdown doc comments. **Every doc comment uses `///`** — never `/** … */`.

```java
/// Minutes between the end of the previous booking and this one, in the venue's zone — never on raw
/// instants, because a season spans a DST change.
/// Negative when the bookings overlap.
static long gapMinutes(Booking previous, Booking next) { … }
```

- Markdown, not HTML: `` `code` `` not `{@code}`, `_em_` / `**strong**` not `<em>` / `<strong>`, a blank `///` line
  not `<p>`, `-` bullets not `<ul><li>`.
- Links are markdown references: `[DateRange#overlaps]`, `[PriceCalculator]` — not `{@link …}`.
- Block tags (`@param`, `@return`, `@throws`) still work but **only add one when it says something the signature
  does not**. `@param order the order` is noise; delete it.
- Implementation notes inside a method body use `//`.

## Length budget

- Type doc **1–3 lines**, method doc **1–2 lines** (or none), constant doc **1 line**.
- More than ~4 lines is a smell: the explanation belongs in a better name, a value object, or a test.

**Self-check:** delete the comment. If nothing was lost, it should not have been there. If a *fact* was lost, keep
that fact — in one line, in markdown, on a `///`.
