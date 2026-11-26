'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Download, ImageIcon, Reply } from 'lucide-react';
import { adminEmailsCopy } from '@/content/admin';
import { inboxAttachmentUrl } from '@/lib/admin/apiClient';
import { formatFileSize } from '@/lib/admin/emailFormat';
import {
  requestKeys,
  selectInboxItemById,
  selectInboxMessage,
  selectRequest,
  useDomainActions,
  useDomainSelector,
  type InboxMessageDTO,
} from '@/state';
import { DetailDrawer } from '@/components/admin/DetailDrawer';
import { EmailFrame, MetaList } from '@/components/admin/emails/EmailDetail';
import { formatExact, smallButtonClass } from '@/components/admin/emails/listParts';
import { cn } from '@/lib/utils';

const copy = adminEmailsCopy.detail;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Wraps the (already server-sanitised) message in a document for the
 * sandboxed iframe. The CSP is a second guard: no scripts, no network except
 * images, and remote images only after "Show images".
 */
function messageDocument(message: InboxMessageDTO, allowRemoteImages: boolean): string {
  const imgSrc = allowRemoteImages ? 'data: https:' : 'data:';
  const body =
    message.html ??
    (message.text
      ? `<pre style="white-space:pre-wrap;font:14px/1.6 Arial,Helvetica,sans-serif;margin:0">${escapeHtml(message.text)}</pre>`
      : `<p style="color:#5c564d">${escapeHtml(copy.noBody)}</p>`);
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${imgSrc}; style-src 'unsafe-inline'"><style>body{margin:16px;font:14px/1.6 Arial,Helvetica,sans-serif;color:#1a1714;background:#fff;overflow-wrap:anywhere}img{max-width:100%;height:auto}</style></head><body>${body}</body></html>`;
}

/** Detail panel for a received message. */
export function InboxDetail({
  id,
  onClose,
  onReply,
  fallbackFocus,
}: {
  id: string;
  onClose: () => void;
  onReply: (message: InboxMessageDTO) => void;
  fallbackFocus?: () => HTMLElement | null;
}) {
  const actions = useDomainActions();
  const item = useDomainSelector(selectInboxItemById(id));
  const message = useDomainSelector(selectInboxMessage(id));
  const request = useDomainSelector(selectRequest(requestKeys.inboxMessage(id)));
  const [imagesShown, setImagesShown] = useState(false);
  const messageHeadingRef = useRef<HTMLHeadingElement>(null);

  // Always fetch on open (remote images off); the store keeps the result.
  useEffect(() => {
    void actions.loadInboxMessage(id);
  }, [actions, id]);

  const showImages = () => {
    setImagesShown(true);
    // The button is removed once used; keep focus inside the panel.
    messageHeadingRef.current?.focus();
    void actions.loadInboxMessage(id, { images: true });
  };

  const title = message?.subject || item?.subject || adminEmailsCopy.noSubject;
  const loadingImages = imagesShown && request.status === 'pending';

  let content: ReactNode;
  if (!message) {
    content = (
      <p role="status" className="px-5 py-6 font-[family-name:var(--font-sans)] text-[15px] text-[var(--muted)]">
        {request.status === 'error' ? copy.messageFailed : copy.loadingMessage}
      </p>
    );
  } else {
    content = (
      <div className="flex flex-1 flex-col gap-4 px-5 py-5">
        <MetaList
          items={[
            [copy.from, message.from],
            [copy.to, message.to.join(', ')],
            [copy.received, formatExact(message.createdAt)],
            [copy.subject, message.subject || adminEmailsCopy.noSubject],
          ]}
        />

        {message.attachments.length > 0 ? (
          <section aria-labelledby={`${id}-attachments`}>
            <h3 id={`${id}-attachments`} className="font-[family-name:var(--font-sans)] text-[15px] font-semibold">
              {copy.attachments}
            </h3>
            <ul className="mt-2 flex flex-col gap-2">
              {message.attachments.map((attachment) => (
                <li key={attachment.id}>
                  <a
                    href={inboxAttachmentUrl(message.id, attachment.id)}
                    download={attachment.filename}
                    aria-label={copy.download(attachment.filename)}
                    className="flex min-h-[44px] items-center gap-3 rounded-[10px] border border-[var(--line)] px-3 py-2 font-[family-name:var(--font-sans)] text-[14px] text-[var(--ink)] hover:bg-[var(--btn2)] focus-visible:outline-[3px] focus-visible:outline-offset-[2px] focus-visible:outline-[var(--accent)]"
                  >
                    <Download className="h-[16px] w-[16px] shrink-0 text-[var(--muted)]" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate font-semibold">{attachment.filename}</span>
                    <span className="shrink-0 font-[family-name:var(--font-mono)] text-[12px] text-[var(--muted)]">
                      {formatFileSize(attachment.size)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h3
              ref={messageHeadingRef}
              tabIndex={-1}
              className="flex-1 font-[family-name:var(--font-sans)] text-[15px] font-semibold outline-none focus-visible:outline-none"
            >
              {copy.messageTitle}
            </h3>
            {message.hasRemoteImages && !imagesShown ? (
              <button type="button" onClick={showImages} className={smallButtonClass}>
                <ImageIcon className="h-[16px] w-[16px]" aria-hidden="true" />
                {adminEmailsCopy.actions.showImages}
              </button>
            ) : null}
            {loadingImages ? (
              <span role="status" className="font-[family-name:var(--font-sans)] text-[13px] text-[var(--muted)]">
                {adminEmailsCopy.actions.loadingImages}
              </span>
            ) : null}
          </div>
          {message.hasRemoteImages && !imagesShown ? (
            <p className="font-[family-name:var(--font-sans)] text-[12px] text-[var(--muted)]">{copy.remoteImagesHidden}</p>
          ) : null}
          <EmailFrame title={`${copy.messageTitle}: ${title}`} html={messageDocument(message, imagesShown)} status={null} />
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
      footer={
        message ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onReply(message)}
              className={cn(
                smallButtonClass,
                'w-full border-[var(--btn)] bg-[var(--btn)] text-[var(--btnfg)] hover:bg-[var(--btn)] hover:opacity-90 sm:w-auto'
              )}
            >
              <Reply className="h-[16px] w-[16px]" aria-hidden="true" />
              {adminEmailsCopy.actions.reply}
            </button>
          </div>
        ) : undefined
      }
    >
      {content}
    </DetailDrawer>
  );
}
