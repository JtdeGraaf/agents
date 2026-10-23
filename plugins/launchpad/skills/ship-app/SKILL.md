---
name: ship-app
description: Turn a one-prompt idea for any frontend-only web app (a tool, toy, game, utility, visualizer, joke, or something useful) into a finished, deployed app with its own unique visual identity. Works out the idea, designs it with Impeccable, builds it (Vite + React + TS), creates a GitHub repo under JtdeGraaf, deploys it to Cloudflare Workers static assets, and attaches the custom domain <slug>.graaf.dev (DNS + TLS handled by Cloudflare). Sets up GitHub Actions so later pushes to main redeploy. Use when the user says "ship-app", "ship this idea", "build and deploy an app for ...", "make me an app that ...", or gives an app idea and wants it live on graaf.dev.
argument-hint: <app idea> [name=<slug>] [private] [pick-style]
---

# ship-app

Idea → spec → unique design → code → GitHub repo → Cloudflare → `https://<slug>.graaf.dev`.

Input: `$ARGUMENTS` (the idea; optional `name=<slug>`, optional `private`, optional `pick-style`).

Keep the user's original prompt verbatim (minus the `name=`/`private`/`pick-style` flags) — it goes into the README.

Apps can be anything frontend-only: serious tools, utilities, games, visualizers, toys, jokes. Don't assume it's a joke; match tone to the idea.

## Fixed config

| Key | Value |
|---|---|
| GitHub owner | `JtdeGraaf` |
| Domain (Cloudflare zone) | `graaf.dev` |
| Local projects root | `~/apps/<slug>` (Windows: `C:\Users\jtgra\apps\<slug>`) |
| Repo visibility | public (unless args contain `private`) |
| Stack | Vite + React + TypeScript, no backend, no server code |
| Hosting | Cloudflare Workers, assets-only (no `main` script), SPA fallback |

Hard rule: **frontend only**. No API keys, no backend, no database. Persistence = `localStorage`/IndexedDB. External data only from free, keyless, CORS-enabled public APIs. If the idea truly needs a backend, say so and propose the closest frontend-only version before building.

## Step 0 — Preflight (stop and tell user exactly what to fix if any fails)

Run in PowerShell or Bash:

```bash
gh auth status                      # GitHub CLI logged in as JtdeGraaf
npx -y wrangler@latest whoami       # must show account, NOT "Not logged in"
```

Cloudflare auth: env vars `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` are **required** (needed for local deploy and copied into repo secrets for CI auto-deploy; OAuth from `wrangler login` expires and cannot refresh in a non-interactive shell). Check presence without printing values (`[bool]$env:CLOUDFLARE_API_TOKEN` / `[ -n "$CLOUDFLARE_API_TOKEN" ]`). If missing, stop and point user to **One-time setup** below. Do not try to log in for them and never ask them to paste a token into chat.

Windows: Git Bash may not have `gh` on PATH right after install — prefix bash commands with `export PATH="$PATH:/c/Program Files/GitHub CLI";`, or use PowerShell.

If `gh` missing: tell user to run `winget install GitHub.cli` then `gh auth login` in their own terminal, restart Claude Code.

## Step 1 — Work out the idea

1. Pick `slug`: short, lowercase, `[a-z0-9-]`, ≤ 20 chars, memorable and obvious about what the app does (e.g. `dumbometer`, `splitbill`, `pomodoro`). Use `name=` arg if given.
2. Check slug is free:
   ```bash
   gh repo view JtdeGraaf/<slug> >/dev/null 2>&1 && echo TAKEN-REPO
   nslookup <slug>.graaf.dev   # any answer besides NXDOMAIN = taken
   ```
   If taken, pick a variant (`<slug>-2`, or a better name) and move on. Only ask the user if the args forced a taken name.
3. Expand the idea into a short spec (write it to `README.md` later):
   - One-sentence pitch
   - Core loop (what user does in first 10 seconds)
   - 3–6 features, ranked; cut anything that needs a backend
   - Audience + tone (serious tool? playful toy? somewhere between?)
   - Impeccable mode: Operate (tools/utilities), Experience (toys/games/visual pieces), Read (explainers), Persuade (rare: only if the app is mainly a pitch)
   - Persistence: what lives in `localStorage`, if anything
   - Visual direction is decided in Step 3, not here.
4. Show the spec + URL in ≤ 10 lines, then **continue without waiting** (user wants it automatic). Only stop if the idea is ambiguous in a way that changes what gets built.

## Step 2 — Scaffold

```bash
mkdir -p ~/apps && cd ~/apps
npm create vite@latest <slug> -- --template react-ts --no-interactive --no-immediate
cd <slug> && npm install
```

If create-vite still prompts or rejects `--no-interactive`, write the minimal Vite React-TS files by hand instead (package.json, vite.config.ts, tsconfig.json, index.html, src/main.tsx, src/App.tsx). Do not leave a hanging interactive process.

Add Wrangler as dev dep: `npm i -D wrangler@latest`.

## Step 3 — Design + build with Impeccable (unique identity per app)

Every app gets its own visual world. No two ship-app apps may look alike, and none may look like a template.

1. **Read the design log** at `~/.claude/ship-app/design-log.md` (it lives outside the plugin so updates don't wipe it). If it doesn't exist yet, create it by copying `${CLAUDE_PLUGIN_ROOT}/skills/ship-app/design-log.md`, the seed bundled with this plugin. Every earlier app's world, palette, type and signature move is an **anti-reference**: the new app must differ in concept, palette family, and typefaces from all of them.
2. **Load `impeccable:impeccable`** (Skill tool; if the Impeccable plugin isn't installed, tell the user it's recommended — `claude plugin marketplace add pbakaus/impeccable` — and fall back to the `frontend-design` skill for this run) and follow its new-work flow inside `~/apps/<slug>`: run its `context.mjs` setup, write `PRODUCT.md` via its init playbook, load `reference/new-work.md`, choose a direction, then load `reference/craft-floor.md` before writing UI.
3. **Autonomy (default):** the user has delegated every product and design decision for ship-app runs in advance. That standing delegation *is* the answer to Impeccable's init and direction-round questions, so do not stop to ask:
   - `PRODUCT.md`: fill from the spec; record `## Stack` as "Vite + React + TypeScript, frontend-only, Cloudflare Workers static assets (pinned by ship-app)"; mark inferred facts as inferred.
   - Direction: let Impeccable deal its directions, drop any that collide with the design log, and proceed with the assigned (strongest remaining) direction. Never take the "category standard" exit on your own.
   - If image generation is available, Impeccable visualizes comps; pick the strongest yourself instead of waiting for approval.
   - **If args contain `pick-style`**: run Impeccable's direction round normally (its decision page / question tool) and let the user choose. This is the only case where ship-app waits on design.
4. **Finish passes:** run Impeccable's finish reviewer (`impeccable-finish-reviewer` subagent) with desktop + mobile screenshots, apply its material fixes, max two rounds (unattended budget). Then run `impeccable-documenter` so the repo gets a `DESIGN.md`.
5. **Append to the design log** (one entry, format in that file) once the design is final. If the log is missing, recreate it with entries of: `## <slug> — <date>`, idea, world, palette (hex), type, signature move, mode.

Build rules on top of Impeccable's:
- Replace Vite boilerplate entirely (delete `src/assets/react.svg`, `public/vite.svg`, default counter, default CSS).
- Set `<title>`, meta description, theme-color, and an inline SVG/emoji favicon in `index.html`.
- Mobile-first, works at 360px wide, keyboard accessible, respects `prefers-reduced-motion`.
- Keep deps minimal; no UI kits unless they clearly earn it.
- `npm run build` must pass with zero TS errors.
- Run it (`npm run dev` in background or `npx vite preview`) and check it in the built-in browser: core loop works, no console errors, mobile width OK. Fix before deploying.

## Step 4 — Cloudflare config

Use Wrangler, not the `cf` CLI. If the `cloudflare:wrangler` skill is available, load it for deploy/troubleshooting details.

Create `wrangler.jsonc` in project root:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "<slug>",
  "compatibility_date": "<today YYYY-MM-DD>",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  },
  "routes": [
    { "pattern": "<slug>.graaf.dev", "custom_domain": true }
  ],
  "workers_dev": false,
  "preview_urls": false
}
```

`custom_domain: true` makes Cloudflare create the DNS record on the `graaf.dev` zone and issue the TLS cert automatically. No manual DNS calls needed. If deploy fails because a DNS record for that hostname already exists, stop and tell user (don't delete their records).

Add scripts to `package.json`:

```json
"deploy": "npm run build && wrangler deploy"
```

Add `.wrangler/` and `.impeccable/` (design-hook cache) to `.gitignore`. Before the first commit, check `git status --short` and ignore any other tool caches that show up.

## Step 5 — GitHub Actions auto-deploy (required)

Every push to `main` must redeploy to `<slug>.graaf.dev`. This is not optional.

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
  workflow_dispatch:
concurrency:
  group: deploy
  cancel-in-progress: true
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy
```

## Step 6 — Repo + push

`README.md` **must start with this banner**, verbatim except the placeholders, before the title:

```markdown
> [!WARNING]
> **🤖 One-prompt app — please ignore the code.**
> This entire project — idea, design, code, GitHub repo, and Cloudflare deployment — was generated and shipped by [Claude Code](https://claude.com/claude-code) from a **single prompt**, in a **single run**. No human wrote or reviewed this code. It is not an example of how I write software; judge the idea, not the implementation.
>
> **The prompt:** "<original prompt verbatim>"
```

Then: title, live URL, spec from Step 1, `npm run dev` / `npm run deploy` usage, note that pushes to `main` auto-deploy.

```bash
git init -b main
git add -A
git commit -m "Initial commit: <one-line pitch>"
gh repo create JtdeGraaf/<slug> --public --source . --remote origin --description "[one-prompt app] <pitch> — https://<slug>.graaf.dev" --homepage "https://<slug>.graaf.dev"
```
(`--private` instead of `--public` if args say `private`.)

Tag the repo so one-prompt apps are recognizable in the GitHub profile:

```bash
gh repo edit JtdeGraaf/<slug> --add-topic one-prompt-app --add-topic ai-generated --add-topic claude-code
```

Description must start with `[one-prompt app]`, e.g. `--description "[one-prompt app] <pitch> — https://<slug>.graaf.dev"`.

Set Actions secrets from env, piped via stdin so the token never appears in process args or output:

```bash
printf %s "$CLOUDFLARE_API_TOKEN"  | gh secret set CLOUDFLARE_API_TOKEN  --repo JtdeGraaf/<slug>
printf %s "$CLOUDFLARE_ACCOUNT_ID" | gh secret set CLOUDFLARE_ACCOUNT_ID --repo JtdeGraaf/<slug>
gh secret list --repo JtdeGraaf/<slug>   # both names must be listed
```
PowerShell: `$env:CLOUDFLARE_API_TOKEN | gh secret set CLOUDFLARE_API_TOKEN --repo JtdeGraaf/<slug>`.

Preflight already guarantees both env vars exist. If `gh secret set` fails, stop and report — do not push a repo whose CI can't deploy.

## Step 7 — First deploy (local, immediate)

```bash
npm run deploy
```

Then push so CI is wired (CI redeploys same build; harmless):

```bash
git push -u origin main
```

## Step 8 — Verify

- Poll `https://<slug>.graaf.dev` (curl, up to ~3 min, every ~15s) until HTTP 200. First request may fail while cert provisions.
- Open it in the built-in browser once; confirm the app renders, no console errors.
- Confirm auto-redeploy works: wait for the push-triggered run (run in background, ~2–3 min):
  ```bash
  gh run watch --repo JtdeGraaf/<slug> --exit-status $(gh run list --repo JtdeGraaf/<slug> --workflow deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')
  ```
  Must end green. If it fails, read `gh run view --log-failed`, fix, push again, until green. Report "auto-deploy on main: verified" only after a green run.

## Final report (short)

- Live: `https://<slug>.graaf.dev`
- Repo: `https://github.com/JtdeGraaf/<slug>`
- Local: `~/apps/<slug>`
- What was built (pitch + features, 3–5 lines)
- Design direction in one line (world, palette, type) and Impeccable reviewer verdict, open items included
- Anything that failed or was skipped, stated plainly

## Teardown (only when user asks)

```bash
npx wrangler delete --name <slug>      # removes Worker + its custom domain/DNS record
gh repo delete JtdeGraaf/<slug> --yes  # needs `gh auth refresh -s delete_repo`
```
Both are irreversible: confirm with user first.

## One-time setup (tell user if preflight fails)

1. **GitHub CLI**: `winget install GitHub.cli`, then `gh auth login` (HTTPS, browser).
2. **Cloudflare API token** (User token): My Profile → API Tokens → Create Custom Token. Permissions: Account·Workers Scripts·Edit, Account·Account Settings·Read, User·User Details·Read, User·Memberships·Read, Zone·Workers Routes·Edit, Zone·DNS·Edit, Zone·Zone·Read. Zone Resources: specific zone `graaf.dev`. No IP filter (breaks GitHub Actions).
3. **Account ID**: in dashboard URL `dash.cloudflare.com/<account-id>/...`, or graaf.dev → Overview → right sidebar API section.
4. Store as user env vars (PowerShell, user runs it themselves):
   ```powershell
   setx CLOUDFLARE_API_TOKEN "<token>"
   setx CLOUDFLARE_ACCOUNT_ID "<account id>"
   ```
   Restart Claude Code so new env is picked up.
