export const runtime = 'nodejs';

import { db } from '@/db';
import { oauthAuthCodes, oauthAccessTokens, oauthClients } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';

const ACCESS_TOKEN_TTL_MS  = 60 * 60 * 1000;          // 1 hour
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function oauthError(code: string, description: string, status = 400) {
  return Response.json(
    { error: code, error_description: description },
    { status, headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } },
  );
}

function tokenResponse(body: Record<string, unknown>) {
  return Response.json(body, {
    headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' },
  });
}

async function generateTokenPair(): Promise<{
  accessToken: string; accessPrefix: string; accessHash: string;
  refreshToken: string; refreshPrefix: string; refreshHash: string;
}> {
  const aPrefix = randomBytes(4).toString('hex');
  const aSecret = randomBytes(32).toString('hex');
  const accessToken = `oa_${aPrefix}_${aSecret}`;
  const accessHash = await bcrypt.hash(aSecret, 10);

  const rPrefix = randomBytes(4).toString('hex');
  const rSecret = randomBytes(32).toString('hex');
  const refreshToken = `or_${rPrefix}_${rSecret}`;
  const refreshHash = await bcrypt.hash(rSecret, 10);

  return { accessToken, accessPrefix: aPrefix, accessHash, refreshToken, refreshPrefix: rPrefix, refreshHash };
}

function verifyS256(codeVerifier: string, codeChallenge: string): boolean {
  const digest = createHash('sha256').update(codeVerifier).digest();
  const computed = digest.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return computed === codeChallenge;
}

async function handleAuthorizationCode(params: URLSearchParams): Promise<Response> {
  const code        = params.get('code');
  const redirectUri = params.get('redirect_uri');
  const clientId    = params.get('client_id');
  const verifier    = params.get('code_verifier');

  if (!code || !redirectUri || !clientId || !verifier) {
    return oauthError('invalid_request', 'Missing required parameters');
  }

  const [row] = await db
    .select()
    .from(oauthAuthCodes)
    .where(eq(oauthAuthCodes.code, code))
    .limit(1);

  if (!row) return oauthError('invalid_grant', 'Authorization code not found or already used');
  if (row.usedAt) return oauthError('invalid_grant', 'Authorization code already used');
  if (row.expiresAt.getTime() < Date.now()) return oauthError('invalid_grant', 'Authorization code expired');
  if (row.clientId !== clientId) return oauthError('invalid_grant', 'client_id mismatch');
  if (row.redirectUri !== redirectUri) return oauthError('invalid_grant', 'redirect_uri mismatch');
  if (!verifyS256(verifier, row.codeChallenge)) return oauthError('invalid_grant', 'code_verifier invalid');

  // Mark code as used
  await db.update(oauthAuthCodes).set({ usedAt: new Date() }).where(eq(oauthAuthCodes.code, code));

  const tokens = await generateTokenPair();
  const now = new Date();

  await db.insert(oauthAccessTokens).values({
    tokenPrefix:        tokens.accessPrefix,
    tokenHash:          tokens.accessHash,
    refreshTokenPrefix: tokens.refreshPrefix,
    refreshTokenHash:   tokens.refreshHash,
    clientId:           row.clientId,
    userId:             row.userId,
    workspaceId:        row.workspaceId,
    scope:              row.scope,
    expiresAt:          new Date(now.getTime() + ACCESS_TOKEN_TTL_MS),
    createdAt:          now,
  });

  return tokenResponse({
    access_token:  tokens.accessToken,
    token_type:    'Bearer',
    expires_in:    ACCESS_TOKEN_TTL_MS / 1000,
    refresh_token: tokens.refreshToken,
    scope:         row.scope,
  });
}

async function handleRefreshToken(params: URLSearchParams): Promise<Response> {
  const refreshToken = params.get('refresh_token');
  const clientId     = params.get('client_id');

  if (!refreshToken || !clientId) {
    return oauthError('invalid_request', 'Missing refresh_token or client_id');
  }

  const parts = refreshToken.split('_');
  if (parts.length < 3 || parts[0] !== 'or') {
    return oauthError('invalid_grant', 'Invalid refresh token format');
  }
  const [, rPrefix, ...secretParts] = parts;
  const rSecret = secretParts.join('_');

  const [row] = await db
    .select()
    .from(oauthAccessTokens)
    .where(and(eq(oauthAccessTokens.refreshTokenPrefix, rPrefix), isNull(oauthAccessTokens.revokedAt)))
    .limit(1);

  if (!row || !row.refreshTokenHash) return oauthError('invalid_grant', 'Refresh token not found');
  if (!await bcrypt.compare(rSecret, row.refreshTokenHash)) return oauthError('invalid_grant', 'Invalid refresh token');
  if (row.clientId !== clientId) return oauthError('invalid_grant', 'client_id mismatch');

  // Check refresh token hasn't expired (implicit: if created_at + 30d < now)
  const refreshExpiry = new Date(row.createdAt.getTime() + REFRESH_TOKEN_TTL_MS);
  if (refreshExpiry.getTime() < Date.now()) return oauthError('invalid_grant', 'Refresh token expired');

  // Rotate: revoke old, issue new pair
  await db.update(oauthAccessTokens).set({ revokedAt: new Date() }).where(eq(oauthAccessTokens.id, row.id));

  const tokens = await generateTokenPair();
  const now = new Date();

  await db.insert(oauthAccessTokens).values({
    tokenPrefix:        tokens.accessPrefix,
    tokenHash:          tokens.accessHash,
    refreshTokenPrefix: tokens.refreshPrefix,
    refreshTokenHash:   tokens.refreshHash,
    clientId:           row.clientId,
    userId:             row.userId,
    workspaceId:        row.workspaceId,
    scope:              row.scope,
    expiresAt:          new Date(now.getTime() + ACCESS_TOKEN_TTL_MS),
    createdAt:          now,
  });

  return tokenResponse({
    access_token:  tokens.accessToken,
    token_type:    'Bearer',
    expires_in:    ACCESS_TOKEN_TTL_MS / 1000,
    refresh_token: tokens.refreshToken,
    scope:         row.scope,
  });
}

export async function POST(req: Request) {
  let params: URLSearchParams;
  const contentType = req.headers.get('content-type') ?? '';

  if (contentType.includes('application/x-www-form-urlencoded')) {
    params = new URLSearchParams(await req.text());
  } else {
    // Some clients send JSON
    try {
      const body = await req.json() as Record<string, string>;
      params = new URLSearchParams(Object.entries(body).map(([k, v]) => [k, String(v)]));
    } catch {
      return oauthError('invalid_request', 'Unsupported content-type');
    }
  }

  const grantType = params.get('grant_type');

  if (grantType === 'authorization_code') return handleAuthorizationCode(params);
  if (grantType === 'refresh_token') return handleRefreshToken(params);
  return oauthError('unsupported_grant_type', `grant_type '${grantType}' is not supported`);
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
