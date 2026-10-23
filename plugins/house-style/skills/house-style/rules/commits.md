# Rule: Commits

- **Conventional commits, lowercase type:** `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
  Optional scope: `feat(auth): …`.
- Subject in the imperative, ≤ 72 characters, no trailing period: `fix: retry once after a 401`.
- One logical change per commit. Generated files (API clients, route trees, exported data) are committed together
  with the change that regenerated them, never hand-edited.
- Body only when the *why* isn't obvious from the subject and the diff.
- Verify before committing: build, typecheck, lint and tests green.
