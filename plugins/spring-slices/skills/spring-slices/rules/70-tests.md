# Rule: Tests — unit & integration

JUnit 5 + AssertJ (`assertThat`, `assertThatThrownBy`). Tests are **deliberate**: assert exact values, never loose
matchers (`any()`, `anyLong()`, `anyString()`). Prefer a real integration test over a pile of mocks.

Mirror the production package in `src/test/java`. Name methods `method_scenarioAndExpectedOutcome` (e.g.
`getCurrentAccount_returnsThePersonalAccountOfTheAuthenticatedUser`, `fromOAuth2Attributes_throwsWhenEmailMissing`).

## Unit tests — domain & pure logic

Use for `domain/` entities, value objects, enums, and any logic with no I/O. **No Spring context, no database** —
plain `new` / static factory, call the method, assert.
- This is where DDD invariants get covered: a value object rejecting bad input, an entity refusing an illegal
  transition. Assert the exception with `assertThatThrownBy(...).isInstanceOf(SomeException.class)`.
- Need an entity with a package-private builder? Use a `@UtilityClass` **test factory** in the entity's package
  (e.g. `UserTestFactory`), not reflection.
- Fast and many — push edge cases down here rather than into integration tests.

## Integration tests — service layer through the real stack

Default for anything touching `application/` + `data/` (persistence, transactions, queries, scoping). Extend one
shared `AbstractIntegrationTest`:
- Real Postgres via a **shared Testcontainer**; Flyway `clean()` + `migrate()` before each test for isolation; a
  seeded authenticated test user ready (`@ActiveProfiles("test")`).
- `@Autowired` the **service interface** (never the impl) and exercise behaviour through it. Assert on returned DTOs
  and, where relevant, on persisted state via repositories the base class exposes.
- Verify authorization/identity paths with helpers on the base class (`authenticateAsUser(...)`,
  `clearAuthentication()`).

## What to test where

- **Test behaviour at the service layer, not through the controller** — only write a web-layer (`@WebMvcTest` /
  MockMvc) test to assert HTTP wiring itself (status codes, validation, serialization, security filters).
- Don't mock what you can integration-test cheaply; reserve mocks for true external boundaries.

## NullAway in tests

NullAway does **not** trust AssertJ's `isNotNull()`. To narrow a `@Nullable` for later use, call
`Objects.requireNonNull(...)` first.

## Running

`./mvnw verify` — integration tests need **Docker** running for the Testcontainers Postgres.
