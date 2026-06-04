// Add width column to shared_pages. Idempotent — safe to re-run.
// Local:  DATABASE_URL="file:local.db" npx tsx src/db/apply-0021-shared-pages-width.ts
// Turso:  npx tsx src/db/apply-0021-shared-pages-width.ts
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function main() {
  console.log('Applying 0021_shared_pages_width...');
  // ALTER TABLE ADD COLUMN is idempotent-safe via the column existence check
  const cols = await client.execute("PRAGMA table_info(shared_pages)");
  const hasWidth = cols.rows.some((r: any) => r[1] === 'width');
  if (!hasWidth) {
    await client.execute("ALTER TABLE shared_pages ADD COLUMN width text NOT NULL DEFAULT 'narrow'");
    console.log('width column added');
  } else {
    console.log('width column already exists — skipped');
  }
  process.exit(0);
}
main().catch((err) => { console.error(err); process.exit(1); });
