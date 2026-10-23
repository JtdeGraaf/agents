---
name: netplay-host
description: Architecture for the networking side of multiplayer games in C# / .NET — a shared library (packets, content model, error codes), an engine-free host library that runs inside a player's client (listen host) or a thin dedicated server, feature modules layered Handlers → Application → Data/Domain with Mappers to packets, a single-threaded tick, MessagePack packets where the class is the id, protocol versioning, data-driven content. Use when writing or reviewing .NET game server / host / shared-library code, packets, packet handlers, match or session services, or their tests.
---

# Netplay host

Written for **.NET 8+, C#, MessagePack, LiteNetLib / Steam relay transports, xUnit**. The client side is the
`godot-client` skill in this plugin; `house-style` applies to both. A project's own `CLAUDE.md` and
`.claude/rules/` win.

## The shape

```
client ──► platform (e.g. steam) ──► host ──► shared
   │                                   ▲
   └───────────────────────────────────┘
dedicated-server ──► host
tests ──► shared, host, platform (pure helpers only)
```

- **`shared`** references nothing of ours: packets, serializer, content model, error codes, logic both sides run.
- **`host`** runs one match/lobby. It never references the engine, the platform SDK or a hosting framework, so it
  can run **inside a player's client** (listen host) as well as in a dedicated server.
- **Listen host** = the host library over a composite transport (loopback + network): the hosting player joins their
  own match over loopback, through the same packets and handlers as everyone else.
- **Dedicated server** is a thin shell: configuration + a loop that ticks the host. No game logic. Useful for dev,
  tests and CI even when players host.
- **Platform project** (Steam etc.) is the only one touching the vendor SDK; its public API uses plain types
  (`ulong` ids) so vendor types never leak.
- **Content is data** (JSON at the repo root) — the single source of truth. Code never names content.

## Rules (NON-NEGOTIABLE)

Read the relevant rule **before** working in that layer:

- [rules/00-feature-modules.md](rules/00-feature-modules.md) — projects, feature modules, layer folders, dependency direction
- [rules/10-handlers.md](rules/10-handlers.md) — `Handlers/` packet edge, thin: one service call
- [rules/20-application.md](rules/20-application.md) — `Application/` services own the flow; single-threaded tick
- [rules/30-data.md](rules/30-data.md) — `Data/` repositories and content loading, no logic
- [rules/40-domain.md](rules/40-domain.md) — `Domain/` entities & value objects own their invariants
- [rules/50-packets.md](rules/50-packets.md) — wire contracts, protocol versioning, adding a packet
- [rules/60-mappers.md](rules/60-mappers.md) — `Mappers/` domain ↔ packet translation
- [rules/70-tests.md](rules/70-tests.md) — unit, service and end-to-end test conventions
- [rules/80-error-handling.md](rules/80-error-handling.md) — coded errors on the wire
- [rules/90-csharp-style.md](rules/90-csharp-style.md) — C# control flow, comments, build strictness

## House rules

- **No silent defaults** on anything deserialized (packets, content): required is `required`, optional is nullable.
  Deliberate content defaults are documented on the property.
- **Code never names content.** No item/level/task ids in C# (defaults included) — mods and renames must not break
  silently. New behaviour extends fixed enums; never per-item or per-level scripts.
- **Unknown JSON properties are an error** in content, so a typo in a mod is reported instead of ignored. Content
  validation reports **every** error at once. Translations travel with the content (`text` + `textLocalized`).
- `float` / `System.Numerics` for physics, `double` for host clock time. No `decimal` in game code.
- Verify: solution build, client build, all test suites green.
