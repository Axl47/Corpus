// Server-only internal helpers — NOT a 'use server' file.
// Import directly from server components/layouts; never re-export from a 'use server' file.
import 'server-only';
import { db } from '@/db';
import { sharedPages, workspaceMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getShareMapForWorkspace(workspaceId: string): Promise<Record<string, string>> {
  const rows = await db
    .select({ pageId: sharedPages.pageId, slug: sharedPages.slug })
    .from(sharedPages)
    .where(eq(sharedPages.workspaceId, workspaceId));
  return Object.fromEntries(rows.map(r => [r.pageId, r.slug]));
}

export async function checkUserHasWorkspaceAccess(userId: string, workspaceId: string): Promise<boolean> {
  const [member] = await db
    .select({ id: workspaceMembers.id })
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)))
    .limit(1);
  return !!member;
}
