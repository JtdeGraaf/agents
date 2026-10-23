# Rule: No silent defaults on deserialized data

Anything that comes in from outside — JSON bodies, network packets, content files, config — must not quietly turn a
**missing** value into a **real** one.

- **Required means required.** A field that must be present is marked required (`@NotNull` boxed type, C#
  `required`, a non-optional Zod field) so a missing value is rejected, not defaulted.
- **Optional means nullable.** An optional field is a nullable type, never a value type that deserializes to `0`,
  `0.0` or `false` when the sender left it out. A primitive `0` slips past `min`/`positive` validation and silently
  binds a real value.
- `boolean` flags are the exception where `false` is a legitimate default — say so if it isn't obvious.
- Deliberate defaults (a timeout of 90 seconds when content leaves it out) are **documented on the field**.
- **Unknown properties are an error** in hand-authored files (content, config), so a typo is reported instead of
  silently ignored.
- Collections default to empty, never null.

This is about *stored / deserialized* state. Locals, loop counters, constants and computed values stay primitive.
