import { db } from '@/db';
import { clientAuthTokens } from '@/db/schema';
import { eq, lt } from 'drizzle-orm';

export async function setPendingClientToken(deviceId: string, token: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  // Evict expired entries on every write to avoid unbounded growth.
  await db.delete(clientAuthTokens).where(lt(clientAuthTokens.expiresAt, new Date()));
  await db
    .insert(clientAuthTokens)
    .values({ deviceId, token, expiresAt })
    .onConflictDoUpdate({ target: clientAuthTokens.deviceId, set: { token, expiresAt } });
}

// Returns the token and removes it (one-time use). Returns null if missing/expired.
export async function consumeClientToken(deviceId: string): Promise<string | null> {
  const [entry] = await db
    .select()
    .from(clientAuthTokens)
    .where(eq(clientAuthTokens.deviceId, deviceId))
    .limit(1);

  if (!entry || entry.expiresAt < new Date()) {
    if (entry) await db.delete(clientAuthTokens).where(eq(clientAuthTokens.deviceId, deviceId));
    return null;
  }

  await db.delete(clientAuthTokens).where(eq(clientAuthTokens.deviceId, deviceId));
  return entry.token;
}
