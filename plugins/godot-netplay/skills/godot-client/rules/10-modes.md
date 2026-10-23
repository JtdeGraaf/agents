# Rule: `Modes/` — scene roots, thin

A mode (`MatchMode`, `SoloMode`, `MenuMode`) is the client's route: the root script of a scene. Its job is wiring.

- `_Ready`: create child nodes (stage, HUD, views), subscribe to their events, register packet handlers,
  `FlushPending()`.
- Packet handler: pass the packet into a state/flow class, then render what changed. The decision itself (may I act?
  am I sitting this round out? how long is left?) is answered by the state class, not computed inline.
- `_ExitTree`: unregister every packet type the mode registered, unsubscribe from autoload events, release the mouse.
- Phase-specific rendering goes in small `ShowXPhase()` methods called from one `switch` on the phase.
- A mode doesn't talk to transports, the platform SDK or the listen host — only the network autoload (see
  [network](30-network.md)).

**Self-check:** a packet handler in a mode reads as "update state → update HUD/stage". If it contains the rule for
*whether* something is allowed, move that rule into the state class.
