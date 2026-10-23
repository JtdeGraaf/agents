# Rule: Nodes render — logic is delegated (NON-NEGOTIABLE)

A UI node script (`Hud`, `LobbyScreen`, `MainMenuScreen`) is a **rendering component**: build controls, show data
it's given, raise events for input. Anything that isn't rendering is delegated.

## Belongs in a UI node

- Building the control tree, layout, visibility.
- Local UI-only state: which view is showing, a banner timer, the text to copy.
- Thin event wiring: `_startButton.Pressed += () => StartPressed?.Invoke();`, or one flow call
  (`_launcher.Join(_addressEdit.Text)`).

## Does NOT belong in a UI node — delegate it

| Kind of logic | Home |
|---|---|
| Formatting / deriving display text from packets (rows, subtitles, names) | a static `…Text` class next to the node (`LobbyText`) |
| Parsing input (addresses, join codes) | a value type in the feature folder (`ServerAddress`, `LobbyCode`) |
| Multi-step flows: connect, host, join, handshake, async platform calls | a flow class raising events (`SessionLauncher`) |
| Game knowledge: phase timers, who may act, display names | a state class (`MatchClientState`) |
| Transports, platform SDK, the listen host | the network / platform autoloads |

Gameplay nodes (player controller, interaction, items, replay playback) are physics/rendering by nature and stay
nodes; still extract pure maths or rules into plain methods or classes as they grow.

## Keep them small

One node = one region of screen or one gameplay responsibility. A node past roughly 200 lines, or one that needs
comments to follow, is a refactor signal: split into child builders (`BuildSessionRow()`), a text helper and a
flow/state class.

**Self-check:** delete the control-building code from a UI node. What's left should be a handful of one-line event
forwards — the rest already lives in a class you could test without Godot.
