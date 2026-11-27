import { ReplyLayout } from './ReplyLayout';
import {
  BodyHtml,
  Callout,
  CtaButton,
  Eyebrow,
  Heading,
  Para,
  SignOff,
  Subheading,
} from './parts';
import { replyCopy } from './copy';

export interface AttachmentInfo {
  name: string;
  sizeLabel: string;
}

export interface AuditReplyProps {
  subject: string;
  preheader: string;
  greeting: string;
  business?: string;
  /** Sanitised, styled message HTML (see src/lib/server/emailHtml.ts). */
  bodyHtml: string;
  attachment: AttachmentInfo;
  calendlyUrl?: string;
  signer: string;
  logoUrl?: string;
  /** Only for emails that answer a confirmed website request. */
  footerReason?: string;
}

export function AuditReply(p: AuditReplyProps) {
  const c = replyCopy.audit;
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
      {/* <Callout
        title={c.attachmentTitle}
        detail={`${p.attachment.name} (${p.attachment.sizeLabel})`}
        note={c.attachmentNote}
      /> */}
      {p.calendlyUrl ? (
        <CtaButton lead={c.ctaLead} label={c.ctaLabel} href={p.calendlyUrl} />
      ) : null}
      <SignOff signer={p.signer} />
    </ReplyLayout>
  );
}
