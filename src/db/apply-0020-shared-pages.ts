// Manual DDL apply for migration 0020 (shared_pages).
// libsql batch() silently skips DDL — applied directly via client.execute().
// Idempotent; safe to re-run against local SQLite or Turso.
//
// Local:  DATABASE_URL="file:local.db" npx tsx src/db/apply-0020-shared-pages.ts
// Turso:  npx tsx src/db/apply-0020-shared-pages.ts
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function main() {
  console.log('Applying 0020_shared_pages...');
  await client.execute(`CREATE TABLE IF NOT EXISTS shared_pages (
    id text PRIMARY KEY NOT NULL,
    slug text NOT NULL,
    page_id text NOT NULL,
    workspace_id text NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    permission text NOT NULL DEFAULT 'read' CHECK (permission IN ('read','write')),
    created_by text NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    created_at integer NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await client.execute('CREATE UNIQUE INDEX IF NOT EXISTS shared_pages_slug_unique ON shared_pages (slug)');
  await client.execute('CREATE INDEX IF NOT EXISTS shared_pages_workspace_id_idx ON shared_pages (workspace_id)');
  await client.execute('CREATE INDEX IF NOT EXISTS shared_pages_page_id_idx ON shared_pages (page_id)');

  const check = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='shared_pages'");
  console.log('shared_pages present:', check.rows.length === 1);
  process.exit(0);
}
main().catch((err) => { console.error(err); process.exit(1); });
