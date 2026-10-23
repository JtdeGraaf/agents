# Rule: Projects & feature modules

Applies to the .NET libraries (`shared`, `host`, platform, dedicated server, tests). The engine client has its own
rules (`godot-client` skill).

## What may reference what

- `shared` references nothing of ours. `host` never references the engine, the platform SDK or a hosting framework —
  it must run inside the client. The platform project is the only one that touches the vendor SDK.
- The dedicated server is configuration + a loop that ticks the host. No game logic.

## Host: one folder per feature, one folder per layer

```
Host/
├── <Game>Host.cs, ListenHost.cs       composition roots (no DI container)
├── Common/                            no feature dependencies
│   ├── Clock/ Configuration/ Domain/  (PlayerId, ConnectionId)
│   └── Network/                       transports, router, IPacketHandler
├── Sessions/                          who is connected: handshake, leave, clock sync
│   └── Handlers/ Application/ Data/ Domain/ Mappers/
└── Match/                             lobby readiness, rounds, scoring — the game itself
    └── Handlers/ Application/ Domain/ Mappers/
```

Namespaces follow folders: `<Game>.Host.Match.Domain`. Dependencies point inward and never skip a layer:

```
Handlers → Application → { Data, Domain }
Mappers bridge Domain ↔ Packets (shared)
```

- A feature's internals are private to it. Another feature goes through its `Application` **interface**
  (`ISessionService`), never its `Data` or `Domain` directly — except reading an entity that interface returns.
- Features reference each other's players by **id** (`PlayerId`), never by holding the other feature's objects. Game
  state about a player (ready, score) lives in the game feature's domain, not on the session.
- Features that react to each other use events wired in the composition root (`sessions.PlayerJoined += ...`), so
  there are no cycles between services.
- Code every feature needs lives in `Common/`, which references no feature.
- New top-level concept → new feature folder with the same layer folders (only the layers it needs).

## Shared library

Organised by concept; layer folders appear where a concept has more than one layer: `Content/Domain` (definitions +
invariants), `Content/Data` (JSON reading/writing), domain logic both sides run, `Packets/`, `Network/` (serializer,
packet registry, clock sync, client transport interface), `Errors/` (`ErrorCode` + templates), `Constants/`.

## Shared constants

A value reused across layers or projects — a protocol number, a limit, a rate — lives **once** as a `public const` on
a `static class` (`ProtocolVersion.Current`). A constant tied to one type stays on that type (`DisplayName.MaxLength`)
until a second place needs it.

## Files

One top-level type per file, named after it. Small enums/records that only exist for one type may share its file,
and a packet family may share one file (`RoundPackets.cs`).
