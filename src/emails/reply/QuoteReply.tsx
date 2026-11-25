import { ReplyLayout } from './ReplyLayout';
import {
  BodyHtml,
  Callout,
  CtaButton,
  Eyebrow,
  Heading,
  KeyValueTable,
  Note,
  Para,
  SignOff,
  Subheading,
} from './parts';
import { replyCopy } from './copy';
import type { AttachmentInfo } from './AuditReply';

export interface QuoteReplyProps {
  subject: string;
  preheader: string;
  greeting: string;
  business?: string;
  /** Sanitised, styled message HTML (see src/lib/server/emailHtml.ts). */
  bodyHtml: string;
  rows: { label: string; value: string }[];
  attachment?: AttachmentInfo;
  calendlyUrl?: string;
  signer: string;
  logoUrl?: string;
  /** Only for emails that answer a confirmed website request. */
  footerReason?: string;
}

export function QuoteReply(p: QuoteReplyProps) {
  const c = replyCopy.quote;
  return (
    <ReplyLayout
      title={p.subject}
      preheader={p.preheader}
      footerReason={p.footerReason}
      logoUrl={p.logoUrl}
    >
      <Eyebrow>{c.eyebrow}</Eyebrow>
      <Heading>{c.heading}</Heading>
      {p.business ? <Subheading>Prepared for {p.business}</Subheading> : null}
      <Para text={p.greeting} />
      <BodyHtml html={p.bodyHtml} />
      {p.rows.length > 0 ? (
        <KeyValueTable title={c.rowsTitle} rows={p.rows} />
      ) : null}
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
      <Note>{c.bindingNote}</Note>
    </ReplyLayout>
  );
}
