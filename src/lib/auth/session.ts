'use server';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export type SessionUser = {
  id: string;
  role: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

// Memoized per-request: auth() is called at most once regardless of how many
// server actions run in the same render cycle.
export const getCurrentUser = cache(async (): Promise<SessionUser> => {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  return session.user as SessionUser;
});
