/**
 * Migration 0030 — agent type + display name chosen at OAuth consent
 *
 * Lets the user pick the agent brand (icon) and give the connection a friendly name
 * on the OAuth authorize screen. Those choices are stamped on the auth code at consent
 * and copied onto the access token at exchange.
 *
 *   oauth_auth_codes.agent_name    — canonical AGENT_MARKS id (icon), nullable
 *   oauth_auth_codes.display_name  — user-given label, nullable
 *   oauth_access_tokens.display_name — user-given label, nullable
 *     (oauth_access_tokens.agent_name already exists — migration 0024)
 *
 * Idempotent (skips columns that already exist). Apply to both local and Turso:
 *   npx tsx src/db/apply-0030-oauth-agent-consent.ts                              (Turso)
 *   DATABASE_URL="file:local.db" npx tsx src/db/apply-0030-oauth-agent-consent.ts (local)
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@libsql/client';

const url = process.env.DATABASE_URL!;
const authToken = process.env.DATABASE_AUTH_TOKEN;

const client = createClient(url.startsWith('file:') ? { url } : { url, authToken });

async function addColumn(table: string, column: string, ddl: string) {
  const info = await client.execute(`PRAGMA table_info(${table})`);
  const exists = info.rows.some(r => (r as Record<string, unknown>).name === column);
  if (exists) {
    console.log(`Column ${table}.${column} already exists — skipping.`);
    return;
  }
  await client.execute(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  console.log(`Added column ${table}.${column}.`);
}

async function main() {
  await addColumn('oauth_auth_codes', 'agent_name', 'agent_name TEXT');
  await addColumn('oauth_auth_codes', 'display_name', 'display_name TEXT');
  await addColumn('oauth_access_tokens', 'display_name', 'display_name TEXT');
  console.log('\nMigration 0030 applied successfully.');
}

main().catch(console.error);
