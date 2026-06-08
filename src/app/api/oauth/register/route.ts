export const runtime = 'nodejs';

import { db } from '@/db';
import { oauthClients } from '@/db/schema';

// RFC 7591 Dynamic Client Registration
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return error('invalid_client_metadata', 'Request body must be JSON', 400);
  }

  const clientName = typeof body.client_name === 'string' ? body.client_name.trim() : 'Unknown Client';

  const redirectUris = body.redirect_uris;
  if (!Array.isArray(redirectUris) || redirectUris.length === 0) {
    return error('invalid_redirect_uri', 'redirect_uris is required', 400);
  }
  const uris = redirectUris as string[];
  for (const uri of uris) {
    if (typeof uri !== 'string') return error('invalid_redirect_uri', 'redirect_uris must be strings', 400);
    // Allow http for localhost (desktop clients), require https otherwise
    try {
      const u = new URL(uri);
      if (u.protocol !== 'https:' && u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') {
        return error('invalid_redirect_uri', `Redirect URI must use https: ${uri}`, 400);
      }
    } catch {
      return error('invalid_redirect_uri', `Invalid URI: ${uri}`, 400);
    }
  }

  const grantTypes = Array.isArray(body.grant_types) ? body.grant_types as string[] : ['authorization_code'];
  const responseTypes = Array.isArray(body.response_types) ? body.response_types as string[] : ['code'];
  const tokenEndpointAuthMethod = typeof body.token_endpoint_auth_method === 'string'
    ? body.token_endpoint_auth_method
    : 'none';

  const clientId = crypto.randomUUID();
  const now = new Date();

  await db.insert(oauthClients).values({
    clientId,
    clientName,
    redirectUris: uris,
    grantTypes,
    responseTypes,
    tokenEndpointAuthMethod,
    createdAt: now,
  });

  const BASE = process.env.NEXTAUTH_URL ?? 'https://remnus.com';

  return Response.json(
    {
      client_id: clientId,
      client_name: clientName,
      redirect_uris: uris,
      grant_types: grantTypes,
      response_types: responseTypes,
      token_endpoint_auth_method: tokenEndpointAuthMethod,
      client_id_issued_at: Math.floor(now.getTime() / 1000),
      token_endpoint: `${BASE}/api/oauth/token`,
    },
    { status: 201, headers: { 'Access-Control-Allow-Origin': '*' } },
  );
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function error(code: string, description: string, status: number) {
  return Response.json({ error: code, error_description: description }, { status });
}
