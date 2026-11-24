import { createElement } from 'react';
import { NextResponse } from 'next/server';
import {
  AuditConfirmation,
  defaultProps as auditConfirmationProps,
} from '@/emails/AuditConfirmation';
import {
  AuditRequestNotification,
  defaultProps as auditNotificationProps,
} from '@/emails/AuditRequestNotification';
import {
  QuoteConfirmation,
  defaultProps as quoteConfirmationProps,
} from '@/emails/QuoteConfirmation';
import {
  QuoteRequestNotification,
  defaultProps as quoteNotificationProps,
} from '@/emails/QuoteRequestNotification';
import { renderEmail } from '@/emails/render';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const templates = {
  'audit-notification': {
    createElement: () =>
      createElement(AuditRequestNotification, auditNotificationProps),
    includeUnsubscribeUrl: false,
  },
  'quote-notification': {
    createElement: () =>
      createElement(QuoteRequestNotification, quoteNotificationProps),
    includeUnsubscribeUrl: false,
  },
  'audit-confirmation': {
    createElement: () => createElement(AuditConfirmation, auditConfirmationProps),
    includeUnsubscribeUrl: true,
  },
  'quote-confirmation': {
    createElement: () => createElement(QuoteConfirmation, quoteConfirmationProps),
    includeUnsubscribeUrl: true,
  },
} as const;

function isTemplateName(
  value: string | null
): value is keyof typeof templates {
  return value !== null && Object.prototype.hasOwnProperty.call(templates, value);
}

export async function GET(request: Request): Promise<Response> {
  if (process.env.NODE_ENV !== 'development') {
    return new Response(null, { status: 404 });
  }

  const searchParams = new URL(request.url).searchParams;
  const templateName = searchParams.get('template');
  const format = searchParams.get('format');

  if (!isTemplateName(templateName) || (format !== 'html' && format !== 'text')) {
    return NextResponse.json(
      {
        error:
          'Use a supported template and format: audit-notification, quote-notification, audit-confirmation, quote-confirmation; html or text.',
      },
      { status: 400 },
    );
  }

  const template = templates[templateName];
  const { html, text } = await renderEmail(template.createElement(), {
    includeUnsubscribeUrl: template.includeUnsubscribeUrl,
  });
  const body = format === 'html' ? html : text;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type':
        format === 'html' ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
