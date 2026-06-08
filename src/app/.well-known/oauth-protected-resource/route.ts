export const runtime = 'edge';

const BASE = process.env.NEXTAUTH_URL ?? 'https://remnus.com';

export function GET() {
  return Response.json(
    {
      resource: `${BASE}/api/mcp`,
      authorization_servers: [BASE],
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
}
