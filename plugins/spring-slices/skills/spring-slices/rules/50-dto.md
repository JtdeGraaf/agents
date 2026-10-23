# Rule: `dto/` — wire contracts

`record`s in `dto/`. The only types crossing the HTTP boundary.

- Bean-validation on input (`@Valid`, `@NotNull`, …) + JSpecify `@Nullable` where a field is optional.
- No primitive fields except `boolean` (a missing JSON number defaults to `0` and slips past validation) — boxed wrapper + `@NotNull`/`@Nullable`. See the house rules in this skill's SKILL.md.
- Carry no behavior. Never persisted; entities never leak across the boundary in their place.
- Separate request vs response records (e.g. `UpdateUserRequest` vs `UserDTO`).
- May be used as read-projection targets from `data/` (see the data rule).
