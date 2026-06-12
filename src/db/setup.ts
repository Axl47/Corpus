/**
 * Runs all migrations (Drizzle + every apply-*.ts script) in order.
 * New apply scripts are picked up automatically — no need to edit this file.
 *
 * DATABASE_URL defaults to "file:local.db" for local dev convenience.
 *
 * Usage:
 *   npm run db:setup
 *   DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npm run db:setup  (Turso)
 */
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..', '..');
const dbDir = path.resolve(__dirname);
const dbUrl = process.env.DATABASE_URL ?? 'file:local.db';
const env = { ...process.env, DATABASE_URL: dbUrl };

const applyScripts = fs
  .readdirSync(dbDir)
  .filter(f => /^apply-\d+.*\.ts$/.test(f))
  .sort()
  .map(f => path.join('src', 'db', f));

const scripts = ['src/db/migrate.ts', ...applyScripts];

console.log(`\nSetting up database: ${dbUrl}\n`);

for (const script of scripts) {
  console.log(`▶ ${script}`);
  const result = spawnSync('npx', ['tsx', script], { env, cwd: root, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('\n✓ All migrations applied.\n');
