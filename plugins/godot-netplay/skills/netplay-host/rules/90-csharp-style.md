# Rule: C# style — control flow, comments, strictness

Applies to every C# file, client included. The principles are house-style's control-flow and comments rules.

## Control flow

```csharp
// NO — main logic buried, failure in the else
public void Finish(PlayerId playerId)
{
    if (Phase == GamePhase.Playing)
    {
        if (CurrentRound?.EntryOf(playerId) is { IsFinished: false } entry)
        {
            entry.Finish();
            _messenger.Broadcast(_mapper.ToStatus(entry));
        }
    }
}

// YES — guard exits early, happy path flat at the bottom
public void Finish(PlayerId playerId)
{
    if (Phase != GamePhase.Playing || CurrentRound?.EntryOf(playerId) is not { IsFinished: false } entry)
    {
        return;
    }

    entry.Finish();
    _messenger.Broadcast(_mapper.ToStatus(entry));
}
```

- `is not { } x` patterns and `out var` in the guard keep the variable in scope below it.
- In loops, `continue` early or filter first (`.Where(...)`).
- A chain picking behaviour by enum/type becomes a `switch` with one line per case calling a method.
- Input handlers are a sequence of `if (action) { Handle(); return; }` blocks, not an `else if` chain.
- **Braces always**, even for one-line guards.

## Comments

- Doc comments are `///` XML: `/// <summary>…</summary>`. Never `/** */`.
- Reference code with `<see cref="Round.TryReact"/>`, inline names with `<c>content.json</c>`.
- `<param>` / `<returns>` / `<exception>` only when they add something:
  `/// <returns>False when the frame is dropped: …</returns>` yes; `/// <param name="round">The round.</param>` no.
- Keep: units, timebases and coordinate spaces (seconds vs ticks, host vs local clock), game rules, engine traps.

## Build strictness

- Nullable reference types on, `TreatWarningsAsErrors` on, `EnforceCodeStyleInBuild` on, so `.editorconfig` rules
  at warning severity (unused usings, braces, file-scoped namespaces, field naming, readonly fields, unused private
  members) fail the build.
- `!` only where a preceding check guarantees non-null — never to silence a real maybe-null.
- File-scoped namespaces matching folders, `_camelCase` private fields, `var`, explicit constructors injecting into
  `private readonly` fields.
- LF line endings, 4-space indent (Godot's editor may convert a script to tabs on save — convert back).
