import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { userSessions } from '@/db/schema';

// Heartbeat endpoint. The client pings while the user is active (see
// ActivityTracker). Each ping extends the most recent open session, or opens a
// new one if the last ping was longer than SESSION_GAP_MS ago. Best-effort:
// failures never surface to the user.
const SESSION_GAP_MS = 2 * 60 * 1000; // 2 minutes of inactivity ends a session

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  // Don't track admins — their browsing would create noise rows in the
  // engagement stats they're meant to be reviewing.
  if (session.user.role === 'admin') return NextResponse.json({ ok: true });

  try {
    const now = new Date();

    const [latest] = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.userId, userId))
      .orderBy(desc(userSessions.lastSeenAt))
      .limit(1);

    if (latest && now.getTime() - latest.lastSeenAt.getTime() <= SESSION_GAP_MS) {
      const durationSeconds = Math.round((now.getTime() - latest.startedAt.getTime()) / 1000);
      await db
        .update(userSessions)
        .set({ lastSeenAt: now, durationSeconds })
        .where(eq(userSessions.id, latest.id));
    } else {
      await db.insert(userSessions).values({
        userId,
        startedAt: now,
        lastSeenAt: now,
        durationSeconds: 0,
      });
    }
  } catch {
    // best-effort tracking — swallow errors
  }

  return NextResponse.json({ ok: true });
}
