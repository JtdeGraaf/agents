# Rule: Tests — unit, service, end-to-end

xUnit. Principles are house-style's testing rule: exact assertions (`Assert.Equal(["task 't': text is empty"],
ex.Errors)`), real code over mocks.

| Suite | What |
|---|---|
| `tests/<Game>.Tests` | shared, host, platform helpers — no engine |
| `tests/<Game>.Client.Tests` | the client's plain C# classes — no engine (see `godot-client`) |
| engine tests in the client project | nodes, scenes, physics in headless Godot (see `godot-client`) |

## Layout & naming

- Mirror the production path and namespace: `Host/Match/Domain/RoundTests.cs` → `<Game>.Tests.Host.Match.Domain`.
  Class `<Type>Tests`.
- Method `Method_ScenarioAndExpectedOutcome` — `TryRecord_RejectsFramesAfterFinish`,
  `Join_RejectsVersionMismatchWithCodedErrorAndDisconnects`.
- Arrange / act / assert separated by blank lines. Shared builders and fakes live in `Support/` (`TestContent`,
  `RecordingMessenger`, `ManualClock`).

## Unit tests — domain & pure logic

Domain types, value objects, shared logic. Construct, call, assert. Invariants get covered here: a value object
rejecting bad input, an entity refusing an illegal transition, a `Try…` returning `false`. Randomness: pass a seeded
`Random`.

## Service tests — a feature through its real stack

Compose the **real** services, repositories and mappers exactly as the composition root does; fake only the outbound
boundary (`RecordingMessenger`) and time (`ManualClock`). Drive through the service interface, assert on sent
packets and domain state.

## End-to-end — the host over real transports

Real network transport on port 0 plus loopback. Only for wiring — handshake order, handler registration, transports,
listen-host behaviour. Behaviour belongs in service tests.

## What to test where

- New rule → domain unit test. New flow → service test. New packet → serializer round-trip.
- New `ErrorCode` → covered automatically by a test that every code has a template.
- Real content files are loaded and validated by a test, so a broken content file fails CI.
