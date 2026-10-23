import marketplace from '../.claude-plugin/marketplace.json'

// Everything below is read from the repo at build time, so the site always shows what's installable.
const markdown = import.meta.glob<string>('/plugins/**/*.md', { query: '?raw', import: 'default', eager: true })
// `exhaustive` lets the glob enter the hidden `.claude-plugin/` folders.
const manifests = import.meta.glob<string>('/plugins/*/.claude-plugin/plugin.json', {
  query: '?raw',
  import: 'default',
  eager: true,
  exhaustive: true,
})

export type RepoFile = {
  path: string // repo-relative, e.g. plugins/house-style/skills/house-style/SKILL.md
  name: string
  content: string
}

export type Skill = {
  name: string
  description: string
  dir: string
  entry: RepoFile
  files: RepoFile[] // SKILL.md first, then supporting files
}

export type Plugin = {
  name: string
  displayName: string
  description: string
  version: string
  keywords: string[]
  dependencies: string[]
  category: string
  sheet: string // drawing-sheet number, e.g. A-02
  manifestPath: string
  manifest: string
  skills: Skill[]
}

type Manifest = {
  name: string
  displayName?: string
  description?: string
  version?: string
  keywords?: string[]
  dependencies?: string[]
}

export const MARKETPLACE = marketplace.name
export const REPO = 'JtdeGraaf/agents'

export function parseFrontmatter(content: string): { meta: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(content)
  if (!match) return { meta: {}, body: content }

  const meta: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line)
    if (!kv) continue
    meta[kv[1]] = kv[2].replace(/^["']|["']$/g, '')
  }
  return { meta, body: content.slice(match[0].length) }
}

function toFile(absPath: string, content: string): RepoFile {
  const path = absPath.replace(/^\//, '')
  return { path, name: path.split('/').pop() ?? path, content }
}

function skillsOf(pluginName: string): Skill[] {
  const prefix = `/plugins/${pluginName}/skills/`
  const byDir = new Map<string, RepoFile[]>()

  for (const [absPath, content] of Object.entries(markdown)) {
    if (!absPath.startsWith(prefix)) continue
    const dir = absPath.slice(prefix.length).split('/')[0]
    const files = byDir.get(dir) ?? []
    files.push(toFile(absPath, content))
    byDir.set(dir, files)
  }

  return [...byDir.entries()]
    .map(([dir, files]) => {
      const entry = files.find((f) => f.name === 'SKILL.md')
      if (!entry) return null
      const { meta } = parseFrontmatter(entry.content)
      const rest = files.filter((f) => f !== entry).sort((a, b) => a.path.localeCompare(b.path))
      return {
        name: meta.name ?? dir,
        description: meta.description ?? '',
        dir,
        entry,
        files: [entry, ...rest],
      }
    })
    .filter((s): s is Skill => s !== null)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export const PLUGINS: Plugin[] = marketplace.plugins.map((entry, index) => {
  const manifestPath = `plugins/${entry.name}/.claude-plugin/plugin.json`
  const raw = manifests[`/${manifestPath}`] ?? '{}'
  const manifest = JSON.parse(raw) as Manifest
  return {
    name: entry.name,
    displayName: manifest.displayName ?? entry.name,
    description: manifest.description ?? entry.description ?? '',
    version: manifest.version ?? '0.0.0',
    keywords: manifest.keywords ?? [],
    dependencies: manifest.dependencies ?? [],
    category: entry.category ?? 'other',
    sheet: `A-${String(index + 2).padStart(2, '0')}`,
    manifestPath,
    manifest: raw,
    skills: skillsOf(entry.name),
  }
})

export const ALL_FILES: RepoFile[] = PLUGINS.flatMap((p) => [
  { path: p.manifestPath, name: 'plugin.json', content: p.manifest },
  ...p.skills.flatMap((s) => s.files),
])

export function findFile(path: string): RepoFile | undefined {
  return ALL_FILES.find((f) => f.path === path)
}

export function pluginOfPath(path: string): Plugin | undefined {
  return PLUGINS.find((p) => path.startsWith(`plugins/${p.name}/`))
}

// Resolves a markdown link written relative to `fromPath` into a repo-relative path.
export function resolvePath(fromPath: string, href: string): string {
  const parts = fromPath.split('/').slice(0, -1)
  for (const segment of href.split('/')) {
    if (segment === '' || segment === '.') continue
    if (segment === '..') parts.pop()
    else parts.push(segment)
  }
  return parts.join('/')
}
