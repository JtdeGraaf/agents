# Rule: Client structure

The client is organised by **responsibility**. Each folder under `Scripts/` owns one concern; dependencies point
inward and never reach sideways into another feature's internals.

```
Scripts/
├── Autoloads/   NetworkClient (transports, listen host, clock sync, router), platform manager — app-wide services
├── Modes/       scene roots (MenuMode, MatchMode, SoloMode) — thin: wire packets/input to state and render
├── Match/       online game knowledge as plain C# (MatchClientState, confirmations)
├── Solo/        offline play as plain C# (session, seed, live evaluation, verdict)
├── Menu/        menu flows as plain C# (session launcher: host/join, address parsing)
├── Game/        the shared stage, client content loading, settings + records stores, launch options
├── World/       level instance, items built from content, surfaces, editor markers for exporters
├── Player/      controller, interaction/grab, input strategies (plain classes), body/rig
├── Replay/      recorder, playback, ghosts
├── UI/          nodes that render + their plain helpers (…Text classes, ControlHints) + the look (UiTheme, UiStyles)
├── Network/     PacketRouter, logger bridge
└── Utilities/   engine ⇄ System.Numerics conversions, model loader (content path → node, placeholder on miss)
Assets/          Audio/, Fonts/ (+ licences), Models/ (referenced from content), Shaders/, Textures/
addons/          editor + headless exporters (level metadata → content JSON)
EngineTests/     GdUnit4 tests run in headless Godot, mirroring Scripts/ (Debug builds only)
```

## Dependency direction

```
Modes → { Match, Solo, Menu, Game, UI } → { World, Player, Replay, Network, Utilities } → shared / host / platform
Autoloads are reachable from Modes and Menu flows, never from World/Player/Replay nodes
```

- **Plain-C# folders** (`Match/`, `Solo/`, `Menu/`, `UI/*Text`) hold logic without `Node` subclasses, so it is
  unit-tested without the engine. Prefer no `using Godot` there; when a flow must call the engine, keep that at its
  edges.
- A new online concept (spectating, a theater mode) → a folder next to `Match/` with its state/flow classes, rendered
  by a mode or a UI node.
- Code used by two features moves down (`UI/`, `Game/`, `Utilities/`), not copied.
- **Scene-attached scripts don't move casually**: `.tscn` files and `project.godot` reference them by `res://` path and
  `.cs.uid`. Moving one means updating those references in the same change (the editor's rename is safest).
- Game rules come from `shared`; the client never defines rules of its own that the host would disagree with.
