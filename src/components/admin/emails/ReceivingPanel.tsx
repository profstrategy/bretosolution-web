'use client';

import { memo, useEffect } from 'react';
import { Inbox, Paperclip, RefreshCw } from 'lucide-react';
import { adminEmailsCopy } from '@/content/admin';
import { cn } from '@/lib/utils';
import {
  requestKeys,
  selectInboxIds,
  selectInboxItemById,
  selectInboxLoaded,
  selectInboxNextCursor,
  selectInboxNotice,
  selectRequest,
  useDomainActions,
  useDomainSelector,
} from '@/state';
import {
  EmptyState,
  InfoPanel,
  ListError,
  ListSkeleton,
  LoadMoreButton,
  RelativeTime,
  cardClass,
  parseAddress,
  smallButtonClass,
} from '@/components/admin/emails/listParts';

const copy = adminEmailsCopy;

/** One received message. Memoised and selecting by id. */
const InboxRow = memo(function InboxRow({ id, onOpen }: { id: string; onOpen: (id: string) => void }) {
  const item = useDomainSelector(selectInboxItemById(id));
  if (!item) return null;
  const sender = parseAddress(item.from);
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(id)}
        aria-haspopup="dialog"
        className="flex w-full cursor-pointer flex-col gap-1.5 px-4 py-4 text-left transition-colors hover:bg-[var(--btn2)] focus-visible:outline-[3px] focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--accent)] motion-reduce:transition-none sm:px-5"
      >
        <span className="flex w-full min-w-0 items-baseline gap-3">
          <span className="min-w-0 flex-1 truncate font-[family-name:var(--font-sans)] text-[15px] font-semibold text-[var(--ink)]">
            {sender.name || sender.email}
          </span>
          {item.attachmentCount > 0 ? (
            <span
              className="inline-flex shrink-0 items-center gap-1 font-[family-name:var(--font-mono)] text-[12px] text-[var(--muted)]"
              title={copy.attachmentsCount(item.attachmentCount)}
            >
              <Paperclip className="h-[14px] w-[14px]" aria-hidden="true" />
              <span aria-hidden="true">{item.attachmentCount}</span>
              <span className="sr-only">{copy.attachmentsCount(item.attachmentCount)}</span>
            </span>
          ) : null}
          <RelativeTime iso={item.createdAt} className="shrink-0 font-[family-name:var(--font-mono)] text-[12px] text-[var(--muted)]" />
        </span>
        <span className="w-full truncate font-[family-name:var(--font-sans)] text-[14px] text-[var(--muted)]">
          {item.subject || copy.noSubject}
        </span>
      </button>
    </li>
  );
});

export function ReceivingPanel({ inboxAddress, onOpen }: { inboxAddress: string; onOpen: (id: string) => void }) {
  const actions = useDomainActions();
  const ids = useDomainSelector(selectInboxIds);
  const loaded = useDomainSelector(selectInboxLoaded);
  const nextCursor = useDomainSelector(selectInboxNextCursor);
  const notice = useDomainSelector(selectInboxNotice);
  const list = useDomainSelector(selectRequest(requestKeys.inboxList));
  const more = useDomainSelector(selectRequest(requestKeys.inboxListMore));
  const refreshing = list.status === 'pending' && loaded;

  useEffect(() => {
    if (!loaded && list.status === 'idle') void actions.loadInbox();
  }, [actions, loaded, list.status]);

  let body;
  if (ids.length === 0 && (list.status === 'pending' || (!loaded && list.status === 'idle'))) {
    body = <ListSkeleton label={copy.loading.receiving} />;
  } else if (ids.length === 0 && list.status === 'error') {
    body = <ListError message={copy.listError.receiving} onRetry={() => void actions.loadInbox()} />;
  } else if (ids.length === 0 && notice === 'receiving-not-configured') {
    body = <InfoPanel heading={copy.receivingNotConfigured.heading} body={copy.receivingNotConfigured.body} />;
  } else if (ids.length === 0) {
    body = (
      <>
        <EmptyState icon={Inbox} heading={copy.empty.receiving.heading} body={copy.empty.receiving.body(inboxAddress)} />
        {/* A filtered page can be empty while older mail exists. */}
        {nextCursor ? <LoadMoreButton pending={more.status === 'pending'} onClick={() => void actions.loadMoreInbox()} /> : null}
      </>
    );
  } else {
    body = (
      <>
        <ul className={`${cardClass} divide-y divide-[var(--line)]`}>
          {ids.map((id) => (
            <InboxRow key={id} id={id} onOpen={onOpen} />
          ))}
        </ul>
        {more.status === 'error' ? (
          <ListError compact message={copy.listError.more} onRetry={() => void actions.loadMoreInbox()} />
        ) : nextCursor ? (
          <LoadMoreButton pending={more.status === 'pending'} onClick={() => void actions.loadMoreInbox()} />
        ) : null}
      </>
    );
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => void actions.loadInbox()}
          disabled={list.status === 'pending'}
          aria-busy={refreshing || undefined}
          className={smallButtonClass}
        >
          <RefreshCw className={cn('h-[16px] w-[16px]', refreshing && 'motion-safe:animate-spin')} aria-hidden="true" />
          {refreshing ? copy.refreshing : copy.refresh}
        </button>
      </div>
      {body}
    </div>
  );
}
