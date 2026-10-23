import { useMemo } from 'react'
import { Marked } from 'marked'
import { findFile, resolvePath } from './catalog.ts'

const EXTERNAL = /^([a-z][a-z0-9+.-]*:|#|\/\/)/i

function render(content: string, fromPath: string): string {
  const marked = new Marked({
    gfm: true,
    walkTokens(token) {
      if (token.type !== 'link' || EXTERNAL.test(token.href)) return
      const target = resolvePath(fromPath, token.href)
      // Links to files the site doesn't carry fall through to GitHub.
      token.href = findFile(target)
        ? `#/file/${target}`
        : `https://github.com/JtdeGraaf/agents/blob/main/${target}`
    },
  })
  return marked.parse(content, { async: false })
}

export function Markdown({ content, path }: { content: string; path: string }) {
  const html = useMemo(() => render(content, path), [content, path])
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
}
