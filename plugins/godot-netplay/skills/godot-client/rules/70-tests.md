# Rule: Client tests — plain classes vs engine

Two kinds, chosen by what decides the behaviour.

## Plain-class unit tests (xUnit, no engine)

Client logic belongs in plain classes (state, flows, `…Text`, input strategies, grip/handling maths) tested in a
separate test project without Godot. Pull maths out of nodes to get it there.

## Engine tests (GdUnit4, headless Godot)

For what a node, a scene or the physics engine decides. Live in `EngineTests/`, mirroring `Scripts/`; compiled into
Debug builds only, so exports leave them out. `[TestSuite]`, `[RequireGodotRuntime]`, `[TestCase]`, `AssertThat(...)`.

- Test **how the game uses physics**, not the physics engine: tuning reaching bodies, low friction sliding further,
  piles settling, fast objects not tunnelling. Compare against a control or a bound
  (`IsGreater(normalDistance * 2f)`), never exact positions.
- Step a fixed number of physics frames (`TestWorld.Step(60)`), never wait on wall time.
- Build worlds with a shared `TestWorld` helper and dispose it; side-by-side comparisons sit far apart.
- Loop over **real content** (every level, item) where an invariant must hold for mods too, with a failure message
  naming the content id.
- Feel ("is ice icy enough") is play-testing, not a test.
- Running engine tests opens the project in the editor, which may re-save open scripts with tabs — convert back
  before committing.
