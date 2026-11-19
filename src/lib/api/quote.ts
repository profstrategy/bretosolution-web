"use client";

import type { QuoteRequestValues } from '@/schemas/quote';
import { submitRequest } from '@/lib/api/submit';

export interface QuoteSubmissionResult {
  ok: true;
  ref: string;
}

export async function submitQuoteRequest(
  values: QuoteRequestValues
): Promise<QuoteSubmissionResult> {
  const id = await submitRequest('/api/quote-requests', values);
  return { ok: true, ref: id };
}
