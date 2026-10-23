# Rule: `mapper/` — domain ↔ dto translation

`@Component` mappers, written by hand — **no MapStruct**.

- The single place entity ↔ DTO conversion happens (except read projections done in the query — see the data rule).
- Injected by services; never by controllers.
- Pure translation: no repository access, no business decisions.
