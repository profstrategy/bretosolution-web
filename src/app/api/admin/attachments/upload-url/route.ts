import { guardAdmin, json, readValidatedJson, serverError } from '@/lib/server/adminApi';
import { buildAttachmentPath, createSignedUploadUrl } from '@/lib/server/storage';
import { uploadUrlRequestSchema } from '@/schemas/adminEmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/attachments/upload-url  body { filename, size, contentType }.
 * Returns { path, signedUrl, token }. The browser uploads the PDF directly to
 * Supabase Storage, so the file never passes through this API (hosting body
 * limits are small). The bucket enforces the 15 MB limit and PDF MIME type,
 * and the send route re-checks the bytes.
 */
export async function POST(request: Request): Promise<Response> {
  const auth = await guardAdmin(request, { mutation: true });
  if (auth instanceof Response) return auth;

  const body = await readValidatedJson(request, uploadUrlRequestSchema);
  if (!body.ok) return body.response;

  try {
    const upload = await createSignedUploadUrl(buildAttachmentPath(body.data.filename));
    return json(upload);
  } catch (error) {
    return serverError('attachments/upload-url', error);
  }
}
