# Rule: Errors — coded, templated, localisable (NON-NEGOTIABLE)

Failures a user can see are **coded**, so the wording lives in one place and can be translated. The code is a
stable wire contract; the text is a template.

## The contract

- **One `ErrorCode` enum is the single source of truth.** A constant's *name* is the stable code that crosses the
  boundary; next to it lives an English template that is the **fallback** message until a translation exists.
- Errors carry the code plus **positional args** (`{0}`, `{1}`, …). The sender passes raw values; the template owns
  the wording.
- The receiving side (frontend, game client) renders `code → translation(args)` and falls back to the English
  template when no key exists yet — a newer server never breaks an older UI.
- A parity test fails when a code has no template/translation, or a translation has no code.

## Adding an error

1. Add the constant + English template. (Beware template engines with escape characters — e.g. Java
   `MessageFormat` treats `'` as an escape; reword instead.)
2. Raise it with args in the order the template expects: `throw new ConflictException(ErrorCode.ALREADY_ASSIGNED, id)`.
3. Add the translation key on the client side, in **every** locale.

## Other failure kinds

| Situation | How |
|---|---|
| Untrusted input that is plausibly wrong (late frame, double submit) | Domain `try…` returns `false`; drop it quietly |
| Programming error / broken invariant | Throw the language's argument / invalid-operation exception |
| Malformed message | Let deserialization throw; the edge logs it and carries on |
| Bad config or content files | One exception listing **every** error at once, thrown at startup |

## Don't

- Don't build a message at the throw site (`"Version mismatch (" + a + ")"`).
- Don't send free-text reasons over the wire.
- Don't reuse a code for a different rule or rename one casually — clients key off the name.
- Don't swallow exceptions except at the outermost loop/edge, which logs them.
