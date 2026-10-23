# Rule: `components/` — shared UI & `components/ui/` primitives

Two tiers: cross-feature composite components at `components/` (e.g. `Layout`, `Navbar`), and reusable
primitives at `components/ui/`.

## `components/ui/` — thin owned wrappers over Base UI

We use **Base UI** (`@base-ui/react`) as an **installed dependency** (not shadcn copy-paste, not a managed
lib). Each file is a thin, styled wrapper we own:

- Wrap the Base UI primitive, apply Tailwind classes via `cn()`, expose variants with **CVA**
  (`buttonVariants` in `button.tsx` is the reference).
- Type props as `Omit<ComponentProps<typeof BasePart>, 'className'> & { className?: string }` so callers
  pass a plain `className` string (Base UI's `className` can be a state function — don't leak that).
- Re-export compound parts under our own names (`Dialog`, `DialogContent`, …; `DropdownMenu*`).
- **Respect Base UI's structural contracts** — group parts (`Menu.GroupLabel`, radio/checkbox items) must
  sit inside their required parent (`Menu.Group`/`RadioGroup`). A standalone header is a plain `div`, not a
  `GroupLabel`. (This bit us once — there's a regression test in `dropdown-menu.test.tsx`.)
- For polymorphism use Base UI's `render` prop (e.g. a Button that is really an `<a>`:
  `render={<a href={…} />}`), not cloned markup.

## `components/` — composites

- Build from `ui/` primitives + feature hooks. Keep them presentational where possible.
- No data fetching beyond calling a `useAuth()` / feature hook; no business logic.
- Components render only — non-render logic is delegated and they stay small. See
  [component responsibility](45-component-responsibility.md).

**Self-check:** a new primitive should be a small wrapper that adds styling/variants only — behaviour and
accessibility come from Base UI. If you're re-implementing focus/keyboard/aria, you skipped the primitive.
