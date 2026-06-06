import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workspaces, workspaceMembers, databases } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';
import { normalizeNotionDate, type ImportItem, type ImportSpacePayload } from '@/lib/import/notion-parser';
import { createPageInWorkspace, createDatabaseInWorkspace } from '@/lib/services/workspace';
import { SELECT_COLOR_ORDER, type SelectOptionColor } from '@/lib/types/properties';

// ── Import flow ──────────────────────────────────────────────────────────────────
// The Notion export ZIP is parsed ENTIRELY in the browser (JSZip) and images are
// uploaded individually from the browser straight to Cloudinary. This route only
// receives the final, fully-materialized JSON tree (content already contains real
// image URLs) and writes it to the DB — so the (potentially huge) ZIP never has to
// be uploaded anywhere, sidestepping both Vercel's 4.5 MB body limit and
// Cloudinary's 10 MB single-file limit. The client sends one request per space.

const PALETTE = SELECT_COLOR_ORDER.filter(c => c !== 'default') as SelectOptionColor[];
function assignColors(options: string[]): { value: string; color: SelectOptionColor }[] {
  return options.map((value, i) => ({ value, color: PALETTE[i % PALETTE.length] }));
}

const ICON_PALETTE = ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink'] as const;
function randomIconColor(): string {
  return ICON_PALETTE[Math.floor(Math.random() * ICON_PALETTE.length)];
}

async function createWorkspaceForUser(userId: string, name: string): Promise<string> {
  const id = crypto.randomUUID();
  await db.insert(workspaces).values({ id, name: name.trim() || 'Untitled', createdAt: new Date() });
  await db.insert(workspaceMembers).values({ workspaceId: id, userId, role: 'owner', createdAt: new Date() });
  return id;
}

async function importItems(
  items: ImportItem[],
  workspaceId: string,
  parentId: string | undefined,
  counters: { pages: number; databases: number; rows: number },
) {
  for (const item of items) {
    if (item.type === 'page') {
      const result = await createPageInWorkspace(workspaceId, {
        title: item.title || 'Untitled',
        content: item.content,
        parentId,
        iconColor: randomIconColor(),
      });
      counters.pages++;
      if (item.children.length > 0) {
        await importItems(item.children, workspaceId, result.id, counters);
      }
    } else {
      const { databaseId } = await createDatabaseInWorkspace(workspaceId, {
        name: item.title || 'Untitled',
        parentId,
        iconColor: randomIconColor(),
        schema: item.columns.length > 0
          ? item.columns.map(col => ({
              name: col.name,
              type: col.type,
              ...(col.options ? { options: assignColors(col.options) } : {}),
            }))
          : undefined,
      });
      counters.databases++;

      // Fetch schema to map column names → generated IDs.
      const [dbRecord] = await db
        .select({ schema: databases.schema })
        .from(databases)
        .where(eq(databases.id, databaseId))
        .limit(1);
      const nameToId = new Map<string, string>();
      const idToType = new Map<string, string>();
      for (const col of (dbRecord?.schema ?? []) as { id: string; name: string; type: string }[]) {
        nameToId.set(col.name, col.id);
        idToType.set(col.id, col.type);
      }

      const firstColName = item.columns[0]?.name ?? 'Title';
      for (const row of item.rows) {
        const properties: Record<string, string | string[]> = {};
        for (const [k, v] of Object.entries(row.properties)) {
          if (k === firstColName || !v) continue;
          const colId = nameToId.get(k);
          if (!colId) continue;
          const colType = idToType.get(colId);
          if (colType === 'multi_select') {
            properties[colId] = v.split(',').map(s => s.trim()).filter(Boolean);
          } else if (colType === 'checkbox') {
            properties[colId] = /^(yes|true|☑|✓|checked)$/i.test(v) ? 'true' : 'false';
          } else if (colType === 'date' || colType === 'datetime') {
            properties[colId] = normalizeNotionDate(v);
          } else {
            properties[colId] = v;
          }
        }

        await createPageInWorkspace(workspaceId, {
          databaseId,
          title: row.title || 'Untitled',
          content: row.content,
          properties: Object.keys(properties).length > 0 ? properties : undefined,
        });
        counters.rows++;
      }
    }
  }
}

// ── Routes ─────────────────────────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    const body = (await req.json().catch(() => null)) as { space?: ImportSpacePayload } | null;
    const space = body?.space;
    if (!space || typeof space.name !== 'string' || !Array.isArray(space.items)) {
      return NextResponse.json({ error: 'Invalid import payload' }, { status: 400 });
    }

    const workspaceId = await createWorkspaceForUser(user.id, space.name);
    const counters = { pages: 0, databases: 0, rows: 0 };
    await importItems(space.items, workspaceId, undefined, counters);

    return NextResponse.json({ ok: true, name: space.name, workspaceId, imported: counters });
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    console.error('[import/notion]', err);
    return NextResponse.json({ error: err?.message ?? 'Import failed' }, { status: 500 });
  }
}
