import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/db';
import { workspaceMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { realtimeEmitter } from '@/lib/realtime/emitter';
import type { RealtimeEvent } from '@/lib/realtime/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const memberships = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, user.id));

  const allowedIds = new Set(memberships.map((m) => m.workspaceId));

  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      const send = (chunk: string) => {
        try {
          controller.enqueue(enc.encode(chunk));
        } catch {
          // controller already closed — ignore
        }
      };

      // Confirm connection
      send(': connected\n\n');

      // Keep-alive comment every 15 s — prevents proxy / Vercel 60 s idle timeout
      const keepalive = setInterval(() => send(': keepalive\n\n'), 15_000);

      const listener = (event: RealtimeEvent) => {
        if (!allowedIds.has(event.workspaceId)) return;
        send(`data: ${JSON.stringify(event)}\n\n`);
      };

      realtimeEmitter.on('event', listener);

      cleanup = () => {
        clearInterval(keepalive);
        realtimeEmitter.off('event', listener);
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      request.signal.addEventListener('abort', () => cleanup?.());
    },
    cancel() {
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx buffering
    },
  });
}
