# Rule: `Application/` — services own the flow

Interface + implementation in the same file: `IMatchService` / `MatchService`. Sealed classes, dependencies through
the constructor into `private readonly _fields`, composed by hand in the composition root (no DI container).

- **All** orchestration lives here: guarding on phase/state, calling domain objects, sending packets through a
  messenger, logging, raising feature events.
- Push rules **down** into the domain whenever they're about the data rather than the flow. The service asks
  (`round.TryRecord(frame, limits)`, `roster.CanStart(min)`), it doesn't re-implement the check inline.
- Services inject repositories (`Data/`) and mappers of **their own** feature, and other features' service
  interfaces. Never another feature's repository.
- Every packet a service sends is built by a mapper. No `new SomePacket { ... }` in a service body.
- Callers (handlers, the composition root, tests) depend on the interface; the implementation stays swappable.
- Inputs are domain values (`PlayerId`) or the request packet itself when it carries several fields.

## Threading

Everything runs inside the host's `Tick` on one thread: transport events, handlers, services, timers. No locks, no
`async`, no background work in the host. Anything that must happen later is driven by a timer checked in
`Update(deltaTime)`. Every phase runs on a host timer; nothing waits forever on a player.

## Adding an interaction

1. Packet class + registry entry in shared (see [packets](50-packets.md)).
2. Domain method that enforces the rule.
3. Service method: guard → domain call → mapper → messenger.
4. Thin handler, registered in the composition root.
5. Tests: domain unit test for the rule, service test for the flow (see [tests](70-tests.md)).
