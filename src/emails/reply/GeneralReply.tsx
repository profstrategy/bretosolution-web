import { ReplyLayout } from './ReplyLayout';
import { BodyHtml, Callout, CtaButton, Para, SignOff } from './parts';
import { replyCopy } from './copy';
import type { AttachmentInfo } from './AuditReply';

export interface GeneralReplyProps {
  /** The personalised subject written for this recipient. */
  subject: string;
  preheader: string;
  greeting: string;
  /** Sanitised, styled message HTML (see src/lib/server/emailHtml.ts). */
  bodyHtml: string;
  attachment?: AttachmentInfo;
  calendlyUrl?: string;
  signer: string;
  logoUrl?: string;
  /** Only for emails that answer a confirmed website request. */
  footerReason?: string;
}

/**
 * A personal message (new conversation, cold email or follow-up): no eyebrow
 * or fixed heading, so it reads like a letter. The subject line carries the
 * personalisation.
 */
export function GeneralReply(p: GeneralReplyProps) {
  const c = replyCopy.general;
  return (
    <ReplyLayout
      title={p.subject}
      preheader={p.preheader}
      footerReason={p.footerReason}
      logoUrl={p.logoUrl}
    >
      <Para text={p.greeting} />
      <BodyHtml html={p.bodyHtml} />
      {p.attachment ? (
        <Callout
          title={c.attachmentTitle}
          detail={`${p.attachment.name} (${p.attachment.sizeLabel})`}
          note={c.attachmentNote}
        />
      ) : null}
      {p.calendlyUrl ? (
        <CtaButton lead={c.ctaLead} label={c.ctaLabel} href={p.calendlyUrl} />
      ) : null}
      <SignOff signer={p.signer} />
    </ReplyLayout>
  );
}
