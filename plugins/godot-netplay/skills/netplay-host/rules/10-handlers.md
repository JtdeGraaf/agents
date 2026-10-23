# Rule: `Handlers/` — the network edge, thin (NON-NEGOTIABLE)

A packet handler is the host's controller: one class per client→server packet class. It deserializes (via its base
class), resolves who sent it, and makes **one** service call. **No game logic.**

```csharp
public sealed class SetReadyPacketHandler : SessionPacketHandler<SetReadyPacket>
{
    // ctor stores IMatchService; the packet class itself routes it here

    protected override void Handle(PlayerId player, SetReadyPacket packet) => _match.SetReady(player, packet.IsReady);
}
```

- Derive from `PacketHandler<T>` (no session needed: handshake, ping) or `SessionPacketHandler<T>` (drops packets from
  connections that haven't joined and hands you a `PlayerId`).
- Inject **service interfaces** only — never a repository, a mapper, the messenger or a transport.
- A handler never sends packets. Replies (even a pong) go out from a service.
- Allowed: reading packet fields and wrapping a raw id in its value object. A malformed value throwing here is fine —
  the router logs it and the tick carries on.
- Register the handler in the composition root. Routing is by the handler's packet class.

If a handler does any of these, the logic belongs in a service:
- checking game phase, protocol version, permissions or any other state
- more than one service call, or deciding which one to call
- building a response or looking something up to pass along

**Self-check:** every `Handle` body is a single expression: take packet → call one service method.
