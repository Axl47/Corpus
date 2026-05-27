'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { RealtimeEvent } from '@/lib/realtime/types';

/**
 * Subscribes to the /api/realtime SSE stream and calls router.refresh()
 * whenever another user (or an MCP agent) mutates data in the workspace.
 *
 * Events originating from the current user are skipped because the UI
 * already applies optimistic updates for those actions.
 */
export function useWorkspaceEvents(currentUserId: string) {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const es = new EventSource('/api/realtime');

    es.onmessage = (e) => {
      let event: RealtimeEvent;
      try {
        event = JSON.parse(e.data) as RealtimeEvent;
      } catch {
        return;
      }

      // Own mutations are already reflected via optimistic UI — skip them.
      if (event.actorId === currentUserId) return;

      // Debounce: bulk MCP operations emit many events in quick succession.
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        router.refresh();
      }, 400);
    };

    es.onerror = () => {
      // The browser's EventSource automatically reconnects after an error.
      // Closing here would prevent reconnection; leave it open.
    };

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      es.close();
    };
  }, [currentUserId, router]);
}
