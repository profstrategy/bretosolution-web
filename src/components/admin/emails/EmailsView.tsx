'use client';

import { useCallback, useRef, useState, type KeyboardEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { adminEmailsCopy } from '@/content/admin';
import { cn } from '@/lib/utils';
import { SendMailButton } from '@/components/admin/emails/SendMailButton';
import { ReceivingPanel, SendingPanel } from '@/components/admin/emails/EmailPanels';
import { ComposeEmailModal, type ComposeMode } from '@/components/admin/ComposeEmailModal';
import type { AdminEmailDTO } from '@/state';

export type EmailsTab = 'sending' | 'receiving';
const TABS: readonly EmailsTab[] = ['sending', 'receiving'];

export function parseEmailsTab(value: string | null): EmailsTab {
  return value === 'receiving' ? 'receiving' : 'sending';
}

/** The header button; focus returns here if the opener is gone (empty state). */
const SEND_MAIL_BUTTON_ID = 'admin-send-mail';

const tabId = (tab: EmailsTab) => `emails-tab-${tab}`;
const panelId = (tab: EmailsTab) => `emails-panel-${tab}`;

export function EmailsView({ inboxAddress }: { inboxAddress: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = parseEmailsTab(searchParams.get('tab'));
  const tabRefs = useRef<Record<EmailsTab, HTMLButtonElement | null>>({
    sending: null,
    receiving: null,
  });

  const selectTab = useCallback(
    (tab: EmailsTab) => {
      if (tab === activeTab) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tab);
      // push (not replace) so back/forward moves between tabs.
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [activeTab, pathname, router, searchParams]
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

  // Which composer is open (UI state, not domain state). Changing it is the
  // only thing that re-renders this view; typing stays inside the modal.
  const [composer, setComposer] = useState<ComposeMode | null>(null);
  const handleSendMail = useCallback(() => setComposer({ type: 'new' }), []);
  const handleEditEmail = useCallback(
    (email: AdminEmailDTO) => setComposer({ type: 'edit', email }),
    []
  );
  const closeComposer = useCallback(() => setComposer(null), []);
  const fallbackFocus = useCallback(() => document.getElementById(SEND_MAIL_BUTTON_ID), []);

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
        <SendMailButton
          id={SEND_MAIL_BUTTON_ID}
          onClick={handleSendMail}
          className="w-full shrink-0 sm:w-auto"
        />
      </div>

      <div
        role="tablist"
        aria-label={adminEmailsCopy.tabsLabel}
        className="mt-8 flex gap-1 border-b border-[var(--line)]"
      >
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
                selected
                  ? 'border-[var(--accent)] text-[var(--ink)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
              )}
            >
              {adminEmailsCopy.tabs[tab]}
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
        {activeTab === 'sending' ? (
          <SendingPanel onSendMail={handleSendMail} onEditEmail={handleEditEmail} />
        ) : null}
      </div>
      <div
        role="tabpanel"
        id={panelId('receiving')}
        aria-labelledby={tabId('receiving')}
        hidden={activeTab !== 'receiving'}
        tabIndex={0}
        className="mt-6 rounded-[16px] outline-none focus-visible:outline-[3px] focus-visible:outline-[var(--accent)]"
      >
        {activeTab === 'receiving' ? <ReceivingPanel inboxAddress={inboxAddress} /> : null}
      </div>

      {composer ? (
        <ComposeEmailModal
          key={composer.type === 'edit' ? `edit-${composer.email.id}` : composer.type}
          mode={composer}
          onClose={closeComposer}
          fallbackFocus={fallbackFocus}
        />
      ) : null}
    </div>
  );
}
