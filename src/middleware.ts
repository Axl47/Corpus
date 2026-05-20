import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);
const { auth: authMiddleware } = NextAuth(authConfig);

// Auth.js middleware wraps the intl middleware:
// 1. Auth checks run on the original (un-rewritten) request path
// 2. If authorized, intl middleware handles locale detection and internal rewrite
export default authMiddleware(function middleware(req: NextRequest) {
  return intlMiddleware(req);
}) as (req: NextRequest) => Response | Promise<Response>;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.*|.*\\.(?:png|ico|svg|jpg|jpeg|webp|woff2?)).*)',
  ],
};
