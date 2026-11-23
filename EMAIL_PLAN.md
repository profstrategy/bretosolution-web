# Branded email implementation plan

This is the read-only Phase 0 plan. No application code or dependencies have
been changed.

## Brand tokens

Email templates will use fixed light-theme hex values from
`src/styles/globals.css`; emails will not use CSS variables or follow the
recipient's dark-mode theme.

| CSS token | Email value | Intended use |
| --- | --- | --- |
| `--bg` | `#F5F2EB` | Outer page background |
| `--alt`, `--panel` | `#FFFFFF` | Card background |
| `--ink` | `#1A1714` | Main text and headings |
| `--muted` | `#5C564D` | Secondary text |
| `--line` | `#DDD6C8` | Rules and table borders |
| `--accent` | `#B8400F` | Links and brand accents |
| `--foot` | `#ECE6D8` | Footer background |
| `--btn`, `--btnfg` | `#1A1714`, `#FFFFFF` | Token equivalents; no email buttons are planned |

The supplied ink, muted, and accent colors against white have contrast ratios
of approximately 17.85:1, 7.26:1, and 5.56:1 respectively. The heading and body
font stacks will be the requested web-safe Georgia/Times and Arial/Helvetica
stacks.

## Files planned

**Create**

- `src/content/emails.ts`
- `src/emails/tokens.ts`
- `src/emails/components/EmailLayout.tsx`
- `src/emails/AuditRequestNotification.tsx`
- `src/emails/QuoteRequestNotification.tsx`
- `src/emails/AuditConfirmation.tsx`
- `src/emails/QuoteConfirmation.tsx`
- `src/app/api/dev/email-preview/route.ts`
- `EMAIL_NOTES.md`

**Change**

- `package.json` and `package-lock.json` (only add `@react-email/components`
  and `@react-email/render`; exact versions will be selected and recorded when
  Phase 1 is approved)
- `src/content/site.ts` (add/use the supplied contact email and postal address)
- `src/lib/server/notify.ts`
- `src/app/api/audit-requests/route.ts`
- `src/app/api/quote-requests/route.ts`
- `scripts/smoke-api.md`
- `PORTING.md`

No Prisma schema or migration change is planned. The existing public logo at
`public/brand/breto-logo-email.png` is present and currently untracked; it will
not be changed. The templates can reference it using `seoContent.siteUrl`,
which already defaults to `https://bretosolution.com` and accepts
`NEXT_PUBLIC_SITE_URL`.

## Email rendering and sending APIs

The installed Resend 6.39.0 package's type declaration defines
`resend.emails.send(payload, requestOptions?)` as returning
`Promise<CreateEmailResponse>`. Its email payload supports `html`, `text`,
`replyTo`, and `headers`; the installed README also uses the camel-case
`replyTo` option. Sending will pass both `html` and `text`, never `react`.

Neither `@react-email/components` nor `@react-email/render` is installed or
present in `package-lock.json` now, so their installed types and package docs
cannot be inspected during this read-only phase. The React Email render docs
describe awaiting `render(<Template ... />)` for an HTML string and passing
that HTML to `toPlainText(html)` for the plain-text string. Those documented
calls are the intended API, but the precise installed signatures and package
versions remain unverified until the packages are added in an approved phase.
I will inspect both installed packages' types and docs before implementing
their calls.

## Auto-reply abuse guard

After the lead is saved, normalize the submitted address with `trim()`, then
count matching records in the last 24 hours in both `AuditRequest` and
`QuoteRequest`. Each Prisma count will filter `createdAt >= cutoff` and use
PostgreSQL case-insensitive email equality (`mode: 'insensitive'`). The just
saved row is included in these counts. If the combined total is greater than
2, skip only the confirmation and log exactly
`Confirmation skipped: recipient limit`; still attempt the owner notification.
The existing honeypot branches return before parsing/saving or attempting any
notification, and will remain before the send path.

## Existing conflicts and observations

- `src/content/site.ts` already has a top-level
  `contactEmail: 'hello@bretosolution.com'`; the change should retain/reuse it,
  not introduce a duplicate field. There is also a nested contact email using
  the same address.
- The privacy text in `src/content/legal.ts` gives a different, less complete
  postal form (`Jakana Plaza, Lagos Street,Maiduguri Borno State`). Per
  instruction, that existing legal text will not be edited. The requested
  address was corrected and confirmed as
  `['35, Jakana Plaza', 'Lagos Street', 'Maiduguri, Borno State', '600215', 'Nigeria']`;
  the legal text will remain unchanged.
- `notify.ts` currently sends plain text only. Audit notification fields are
  Business name, Website or Instagram, City, Business type, Email, and
  Consent. Quote notification fields are Business type, Help needed, Main
  challenge, Contact name, Business name, Email, Phone or WhatsApp, Website or
  Instagram, Country or region, and Consent. Both include the acceptance
  timestamp and policy version in the consent line; the policy version is
  internal metadata, so the proposed owner template must not expose it if
  “never put internal IDs in any email” is interpreted to include policy
  versions. The received timestamp can be displayed separately.
- Optional quote fields are currently represented as empty strings in some
  route inputs and as `undefined` in the schema type; templates will display
  empty values as “Not provided”.
- The current legal terms say a quote or estimate is not binding and project
  work starts only after both parties sign a written scope. The requested
  confirmation copy is kept exactly as supplied; legal content will not be
  changed.
- The required Phase 0 plan is the only file to be written in this phase.
  Builds, type checks, lint, dependency installation, and commits are deferred
  until the corresponding approved implementation phase.
