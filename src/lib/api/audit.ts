"use client";

/**
 * MOCK IMPLEMENTATION — TO BE REPLACED BY A SERVER ROUTE
 * This client-side mock simulates an API call by waiting 700ms, storing
 * valid audit requests in localStorage under "bretosolution.audit-requests",
 * and returning a generated reference code. Replace this with a server route
 * only when a backend is configured.
 */

import type { AuditRequestValues } from '@/schemas/audit';

const STORAGE_KEY = 'bretosolution.audit-requests';
const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export interface AuditSubmissionResult {
  ok: true;
  ref: string;
}

export interface StoredAuditRequest {
  ref: string;
  submittedAt: string;
  businessName: string;
  websiteOrInstagram: string;
  city: string;
  businessType: AuditRequestValues['businessType'];
  email: string;
}

function generateReference(): string {
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    const index = Math.floor(Math.random() * REF_ALPHABET.length);
    code += REF_ALPHABET[index];
  }
  return `BR-${code}`;
}

export async function submitAuditRequest(
  values: AuditRequestValues
): Promise<AuditSubmissionResult> {
  await new Promise((resolve) => {
    setTimeout(resolve, 700);
  });

  const ref = generateReference();

  // Honeypot check: if company_site is filled, pretend success and store nothing
  if (values.company_site && values.company_site.trim().length > 0) {
    return { ok: true, ref };
  }

  try {
    const rawExisting = window.localStorage.getItem(STORAGE_KEY);
    const existing: StoredAuditRequest[] = rawExisting
      ? (JSON.parse(rawExisting) as StoredAuditRequest[])
      : [];

    const record: StoredAuditRequest = {
      ref,
      submittedAt: new Date().toISOString(),
      businessName: values.businessName.trim(),
      websiteOrInstagram: values.websiteOrInstagram.trim(),
      city: values.city.trim(),
      businessType: values.businessType,
      email: values.email.trim(),
    };

    const next = Array.isArray(existing) ? [...existing, record] : [record];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore localStorage access/quota errors in restricted environments
  }

  return { ok: true, ref };
}
