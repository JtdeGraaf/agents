# Rule: Styling — Tailwind v4 tokens + `cn()`

Tailwind v4 with the design system defined as `@theme` tokens in `src/index.css` (palette, fonts, radii, type
utilities). Styling is utility-first against those tokens. The visual direction itself is the project's own — decide
it once, encode it as tokens, and keep every screen inside it.

## Use the tokens, not raw values

- Reference semantic tokens: `bg-background`, `bg-surface`, `text-ink`, `text-ink-muted`, `border-border`,
  `text-error`, `font-display`.
- **No inline hex / arbitrary colours** in components (`text-[#1A1A2E]`, `style={{ color: … }}`). If a shade is
  missing, add a token to `@theme` and use it.
- **Fill colours and text colours are separate tokens.** A brand or user-chosen colour that looks right as a block is
  often illegible as small text on the background. Keep a `brand` token for fills and a contrast-checked `brand-ink`
  for type (derive it at runtime if the colour is user-configurable).
- Muted text tokens carry real text — check them against the background (WCAG AA) before changing them.
- Repeated type registers (display, label, data) are `@utility` rules in `index.css`, not class soup repeated per
  screen. Numbers that line up in columns get tabular figures.
- Fonts are self-hosted (`@fontsource/*` imported in `main.tsx`), not loaded from a CDN at runtime.

## Compose classes with `cn()`

- Always merge with `cn(...)` from `@/lib/utils` (clsx + tailwind-merge) so conditional + overriding classes resolve
  correctly. Callers override by putting `className` **last** in the `cn()` call.
- Variants come from **CVA** in the `ui/` wrapper, not ad-hoc conditionals scattered in markup.

## Animations / state

- Prefer the primitive library's data-attributes for enter/exit and state (`data-[starting-style]`,
  `data-[ending-style]`, `data-[highlighted]`) over manual open/close state.
- Respect `prefers-reduced-motion`.

**Self-check:** grep your diff for `#` hex and `style=` — there should be none in components; colours and radii come
from `@theme`.
