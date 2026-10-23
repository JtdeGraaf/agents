# Rule: Destructive actions get a confirm dialog (NON-NEGOTIABLE)

What counts as destructive (and what doesn't) is in the house-style irreversible-actions rule. In React:

- Every destructive action goes through **one** shared `components/ui/confirm-dialog.tsx` (`ConfirmDialog`). It is
  only the confirm/cancel chrome; the caller owns the mutation, error message and pending state (translated
  title/description/labels in, `onConfirm` calling the mutation out).
- The confirm button names the verb ("Delete", "Discard"), translated like all copy.
- No dialog for actions with a visible undo, or that a later approval step already confirms (a diff the user must
  approve *is* the confirmation).
- **If unsure, ask the user** before wiring it either way.

**Self-check:** a new delete/discard action either (a) goes through `ConfirmDialog`, (b) has an existing undo path
you can name, or (c) you asked.
