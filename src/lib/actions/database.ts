'use server';
import { db } from '@/db';
import { databases } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createDatabase(name: string) {
  const id = crypto.randomUUID();
  await db.insert(databases).values({
    id,
    name,
    schema: [
      { id: 'title', name: 'Title', type: 'text' },
      { id: 'status', name: 'Status', type: 'select', options: ['To Do', 'In Progress', 'Done'] }
    ],
  });
  revalidatePath('/');
  return id;
}

export async function getDatabases() {
  return db.select().from(databases);
}

export async function getDatabase(id: string) {
  const result = await db.select().from(databases).where(eq(databases.id, id));
  return result[0];
}

export async function updateDatabaseSchema(id: string, newSchema: any[]) {
  await db.update(databases).set({ schema: newSchema, updatedAt: new Date() }).where(eq(databases.id, id));
  revalidatePath(`/db/${id}`);
}
