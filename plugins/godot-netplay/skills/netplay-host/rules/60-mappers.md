# Rule: `Mappers/` — domain ↔ packet translation

`public sealed class XMapper` per feature, written by hand, instantiated in the composition root and injected into
that feature's service.

- The **single place** a domain object becomes a packet (and back, when a request needs it). Services call
  `_mapper.ToRoundStart(round)`; they never assemble packets themselves.
- Pure translation: unwrap value objects (`id.Value`), flatten, copy. No repository access, no decisions about
  *whether* to send, no side effects.
- A mapper may combine data the service passes in from several sources, but it doesn't fetch that data itself.
- Injected by services only — never by handlers.
- Order-sensitive inputs are documented on the method ("award points before mapping").
