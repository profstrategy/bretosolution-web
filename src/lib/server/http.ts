import type { ZodError } from 'zod';
import { HONEYPOT_FIELD } from '@/schemas/honeypot';

const MAX_JSON_BODY_BYTES = 20 * 1024;

export type JsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; response: Response };

export function jsonResponse(
  body: unknown,
  status = 200,
  headers?: HeadersInit
): Response {
  return Response.json(body, { status, headers });
}

export function jsonError(
  message: string,
  status: number,
  headers?: HeadersInit
): Response {
  return jsonResponse({ ok: false, message }, status, headers);
}

export function getFieldErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path.length > 0 ? issue.path.join('.') : '_form';
    if (!errors[field]) errors[field] = issue.message;
  }

  return errors;
}

export function hasFilledHoneypot(value: unknown): boolean {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value) ||
    !(HONEYPOT_FIELD in value)
  ) {
    return false;
  }

  const honeypot = value[HONEYPOT_FIELD];
  return typeof honeypot === 'string' && honeypot.trim().length > 0;
}

export async function readJsonBody(request: Request): Promise<JsonBodyResult> {
  const contentType = request.headers
    .get('content-type')
    ?.split(';', 1)[0]
    .trim()
    .toLowerCase();

  if (
    !contentType ||
    (contentType !== 'application/json' &&
      !/^application\/[a-z0-9!#$&^_.+-]+\+json$/.test(contentType))
  ) {
    return {
      ok: false,
      response: jsonError('Content-Type must be JSON.', 415),
    };
  }

  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_JSON_BODY_BYTES) {
    return {
      ok: false,
      response: jsonError('Request body is too large.', 413),
    };
  }

  const reader = request.body?.getReader();
  if (!reader) {
    return {
      ok: false,
      response: jsonError('Request body must contain valid JSON.', 400),
    };
  }

  const chunks: Uint8Array[] = [];
  let size = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      size += value.byteLength;
      if (size > MAX_JSON_BODY_BYTES) {
        await reader.cancel();
        return {
          ok: false,
          response: jsonError('Request body is too large.', 413),
        };
      }

      chunks.push(value);
    }
  } catch {
    return {
      ok: false,
      response: jsonError('Request body could not be read.', 400),
    };
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return {
      ok: false,
      response: jsonError('Request body must contain valid JSON.', 400),
    };
  }
}
