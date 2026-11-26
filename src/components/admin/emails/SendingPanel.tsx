'use client';

import { memo, useEffect } from 'react';
import { Eye, Pencil, RefreshCw, Send, Trash2 } from 'lucide-react';
import { adminEmailsCopy } from '@/content/admin';
import { resolveSubject } from '@/lib/admin/emailFormat';
import { cn } from '@/lib/utils';
import {
  requestKeys,
  selectEmailById,
  selectEmailIds,
  selectEmailsLoaded,
  selectEmailsNextCursor,
  selectRequest,
  useDomainActions,
  useDomainSelector,
  type AdminEmailDTO,
} from '@/state';
import { SendMailButton } from '@/components/admin/emails/SendMailButton';
import {
  Badge,
  EmptyState,
  ListError,
  ListSkeleton,
  LoadMoreButton,
  RelativeTime,
  cardClass,
  smallButtonClass,
  type BadgeTone,
} from '@/components/admin/emails/listParts';

const copy = adminEmailsCopy;

/** Stable callbacks (created once in EmailsView), so memoised rows never re-render for them. */
export interface EmailRowHandlers {
  open: (id: string) => void;
  edit: (id: string) => void;
  send: (id: string) => void;
  remove: (id: string) => void;
  refresh: (id: string) => void;
}

const STATUS_TONE: Record<AdminEmailDTO['status'], BadgeTone> = {
  DRAFT: 'muted',
  SENDING: 'neutral',
  SENT: 'ink',
  FAILED: 'accent',
};

const BAD_EVENTS = new Set(['bounced', 'complained', 'failed', 'suppressed', 'delivery_delayed', 'canceled']);

export function emailTitle(email: AdminEmailDTO): string {
  return resolveSubject(email) || copy.noSubject;
}

export function EmailBadges({ email }: { email: AdminEmailDTO }) {
  const event = email.status === 'SENT' && email.lastEvent ? email.lastEvent : null;
  return (
    <>
      <Badge tone="neutral">{copy.kinds[email.kind]}</Badge>
      <Badge tone={STATUS_TONE[email.status]}>{copy.statuses[email.status]}</Badge>
      {event ? (
        <Badge tone={BAD_EVENTS.has(event) ? 'accent' : 'muted'}>{copy.events[event] ?? event}</Badge>
      ) : null}
    </>
  );
}

/** Row and detail-panel actions for one email. */
export function EmailActions({
  email,
  handlers,
  includeView,
  className,
}: {
  email: AdminEmailDTO;
  handlers: EmailRowHandlers;
  includeView: boolean;
  className?: string;
}) {
  const refreshing = useDomainSelector(selectRequest(requestKeys.emailRefresh(email.id))).status === 'pending';
  const what = emailTitle(email);
  const label = (action: string) => copy.actions.labelFor(action, what);

  if (email.status === 'DRAFT' || email.status === 'FAILED') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        <button type="button" className={smallButtonClass} aria-label={label(copy.actions.edit)} onClick={() => handlers.edit(email.id)}>
          <Pencil className="h-[16px] w-[16px]" aria-hidden="true" />
          {copy.actions.edit}
        </button>
        <button type="button" className={smallButtonClass} aria-label={label(copy.actions.send)} onClick={() => handlers.send(email.id)}>
          <Send className="h-[16px] w-[16px]" aria-hidden="true" />
          {copy.actions.send}
        </button>
        <button type="button" className={smallButtonClass} aria-label={label(copy.actions.delete)} onClick={() => handlers.remove(email.id)}>
          <Trash2 className="h-[16px] w-[16px]" aria-hidden="true" />
          {copy.actions.delete}
        </button>
      </div>
    );
  }
  if (email.status === 'SENT') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {includeView ? (
          <button type="button" className={smallButtonClass} aria-label={label(copy.actions.view)} onClick={() => handlers.open(email.id)}>
            <Eye className="h-[16px] w-[16px]" aria-hidden="true" />
            {copy.actions.view}
          </button>
        ) : null}
        <button
          type="button"
          className={smallButtonClass}
          aria-label={label(copy.actions.refreshStatus)}
          disabled={refreshing}
          aria-busy={refreshing || undefined}
          onClick={() => handlers.refresh(email.id)}
        >
          <RefreshCw className={cn('h-[16px] w-[16px]', refreshing && 'motion-safe:animate-spin')} aria-hidden="true" />
          {refreshing ? copy.actions.refreshingStatus : copy.actions.refreshStatus}
        </button>
      </div>
    );
  }
  return null;
}

/** One row. Memoised and selecting by id: a change to one email re-renders only its row. */
const EmailRow = memo(function EmailRow({ id, handlers }: { id: string; handlers: EmailRowHandlers }) {
  const email = useDomainSelector(selectEmailById(id));
  if (!email) return null;
  const recipient = email.recipientName || email.toEmail;
  const title = emailTitle(email);

  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
      <button
        type="button"
        onClick={() => handlers.open(id)}
        aria-haspopup="dialog"
        className="flex min-w-0 flex-1 cursor-pointer flex-col gap-1.5 rounded-[10px] text-left focus-visible:outline-[3px] focus-visible:outline-offset-[4px] focus-visible:outline-[var(--accent)]"
      >
        <span className="flex w-full min-w-0 items-baseline gap-3">
          <span className="min-w-0 flex-1 truncate font-[family-name:var(--font-sans)] text-[15px] font-semibold text-[var(--ink)]">
            {recipient}
          </span>
          <RelativeTime
            iso={email.sentAt ?? email.updatedAt}
            className="shrink-0 font-[family-name:var(--font-mono)] text-[12px] text-[var(--muted)]"
          />
        </span>
        <span className="w-full truncate font-[family-name:var(--font-sans)] text-[14px] text-[var(--muted)]">{title}</span>
        <span className="flex flex-wrap gap-1.5">
          <EmailBadges email={email} />
        </span>
        {email.status === 'FAILED' && email.error ? (
          <span className="font-[family-name:var(--font-sans)] text-[13px] text-[var(--accent)] [overflow-wrap:anywhere]">
            {copy.failedPrefix} {email.error}
          </span>
        ) : null}
      </button>
      <EmailActions email={email} handlers={handlers} includeView className="sm:shrink-0 sm:justify-end" />
    </li>
  );
});

export function SendingPanel({ handlers, onSendMail }: { handlers: EmailRowHandlers; onSendMail: () => void }) {
  const actions = useDomainActions();
  const ids = useDomainSelector(selectEmailIds);
  const loaded = useDomainSelector(selectEmailsLoaded);
  const nextCursor = useDomainSelector(selectEmailsNextCursor);
  const list = useDomainSelector(selectRequest(requestKeys.emailsList));
  const more = useDomainSelector(selectRequest(requestKeys.emailsListMore));

  // First open: load once (a duplicate dispatch while pending is ignored).
  useEffect(() => {
    if (!loaded && list.status === 'idle') void actions.loadEmails();
  }, [actions, loaded, list.status]);

  if (ids.length === 0) {
    if (list.status === 'pending' || (!loaded && list.status === 'idle')) {
      return <ListSkeleton label={copy.loading.sending} />;
    }
    if (list.status === 'error') {
      return <ListError message={copy.listError.sending} onRetry={() => void actions.loadEmails()} />;
    }
    return (
      <EmptyState
        icon={Send}
        heading={copy.empty.sending.heading}
        body={copy.empty.sending.body}
        action={<SendMailButton onClick={onSendMail} className="w-full sm:w-auto" />}
      />
    );
  }

  return (
    <div>
      <ul className={`${cardClass} divide-y divide-[var(--line)]`}>
        {ids.map((id) => (
          <EmailRow key={id} id={id} handlers={handlers} />
        ))}
      </ul>
      {more.status === 'error' ? (
        <ListError compact message={copy.listError.more} onRetry={() => void actions.loadMoreEmails()} />
      ) : nextCursor ? (
        <LoadMoreButton pending={more.status === 'pending'} onClick={() => void actions.loadMoreEmails()} />
      ) : null}
    </div>
  );
}
