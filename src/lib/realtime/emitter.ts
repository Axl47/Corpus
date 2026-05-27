import { EventEmitter } from 'events';

// globalThis pattern keeps a single emitter instance across HMR reloads in dev.
// In production there is only one module instance, so this is a no-op there.
declare global {
  // eslint-disable-next-line no-var
  var __realtimeEmitter: EventEmitter | undefined;
}

export const realtimeEmitter: EventEmitter =
  (globalThis.__realtimeEmitter ??= new EventEmitter());

// One listener per connected SSE client — raise the default limit to avoid warnings.
realtimeEmitter.setMaxListeners(500);
