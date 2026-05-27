'use server';
import { db } from '@/db';
import { databases, workspaceItems, workspaceMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth/session';
import { createWorkspaceDatabase, getActiveWorkspaceId } from './workspace';
import { publish } from '@/lib/realtime/publish';

// Verify user has access to the workspace that owns this database.
// Returns { userId, workspaceId } so callers can emit realtime events.
async function assertDatabaseAccess(databaseId: string): Promise<{ userId: string; workspaceId: string }> {
  const user = await getCurrentUser();

  const [row] = await db
    .select({ workspaceId: workspaceItems.workspaceId })
    .from(databases)
    .innerJoin(workspaceItems, eq(databases.itemId, workspaceItems.id))
    .where(eq(databases.id, databaseId))
    .limit(1);

  if (!row) throw new Error('Database not found');

  if (user.role !== 'admin') {
    const [member] = await db
      .select({ id: workspaceMembers.id })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, row.workspaceId),
          eq(workspaceMembers.userId, user.id),
        ),
      )
      .limit(1);

    if (!member) throw new Error('Unauthorized: no access to this database');
  }

  return { userId: user.id, workspaceId: row.workspaceId };
}

export async function createDatabase(name: string) {
  const workspaceId = await getActiveWorkspaceId();
  if (!workspaceId) throw new Error('No active workspace');
  const { dbId } = await createWorkspaceDatabase(workspaceId, name);
  revalidatePath('/', 'layout');
  return dbId;
}

export async function getDatabases() {
  return db.select().from(databases);
}

export async function getDatabase(id: string) {
  await assertDatabaseAccess(id);

  const result = await db
    .select({
      id: databases.id,
      name: databases.name,
      itemId: databases.itemId,
      schema: databases.schema,
      views: databases.views,
      createdAt: databases.createdAt,
      updatedAt: databases.updatedAt,
      icon: workspaceItems.icon,
      iconColor: workspaceItems.iconColor,
      workspaceId: workspaceItems.workspaceId,
      parentId: workspaceItems.parentId,
    })
    .from(databases)
    .leftJoin(workspaceItems, eq(databases.itemId, workspaceItems.id))
    .where(eq(databases.id, id));
  return result[0];
}

export async function updateDatabaseSchema(id: string, newSchema: any[]) {
  const { userId, workspaceId } = await assertDatabaseAccess(id);
  await db.update(databases).set({ schema: newSchema, updatedAt: new Date() }).where(eq(databases.id, id));
  revalidatePath(`/db/${id}`);
  publish({ scope: 'database', workspaceId, resourceId: id, actorId: userId });
}

export async function updateDatabaseViews(id: string, views: any[]) {
  const { userId, workspaceId } = await assertDatabaseAccess(id);
  await db.update(databases).set({ views, updatedAt: new Date() }).where(eq(databases.id, id));
  publish({ scope: 'database', workspaceId, resourceId: id, actorId: userId });
}
