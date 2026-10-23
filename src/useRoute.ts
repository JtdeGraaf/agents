import { useEffect, useState } from 'react'

export type Route = { kind: 'index' } | { kind: 'plugin'; name: string } | { kind: 'file'; path: string }

function parse(hash: string): Route {
  const [, kind, ...rest] = hash.replace(/^#/, '').split('/')
  if (kind === 'plugin' && rest[0]) return { kind: 'plugin', name: rest[0] }
  if (kind === 'file' && rest.length > 0) return { kind: 'file', path: decodeURIComponent(rest.join('/')) }
  // Plugin homepages in plugin.json point at #<name>.
  if (kind && rest.length === 0 && !kind.includes('.')) return { kind: 'plugin', name: kind }
  return { kind: 'index' }
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(window.location.hash))

  useEffect(() => {
    const onChange = () => {
      setRoute(parse(window.location.hash))
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}
