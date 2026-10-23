# Rule: Packets — wire contracts

Packets are the only types that cross the network. They live in `shared` so host and client can never drift.

## No magic numbers

Host and client run the same build and the protocol version is checked at the handshake, so the wire format needs
no hand-maintained numbers:

- **Packet id = the class.** A `PacketRegistry` lists every packet class; the header byte is its position. Send with
  `Send(new SetReadyPacket { ... })`, register with `Router.Register<SetReadyPacket>(...)`. No packet-type enum.
- **Fields by name.** `[MessagePackObject(keyAsPropertyName: true)]`, no `[Key]` attributes.
- **Enums by declaration order**, no explicit values.

Two deliberate exceptions:
- **High-frequency data stays positional.** Anything sent many times a second per player (state snapshots,
  transforms) keeps `[Key(n)]` — property names would multiply its size.
- **Handshake packets are frozen.** They stay first in the registry and their field names never change, so a client
  on another protocol version can still send its handshake and read the version-mismatch rejection. The
  version-mismatch error code stays first for the same reason.

## Shape

- `public sealed class XPacket`, `init` properties, a `/// <summary>C→S …</summary>` or `S→C …` direction note.
- **No silent defaults.** Required fields are `required`; optional ones nullable. Collections default to `[]`.
- **Separate request and response classes.** C→S and S→C get their own class even when the payload looks similar.
  No field that is "ignored when sent by a client".
- **No behaviour**, no domain value objects in packet fields (ids travel as `uint`). Mappers convert.
- Packets are never stored as domain state — except a deliberately shared recording/setup format that *is* the data
  and carries no behaviour.
- Any change to a packet's fields, the registry order or a wire enum **bumps `ProtocolVersion.Current`** (lobby
  discovery filters on it).

## Adding a packet

1. Class in `shared/Packets/` following the rules above.
2. Add it to `PacketRegistry` (after the handshake packets). A registry test fails if you forget.
3. Host: mapper method (S→C) or handler + service method (C→S).
4. Client: `Router.Register<T>(...)` in the owning mode, and the matching unregister.
5. Round-trip serializer test.
6. Bump `ProtocolVersion.Current`.
