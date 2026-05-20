import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

// Apply performance PRAGMAs once at module load (local SQLite only)
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:')) {
  client.execute('PRAGMA journal_mode = WAL').catch(() => {});
  client.execute('PRAGMA synchronous = NORMAL').catch(() => {});
  client.execute('PRAGMA foreign_keys = ON').catch(() => {});
  client.execute('PRAGMA cache_size = -20000').catch(() => {});
  client.execute('PRAGMA temp_store = MEMORY').catch(() => {});
}

export const db = drizzle(client, { schema });
