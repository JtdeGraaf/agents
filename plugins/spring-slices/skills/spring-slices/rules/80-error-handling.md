# Rule: Error handling — coded, localisable errors (NON-NEGOTIABLE)

The principle is in the house-style errors rule. This is the Spring implementation. Errors that reach the client
are **coded** so the frontend can show them in the user's language; the frontend half is the `react-slices` i18n
rule.

## The contract

- **`ErrorCode` (enum, in `common/`) is the single source of truth.** Each constant's *name* is the stable wire code
  (serialised as `ErrorResponse.code`, an enum field → it ships in the OpenAPI `enum`); its English template is the
  **fallback** message (`ErrorResponse.message`) shown until a locale key exists.
- Exceptions carry the code + positional args via a `CodedError` interface:
  - HTTP-mapped exceptions (`BadRequestException`, `ConflictException`, `DataNotFoundException`, …) extend
    `CodedRuntimeException`.
  - The domain raises `DomainValidationException` (it stays HTTP-ignorant; the web layer maps it to 400).
- One `@RestControllerAdvice` `GlobalExceptionHandler` lifts the code + args off any `CodedError` onto the
  `ErrorResponse`. You don't touch the handler to add an error.

## Adding an error

1. Add a constant + its English template to `ErrorCode`. Use `{0}`, `{1}`, … for interpolation
   (`java.text.MessageFormat`). **No apostrophes in templates** — `MessageFormat` treats `'` as an escape
   (`"The account's name"` breaks); reword instead.
2. Throw it with positional args in the order the template expects:
   `throw new DomainValidationException(ErrorCode.ACCOUNT_NAME_TOO_LONG, MAX_LENGTH);`
   `throw new ConflictException(ErrorCode.ORDER_ALREADY_SHIPPED, orderId);`
   Args are stringified (`String.valueOf`) — pass the raw value, not a pre-built string.
3. Add the `errors.<CODE>` key to **every** frontend locale and regenerate the API client so the code lands in the
   generated enum. A cross-boundary parity test fails if a code has no translation, or a translation has no code.

## Don't

- Don't build a code's message by hand at the throw site (`"… " + value`) — the template owns the wording.
- Don't reuse a code for a different rule, or rename one casually — the name is a stable wire contract.
- Plain-`String` constructors (`new BadRequestException("…")`) exist only for messages **not yet coded**; they
  surface verbatim with no translation. Prefer a coded error for anything a user sees.

**Self-check:** a user-facing failure throws `new XException(ErrorCode.SOMETHING, args…)` with a matching template
and `errors.SOMETHING` in every locale — not a hand-concatenated string.
