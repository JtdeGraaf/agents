---
name: godot-client
description: Architecture for Godot 4 C# game clients — organised by responsibility with thin scene-root "modes", UI nodes that only render, game knowledge in plain C# state/flow classes testable without the engine, one network autoload that owns transports and the embedded listen host, code-built UI on theme tokens, correct physics/process/input split, replays as recorded playback, and GdUnit4 engine tests. Use when writing or reviewing Godot C# scripts, scenes, UI, input, networking on the client, or client tests.
---

# Godot client

Written for **Godot 4.x .NET (C#), Jolt physics, GdUnit4**. Pairs with the `netplay-host` skill for the networked
side; `house-style` applies too (C# specifics in `netplay-host`'s C# style rule). A project's own `CLAUDE.md` and
`.claude/rules/` win.

```
Modes/ → { feature state & flows, UI/ } → { World/, Player/, Replay/, Network/, Utilities/ } → shared / host / platform
Autoloads/ (network client, platform manager) are the app-wide services
```

## Responsibilities (NON-NEGOTIABLE)

Read the relevant rule **before** working there:

- [rules/00-structure.md](rules/00-structure.md) — folders, dependency direction, moving scene-attached scripts
- [rules/10-modes.md](rules/10-modes.md) — `Modes/` scene roots are thin: packets → state → render
- [rules/20-nodes-render.md](rules/20-nodes-render.md) — UI nodes render only; text, parsing, flows and state live in plain classes
- [rules/30-network.md](rules/30-network.md) — one autoload owns transports; symmetric register/unregister; host-clock timers
- [rules/40-irreversible-actions.md](rules/40-irreversible-actions.md) — actions that hurt the player or others need a second step
- [rules/50-ui.md](rules/50-ui.md) — UI built in code, theme tokens, shared control hints
- [rules/60-update-loop.md](rules/60-update-loop.md) — physics vs process vs input, interpolation, never re-simulate replays
- [rules/70-tests.md](rules/70-tests.md) — plain-class unit tests vs headless engine tests

## Key ideas

- **Logic out of nodes.** Anything you can express without `using Godot` goes in a plain class with an xUnit test.
- **Content drives behaviour.** Items/levels are built from content definitions with behaviour from fixed enums —
  never item-specific scripts or scenes. Level scenes use only marker scripts and plain nodes so they can ship as
  mods later.
- **Settings and records** live in `user://` config files; a missing or broken file means defaults, never a crash.
- **Localisation seams from day one**: user-facing wording sits in constants with `{0}` placeholders (never
  concatenated), host failures arrive as error codes, content carries its own translations.
- Verify: client build, client unit tests, engine tests (whenever gameplay, levels or physics changed), then run the
  scene you touched.
