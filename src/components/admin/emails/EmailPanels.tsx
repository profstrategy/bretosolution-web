'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox, Pencil, Send } from 'lucide-react';
import { adminEmailsCopy } from '@/content/admin';
import {
  type AdminEmailDTO,
  requestKeys,
  selectEmailById,
  selectEmailIds,
  selectInboxIds,
  selectInboxItemById,
  selectRequest,
  useDomainSelector,
} from '@/state';
import { SendMailButton } from '@/components/admin/emails/SendMailButton';
import { resolveSubject } from '@/lib/admin/emailFormat';

const cardClass = 'rounded-[16px] border border-[var(--line)] bg-[var(--panel)]';

function EmptyState({
  icon: Icon,
  heading,
  body,
  action,
}: {
  icon: LucideIcon;
  heading: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className={`${cardClass} flex flex-col items-center px-6 py-12 text-center sm:py-16`}>
      <span className="inline-flex h-[56px] w-[56px] items-center justify-center rounded-full border border-[var(--line)] bg-[var(--bg)] text-[var(--accent)]">
        <Icon className="h-[24px] w-[24px]" aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-[family-name:var(--font-display)] text-[22px] font-semibold text-[var(--ink)]">
        {heading}
      </h2>
      <p className="mt-2 max-w-[44ch] font-[family-name:var(--font-sans)] text-[15px] leading-relaxed text-[var(--muted)] [overflow-wrap:anywhere]">
        {body}
      </p>
      {action ? <div className="mt-6 w-full sm:w-auto">{action}</div> : null}
    </div>
  );
}

function ListSkeleton({ label }: { label: string }) {
  return (
    <div className={cardClass} role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <ul aria-hidden="true" className="divide-y divide-[var(--line)]">
        {[0, 1, 2].map((row) => (
          <li key={row} className="flex items-center gap-4 px-5 py-4">
            <span className="h-[36px] w-[36px] shrink-0 rounded-full bg-[var(--btn2)] motion-safe:animate-pulse" />
            <span className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="h-[12px] w-2/3 max-w-[320px] rounded-full bg-[var(--btn2)] motion-safe:animate-pulse" />
              <span className="h-[10px] w-1/3 max-w-[180px] rounded-full bg-[var(--btn2)] motion-safe:animate-pulse" />
            </span>
            <span className="hidden h-[10px] w-[72px] shrink-0 rounded-full bg-[var(--btn2)] motion-safe:animate-pulse sm:block" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

function RowContent({ title, meta, date }: { title: string; meta: string; date: string }) {
  return (
    <>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-[family-name:var(--font-sans)] text-[15px] font-semibold text-[var(--ink)]">
          {title}
        </span>
        <span className="truncate font-[family-name:var(--font-sans)] text-[13px] text-[var(--muted)]">
          {meta}
        </span>
      </span>
      <span className="shrink-0 font-[family-name:var(--font-mono)] text-[12px] text-[var(--muted)]">
        {date}
      </span>
    </>
  );
}

function Row(props: { title: string; meta: string; date: string }) {
  return (
    <li className="flex items-center gap-4 px-5 py-4">
      <RowContent {...props} />
    </li>
  );
}

/** A row that opens the composer (drafts and failed sends can be edited). */
function EditableRow({
  title,
  meta,
  date,
  label,
  onClick,
}: {
  title: string;
  meta: string;
  date: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-haspopup="dialog"
        className="flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--btn2)] focus-visible:outline-[3px] focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--accent)] motion-reduce:transition-none"
      >
        <RowContent title={title} meta={meta} date={date} />
        <Pencil className="h-[16px] w-[16px] shrink-0 text-[var(--muted)]" aria-hidden="true" />
      </button>
    </li>
  );
}

function SentEmailRow({ id, onEdit }: { id: string; onEdit: (email: AdminEmailDTO) => void }) {
  const email = useDomainSelector(selectEmailById(id));
  if (!email) return null;
  // Show the subject as the recipient sees it ({name}/{business} filled in).
  const title = resolveSubject(email) || adminEmailsCopy.noSubject;
  const meta = `${email.status} · ${email.toEmail}`;
  const date = formatDate(email.sentAt ?? email.updatedAt);
  if (email.status === 'DRAFT' || email.status === 'FAILED') {
    return (
      <EditableRow
        title={title}
        meta={meta}
        date={date}
        label={adminEmailsCopy.editEmailLabel(title, email.toEmail)}
        onClick={() => onEdit(email)}
      />
    );
  }
  return <Row title={title} meta={meta} date={date} />;
}

function InboxRow({ id }: { id: string }) {
  const item = useDomainSelector(selectInboxItemById(id));
  if (!item) return null;
  return (
    <Row
      title={item.subject || adminEmailsCopy.noSubject}
      meta={item.from}
      date={formatDate(item.createdAt)}
    />
  );
}

/** Data loading is wired in Stage 6; until then the store is empty. */
export function SendingPanel({
  onSendMail,
  onEditEmail,
}: {
  onSendMail: () => void;
  onEditEmail: (email: AdminEmailDTO) => void;
}) {
  const request = useDomainSelector(selectRequest(requestKeys.emailsList));
  const ids = useDomainSelector(selectEmailIds);
  const copy = adminEmailsCopy.empty.sending;

  if (request.status === 'pending' && ids.length === 0) {
    return <ListSkeleton label={adminEmailsCopy.loading.sending} />;
  }
  if (ids.length === 0) {
    return (
      <EmptyState
        icon={Send}
        heading={copy.heading}
        body={copy.body}
        action={<SendMailButton onClick={onSendMail} className="w-full sm:w-auto" />}
      />
    );
  }
  return (
    <ul className={`${cardClass} divide-y divide-[var(--line)]`}>
      {ids.map((id) => (
        <SentEmailRow key={id} id={id} onEdit={onEditEmail} />
      ))}
    </ul>
  );
}

export function ReceivingPanel({ inboxAddress }: { inboxAddress: string }) {
  const request = useDomainSelector(selectRequest(requestKeys.inboxList));
  const ids = useDomainSelector(selectInboxIds);
  const copy = adminEmailsCopy.empty.receiving;

  if (request.status === 'pending' && ids.length === 0) {
    return <ListSkeleton label={adminEmailsCopy.loading.receiving} />;
  }
  if (ids.length === 0) {
    return <EmptyState icon={Inbox} heading={copy.heading} body={copy.body(inboxAddress)} />;
  }
  return (
    <ul className={`${cardClass} divide-y divide-[var(--line)]`}>
      {ids.map((id) => (
        <InboxRow key={id} id={id} />
      ))}
    </ul>
  );
}
