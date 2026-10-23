# Rule: Control flow — flatten nesting, return early (NON-NEGOTIABLE)

Keep the **happy path at the leftmost indentation**. Handle the exceptional, invalid, or edge case first and
leave via `return` / `throw` / `continue`; never wrap the main logic in an `if` and push the failure into an
`else`. Deep nesting is a defect, not a style choice — it hides the real path and breeds bugs.

## Guard clauses first

Validate, reject, and short-circuit at the top so the rest of the body runs unguarded.

```ts
// NO — main logic buried inside nested ifs, failure in the else
function ship(order: Order | null): Shipment {
  if (order) {
    if (order.isPaid) {
      if (order.items.length > 0) {
        return createShipment(order)
      } else {
        throw new AppError(ErrorCode.ORDER_EMPTY)
      }
    } else {
      throw new AppError(ErrorCode.ORDER_UNPAID, order.id)
    }
  } else {
    throw new AppError(ErrorCode.ORDER_NOT_FOUND)
  }
}

// YES — guards exit early, happy path flat at the bottom
function ship(order: Order | null): Shipment {
  if (!order) throw new AppError(ErrorCode.ORDER_NOT_FOUND)
  if (!order.isPaid) throw new AppError(ErrorCode.ORDER_UNPAID, order.id)
  if (order.items.length === 0) throw new AppError(ErrorCode.ORDER_EMPTY)
  return createShipment(order)
}
```

## Rules of thumb

- **No `else` after a branch that returns/throws.** If the `if` exits, drop the `else` and de-indent its body.
- **Invert conditions to exit early.** `if (valid) { … }` wrapping a body becomes `if (!valid) return` at the top.
- **In loops, `continue`/`return` early** instead of wrapping the body in `if (shouldProcess) { … }` — or filter
  first (`filter`/`where`/`find`/`any`) instead of an imperative nested loop.
- **Avoid the arrow anti-pattern.** More than ~2 levels of nesting in a function is the signal to flatten.
- **Extract instead of nest.** When guards aren't enough, lift the nested block into a well-named helper, or push
  the decision into the domain (a value object validating itself, an entity method that refuses).
- **Collapse if/else ladders.** A chain that picks a value or behaviour by enum/type belongs on the enum itself, in
  a lookup map, or in one `switch` expression — not a stack of `if (kind == A) … else if …`.
- **Input/event dispatch** is a sequence of flat `if (action) { handle(); return }` blocks, not an `else if` chain.
- **In UI markup**, early-return empty/loading/error states and extract small components instead of nesting ternaries.
- Early **throws** still use coded errors (see [errors](errors.md)).

**Self-check:** read the function top to bottom. Guards and edge cases handle-and-exit first; the main path is flat
and last; nothing hangs off an `else` after an exit. If it stair-steps to the right, flatten it.
