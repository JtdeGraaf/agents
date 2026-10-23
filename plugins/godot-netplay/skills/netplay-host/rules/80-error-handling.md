# Rule: Error handling — coded errors on the wire (NON-NEGOTIABLE)

The principle is house-style's errors rule. Failures a player sees that come from the host are **coded**, so the
text lives in one place and can be localised. The contract lives in `shared/Errors/`.

## The contract

- **`ErrorCode` (enum, `byte`) is the single source of truth.** No explicit values (host and client share a build);
  the version-mismatch code stays first. `ErrorMessages` holds the English template for each code.
- The host sends the code plus positional string args (`RejectCode` + `RejectArgs`); the client renders with
  `ErrorMessages.Format(code, args)`.
- Transport-level disconnect reasons that must be a string are still built from the template —
  `ErrorMessages.Format(ErrorCode.HostLeft)` — never a hand-typed duplicate. Platforms that hide close strings get
  numeric app close codes the client maps back to the template.

## Adding an error

1. Add the constant to `ErrorCode`, with a `/// Args: …` doc if it takes arguments.
2. Add its English template to `ErrorMessages` using `{0}`, `{1}`… in argument order.
3. Send it with raw values; an `Args(...)` helper formats them invariantly.
4. A test fails if a code has no template.

## Other failure kinds

| Situation | How |
|---|---|
| Untrusted client input that is plausibly wrong (late frame, double action, not your turn) | Domain `Try…` returns `false`; service drops it silently |
| Programming error / broken invariant | Throw `ArgumentException` / `InvalidOperationException` |
| Malformed packet | Let deserialization throw; the router logs and keeps ticking |
| Oversized client packet | Dropped unread by the router (max size) |
| Bad content files | One exception listing every error, thrown at load so the host fails at boot |
| Client-local failures (port in use, missing files) | Plain message in the client UI; not a wire concern |

## Don't

- Don't build a user-facing message at the send site. Don't send free-text reasons in packets.
- Don't swallow exceptions in the host except at the router and the game loop, which log them.
