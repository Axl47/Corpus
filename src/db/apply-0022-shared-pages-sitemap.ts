// Add in_sitemap column to shared_pages. Idempotent.
// Local:  DATABASE_URL="file:local.db" npx tsx src/db/apply-0022-shared-pages-sitemap.ts
// Turso:  npx tsx src/db/apply-0022-shared-pages-sitemap.ts
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function main() {
  console.log('Applying 0022_shared_pages_sitemap...');
  const cols = await client.execute('PRAGMA table_info(shared_pages)');
  const hasCol = cols.rows.some((r: any) => r[1] === 'in_sitemap');
  if (!hasCol) {
    await client.execute('ALTER TABLE shared_pages ADD COLUMN in_sitemap integer NOT NULL DEFAULT 0');
    console.log('in_sitemap column added');
  } else {
    console.log('in_sitemap already exists — skipped');
  }
  process.exit(0);
}
main().catch((err) => { console.error(err); process.exit(1); });
