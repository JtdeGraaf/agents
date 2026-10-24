# agents

**Site:** https://agents.graaf.dev

My agent skills, in one place, installable anywhere: a house style that applies to every project, architecture
guidelines per stack, and workflows that ship things. The repo is a [Claude Code plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces);
the site renders the repo's own skill files.

## Install

```bash
claude plugin marketplace add JtdeGraaf/agents
claude plugin install spring-slices@graaf
```

Inside a session: `/plugin marketplace add JtdeGraaf/agents`, then `/plugin` to browse. Dependencies install along
(every stack plugin pulls in `house-style`). Update with `claude plugin marketplace update graaf`.

## Plugins

| Plugin | Skills | What it covers |
|---|---|---|
| `house-style` | `house-style` | Language-agnostic: flat control flow, rare short comments, coded errors, no silent defaults, domain modelling, deliberate tests, irreversible actions, commits |
| `spring-slices` | `spring-slices` | Java / Spring Boot backends as DDD feature slices |
| `react-slices` | `react-slices` | React + TypeScript SPAs by responsibility, generated API client, typed i18n |
| `godot-netplay` | `netplay-host`, `godot-client` | Multiplayer games: engine-free .NET host library + Godot C# client |
| `launchpad` | `ship-app` | One prompt → designed, deployed frontend app on `<slug>.graaf.dev` |
| `orchestrator` | `orchestrator` | Improvement loop: a scout files GitHub issues, one visible session per issue fixes and deploys it, repeat |

Guidelines describe *how* I design software — layering, boundaries, style — not any one project's internals. A
project's own `CLAUDE.md` / `.claude/rules/` always win over these.

## Layout

```
.claude-plugin/marketplace.json     the catalog: one entry per plugin
plugins/<plugin>/
  .claude-plugin/plugin.json        manifest (name, version, dependencies)
  skills/<skill>/SKILL.md           entry point, loaded when the description matches the work
  skills/<skill>/rules/*.md         detail, read on demand
src/                                the site (Vite + React), reads plugins/ at build time
```

## Adding or changing a skill

1. Add `plugins/<plugin>/skills/<skill>/SKILL.md` (new plugin: also a `plugin.json` and a marketplace entry).
2. Bump `version` in that plugin's `plugin.json` — installed copies only update when the version changes.
3. `claude plugin validate .` and `npm run build`.
4. Push to `main`: GitHub Actions redeploys the site; machines pick up the plugin on `claude plugin marketplace update graaf`.

## Site

`npm run dev` to preview, `npm run deploy` to deploy by hand (needs `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`).
Hosted as static assets on Cloudflare Workers.
