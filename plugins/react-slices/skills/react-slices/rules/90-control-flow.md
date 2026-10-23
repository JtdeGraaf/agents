# Rule: Control flow — TypeScript & JSX specifics (NON-NEGOTIABLE)

The principle is the house-style control-flow rule: guards exit early, happy path flat and last, no `else` after an
exit. In TypeScript / React:

```tsx
// NO — nested ternaries
return isLoading ? <Spinner /> : error ? <ErrorState error={error} /> : items.length ? <List items={items} /> : <Empty />

// YES — flat early returns
if (isLoading) return <Spinner />
if (error) return <ErrorState error={error} />
if (items.length === 0) return <Empty />
return <List items={items} />
```

- Reach for `filter` / `map` / `find` / `some` over imperative nested loops.
- A value-or-type → result chain is a lookup object / `Map`, or a `switch` that returns — not `if (kind === 'x') … else if`.
- When guards aren't enough, extract: a pure function in `lib/` for logic, a subcomponent or custom hook for
  UI/stateful logic (see [component responsibility](45-component-responsibility.md)).
