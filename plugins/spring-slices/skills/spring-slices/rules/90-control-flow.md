# Rule: Control flow — Java specifics (NON-NEGOTIABLE)

The principle is the house-style control-flow rule: guards exit early, happy path flat and last, no `else` after an
exit. In Java:

```java
// NO — main logic buried inside nested ifs, failure in the else
public Shipment ship(Order order) {
    if (order != null) {
        if (order.isPaid()) {
            return order.ship();
        } else {
            throw new ConflictException(ErrorCode.ORDER_UNPAID, order.getId());
        }
    } else {
        throw new DataNotFoundException(ErrorCode.ORDER_NOT_FOUND);
    }
}

// YES — guards throw early, happy path flat at the bottom
public Shipment ship(Order order) {
    if (order == null) throw new DataNotFoundException(ErrorCode.ORDER_NOT_FOUND);
    if (!order.isPaid()) throw new ConflictException(ErrorCode.ORDER_UNPAID, order.getId());
    return order.ship();
}
```

- One-line guard throws may skip braces; anything longer gets braces.
- **Collapse ladders** onto the enum (give it behaviour) or a `switch` expression — not `if (type == X) … else if`.
- **Extract instead of nest**: a well-named private method, or push the decision into `domain/` (an entity or value
  object validating itself).
- Prefer streams (`filter`/`map`/`anyMatch`) over nested imperative loops when it reads flatter.
- Early throws use coded errors (see [error handling](80-error-handling.md)).
