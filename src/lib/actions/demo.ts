'use server';
import { db } from '@/db';
import { users, workspaces, workspaceMembers } from '@/db/schema';
import { eq, ne } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { encode } from '@auth/core/jwt';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createDemoSeedData } from '@/lib/seed';

const DEMO_EMAIL = 'demo@remnus.com';
const DEMO_PASSWORD = 'remnus-demo-2024';

export async function loginAsDemo(_prevState: unknown, _formData: FormData): Promise<{ error: string } | null> {
  // Require at least one real (non-demo) user to exist before enabling demo mode
  const realUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(ne(users.role, 'demo'));

  if (realUsers.length === 0) {
    return { error: 'Demo mode is not available yet. Please create an account first.' };
  }

  // Find or create the demo user
  let [demoUser] = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.email, DEMO_EMAIL))
    .limit(1);

  if (!demoUser) {
    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
    await db.insert(users).values({
      id,
      name: 'Demo User',
      email: DEMO_EMAIL,
      passwordHash,
      role: 'demo',
      createdAt: new Date(),
    });
    demoUser = { id, name: 'Demo User' };
  }

  // Reset workspaces only — user_sessions are intentionally preserved so the
  // admin panel can track cumulative demo engagement across all visitors.
  const memberships = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, demoUser.id));

  for (const { workspaceId } of memberships) {
    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
  }

  // Recreate fresh demo data (1 workspace + pages + databases)
  await createDemoSeedData(demoUser.id, demoUser.name);

  // Create a session JWT directly — bypasses Auth.js HTTP route and its CSRF check.
  // Calling signIn() from a server action makes an internal POST to /api/auth/signin
  // which requires a CSRF token that isn't present in server-side contexts.
  const isProd = process.env.NODE_ENV === 'production';
  const cookieName = isProd ? '__Secure-authjs.session-token' : 'authjs.session-token';
  const secret = process.env.AUTH_SECRET!;

  const sessionToken = await encode({
    token: {
      sub: demoUser.id,
      name: demoUser.name ?? 'Demo User',
      email: DEMO_EMAIL,
      id: demoUser.id,
      role: 'demo',
    },
    secret,
    salt: cookieName,
  });

  const cookieStore = await cookies();
  cookieStore.set(cookieName, sessionToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect('/app');
}
