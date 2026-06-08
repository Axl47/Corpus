/**
 * Migration 0023 — OAuth 2.1 + PKCE tables
 * Apply to both local and Turso:
 *   npx tsx src/db/apply-0023-oauth.ts                          (Turso)
 *   DATABASE_URL="file:local.db" npx tsx src/db/apply-0023-oauth.ts  (local)
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@libsql/client';

const url = process.env.DATABASE_URL!;
const authToken = process.env.DATABASE_AUTH_TOKEN;

const client = createClient(url.startsWith('file:') ? { url } : { url, authToken });

const DDL = [
  `CREATE TABLE IF NOT EXISTS oauth_clients (
    client_id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    redirect_uris TEXT NOT NULL,
    grant_types TEXT NOT NULL DEFAULT '["authorization_code"]',
    response_types TEXT NOT NULL DEFAULT '["code"]',
    token_endpoint_auth_method TEXT NOT NULL DEFAULT 'none',
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS oauth_auth_codes (
    code TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    redirect_uri TEXT NOT NULL,
    code_challenge TEXT NOT NULL,
    code_challenge_method TEXT NOT NULL DEFAULT 'S256',
    scope TEXT NOT NULL DEFAULT 'read',
    expires_at INTEGER NOT NULL,
    used_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS oauth_access_tokens (
    id TEXT PRIMARY KEY,
    token_prefix TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    refresh_token_prefix TEXT,
    refresh_token_hash TEXT,
    client_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    scope TEXT NOT NULL DEFAULT 'read',
    expires_at INTEGER NOT NULL,
    revoked_at INTEGER,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS oauth_access_tokens_prefix_idx ON oauth_access_tokens(token_prefix)`,
  `CREATE INDEX IF NOT EXISTS oauth_access_tokens_refresh_prefix_idx ON oauth_access_tokens(refresh_token_prefix)`,
];

async function main() {
  for (const sql of DDL) {
    await client.execute(sql);
    console.log('OK:', sql.slice(0, 60).replace(/\s+/g, ' ') + '...');
  }
  console.log('\nMigration 0023 applied successfully.');
}

main().catch(console.error);
