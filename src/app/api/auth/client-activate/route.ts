import { signIn } from '@/auth';
import { NextRequest } from 'next/server';

// Tauri WebView navigates here after receiving the deep-link callback.
// Signs in using the short-lived client-token and redirects to the app.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    console.log('[client-activate] no token in query');
    return Response.redirect(new URL('/login', request.url), 302);
  }

  console.log('[client-activate] start', {
    hasToken: !!token,
    tokenLen: token.length,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    secretLen: process.env.AUTH_SECRET?.length ?? 0,
  });

  try {
    await signIn('client-token', { token, redirect: false });
    console.log('[client-activate] signIn ok');
  } catch (err) {
    // Log the underlying reason so we can tell *why* the credentials provider
    // rejected the token (JWT verify? user lookup? secret mismatch?).
    console.log('[client-activate] signIn FAILED', {
      name: (err as Error)?.name,
      message: (err as Error)?.message,
      cause: (err as { cause?: unknown })?.cause,
    });
    return Response.redirect(new URL('/login?error=token', request.url), 302);
  }

  return Response.redirect(new URL('/app', request.url), 302);
}
