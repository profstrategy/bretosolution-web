import NextAuth from 'next-auth';
import type { NextRequest } from 'next/server';
import { getAuthOptions } from '@/lib/auth/options';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface NextAuthRouteContext {
  params: Promise<{ nextauth: string[] }>;
}

/**
 * next-auth v4 App Router handler. The three-argument form
 * `NextAuth(req, context, options)` (node_modules/next-auth/next/index.d.ts)
 * lets the options be built per request, so the build reads no auth env.
 */
async function handler(request: NextRequest, context: NextAuthRouteContext): Promise<Response> {
  const response: Response = await NextAuth(request, context, getAuthOptions());
  return response;
}

export { handler as GET, handler as POST };
