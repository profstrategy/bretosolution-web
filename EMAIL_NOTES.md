# Branded email notes

## Environment

- `RESEND_API_KEY` — server-only Resend API key.
- `LEAD_FROM_EMAIL` — verified sender address used for both owner notifications
  and confirmations.
- `LEAD_NOTIFY_EMAIL` — recipient of audit and quote owner notifications.
- `DATABASE_URL` — PostgreSQL connection used to save leads and count recent
  submissions for the confirmation recipient limit.
- `RATE_LIMIT_SALT` — server-only salt used by the existing form rate limiter.
- `NEXT_PUBLIC_SITE_URL` — public origin used for the logo URL; defaults to
  `https://bretosolution.com`.

The contact address used for reply-to and unsubscribe links is
`site.contactEmail` in `src/content/site.ts`. The postal address is in the same
source file. Do not put secret values in this document.
Confirmation emails also carry a `List-Unsubscribe` header.

## Development preview

Run `npm run dev`, then open any of these HTML previews:

- `http://localhost:3000/api/dev/email-preview?template=audit-notification&format=html`
- `http://localhost:3000/api/dev/email-preview?template=quote-notification&format=html`
- `http://localhost:3000/api/dev/email-preview?template=audit-confirmation&format=html`
- `http://localhost:3000/api/dev/email-preview?template=quote-confirmation&format=html`

Use `format=text` to inspect the matching plain-text output. The preview uses
only each template's fake `defaultProps`; it does not read the database. The
endpoint returns 404 outside development.

## Manual delivery checklist

- [ ] Submit the audit form using a Gmail address I own; confirm the owner
  notification and audit confirmation arrive.
- [ ] Submit the quote form using a Gmail address I own; confirm the owner
  notification and quote confirmation arrive.
- [ ] Repeat both form submissions with an Outlook address I own.
- [ ] In Gmail, open **Show original** and confirm SPF, DKIM, and DMARC each
  report **PASS**.
- [ ] View each message on a phone; check that it is readable, not clipped, and
  not in spam.
- [ ] Click **Unsubscribe** and confirm it opens a prefilled email to
  `hello@bretosolution.com`.
- [ ] With a clean address I own, submit two requests across the audit and
  quote forms within 24 hours, then submit a third. Confirm the third still
  receives the owner notification but no confirmation.
- [ ] Confirm a filled honeypot produces no email.
