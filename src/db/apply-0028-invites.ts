/**
 * Migration 0028 — workspace email invitations
 *
 * Adds `workspace_invites` for inviting people who don't have a Remnus account
 * yet. The invite carries a bearer `token` used in /invite/[token]; pending
 * invites reserve a seat in the billing owner's pool.
 *
 * Idempotent (CREATE TABLE IF NOT EXISTS). Apply to BOTH local and Turso:
 *   npx tsx src/db/apply-0028-invites.ts                              (Turso)
 *   DATABASE_URL="file:local.db" npx tsx src/db/apply-0028-invites.ts (local)
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@libsql/client';

const url = process.env.DATABASE_URL!;
const authToken = process.env.DATABASE_AUTH_TOKEN;

const client = createClient(url.startsWith('file:') ? { url } : { url, authToken });

async function main() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS workspace_invites (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      token TEXT NOT NULL,
      invited_by TEXT REFERENCES user(id) ON DELETE SET NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER,
      accepted_at INTEGER
    )
  `);
  await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS workspace_invites_token_unique ON workspace_invites(token)`);
  await client.execute(`CREATE INDEX IF NOT EXISTS workspace_invites_workspace_id_idx ON workspace_invites(workspace_id)`);
  await client.execute(`CREATE INDEX IF NOT EXISTS workspace_invites_email_idx ON workspace_invites(email)`);

  console.log('Migration 0028 applied successfully.');
}

main().catch(console.error);
