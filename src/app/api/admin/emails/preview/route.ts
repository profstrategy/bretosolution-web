import {
  badRequest,
  guardAdmin,
  json,
  readValidatedJson,
  serverError,
} from '@/lib/server/adminApi';
import { renderAdminEmail } from '@/lib/server/adminEmailRender';
import {
  draftRuleErrors,
  previewDraftSchema,
  type NormalisedDraft,
} from '@/schemas/adminEmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/emails/preview  Renders draft fields to { html } for an
 * iframe preview. Nothing is stored or sent.
 */
export async function POST(request: Request): Promise<Response> {
  const auth = await guardAdmin(request, { mutation: true });
  if (auth instanceof Response) return auth;

  const body = await readValidatedJson(request, previewDraftSchema);
  if (!body.ok) return body.response;
  const input = body.data;

  const draft: NormalisedDraft = {
    kind: input.kind,
    toEmail: input.toEmail ?? '',
    recipientName: input.recipientName ?? '',
    businessName: input.businessName ?? '',
    subject: input.subject ?? '',
    bodyHtml: input.bodyHtml ?? '',
    calendlyUrl: input.calendlyUrl ?? null,
    rows: input.rows ?? [],
    attachment: input.attachment ?? null,
    inReplyToMessageId: input.inReplyToMessageId ?? null,
    source: input.source ?? null,
  };
  const ruleErrors = draftRuleErrors(draft);
  delete ruleErrors.subject; // A preview may be rendered before the subject is written.
  if (Object.keys(ruleErrors).length > 0) return badRequest(ruleErrors);

  try {
    const rendered = await renderAdminEmail(draft, { preview: true });
    return json({ html: rendered.html });
  } catch (error) {
    return serverError('emails/preview', error);
  }
}
