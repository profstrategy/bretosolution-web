import 'server-only';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

/**
 * Private Supabase Storage access for admin email attachments (server only).
 * The service role key never leaves the server. Configuration is read lazily
 * so `next build` needs no env vars.
 *
 * Bucket setup (Supabase dashboard): bucket "admin-email-attachments",
 * Private, file size limit 15 MB, allowed MIME types "application/pdf".
 */
export const ATTACHMENT_BUCKET = 'admin-email-attachments';

export class StorageError extends Error {
  constructor(operation: string) {
    super(`Storage ${operation} failed.`);
    this.name = 'StorageError';
  }
}

const required = z.string().trim().min(1);

type StorageBucket = ReturnType<ReturnType<typeof createClient>['storage']['from']>;
let bucket: StorageBucket | null = null;

/**
 * Reads an env var at runtime. A variable key stops Next.js from inlining
 * `process.env.NEXT_PUBLIC_*` at build time (a build made without the value
 * would otherwise bake in an empty string).
 */
function runtimeEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function getBucket(): StorageBucket {
  if (bucket) return bucket;
  // SUPABASE_URL, falling back to the public NEXT_PUBLIC_SUPABASE_URL.
  const url = required.safeParse(runtimeEnv('SUPABASE_URL') ?? runtimeEnv('NEXT_PUBLIC_SUPABASE_URL'));
  const key = required.safeParse(runtimeEnv('SUPABASE_SERVICE_ROLE_KEY'));
  if (!url.success) throw new Error('Missing or invalid environment variable: SUPABASE_URL');
  if (!key.success) throw new Error('Missing or invalid environment variable: SUPABASE_SERVICE_ROLE_KEY');
  const client = createClient(url.data, key.data, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  bucket = client.storage.from(ATTACHMENT_BUCKET);
  return bucket;
}

/** "Q3 Audit (final).PDF" → "Q3-Audit-final" (extension added by the caller). */
export function sanitiseFileStem(filename: string): string {
  const stem = filename.replace(/\.pdf$/i, '');
  const ascii = stem.normalize('NFKD').replace(/[̀-ͯ]/g, '');
  const safe = ascii
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-._]+|[-._]+$/g, '')
    .slice(0, 80);
  return safe || 'attachment';
}

/** `admin-emails/<random 32-hex id>/<sanitised-name>.pdf` */
export function buildAttachmentPath(filename: string): string {
  return `admin-emails/${randomBytes(16).toString('hex')}/${sanitiseFileStem(filename)}.pdf`;
}

export interface SignedUpload {
  path: string;
  signedUrl: string;
  token: string;
}

/** Signed URL the browser uploads to directly (valid 2 hours per Supabase). */
export async function createSignedUploadUrl(path: string): Promise<SignedUpload> {
  const { data, error } = await getBucket().createSignedUploadUrl(path);
  if (error || !data) throw new StorageError('createSignedUploadUrl');
  return { path: data.path, signedUrl: data.signedUrl, token: data.token };
}

export async function downloadAttachment(path: string): Promise<Buffer> {
  const { data, error } = await getBucket().download(path);
  if (error || !data) throw new StorageError('download');
  return Buffer.from(await data.arrayBuffer());
}

export async function removeAttachment(path: string): Promise<void> {
  const { error } = await getBucket().remove([path]);
  if (error) throw new StorageError('remove');
}
