'use client';

import { useCallback, useRef, type KeyboardEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { adminEmailsCopy } from '@/content/admin';
import { cn } from '@/lib/utils';
import { SendMailButton } from '@/components/admin/emails/SendMailButton';
import { ReceivingPanel, SendingPanel } from '@/components/admin/emails/EmailPanels';

export type EmailsTab = 'sending' | 'receiving';
const TABS: readonly EmailsTab[] = ['sending', 'receiving'];

export function parseEmailsTab(value: string | null): EmailsTab {
  return value === 'receiving' ? 'receiving' : 'sending';
}

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

  const handleSendMail = () => {
    // Stage 5 opens the composer modal from here.
  };

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
        <SendMailButton onClick={handleSendMail} className="w-full shrink-0 sm:w-auto" />
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
        {activeTab === 'sending' ? <SendingPanel onSendMail={handleSendMail} /> : null}
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
    </div>
  );
}
