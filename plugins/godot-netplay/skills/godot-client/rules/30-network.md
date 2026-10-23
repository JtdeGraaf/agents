# Rule: Networking on the client

- **One autoload (`NetworkClient`) is the only owner of transports and the listen host** (host/connect over UDP or a
  platform relay, disconnect). Scenes and flows call those; nothing else constructs a transport.
- Platform lobby details scenes need are exposed through the network autoload (invite, overlay) or used inside menu
  flows — UI nodes don't call the platform SDK beyond handing it to a flow.
- Send with `NetworkClient.Send(new XPacket { ... })` — the class is the packet id. Send C→S classes only; S→C classes
  are for registering.
- **Register / unregister symmetrically.** Whoever calls `Router.Register<T>` in `_Ready` (or a flow's constructor)
  unregisters the same classes in `_ExitTree` (or `Dispose`). Call `FlushPending()` after registering in a new scene
  so packets that arrived during the scene change aren't lost.
- **Timers use the host clock** (synced via ping/pong) with a local fallback — never a locally accumulated `delta`,
  so every player sees the same countdown.
- Transports are disposed after polling, never inside their own callbacks.
- Host-side errors arrive coded (`ErrorCode` + args); render with the shared templates, never string-match.
- All handlers run on the main thread: the listen host's tick and transport polling happen in the autoload's
  `_Process`. Platform callbacks are pumped manually on the main thread, before the network autoload each frame.
