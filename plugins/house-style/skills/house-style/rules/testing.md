# Rule: Tests — deliberate, behavioural, at the right layer

A test earns its place when **it fails when behaviour or logic breaks, and only then** — never because copy was
reworded, a class renamed or markup restructured.

## Principles

- **Deliberate assertions.** Assert exact values when they are known (`equals(["name is empty"], errors)`), never
  loose matchers (`any()`, `contains(e => e.includes("name"))`).
- **Real code over mocks.** Prefer running the real stack; fake only true external boundaries (network, clock,
  outbound messaging, third-party APIs). Mocking your own modules tests your mocks.
- **Push edge cases down.** Many fast unit tests on domain types and pure logic; a strong core of integration tests;
  end-to-end only for wiring.
- **Don't re-test the type system** or framework internals.
- **Randomness and time are injected**: a seeded random, a manual clock. Never wait on wall time.

## Where each kind of test goes

| Change | Test |
|---|---|
| A new rule / invariant | Unit test on the domain type: rejects bad input, refuses illegal transitions |
| A new flow / endpoint / message | Integration test through the service interface with the real stack |
| HTTP / transport wiring itself | A thin edge test (status codes, serialization, registration) |
| A runtime-only bug | The minimal test that reproduces it, named after the behaviour |

## Naming & shape

- Mirror the production path. Name by behaviour: `method_scenarioAndExpectedOutcome`
  (`cancel_throwsWhenAlreadyShipped`) or a sentence (`retries once after a 401`).
- Arrange / act / assert separated by blank lines. A short comment only for the non-obvious why.
- Shared builders and fakes live in one `support`/`fixtures` place, not copied per test.

**Self-check:** before each assertion ask "does this fail only when behaviour breaks?" If it would also fail on a
typo fix, a rename or a restyle — and that's all it checks — delete it.
