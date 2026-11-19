"use client";

/**
 * MOCK IMPLEMENTATION — TO BE REPLACED BY A SERVER ROUTE
 * This client-side mock simulates an API call by waiting 700ms, storing
 * valid quote requests in localStorage under "bretosolution.quote-requests",
 * and returning a generated QT-XXXXXX reference code. A server route will
 * replace this file's implementation when migrating to Next.js.
 */

import type { QuoteRequestValues } from '@/schemas/quote';

const STORAGE_KEY = 'bretosolution.quote-requests';
const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export interface QuoteSubmissionResult {
  ok: true;
  ref: string;
}

export interface StoredQuoteRequest {
  ref: string;
  submittedAt: string;
  businessType: string;
  helpNeeded: string;
  mainChallenge: string;
  contactName: string;
  businessName: string;
  email: string;
  phoneOrWhatsapp: string;
  websiteOrInstagram: string;
  countryRegion: string;
}

function generateQuoteReference(): string {
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    const index = Math.floor(Math.random() * REF_ALPHABET.length);
    code += REF_ALPHABET[index];
  }
  return `QT-${code}`;
}

export async function submitQuoteRequest(
  values: QuoteRequestValues
): Promise<QuoteSubmissionResult> {
  await new Promise((resolve) => {
    setTimeout(resolve, 700);
  });

  const ref = generateQuoteReference();

  // Honeypot check: if company_site is filled, pretend success and store nothing
  if (values.company_site && values.company_site.trim().length > 0) {
    return { ok: true, ref };
  }

  try {
    const rawExisting = window.localStorage.getItem(STORAGE_KEY);
    const existing: StoredQuoteRequest[] = rawExisting
      ? (JSON.parse(rawExisting) as StoredQuoteRequest[])
      : [];

    const record: StoredQuoteRequest = {
      ref,
      submittedAt: new Date().toISOString(),
      businessType: values.businessType,
      helpNeeded: values.helpNeeded,
      mainChallenge: (values.mainChallenge ?? '').trim(),
      contactName: values.contactName.trim(),
      businessName: values.businessName.trim(),
      email: values.email.trim(),
      phoneOrWhatsapp: (values.phoneOrWhatsapp ?? '').trim(),
      websiteOrInstagram: (values.websiteOrInstagram ?? '').trim(),
      countryRegion: values.countryRegion,
    };

    const next = Array.isArray(existing) ? [...existing, record] : [record];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore localStorage access/quota errors in restricted environments
  }

  return { ok: true, ref };
}
