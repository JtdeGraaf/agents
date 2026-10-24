---
name: orchestrator
description: Run an autonomous improvement loop on a deployed app whose pushes to main deploy. A scout agent reviews the code and the live site and files GitHub issues; then each issue is fixed, tested, pushed and deployed in its own visible Claude session, one at a time, so the user can open and steer any fix; the orchestrator verifies with gh and repeats for a few rounds. Use when the user says "orchestrator", "run the improvement loop", "scout and fix issues", "keep improving the app", or wants agents to find and close issues on their repo by themselves.
argument-hint: [rounds=5] [issues=8] [leftovers="first known problem; second known problem"]
---

# orchestrator

Scout → issues → one session per issue → verify → log → repeat.

Input: `$ARGUMENTS` — optional `rounds=<n>` (default 5), `issues=<n>` per round (default 8), and `leftovers="..."`:
known problems, separated by `;`, that the first scout must file if they aren't filed yet.

You are the orchestrator. You know what is going on, but you keep your own context small: **you never read or edit
app code yourself**. Agents and sessions do the work and report back in a few lines; GitHub issues hold the state.

## Fixed config

| Key | Value |
|---|---|
| Repo | from `gh repo view --json nameWithOwner -q .nameWithOwner` in the working directory |
| Branch | the default branch (`main`); every push to it deploys |
| Verify command | from the project's `CLAUDE.md`, else the `typecheck`, `lint`, `test` and `build` scripts in `package.json` that exist |
| Labels | `orchestrator` on every issue, plus `bug`, `ux` or `feature`; `blocked` for issues a fixer gave up on |
| Scout brief | [scout-brief.md](scout-brief.md) |
| Fixer brief | [fixer-brief.md](fixer-brief.md) |
| Log | `orchestrator-log.md` in the session's shared notes folder; with no notes folder, a comment per round on one open issue titled "Orchestrator log" (label `orchestrator`) |

## Step 0 — Preflight

- `gh auth status` works and the repo resolves. Working tree is clean and on the default branch (`git status -sb`).
  If not, stop and tell the user.
- The latest deploy run is green: `gh run list --limit 1`. If it is red, the first fix of round 1 is the red build.
- Load `mcp__ccd_session__start_session` (it is often deferred: `ToolSearch` with `select:mcp__ccd_session__start_session`).
  If it doesn't exist (plain CLI, no desktop app), say once that fixes will run as subagents instead, and use the
  Agent tool with the same brief wherever this skill says "start a fixer session".
- Read the log, if one exists, and pick up where it stops instead of starting over.

## One round

### 1. Scout → issues

Start one fresh `general-purpose` subagent (Agent tool) with [scout-brief.md](scout-brief.md), filled in: repo, live
URLs (from the README or `CLAUDE.md`), the issue limit, the leftovers (round 1 only), and one line per fix already
landed this run so it hunts in fresh places and checks those for regressions. It files the issues and returns only
`#N title` lines.

If the scout gets cut off, check `gh issue list --label orchestrator --state open` and resume it (SendMessage to the
same agent) rather than starting over. If it files nothing, the loop ends (see Guardrails).

### 2. One session per issue, one at a time

Fixes run sequentially: they share files and the default branch, and each push deploys. For the next open issue:

1. Write a bold title line and one sentence on what the session will do, then call `start_session`:
   - `title`: `Fix #N: <short title>`;
   - `initiation`: `"user_asked"` — running this skill is the user asking for a session per issue;
   - `context`: `"fresh"`;
   - `use_worktree`: `true`, so the fix happens in its own checkout and never touches the user's working tree;
   - `prompt`: [fixer-brief.md](fixer-brief.md) with the issue number filled in, plus a **Context** line for every
     earlier fix this run that touched the same area ("#5 added `nameForAmount` in `src/lib/ingredient-name.ts`;
     keep it working"), and a scope note when a later issue covers a neighbouring problem ("#7 is a separate fix;
     stay within #3").
2. End your turn. Don't poll. The app continues you with a `<side-sessions-event>` when the session ends a turn,
   quoting the start of its report.
3. Read the report as a claim, then verify with `gh` only — never by reading code:
   - `gh issue view N --json state,labels` is `CLOSED`, or open with `blocked`;
   - `gh run list --limit 1` shows the run for that commit, finished and green.
4. If the session's turn ended without either — it asked a question, or the user stepped in and is talking to it —
   don't start the next one. Say in one line which session is waiting and on what, link it
   (`[Fix #N](#local_<id>)`), and end your turn. Questions it sends you with SendMessage, answer if you can from the
   issue and the log; anything else goes to the user.
5. If CI is red, the next session fixes the red build before any other issue.
6. Append one line to the log (`#N closed by <sha>, deploy green.`) so an interrupted run can resume.

Then start the session for the next issue. The round is done when every issue it filed is closed or `blocked`.

### 3. Log the round

Append 3–6 lines: the issues, the commits, anything blocked or unverified (things a fixer said it could not check).
Then go back to step 1.

## Guardrails

- Stop and report when a scout finds nothing worth filing, after `rounds` rounds, or when CI stays red after two fix
  attempts — whichever comes first. If the user says stop, finish the issues already filed and start no new round.
- Never force-push, rewrite history, delete branches or issues, or touch hosting, DNS or secrets settings. Never print
  secrets.
- Only one fixer works at a time. Never start the next session while the last one is still working or waiting.
- If `start_session` is refused, it's usually because this turn was started by another session's message rather than
  by the user or a `<side-sessions-event>`. Fall back to a subagent for that issue, say so in one line, and carry on.
- After many `<side-sessions-event>` turns with no message from the user, the app may hold notes until the user
  writes. If the loop seems paused, tell the user a one-word "continue" resumes it.
- Leave finished fixer sessions alone. At the end, offer to archive them; archive only on the user's yes.

## Final report

- Rounds run.
- Issues filed / closed / blocked, as links.
- Fixer sessions, as links.
- CI state of the default branch.
- Anything the user should decide, and anything a fixer reported it could not verify.
