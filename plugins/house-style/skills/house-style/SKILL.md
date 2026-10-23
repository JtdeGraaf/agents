---
name: house-style
description: Jt's language-agnostic house style for writing, refactoring and reviewing code in any language or project. Flat control flow with guard clauses, rare one-line comments, coded and localisable errors, no silent defaults on deserialized data, value objects over primitives, deliberate behaviour-level tests, confirmation before destructive actions, conventional commits. Use whenever writing or reviewing code; stack plugins (spring-slices, react-slices, godot-netplay) add language-specific rules on top.
---

# House style

These rules apply to every language and every project. A stack skill (`spring-slices`, `react-slices`,
`godot-netplay`) adds the layering and idioms for its stack; where a stack rule is more specific, it wins.
A project's own `CLAUDE.md` / `.claude/rules/` win over both.

Read the rule that matches what you're doing **before** you do it:

| Doing | Read |
|---|---|
| Writing any function or method | [rules/control-flow.md](rules/control-flow.md) |
| Adding or editing a comment | [rules/comments.md](rules/comments.md) |
| Modelling data, ids, money, limits, anything with rules | [rules/domain-modelling.md](rules/domain-modelling.md) |
| Raising or showing an error a user can see | [rules/errors.md](rules/errors.md) |
| Reading data from the wire, a file or config | [rules/no-silent-defaults.md](rules/no-silent-defaults.md) |
| Writing or reviewing tests | [rules/testing.md](rules/testing.md) |
| Building a delete / discard / leave / irreversible action | [rules/irreversible-actions.md](rules/irreversible-actions.md) |
| Committing | [rules/commits.md](rules/commits.md) |

## The short version

- **Happy path flat and last.** Guards exit early; no `else` after `return`/`throw`; more than ~2 levels of
  nesting is a defect.
- **Comments are rare and short.** Only what the code can't say: a why, a unit, a rule, a trap. Delete the rest.
- **Push rules into the type that owns the data.** Value objects that validate themselves; entities that refuse
  illegal transitions; no primitive obsession.
- **Thin edges.** Whatever receives a request (controller, route, packet handler, UI node) makes one call and
  holds no logic.
- **Errors are codes with templates**, never strings concatenated at the throw site.
- **Nothing quietly becomes `0`.** Required means required; optional means nullable.
- **Tests fail when behaviour breaks, and only then.** Exact assertions, real code over mocks.
- **Irreversible actions ask first.** Unsure whether something is irreversible? Ask the user.
- Verify before declaring done: build, typecheck, lint and tests green.
