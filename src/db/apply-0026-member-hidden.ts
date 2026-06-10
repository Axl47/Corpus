/**
 * Migration 0026 — move workspace `hidden` from per-workspace to per-user
 *
 * 0025 added `hidden` to `workspaces`, but that made hiding workspace-global: one member
 * hiding a shared/blog workspace would hide it for ALL members. Hiding is a personal
 * sidebar preference, so it belongs on the caller's membership row. This adds
 * `hidden` to `workspace_members` and drops the orphaned `workspaces.hidden` column.
 *
 * Idempotent (PRAGMA column checks). Apply to both local and Turso:
 *   npx tsx src/db/apply-0026-member-hidden.ts                              (Turso)
 *   DATABASE_URL="file:local.db" npx tsx src/db/apply-0026-member-hidden.ts (local)
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@libsql/client';

const url = process.env.DATABASE_URL!;
const authToken = process.env.DATABASE_AUTH_TOKEN;

const client = createClient(url.startsWith('file:') ? { url } : { url, authToken });

async function hasColumn(table: string, column: string) {
  const info = await client.execute(`PRAGMA table_info(${table})`);
  return info.rows.some(r => (r as Record<string, unknown>).name === column);
}

async function main() {
  if (await hasColumn('workspace_members', 'hidden')) {
    console.log('Column workspace_members.hidden already exists — skipping add.');
  } else {
    await client.execute(`ALTER TABLE workspace_members ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0`);
    console.log('Added column workspace_members.hidden.');
  }

  if (await hasColumn('workspaces', 'hidden')) {
    await client.execute(`ALTER TABLE workspaces DROP COLUMN hidden`);
    console.log('Dropped orphaned column workspaces.hidden.');
  } else {
    console.log('Column workspaces.hidden does not exist — nothing to drop.');
  }

  console.log('\nMigration 0026 applied successfully.');
}

main().catch(console.error);
