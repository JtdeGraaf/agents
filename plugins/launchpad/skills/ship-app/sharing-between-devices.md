# Sharing data between devices (unsafe, opt-in)

The one exception to "no backend": an app may keep **small, harmless** data the same on several devices, with no
accounts, using [TinyBase](https://tinybase.org) and its Cloudflare Durable Object server. Every device that knows
the same few words ("tomaat-oven-paars-lepel") shares one space.

Only add this when the idea clearly needs it (a shared shopping list, a household's chores, settings on phone and
laptop, a prototype that has to show data on two devices). Otherwise keep `localStorage`.

## It is unsafe. Say so.

Read this before using it, and put it in the app (see "Required notices" below).

- **Anyone with the words can read and change everything.** No accounts, no permissions, no audit log. The words
  are a house key.
- **The server can read the data.** TinyBase stores plain JSON in the Durable Object's SQLite, so whoever can open
  the Cloudflare account can see it.
- **Guessing a code is hard, not impossible.** Four words from a list of ~1000 is about 40 bits. Nothing limits how
  fast someone tries.
- **Anyone who connects can delete everything.** The server accepts every change from every client in the space.
- **No backups, no history.** A bad write or a cleared space is gone.
- **Small data only.** Keep each space well under a few MB.

**Good for:** shopping lists, favourites, settings, progress, a shared list on the fridge, prototypes.

**Never for:** anything private, anything about other people, money, health, location, passwords or tokens,
messages, photos, or anything the user can't afford to lose. If the idea needs any of that, it needs a real backend
with accounts: say so and don't build sync.

## Required notices

- `README.md`: a section **"Sharing between devices (unsafe)"** with the bullets above, shortened, and what this app
  syncs.
- In the app: one plain line next to the code, e.g. "Anyone with these words can see and change this list. Don't
  put anything private in it." Like all copy it is an i18n key in every locale (`en` and `nl`).
- `CLAUDE.md`: replace "No backend." with "No backend beyond the unsafe sync Worker (`worker/index.ts`, TinyBase on
  a Durable Object); only harmless data goes in it."

## Packages

```bash
npm i tinybase partysocket
npm i -D @cloudflare/workers-types
```

`partysocket/ws` is a reconnecting WebSocket with the browser API; TinyBase's client accepts it and keeps syncing
after the phone has been offline. Check the TinyBase version is still current (`npm view tinybase version`) and that
the imports below still exist; the server parts have moved before.

## The code (the space id)

- The first device makes the words: 4 random words from a list of ~1000 short everyday words (`lib/words.ts`),
  picked with `crypto.getRandomValues` and rejection sampling so every word is equally likely. Use one list for the
  whole app, in its default language, so a code works the same whatever language each player has chosen.
- Reading typed words is forgiving: ignore case, spaces, commas and dashes. The join form is react-hook-form with a
  Zod schema; what goes wrong is a coded error (`wrong-word-count`, `unknown-words`, `not-started`, `offline`) with
  an `errors.<code>` key in every locale, interpolating the count or the unknown words.
- The space id is the SHA-256 hex of `<slug>:<words>` (`crypto.subtle.digest`). The words never leave the device;
  the server and its logs only see the hash, and the same words in two apps open two spaces.
- Show the words big and a QR code of `https://<slug>.graaf.dev/#join=<words>` (the words sit in the hash, so no
  server sees them). Use a small QR encoder such as `uqr`. Read the hash through the router's `useLocation()` and a
  tested `lib/` parser, never `window.location`.
- Remember the words in `localStorage` so the device reconnects on its own and can show them again.
- All of this is pure `lib/` code with tests: word picking, reading typed words, the space id, the join link.

## Worker

`worker/index.ts`:

```ts
import { createMergeableStore } from 'tinybase'
import { createDurableObjectSqlStoragePersister } from 'tinybase/persisters/persister-durable-object-sql-storage'
import {
  getWsServerDurableObjectFetch,
  WsServerDurableObject,
} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object'

/** One shared space: everyone who connects to the same path. */
export class SharedSpace extends WsServerDurableObject {
  createPersister() {
    return createDurableObjectSqlStoragePersister(createMergeableStore(), this.ctx.storage.sql, {
      mode: 'fragmented',
    })
  }
}

type Env = { SHARED_SPACES: DurableObjectNamespace<SharedSpace> }

const openSpace = getWsServerDurableObjectFetch('SHARED_SPACES')
const SPACE_PATH = /^\/api\/sync\/[0-9a-f]{64}$/

export default {
  fetch(request, env) {
    if (!SPACE_PATH.test(new URL(request.url).pathname)) return new Response(null, { status: 404 })
    return openSpace(request, env)
  },
} satisfies ExportedHandler<Env>
```

`fragmented` mode stores a row per TinyBase row, so a space doesn't hit the 2 MB single-row limit. The path check
keeps random paths from making Durable Objects.

`wrangler.jsonc` (on top of Step 4):

```jsonc
"main": "worker/index.ts",
"assets": {
  "directory": "./dist",
  "not_found_handling": "single-page-application",
  "run_worker_first": ["/api/*"]
},
// Unsafe shared spaces: one Durable Object per code. See README "Sharing between devices (unsafe)".
"durable_objects": { "bindings": [{ "name": "SHARED_SPACES", "class_name": "SharedSpace" }] },
"migrations": [{ "tag": "v1", "new_sqlite_classes": ["SharedSpace"] }]
```

Add `tsconfig.worker.json` (types `@cloudflare/workers-types`, includes `worker`) and reference it from
`tsconfig.json` so `npm run typecheck` covers the Worker. The Cloudflare token from One-time setup already deploys
Durable Objects.

## Client

The synced state lives in a TinyBase `MergeableStore`, kept on the device with a local persister. It follows the
react-slices layering like any other data:

- `features/<x>/shared-space.ts` owns the connection (the code below). Nothing else imports `tinybase` or
  `partysocket`.
- `features/<x>/use<X>.ts` reads the store with `tinybase/ui-react` hooks, passes the raw rows through a parser in
  `lib/` (anyone can write anything, so nothing is trusted), and exposes plain actions (`addItem`, `drawLine`).
- Components only call that hook and render.

```ts
import { createMergeableStore } from 'tinybase'
import { createLocalPersister } from 'tinybase/persisters/persister-browser'
import { createWsSynchronizer } from 'tinybase/synchronizers/synchronizer-ws-client'
import ReconnectingWebSocket from 'partysocket/ws'

export const store = createMergeableStore()
const onThisDevice = createLocalPersister(store, '<slug>')
await onThisDevice.startAutoPersisting()

function spaceUrl(spaceId: string) {
  return `${location.origin.replace(/^http/, 'ws')}/api/sync/${spaceId}`
}

/** How often to swap the latest content with the others again, in case a change slipped past. */
const CATCH_UP_EVERY_MS = 5_000

export function connect(spaceId: string) {
  const socket = new ReconnectingWebSocket(spaceUrl(spaceId))
  // Not awaited: the copy on this device stays usable while the connection comes up, or never does.
  const syncing = createWsSynchronizer(store, socket).then(async (synchronizer) => synchronizer.startSync())
  // Pull the others' changes, then push this device's own: either direction can be dropped.
  const catchUp = () =>
    void syncing
      .then(async (synchronizer) => {
        await synchronizer.load()
        await synchronizer.save()
      })
      .catch(() => {})
  const catchUpWhenVisible = () => document.visibilityState === 'visible' && catchUp()
  const timer = setInterval(catchUp, CATCH_UP_EVERY_MS)
  document.addEventListener('visibilitychange', catchUpWhenVisible)
  return {
    isOnline: () => socket.readyState === WebSocket.OPEN,
    stop() {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', catchUpWhenVisible)
      socket.close()
      void syncing.then((synchronizer) => synchronizer.destroy()) // the data stays on the device
    },
  }
}
```

Two traps this code avoids, both seen in a real build:

- **Don't await the connection before showing data.** `createWsSynchronizer` waits for the socket to open, so an
  offline device would hang on a spinner with its data right there in localStorage.
- **Changes can slip past without the catch-up.** TinyBase fetches a change from the device that made it, with a
  1-second timeout. When that device is locked, backgrounded or throttled right after its change (a phone put down
  after a move), the fetch times out and the others never see the change until something else changes. Asking for
  the latest content every few seconds and when the page comes back into view (`synchronizer.load()`) closes that gap.
  Without it, a two-phone game deadlocked with each phone waiting for the other's turn.
- **The push can fail too, so the catch-up also calls `save()`.** The server fetches a change from the device that
  made it with the same 1-second timeout, so a change from a throttled device may never reach the server at all, and
  no amount of pulling elsewhere finds it. In a four-phone game a played card sat on one phone, "Connected", while
  the other three waited; `load()` then `save()` every 5 seconds fixed it.

**One store per space when a device can be in several.** For a household list a device belongs to one space and its
data joins it. For rooms (a game, a session) give each space its own store and localStorage key
(`<slug>:space:<spaceId>`), or joining a second room merges the first room's data into it.

**A typo must not look like lost data.** The server opens an empty space for any id, so:

- Starting a new space: connect, then `store.setValue('startedAt', Date.now())`.
- Joining: first sync a throwaway `createMergeableStore()` (no persister) to the space, with a timeout (offline
  otherwise hangs). If it has no `startedAt` value after `startSync()`, destroy it and show `errors.not-started`
  ("Nobody uses these words yet. Check them for typos."); on timeout show `errors.offline`. Only then connect the
  real store.
- Joining merges what was already on the device into the space; nothing is thrown away.
- "Stop sharing" goes through the app's one `ConfirmDialog` (`components/ui/`) and says the data stays on this
  device.

Show the state in plain words, as i18n keys: shared and up to date, offline (changes wait), or not shared.

## Checking it

- `npx wrangler dev` serves the app and the Worker together (run `npm run build` first). Open it on `localhost` and
  on `127.0.0.1`: they have separate storage, so they act as two phones. Start on one, join with the words on the
  other, change data on both, check it arrives both ways, and that a wrong code shows the typo message.
- Check a change made while the other tab is in the background still arrives within the catch-up interval, and
  that wiping one tab's localStorage and reloading brings everything back from the server (the Durable Object
  really stores it). Restart `wrangler dev` once in between: the other tab must reconnect on its own.
- Anyone with the words can write anything, so every value read from the store is checked in `lib/`; for a game,
  replay the moves by the rules and skip illegal ones instead of trusting whose turn the data says it is.
- Before deploying, `npx wrangler deploy --dry-run` must list the `SHARED_SPACES` Durable Object binding.
