'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { adminEmailsCopy } from '@/content/admin';
import { cn } from '@/lib/utils';
import {
  selectEmailById,
  selectEmailCountLabel,
  selectInboxCountLabel,
  useDomainActions,
  useDomainDispatch,
  useDomainSelector,
  type AdminEmailDTO,
  type DomainSelector,
  type InboxMessageDTO,
} from '@/state';
import { SendMailButton } from '@/components/admin/emails/SendMailButton';
import { SendingPanel, emailTitle, type EmailRowHandlers } from '@/components/admin/emails/SendingPanel';
import { ReceivingPanel } from '@/components/admin/emails/ReceivingPanel';
import { EmailDetail } from '@/components/admin/emails/EmailDetail';
import { InboxDetail } from '@/components/admin/emails/InboxDetail';
import { parseAddress } from '@/components/admin/emails/listParts';
import { ComposeEmailModal, type ComposeMode } from '@/components/admin/ComposeEmailModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

export type EmailsTab = 'sending' | 'receiving';
const TABS: readonly EmailsTab[] = ['sending', 'receiving'];

export function parseEmailsTab(value: string | null): EmailsTab {
  return value === 'receiving' ? 'receiving' : 'sending';
}

/** Query parameter holding the id shown in the detail panel. */
export const OPEN_PARAM = 'open';

/** The header button; focus returns here if the opener is gone (empty state). */
const SEND_MAIL_BUTTON_ID = 'admin-send-mail';

const tabId = (tab: EmailsTab) => `emails-tab-${tab}`;
const panelId = (tab: EmailsTab) => `emails-panel-${tab}`;

const COUNT_SELECTORS: Record<EmailsTab, DomainSelector<string | null>> = {
  sending: selectEmailCountLabel,
  receiving: selectInboxCountLabel,
};

/** Count next to a tab label; subscribes on its own so the view does not re-render. */
function TabCount({ tab }: { tab: EmailsTab }) {
  const label = useDomainSelector(COUNT_SELECTORS[tab]);
  if (label === null) return null;
  return (
    <span className="ml-2 inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[var(--btn2)] px-1.5 font-[family-name:var(--font-mono)] text-[12px] text-[var(--ink)]">
      {label}
    </span>
  );
}

type Confirm = { type: 'send' | 'delete'; id: string } | null;

export function EmailsView({ inboxAddress }: { inboxAddress: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const actions = useDomainActions();
  const dispatch = useDomainDispatch();
  const activeTab = parseEmailsTab(searchParams.get('tab'));
  const openId = searchParams.get(OPEN_PARAM);
  const tabRefs = useRef<Record<EmailsTab, HTMLButtonElement | null>>({ sending: null, receiving: null });

  const hrefWith = useCallback(
    (changes: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null) params.delete(key);
        else params.set(key, value);
      }
      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams]
  );

  const selectTab = useCallback(
    (tab: EmailsTab) => {
      if (tab === activeTab) return;
      // push (not replace) so back/forward moves between tabs.
      router.push(hrefWith({ tab, [OPEN_PARAM]: null }), { scroll: false });
    },
    [activeTab, hrefWith, router]
  );

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, current: EmailsTab) => {
    const index = TABS.indexOf(current);
    let next: EmailsTab | undefined;
    if (event.key === 'ArrowRight') next = TABS[(index + 1) % TABS.length];
    else if (event.key === 'ArrowLeft') next = TABS[(index - 1 + TABS.length) % TABS.length];
    else if (event.key === 'Home') next = TABS[0];
    else if (event.key === 'End') next = TABS[TABS.length - 1];
    if (!next) return;
    event.preventDefault();
    tabRefs.current[next]?.focus();
    selectTab(next);
  };

  // ---- UI state: composer, confirmation ----------------------------------------------
  const [composer, setComposer] = useState<ComposeMode | null>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const confirmEmail = useDomainSelector(selectEmailById(confirm?.id ?? ''));

  const handleSendMail = useCallback(() => setComposer({ type: 'new' }), []);
  const closeComposer = useCallback(() => setComposer(null), []);
  const fallbackFocus = useCallback(() => document.getElementById(SEND_MAIL_BUTTON_ID), []);

  // ---- detail panel (URL: ?tab=…&open=<id>) ---------------------------------------------
  /** true when this session pushed the history entry that opened the panel. */
  const pushedOpenRef = useRef(false);

  const openDetail = useCallback(
    (tab: EmailsTab, id: string) => {
      pushedOpenRef.current = true;
      router.push(hrefWith({ tab, [OPEN_PARAM]: id }), { scroll: false });
    },
    [hrefWith, router]
  );

  const closeDetail = useCallback(() => {
    if (pushedOpenRef.current) {
      pushedOpenRef.current = false;
      router.back();
    } else {
      router.replace(hrefWith({ [OPEN_PARAM]: null }), { scroll: false });
    }
  }, [hrefWith, router]);

  // Latest versions for the stable handler objects below.
  const latest = useRef({ openDetail, closeDetail, openId });
  useEffect(() => {
    latest.current = { openDetail, closeDetail, openId };
  }, [openDetail, closeDetail, openId]);

  /** Reads one email from the store without subscribing to it. */
  const readEmail = useCallback(
    (id: string): AdminEmailDTO | undefined => dispatch((_dispatch, getState) => getState().emails.byId[id]),
    [dispatch]
  );

  // Created once: memoised rows receive the same object on every render.
  const handlers = useMemo<EmailRowHandlers>(
    () => ({
      open: (id) => latest.current.openDetail('sending', id),
      edit: (id) => {
        const email = readEmail(id);
        if (email) setComposer({ type: 'edit', email });
      },
      send: (id) => setConfirm({ type: 'send', id }),
      remove: (id) => setConfirm({ type: 'delete', id }),
      refresh: (id) => void actions.refreshEmailStatus(id),
    }),
    // State setters are stable; listed for the React Compiler.
    [actions, readEmail, setComposer, setConfirm]
  );
  const openInbox = useCallback((id: string) => latest.current.openDetail('receiving', id), []);

  const reply = useCallback((message: InboxMessageDTO) => {
    const sender = parseAddress(message.from);
    setComposer({
      type: 'reply',
      toEmail: sender.email,
      recipientName: sender.name || undefined,
      subject: message.subject,
      inReplyToMessageId: message.messageId,
    });
  }, []);

  const runConfirm = async () => {
    if (!confirm) return;
    setConfirmBusy(true);
    if (confirm.type === 'send') {
      await actions.sendEmail(confirm.id);
    } else if (await actions.deleteDraft(confirm.id)) {
      if (latest.current.openId === confirm.id) latest.current.closeDetail();
    }
    setConfirmBusy(false);
    setConfirm(null);
  };

  const needsPdf = confirmEmail?.kind === 'AUDIT' && !confirmEmail.attachment;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(28px,3vw,38px)] font-semibold leading-[1.15] text-[var(--ink)] [text-wrap:balance]">
            {adminEmailsCopy.title}
          </h1>
          <p className="mt-2 max-w-[60ch] font-[family-name:var(--font-sans)] text-[15px] leading-relaxed text-[var(--muted)] [overflow-wrap:anywhere]">
            {adminEmailsCopy.subtitle(inboxAddress)}
          </p>
        </div>
        <SendMailButton id={SEND_MAIL_BUTTON_ID} onClick={handleSendMail} className="w-full shrink-0 sm:w-auto" />
      </div>

      <div role="tablist" aria-label={adminEmailsCopy.tabsLabel} className="mt-8 flex gap-1 border-b border-[var(--line)]">
        {TABS.map((tab) => {
          const selected = tab === activeTab;
          return (
            <button
              key={tab}
              ref={(node) => {
                tabRefs.current[tab] = node;
              }}
              type="button"
              role="tab"
              id={tabId(tab)}
              aria-selected={selected}
              aria-controls={panelId(tab)}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectTab(tab)}
              onKeyDown={(event) => handleTabKeyDown(event, tab)}
              className={cn(
                '-mb-px inline-flex min-h-[44px] cursor-pointer items-center rounded-t-[10px] border-b-2 px-4 font-[family-name:var(--font-sans)] text-[15px] font-semibold transition-colors',
                selected ? 'border-[var(--accent)] text-[var(--ink)]' : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
              )}
            >
              {adminEmailsCopy.tabs[tab]}
              <TabCount tab={tab} />
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={panelId('sending')}
        aria-labelledby={tabId('sending')}
        hidden={activeTab !== 'sending'}
        tabIndex={0}
        className="mt-6 rounded-[16px] outline-none focus-visible:outline-[3px] focus-visible:outline-[var(--accent)]"
      >
        {activeTab === 'sending' ? <SendingPanel handlers={handlers} onSendMail={handleSendMail} /> : null}
      </div>
      <div
        role="tabpanel"
        id={panelId('receiving')}
        aria-labelledby={tabId('receiving')}
        hidden={activeTab !== 'receiving'}
        tabIndex={0}
        className="mt-6 rounded-[16px] outline-none focus-visible:outline-[3px] focus-visible:outline-[var(--accent)]"
      >
        {activeTab === 'receiving' ? <ReceivingPanel inboxAddress={inboxAddress} onOpen={openInbox} /> : null}
      </div>

      {openId && activeTab === 'sending' ? (
        <EmailDetail key={openId} id={openId} handlers={handlers} onClose={closeDetail} fallbackFocus={fallbackFocus} />
      ) : null}
      {openId && activeTab === 'receiving' ? (
        <InboxDetail key={openId} id={openId} onClose={closeDetail} onReply={reply} fallbackFocus={fallbackFocus} />
      ) : null}

      {/* The composer and confirmations stack above an open detail panel. */}
      {composer ? (
        <ComposeEmailModal
          key={composer.type === 'edit' ? `edit-${composer.email.id}` : composer.type}
          mode={composer}
          onClose={closeComposer}
          fallbackFocus={fallbackFocus}
        />
      ) : null}

      {confirm && confirmEmail ? (
        confirm.type === 'delete' ? (
          <ConfirmDialog
            title={adminEmailsCopy.confirmDelete.title}
            confirmLabel={adminEmailsCopy.confirmDelete.confirm}
            busyLabel={adminEmailsCopy.confirmDelete.busy}
            cancelLabel={adminEmailsCopy.cancel}
            busy={confirmBusy}
            danger
            onConfirm={runConfirm}
            onCancel={() => setConfirm(null)}
          >
            {adminEmailsCopy.confirmDelete.body}
          </ConfirmDialog>
        ) : (
          <ConfirmDialog
            title={adminEmailsCopy.confirmSend.title}
            confirmLabel={adminEmailsCopy.confirmSend.confirm}
            busyLabel={adminEmailsCopy.confirmSend.busy}
            cancelLabel={adminEmailsCopy.cancel}
            busy={confirmBusy}
            confirmDisabled={needsPdf}
            onConfirm={runConfirm}
            onCancel={() => setConfirm(null)}
          >
            <p>{adminEmailsCopy.confirmSend.body(confirmEmail.toEmail, emailTitle(confirmEmail))}</p>
            {confirmEmail.attachment ? <p className="mt-1">{adminEmailsCopy.confirmSend.attachment(confirmEmail.attachment.name)}</p> : null}
            {needsPdf ? <p className="mt-2 font-semibold text-[var(--accent)]">{adminEmailsCopy.confirmSend.needsPdf}</p> : null}
          </ConfirmDialog>
        )
      ) : null}
    </div>
  );
}
