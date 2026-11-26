'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { adminEmailsCopy } from '@/content/admin';
import { formatFileSize } from '@/lib/admin/emailFormat';
import {
  requestKeys,
  selectEmailById,
  selectEmailsLoaded,
  selectRequest,
  useDomainActions,
  useDomainSelector,
} from '@/state';
import { DetailDrawer } from '@/components/admin/DetailDrawer';
import { EmailActions, EmailBadges, emailTitle, type EmailRowHandlers } from '@/components/admin/emails/SendingPanel';
import { formatExact } from '@/components/admin/emails/listParts';

const copy = adminEmailsCopy.detail;

export function MetaList({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-[var(--line)] rounded-[12px] border border-[var(--line)]">
      {items.map(([term, detail]) => (
        <div key={term} className="grid grid-cols-1 gap-1 px-4 py-2.5 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-4">
          <dt className="font-[family-name:var(--font-sans)] text-[12px] font-semibold uppercase tracking-[0.04em] text-[var(--muted)]">
            {term}
          </dt>
          <dd className="font-[family-name:var(--font-sans)] text-[14px] text-[var(--ink)] [overflow-wrap:anywhere]">{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Short, stable hash of the document (FNV-1a), used as the iframe key. */
function documentKey(html: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < html.length; index += 1) {
    hash ^= html.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `${html.length}-${(hash >>> 0).toString(36)}`;
}

export function EmailFrame({ title, html, status }: { title: string; html: string | null; status: string | null }) {
  return (
    <div className="flex min-h-[420px] flex-1 flex-col">
      {html !== null ? (
        <iframe
          // A new iframe per document: changing srcdoc on a live iframe is a
          // navigation that adds a browser history entry, which would make
          // "Back" (and closing the panel) step the iframe instead of the page.
          key={documentKey(html)}
          title={title}
          sandbox=""
          srcDoc={html}
          className="min-h-[420px] w-full flex-1 rounded-[12px] border border-[var(--line)] bg-white"
        />
      ) : (
        <p role="status" className="flex min-h-[200px] flex-1 items-center justify-center rounded-[12px] border border-dashed border-[var(--line)] px-4 text-center font-[family-name:var(--font-sans)] text-[14px] text-[var(--muted)]">
          {status}
        </p>
      )}
    </div>
  );
}

/** Detail panel for an email in the Sending list. */
export function EmailDetail({
  id,
  handlers,
  onClose,
  fallbackFocus,
}: {
  id: string;
  handlers: EmailRowHandlers;
  onClose: () => void;
  fallbackFocus?: () => HTMLElement | null;
}) {
  const actions = useDomainActions();
  const email = useDomainSelector(selectEmailById(id));
  const listLoaded = useDomainSelector(selectEmailsLoaded);
  const render = useDomainSelector(selectRequest(requestKeys.emailRender(id)));
  const [rendered, setRendered] = useState<{ key: string; html: string } | null>(null);
  const key = email ? `${email.id}:${email.updatedAt}` : null;

  // Render again whenever the stored email changes (edit, send, refresh).
  // Results are matched by key, so a stale or duplicate response is ignored.
  useEffect(() => {
    if (!email) return;
    const requestKey = `${email.id}:${email.updatedAt}`;
    void actions.renderEmail(email).then((html) => {
      if (html !== null) setRendered({ key: requestKey, html });
    });
  }, [actions, email]);

  const html = rendered && rendered.key === key ? rendered.html : null;
  const title = email ? emailTitle(email) : adminEmailsCopy.noSubject;

  let content: ReactNode;
  if (!email) {
    content = (
      <p role="status" className="px-5 py-6 font-[family-name:var(--font-sans)] text-[15px] text-[var(--muted)]">
        {listLoaded ? copy.notFound : adminEmailsCopy.loading.sending}
      </p>
    );
  } else {
    content = (
      <div className="flex flex-1 flex-col gap-4 px-5 py-5">
        <div className="flex flex-wrap gap-1.5">
          <EmailBadges email={email} />
        </div>
        <MetaList
          items={[
            [copy.to, email.toEmail],
            ...(email.recipientName ? [[copy.name, email.recipientName] as [string, ReactNode]] : []),
            ...(email.businessName ? [[copy.business, email.businessName] as [string, ReactNode]] : []),
            [copy.subject, title],
            [copy.created, formatExact(email.createdAt)],
            ...(email.sentAt ? [[copy.sent, formatExact(email.sentAt)] as [string, ReactNode]] : []),
            [
              copy.attachment,
              email.attachment ? `${email.attachment.name} (${formatFileSize(email.attachment.size)})` : copy.none,
            ],
            ...(email.status === 'FAILED' && email.error ? [[copy.error, email.error] as [string, ReactNode]] : []),
          ]}
        />
        <div className="flex flex-1 flex-col gap-2">
          <h3 className="font-[family-name:var(--font-sans)] text-[15px] font-semibold">{copy.renderTitle}</h3>
          <p className="font-[family-name:var(--font-sans)] text-[12px] text-[var(--muted)]">{copy.renderedNote}</p>
          <EmailFrame
            title={`${copy.renderTitle}: ${title}`}
            html={html}
            status={render.status === 'error' ? copy.renderFailed : copy.rendering}
          />
        </div>
      </div>
    );
  }

  return (
    <DetailDrawer
      title={title}
      closeLabel={copy.close}
      onClose={onClose}
      fallbackFocus={fallbackFocus}
      footer={email ? <EmailActions email={email} handlers={handlers} includeView={false} /> : undefined}
    >
      {content}
    </DetailDrawer>
  );
}
