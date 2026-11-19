"use client";

import type { AuditRequestValues } from '@/schemas/audit';
import { submitRequest } from '@/lib/api/submit';

export interface AuditSubmissionResult {
  ok: true;
  ref: string;
}

export async function submitAuditRequest(
  values: AuditRequestValues
): Promise<AuditSubmissionResult> {
  const id = await submitRequest('/api/audit-requests', values);
  return { ok: true, ref: id };
}
