import { getPrismaClient } from '@/lib/db';
import {
  badRequest,
  guardAdmin,
  json,
  readValidatedJson,
  serverError,
} from '@/lib/server/adminApi';
import { draftToColumns, toAdminEmailDTO } from '@/lib/server/adminEmailDto';
import { sanitizeComposerHtml } from '@/lib/server/emailHtml';
import { getFieldErrors } from '@/lib/server/http';
import {
  createDraftSchema,
  draftRuleErrors,
  emailListQuerySchema,
  type NormalisedDraft,
} from '@/schemas/adminEmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

/** GET /api/admin/emails?cursor=  Newest first, 20 per page. */
export async function GET(request: Request): Promise<Response> {
  const auth = await guardAdmin(request, { mutation: false });
  if (auth instanceof Response) return auth;

  const query = emailListQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams)
  );
  if (!query.success) return badRequest(getFieldErrors(query.error));

  try {
    const records = await getPrismaClient().adminEmail.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: PAGE_SIZE + 1,
      ...(query.data.cursor ? { cursor: { id: query.data.cursor }, skip: 1 } : {}),
    });
    const page = records.slice(0, PAGE_SIZE);
    const nextCursor = records.length > PAGE_SIZE ? page[page.length - 1]?.id ?? null : null;
    return json({ items: page.map(toAdminEmailDTO), nextCursor });
  } catch (error) {
    return serverError('emails/list', error);
  }
}

/** POST /api/admin/emails  Creates a DRAFT. */
export async function POST(request: Request): Promise<Response> {
  const auth = await guardAdmin(request, { mutation: true });
  if (auth instanceof Response) return auth;

  const body = await readValidatedJson(request, createDraftSchema);
  if (!body.ok) return body.response;
  const input = body.data;

  const draft: NormalisedDraft = {
    kind: input.kind,
    toEmail: input.toEmail,
    recipientName: input.recipientName ?? '',
    businessName: input.businessName ?? '',
    subject: input.subject ?? '',
    bodyHtml: sanitizeComposerHtml(input.bodyHtml ?? ''),
    calendlyUrl: input.calendlyUrl ?? null,
    rows: input.rows ?? [],
    attachment: input.attachment ?? null,
    inReplyToMessageId: input.inReplyToMessageId ?? null,
    source: input.source ?? null,
  };
  const ruleErrors = draftRuleErrors(draft);
  if (Object.keys(ruleErrors).length > 0) return badRequest(ruleErrors);

  try {
    const record = await getPrismaClient().adminEmail.create({
      data: { ...draftToColumns(draft), status: 'DRAFT' },
    });
    return json({ email: toAdminEmailDTO(record) }, 201);
  } catch (error) {
    return serverError('emails/create', error);
  }
}
