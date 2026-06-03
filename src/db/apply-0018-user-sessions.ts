// Manual DDL apply for migration 0018 (user_sessions).
// libsql's batch() — used by drizzle migrate() — silently skips DDL statements,
// so this table is applied directly via client.execute(). Idempotent; safe to
// re-run against local SQLite or Turso. Run: npx tsx src/db/apply-0018-user-sessions.ts
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function main() {
  console.log('Applying 0018_user_sessions...');
  await client.execute(`CREATE TABLE IF NOT EXISTS user_sessions (
    id text PRIMARY KEY NOT NULL,
    user_id text NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    started_at integer NOT NULL,
    last_seen_at integer NOT NULL,
    duration_seconds integer NOT NULL DEFAULT 0
  )`);
  await client.execute('CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions (user_id)');
  await client.execute('CREATE INDEX IF NOT EXISTS user_sessions_last_seen_at_idx ON user_sessions (last_seen_at)');

  const check = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_sessions'");
  console.log('user_sessions present:', check.rows.length === 1);
  process.exit(0);
}
main().catch((err) => { console.error(err); process.exit(1); });
