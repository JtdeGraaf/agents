import { useState, type ReactNode } from 'react'
import {
  MARKETPLACE,
  PLUGINS,
  REPO,
  findFile,
  parseFrontmatter,
  pluginOfPath,
  type Plugin,
  type RepoFile,
} from './catalog.ts'
import { Markdown } from './Markdown.tsx'
import { useRoute, type Route } from './useRoute.ts'

const ADD_MARKETPLACE = `claude plugin marketplace add ${REPO}`
const installCommand = (plugin: string) => `claude plugin install ${plugin}@${MARKETPLACE}`

export default function App() {
  const route = useRoute()
  const sheet = sheetFor(route)

  return (
    <div className="drawing">
      <SheetIndex route={route} />
      <main className="sheet" id="main">
        {sheet.body}
        <TitleBlock number={sheet.number} title={sheet.title} revision={sheet.revision} />
      </main>
    </div>
  )
}

type Sheet = { number: string; title: string; revision: string; body: ReactNode }

function sheetFor(route: Route): Sheet {
  if (route.kind === 'plugin') {
    const plugin = PLUGINS.find((p) => p.name === route.name)
    if (plugin) return { number: plugin.sheet, title: plugin.displayName, revision: plugin.version, body: <PluginSheet plugin={plugin} /> }
  }
  if (route.kind === 'file') {
    const file = findFile(route.path)
    const plugin = pluginOfPath(route.path)
    if (file && plugin) {
      return { number: `${plugin.sheet}.${detailNumber(plugin, file)}`, title: file.path.split('/').slice(-2).join('/'), revision: plugin.version, body: <FileSheet file={file} plugin={plugin} /> }
    }
    return { number: '—', title: 'Missing sheet', revision: '—', body: <Missing path={route.path} /> }
  }
  return { number: 'A-01', title: 'Index', revision: '1.0', body: <IndexSheet /> }
}

function detailNumber(plugin: Plugin, file: RepoFile): string {
  const files = plugin.skills.flatMap((s) => s.files)
  const index = files.findIndex((f) => f.path === file.path)
  return String(index < 0 ? 0 : index + 1).padStart(2, '0')
}

function SheetIndex({ route }: { route: Route }) {
  const activePlugin =
    route.kind === 'plugin' ? route.name : route.kind === 'file' ? pluginOfPath(route.path)?.name : undefined
  const activePath = route.kind === 'file' ? route.path : undefined

  return (
    <nav className="index" aria-label="Sheets">
      <a className="index-home" href="#/">
        <span className="index-mark" aria-hidden="true" />
        <span>
          <strong>agents</strong>.graaf.dev
        </span>
      </a>
      <ol className="index-sheets">
        <li>
          <a href="#/" aria-current={route.kind === 'index' ? 'page' : undefined}>
            <span className="sheet-no">A-01</span> Index
          </a>
        </li>
        {PLUGINS.map((plugin) => (
          <li key={plugin.name}>
            <a href={`#/plugin/${plugin.name}`} aria-current={route.kind === 'plugin' && activePlugin === plugin.name ? 'page' : undefined}>
              <span className="sheet-no">{plugin.sheet}</span> {plugin.displayName}
            </a>
            {activePlugin === plugin.name && (
              <ul className="index-files">
                {plugin.skills.flatMap((skill) =>
                  skill.files.map((file) => (
                    <li key={file.path}>
                      <a href={`#/file/${file.path}`} aria-current={activePath === file.path ? 'page' : undefined}>
                        {file.name === 'SKILL.md' ? `${skill.name}/SKILL.md` : file.path.split('/').slice(-2).join('/')}
                      </a>
                    </li>
                  )),
                )}
              </ul>
            )}
          </li>
        ))}
      </ol>
      <a className="index-repo" href={`https://github.com/${REPO}`}>
        github.com/{REPO}
      </a>
    </nav>
  )
}

function IndexSheet() {
  return (
    <article className="sheet-body">
      <header className="sheet-head">
        <h1>Skills, drawn up once and installed anywhere.</h1>
        <p className="lede">
          The way I build software, written down for agents: a house style that applies everywhere, architecture guidelines
          per stack, and workflows that ship things. It's a Claude Code plugin marketplace; this site renders the repo as it is.
        </p>
      </header>

      <section className="redline" aria-labelledby="install-title">
        <h2 id="install-title">Install</h2>
        <ol className="steps">
          <li>
            <span>Add the marketplace once per machine</span>
            <Command text={ADD_MARKETPLACE} />
          </li>
          <li>
            <span>Install what the project needs; dependencies come along</span>
            <Command text={installCommand('spring-slices')} />
          </li>
        </ol>
        <p className="note">
          Inside a session: <code>/plugin marketplace add {REPO}</code>, then <code>/plugin</code> to browse.
        </p>
      </section>

      <section aria-labelledby="sheets-title">
        <h2 id="sheets-title">Sheets</h2>
        <table className="schedule">
          <thead>
            <tr>
              <th scope="col">Sheet</th>
              <th scope="col">Plugin</th>
              <th scope="col">What it covers</th>
              <th scope="col">Skills</th>
            </tr>
          </thead>
          <tbody>
            {PLUGINS.map((plugin) => (
              <tr key={plugin.name}>
                <td className="sheet-no">{plugin.sheet}</td>
                <td>
                  <a href={`#/plugin/${plugin.name}`}>{plugin.displayName}</a>
                </td>
                <td>{plugin.description}</td>
                <td className="num">{plugin.skills.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </article>
  )
}

function PluginSheet({ plugin }: { plugin: Plugin }) {
  return (
    <article className="sheet-body">
      <header className="sheet-head">
        <h1>{plugin.displayName}</h1>
        <p className="lede">{plugin.description}</p>
      </header>

      <section className="redline" aria-label="Install">
        <Command text={installCommand(plugin.name)} />
        {plugin.dependencies.length > 0 && (
          <p className="note">
            Brings along{' '}
            {plugin.dependencies.map((dep, i) => (
              <span key={dep}>
                {i > 0 && ', '}
                <a href={`#/plugin/${dep}`}>{dep}</a>
              </span>
            ))}
            .
          </p>
        )}
      </section>

      <section aria-labelledby="skills-title">
        <h2 id="skills-title">Skills</h2>
        <ul className="details">
          {plugin.skills.map((skill) => (
            <li key={skill.name} className="detail">
              <a className="detail-title" href={`#/file/${skill.entry.path}`}>
                {plugin.name}:{skill.name}
              </a>
              <p>{skill.description}</p>
              {skill.files.length > 1 && (
                <ul className="detail-files">
                  {skill.files.slice(1).map((file) => (
                    <li key={file.path}>
                      <a href={`#/file/${file.path}`}>{file.path.split('/').slice(-2).join('/')}</a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="manifest-title">
        <h2 id="manifest-title">Manifest</h2>
        <pre className="code">
          <code>{plugin.manifest}</code>
        </pre>
      </section>
    </article>
  )
}

function FileSheet({ file, plugin }: { file: RepoFile; plugin: Plugin }) {
  const { meta, body } = parseFrontmatter(file.content)
  const hasMeta = Object.keys(meta).length > 0

  return (
    <article className="sheet-body">
      <p className="breadcrumb">
        <a href={`#/plugin/${plugin.name}`}>{plugin.displayName}</a> / {file.path.replace(`plugins/${plugin.name}/`, '')}
      </p>
      {hasMeta && (
        <dl className="spec">
          {Object.entries(meta).map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <Markdown content={body} path={file.path} />
      <p className="source">
        <a href={`https://github.com/${REPO}/blob/main/${file.path}`}>View source on GitHub</a>
      </p>
    </article>
  )
}

function Missing({ path }: { path: string }) {
  return (
    <article className="sheet-body">
      <h1>No sheet at this reference</h1>
      <p className="lede">
        <code>{path}</code> isn't in the set. It may have been renamed. Start from the <a href="#/">index</a>.
      </p>
    </article>
  )
}

function Command({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="command">
      <code>{text}</code>
      <button type="button" onClick={copy} aria-label={`Copy: ${text}`}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

function TitleBlock({ number, title, revision }: { number: string; title: string; revision: string }) {
  return (
    <footer className="title-block" aria-label="Title block">
      <div className="tb-cell tb-project">
        <span>Project</span>
        <strong>agents.graaf.dev</strong>
      </div>
      <div className="tb-cell tb-title">
        <span>Title</span>
        <strong>{title}</strong>
      </div>
      <div className="tb-cell">
        <span>Sheet</span>
        <strong>{number}</strong>
      </div>
      <div className="tb-cell">
        <span>Rev</span>
        <strong>{revision}</strong>
      </div>
      <div className="tb-cell">
        <span>Drawn</span>
        <strong>JtdeGraaf</strong>
      </div>
    </footer>
  )
}
