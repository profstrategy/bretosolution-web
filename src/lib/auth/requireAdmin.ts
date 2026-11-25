import 'server-only';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { getAdminAuthEnv } from '@/lib/auth/env';
import { getAuthOptions } from '@/lib/auth/options';

export const ADMIN_LOGIN_PATH = '/admin/login';

export interface AdminSession {
  email: string;
  expires: string;
}

/**
 * Returns the admin session, or null when signed out, when the token is not
 * an admin token, or when the token's email no longer matches ADMIN_EMAIL.
 * If auth is not configured, this logs the fact (never values) and returns null.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  let adminEmail: string;
  try {
    adminEmail = getAdminAuthEnv().adminEmail;
  } catch (error) {
    console.error(
      'Admin authentication is not configured.',
      error instanceof Error ? error.message : 'UnknownError'
    );
    return null;
  }

  const session = await getServerSession(getAuthOptions());
  const user = session?.user;
  if (!session || !user || user.role !== 'admin') return null;
  if (typeof user.email !== 'string' || user.email.toLowerCase() !== adminEmail) {
    return null;
  }
  return { email: adminEmail, expires: session.expires };
}

/** For admin pages and layouts: redirects to the login page when not admin. */
export async function requireAdminPage(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect(ADMIN_LOGIN_PATH);
  return session;
}

/**
 * For /api/admin route handlers. Returns the session, or a 401 JSON Response
 * to return as-is:
 *
 *   const auth = await requireAdminApi();
 *   if (auth instanceof Response) return auth;
 */
export async function requireAdminApi(): Promise<AdminSession | Response> {
  const session = await getAdminSession();
  if (!session) {
    return Response.json(
      { ok: false, message: 'Authentication required.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  return session;
}
