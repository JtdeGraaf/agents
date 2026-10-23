# Rule: Update loop

- `_PhysicsProcess`: `MoveAndSlide`, body rotation, physics-driven interaction, state recording, and **applying
  replayed transforms** (so physics interpolation smooths them).
- `_Process`: camera follow (`GetGlobalTransformInterpolated()`), HUD, timers.
- `_UnhandledInput`: store look deltas / dispatch actions only, as flat `if (action) { …; return; }` blocks.
- Physics interpolation on. A camera that follows an interpolated body is `TopLevel` with interpolation off, as are
  other nodes placed every frame from interpolated positions. Otherwise don't turn interpolation off to hide jitter.
- Detach nodes (`RemoveChild`) before `QueueFree` when respawning a level, or stale bodies collide with the new ones
  for a physics step.
- **Replays are dumb playback of recorded state. Never re-simulate** — physics isn't deterministic across machines.
- When each client simulates its own copy of the world, the host validates outcomes from what clients report and
  relays recordings; trusting client transforms is an explicit, documented trade-off (fine among friends, not for
  competitive play).
- Items and levels are built from content definitions with behaviour from fixed enums. **Never** add item-specific
  scripts or scenes; an item's look is a model referenced from content, nothing more.
