import { realtimeEmitter } from './emitter';
import type { RealtimeEvent } from './types';

export function publish(event: RealtimeEvent): void {
  realtimeEmitter.emit('event', event);
}
