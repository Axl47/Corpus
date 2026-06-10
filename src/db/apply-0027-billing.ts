/**
 * Migration 0027 — billing / subscriptions + workspace billing owner
 *
 * Adds the `subscriptions` table (bound to the paying user — the "billing owner")
 * and a `billing_owner_id` column on `workspaces`. A workspace's plan limits
 * (seats/agents/storage) are read from its billing owner's subscription; no
 * subscription row = implicit Free plan.
 *
 * Backfills `billing_owner_id` to each workspace's earliest `role='owner'` member.
 *
 * Idempotent (PRAGMA column checks + CREATE TABLE IF NOT EXISTS).
 * Apply to BOTH local and Turso:
 *   npx tsx src/db/apply-0027-billing.ts                              (Turso)
 *   DATABASE_URL="file:local.db" npx tsx src/db/apply-0027-billing.ts (local)
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
  // 1. subscriptions table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      owner_user_id TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,
      tier TEXT NOT NULL DEFAULT 'free',
      status TEXT NOT NULL DEFAULT 'active',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      current_period_end INTEGER,
      seat_limit_override INTEGER,
      agent_limit_override INTEGER,
      storage_bytes_override INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);
  await client.execute(`CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_idx ON subscriptions(stripe_customer_id)`);
  console.log('OK: subscriptions table.');

  // 2. workspaces.billing_owner_id
  if (await hasColumn('workspaces', 'billing_owner_id')) {
    console.log('Column workspaces.billing_owner_id already exists — skipping add.');
  } else {
    await client.execute(`ALTER TABLE workspaces ADD COLUMN billing_owner_id TEXT`);
    console.log('Added column workspaces.billing_owner_id.');
  }

  // 3. Backfill billing_owner_id from the earliest owner membership
  const res = await client.execute(`
    UPDATE workspaces
    SET billing_owner_id = (
      SELECT user_id FROM workspace_members
      WHERE workspace_id = workspaces.id AND role = 'owner'
      ORDER BY created_at ASC
      LIMIT 1
    )
    WHERE billing_owner_id IS NULL
  `);
  console.log(`Backfilled billing_owner_id on ${res.rowsAffected} workspace(s).`);

  console.log('\nMigration 0027 applied successfully.');
}

main().catch(console.error);
