'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const POLL_INTERVAL_MS = 10_000;

/**
 * Polls for workspace changes every 10 seconds and calls router.refresh()
 * so server components pick up mutations made by other users or MCP agents.
 *
 * SSE was the original approach but Vercel serverless does not share
 * in-process EventEmitters across function instances, so polling is used
 * instead. router.refresh() is efficient: Next.js only re-renders the
 * server component segments that actually changed.
 */
export function useWorkspaceEvents(_currentUserId: string, paused: boolean = false) {
  const router = useRouter();

  useEffect(() => {
    if (paused) return;

    const id = setInterval(() => {
      router.refresh();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(id);
  }, [router, paused]);
}
