// The realtime SSE channel (GET /api/realtime) was removed: no client ever
// subscribed to it, and an in-memory EventEmitter can't fan out across Vercel's
// multi-instance serverless runtime anyway. Live UI updates now ride the
// activity heartbeat (see useWorkspaceEvents + /api/activity/ping changeVersion).
//
// This stays as a no-op so the existing server-action / MCP-write call sites
// compile unchanged; the calls can be swept entirely in a later cleanup.
export function publish(_event: unknown): void {
  /* no-op — realtime SSE removed */
}
