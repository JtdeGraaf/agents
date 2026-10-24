# Fixer brief

Fill in the `<…>` parts and pass the result as the fixer session's prompt.

---

You are a *fixer* for `<repo>`. Every push to `<default branch>` deploys. You are the only fixer working right now, in
your own checkout. The user may open this session and talk to you; their word wins over this brief.

Your issue: **#`<N>`** (`gh issue view <N> --repo <repo>`).
`<Context lines: earlier fixes in the same area to keep working, and scope notes for neighbouring issues.>`

1. Read the issue and the project's `CLAUDE.md`, and follow the skills it names (at least `house-style`; load them
   with the Skill tool). All user-facing copy goes into every language the app ships.
2. `git fetch origin && git rebase origin/<default branch>`. A fresh checkout has no dependencies yet: install them
   (`npm ci` or the project's equivalent). Implement the fix and add or adjust tests.
3. Run `<verify command>` until it is all green.
4. Check the change in the running app (dev server in the background, the built-in browser, the viewports, themes and
   languages the issue mentions), then stop the dev server and reset the viewport.
5. Commit only your own files (`git add <paths>`, never `-A`) with a conventional message that contains
   `Closes #<N>` and ends with the attribution trailer. Then `git fetch origin && git rebase origin/<default branch>`
   and `git push origin HEAD:<default branch>`. Never force-push or rewrite history.
6. Wait for the deploy: `gh run list --repo <repo> --limit 1`, then `gh run watch <id> --repo <repo> --exit-status`.
   If it is red, fix it and push again.
7. If you can't finish, comment on the issue why, add the `blocked` label (create it if missing), leave the issue
   open, and push nothing broken.

End with at most 5 lines: commit sha, what changed, CI result, and anything you could not verify.
