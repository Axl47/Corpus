'use client';

import { useEffect, useRef } from 'react';

const PING_INTERVAL_MS = 30_000; // heartbeat cadence while the tab is visible
const PING_URL = '/api/activity/ping';

/**
 * Heartbeat-based engagement tracker. While the tab is visible it POSTs to
 * /api/activity/ping every 30s; the server extends the user's current session
 * or opens a new one after an inactivity gap. Pinging pauses when the tab is
 * hidden and resumes on return, so we measure real time-in-app (presence)
 * rather than wall-clock time with the tab buried.
 *
 * Mounted only for authenticated users (see [locale]/layout.tsx).
 */
export default function ActivityTracker() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const ping = () => {
      // keepalive lets the request survive a tab close / navigation
      fetch(PING_URL, { method: 'POST', keepalive: true }).catch(() => {});
    };

    const start = () => {
      if (intervalRef.current) return;
      ping(); // immediate ping on (re)gaining visibility
      intervalRef.current = setInterval(ping, PING_INTERVAL_MS);
    };

    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') start();
      else stop();
    };

    if (document.visibilityState === 'visible') start();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      stop();
    };
  }, []);

  return null;
}
