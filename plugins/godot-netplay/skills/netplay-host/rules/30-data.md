# Rule: `Data/` — storage and loading, no logic

The data layer holds state that outlives a single call and reads/writes external formats. A player-hosted game often
has no database: "persistence" is in-memory for the host's lifetime, plus the JSON content files.

- **Repositories** (`ISessionRepository` / `SessionRepository`): add, find, remove, list — and id assignment, like a
  database identity column. No rules about who may do what; that's the service's or the domain's job.
- **Loaders**: file IO and (de)serialization only. Unknown JSON properties are rejected. Where files come from is an
  abstraction (`IContentFiles`: directory on disk, or embedded resources for shipped builds). Loaders hand raw
  definitions to a domain factory (`ContentLibrary.Create`) which validates, and translate format errors into the
  domain's exception type — nothing more.
- Only the owning feature's `Application/` injects its repository. Handlers and other features never do.
- Repositories return **domain entities**, never packets.
- Never hand-edit generated data (e.g. level metadata exported from the editor); regenerate it.
