#!/usr/bin/env node
/**
 * Remnus .mcpb launcher.
 *
 * Claude Desktop runs this with its bundled Node over stdio. We hand off to the
 * bundled `mcp-remote` proxy, which bridges stdio <-> the Remnus remote MCP
 * server (Streamable HTTP) and runs the OAuth 2.1 + PKCE browser flow on the
 * first 401 — dynamic client registration against /api/oauth/* (localhost
 * redirect is allowed by the register endpoint). No token to paste.
 *
 * Canonical host is www: the apex (remnus.com) 307-redirects to www.remnus.com,
 * so the OAuth protected-resource metadata reports www. mcp-remote requires the
 * resource indicator to match the URL it was given, so we must hand it www.
 *
 * Robustness: the URL may arrive via argv (from `${user_config.server_url}`) or
 * the REMNUS_MCP_URL env. If a host's manifest-variable substitution misfires
 * and leaves a non-URL (e.g. a literal "${user_config.server_url}"), we fall
 * back to the production www endpoint instead of handing mcp-remote garbage.
 */
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const DEFAULT_URL = 'https://www.remnus.com/api/mcp';

function pickUrl() {
  const candidates = [process.env.REMNUS_MCP_URL, process.argv[2]];
  for (const c of candidates) {
    if (typeof c === 'string' && /^https?:\/\//i.test(c.trim())) return c.trim();
  }
  return DEFAULT_URL;
}

// Diagnostics: mirror everything to a log file so failures inside Claude Desktop
// (whose own log doesn't always surface the child's stderr) are debuggable.
const LOG_PATH = path.join(os.homedir(), '.remnus-mcpb.log');
function log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}\n`;
  try { fs.appendFileSync(LOG_PATH, stamped); } catch { /* ignore */ }
  try { process.stderr.write(stamped); } catch { /* ignore */ }
}

const MCP_URL = pickUrl();
const proxy = require.resolve('mcp-remote/dist/proxy.js');

log(`launcher start: node=${process.version} url=${MCP_URL} proxy=${proxy}`);

const child = spawn(process.execPath, [proxy, MCP_URL], {
  stdio: ['inherit', 'inherit', 'pipe'],
});

child.stderr.on('data', (buf) => {
  const text = buf.toString();
  try { fs.appendFileSync(LOG_PATH, text); } catch { /* ignore */ }
  try { process.stderr.write(text); } catch { /* ignore */ }
});

child.on('error', (err) => {
  log(`spawn error: ${err && err.message ? err.message : err}`);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  log(`proxy exited code=${code} signal=${signal}`);
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
