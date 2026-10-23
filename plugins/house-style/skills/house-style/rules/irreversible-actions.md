# Rule: Irreversible actions ask first (NON-NEGOTIABLE)

An action that throws away something the user can't get back, or affects **other** people, needs a deliberate
second step. A stray click or key press must never do it.

## What counts

- Deleting something with no undo / trash / restore path in the UI.
- Bulk or cascading deletes (deleting a parent also deletes its children).
- Actions that notify or affect other people and can't be quietly taken back (publishing, releasing, ending a
  session everyone is in).
- Discarding work the user reviewed or produced.

## What doesn't

- Actions with a visible **undo**, or covered by an explicit approval step later (a diff the user must approve
  *is* the confirmation — don't stack a dialog on top).
- Cheap, reversible state changes: sign out, switch language, close a panel, toggle ready.

## How

- One shared confirm component per app; the caller owns the action, its pending state and its error.
- The confirm button names the verb ("Delete", "Leave"), never plain "OK". The text says what happens, including
  to other people.
- Keyboard-driven, mid-action flows may use a double press within a short window, with visible feedback after the
  first press.

## If unsure

Don't guess either way — **ask the user** whether the action needs a confirmation, citing the action and why it's
ambiguous ("has undo, but no visible undo affordance in this view").
