import 'server-only';
import type { z } from 'zod';
import { getAdminAuthEnv } from '@/lib/auth/env';
import { requireAdminApi, type AdminSession } from '@/lib/auth/requireAdmin';
import { getFieldErrors, readJsonBody } from '@/lib/server/http';

/** Admin JSON bodies may carry up to 50 KB of message HTML. */
export const ADMIN_JSON_MAX_BYTES = 128 * 1024;

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: NO_STORE });
}

export function badRequest(errors: Record<string, string>): Response {
  return json({ ok: false, message: 'Some details are missing or invalid.', errors }, 400);
}

export function notFound(message = 'Not found.'): Response {
  return json({ ok: false, message }, 404);
}

export function conflict(message: string): Response {
  return json({ ok: false, message }, 409);
}

/**
 * 500 with a generic message. Logs only a label, the error class and an
 * optional provider code: never request data, payloads or secrets.
 */
export function serverError(label: string, error: unknown, code?: string | number | null): Response {
  // Prisma error codes ("P1001", "P2024"…) are safe to log and say what failed.
  const prismaCode = error instanceof Error ? Reflect.get(error, 'code') : undefined;
  const safeCode = code ?? (typeof prismaCode === 'string' && /^P\d{4}$/.test(prismaCode) ? prismaCode : '');
  console.error(
    `[admin-api] ${label} failed.`,
    error instanceof Error ? error.name : typeof error,
    safeCode
  );
  return json({ ok: false, message: 'Something went wrong. Please try again.' }, 500);
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return origin === new URL(getAdminAuthEnv().nextAuthUrl).origin;
  } catch {
    return false;
  }
}

/**
 * Every admin route calls this first. Returns the admin session, or a
 * Response to return as-is: 401 when not signed in as admin, and 403 for
 * mutations whose Origin header is not this site.
 */
export async function guardAdmin(
  request: Request,
  { mutation }: { mutation: boolean }
): Promise<AdminSession | Response> {
  const auth = await requireAdminApi();
  if (auth instanceof Response) return auth;
  if (mutation && !isSameOrigin(request)) {
    return json({ ok: false, message: 'Request origin not allowed.' }, 403);
  }
  return auth;
}

/** Reads and validates a JSON body; 400 with field errors when invalid. */
export async function readValidatedJson<S extends z.ZodType>(
  request: Request,
  schema: S
): Promise<{ ok: true; data: z.infer<S> } | { ok: false; response: Response }> {
  const body = await readJsonBody(request, ADMIN_JSON_MAX_BYTES);
  if (!body.ok) return body;
  const parsed = schema.safeParse(body.value);
  if (!parsed.success) return { ok: false, response: badRequest(getFieldErrors(parsed.error)) };
  return { ok: true, data: parsed.data };
}

/** Validates a route parameter; null when invalid. */
export function validId(value: string, pattern: RegExp): string | null {
  return pattern.test(value) ? value : null;
}
