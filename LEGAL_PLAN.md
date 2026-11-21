# Legal Pages Implementation Plan

## Phase 0 data inventory

### Audit request

- `businessName`: collected by the audit form and validated as 2 to 100 characters; the API saves it and includes it in the Resend lead notification. (`src/schemas/audit.ts:20-24`, `src/components/forms/AuditRequestForm.tsx:110-125`, `src/app/api/audit-requests/route.ts:46-58`, `src/lib/server/notify.ts:28-42`)
- `websiteOrInstagram`: collected as a website URL, Instagram-style handle, or the text `none yet`; it is validated, saved, and sent in the lead notification. (`src/schemas/audit.ts:25-37`, `src/components/forms/AuditRequestForm.tsx:128-143`, `src/app/api/audit-requests/route.ts:46-58`, `src/lib/server/notify.ts:28-42`)
- `city`: collected as a required text value; it is validated, saved, and sent in the lead notification. (`src/schemas/audit.ts:38-39`, `src/components/forms/AuditRequestForm.tsx:208-220`, `src/app/api/audit-requests/route.ts:46-58`, `src/lib/server/notify.ts:28-42`)
- `businessType`: selected from Restaurant, Lounge or bar, Hotel, Restaurant group, or Other; it is validated, saved, and sent in the lead notification. (`src/schemas/audit.ts:6-12`, `src/schemas/audit.ts:40-42`, `src/components/forms/AuditRequestForm.tsx:223-249`, `src/app/api/audit-requests/route.ts:46-58`, `src/lib/server/notify.ts:28-42`)
- `email`: collected as a business email address and sent in the lead notification. (`src/schemas/audit.ts:43-48`, `src/components/forms/AuditRequestForm.tsx:252-270`, `src/app/api/audit-requests/route.ts:46-58`, `src/lib/server/notify.ts:28-42`)
- Hidden honeypot field: rendered off-screen and checked on submission. If filled, the API returns a successful-looking response and does not save or notify; it is not stored as form data. (`src/schemas/honeypot.ts`, `src/components/forms/AuditRequestForm.tsx:96-108`, `src/app/api/audit-requests/route.ts:18-22`)

### Quote request

- `businessType`: selected from the shared business types; it is validated, saved, and sent in the Resend lead notification. (`src/schemas/quote.ts:3-5`, `src/schemas/quote.ts:24-31`, `src/components/forms/QuoteRequestForm.tsx:282-303`, `src/app/api/quote-requests/route.ts:47-61`, `src/lib/server/notify.ts:46-64`)
- `helpNeeded`: selected from AI Visibility Optimization, Website + AI Visibility, Visibility Growth Management, or Not sure yet; it is saved and sent in the lead notification. (`src/schemas/quote.ts:7-13`, `src/schemas/quote.ts:32-39`, `src/components/forms/QuoteRequestForm.tsx:305-326`, `src/app/api/quote-requests/route.ts:47-61`, `src/lib/server/notify.ts:46-64`)
- `mainChallenge`: optional text, up to 1,000 characters; it is saved and sent in the lead notification. (`src/schemas/quote.ts:40-46`, `src/components/forms/QuoteRequestForm.tsx:328-347`, `src/app/api/quote-requests/route.ts:47-61`, `src/lib/server/notify.ts:46-64`)
- `contactName`: required text, 2 to 100 characters; it is saved and sent in the lead notification. (`src/schemas/quote.ts:47-52`, `src/components/forms/QuoteRequestForm.tsx:284-303`, `src/app/api/quote-requests/route.ts:47-61`, `src/lib/server/notify.ts:46-64`)
- `businessName`: required text, 2 to 100 characters; it is saved and sent in the lead notification. (`src/schemas/quote.ts:53-58`, `src/components/forms/QuoteRequestForm.tsx:304-326`, `src/app/api/quote-requests/route.ts:47-61`, `src/lib/server/notify.ts:46-64`)
- `email`: required valid email address; it is saved and sent in the lead notification. (`src/schemas/quote.ts:59-63`, `src/components/forms/QuoteRequestForm.tsx:326-347`, `src/app/api/quote-requests/route.ts:47-61`, `src/lib/server/notify.ts:46-64`)
- `phoneOrWhatsapp`: optional text, up to 60 characters; it is saved and sent in the lead notification. (`src/schemas/quote.ts:64-69`, `src/components/forms/QuoteRequestForm.tsx:347-373`, `src/app/api/quote-requests/route.ts:47-61`, `src/lib/server/notify.ts:46-64`)
- `websiteOrInstagram`: optional text, up to 200 characters; it is saved and sent in the lead notification. (`src/schemas/quote.ts:70-75`, `src/components/forms/QuoteRequestForm.tsx:373-399`, `src/app/api/quote-requests/route.ts:47-61`, `src/lib/server/notify.ts:46-64`)
- `countryRegion`: selected from Nigeria or Another country; it is saved and sent in the lead notification. (`src/schemas/quote.ts:14-15`, `src/schemas/quote.ts:76-83`, `src/components/forms/QuoteRequestForm.tsx:399-426`, `src/app/api/quote-requests/route.ts:47-61`, `src/lib/server/notify.ts:46-64`)
- Hidden honeypot field: checked and discarded in the same way as the audit honeypot. (`src/schemas/honeypot.ts`, `src/components/forms/QuoteRequestForm.tsx:116-128`, `src/app/api/quote-requests/route.ts:18-22`)

### Data recorded by the server

- Both lead models record a generated `id`, request status (`NEW`, `CONTACTED`, or `CLOSED`), `createdAt`, a hashed IP (`ipHash`), a user-agent string truncated to 200 characters, and `notifiedAt` after a successful notification. (`prisma/schema.prisma:10-43`, `src/app/api/audit-requests/route.ts:42-75`, `src/app/api/quote-requests/route.ts:43-76`)
- Raw IP addresses are not stored. The server derives `ipHash` with SHA-256 from the first forwarded or real IP plus `RATE_LIMIT_SALT`. (`src/lib/server/rateLimit.ts:14-24`)
- The server records `bucket`, `ipHash`, and `createdAt` for rate-limit hits. It cleans hits older than 24 hours and limits requests to five per route bucket per hour. (`src/lib/server/rateLimit.ts:3-13`, `src/lib/server/rateLimit.ts:25-67`)
- Notification delivery sends the same approved lead fields by text email through Resend. Database persistence is kept even if email notification fails. (`src/lib/server/notify.ts:1-64`, `src/app/api/audit-requests/route.ts:61-79`, `src/app/api/quote-requests/route.ts:62-80`)

### Booking and browser data

- `/book-call` contains an inline Calendly embed component. The current configured value is the literal placeholder `[Calendly scheduling link]`, so the live iframe is not active; no booking fields or webhook data are currently sent or stored by this codebase. (`src/content/site.ts:4`, `src/components/booking/CalendlyEmbed.tsx:10-30`, `PORTING.md:72-87`)
- When a real scheduling URL is configured, the embed loads Calendly in an iframe with `hide_gdpr_banner=1` and may receive whatever information a visitor enters directly in Calendly. The code does not receive or save that booking data. (`src/components/booking/CalendlyEmbed.tsx:104-141`)
- The browser stores the theme preference under localStorage key `breto-theme` with value `light` or `dark`. The value also informs the pre-paint theme script. (`src/lib/theme.ts:3-5`, `src/lib/theme.ts:20-51`, `src/app/layout.tsx:60-86`)
- No cookies, sessionStorage, IndexedDB, or other localStorage keys are used elsewhere in the searched application code. (`src/lib/theme.ts:20-51`, `src/app/layout.tsx:60-86`)
- React form state exists only while the form page is open; it is not browser-persisted. (`src/components/forms/AuditRequestForm.tsx:16-45`, `src/components/forms/QuoteRequestForm.tsx:29-67`)

### Third parties and infrastructure

- PostgreSQL database: lead and rate-limit records are stored through Prisma. The code does not name a database host or region. The deployment guide says the intended database is Supabase, but the application schema itself only declares PostgreSQL and environment variables; use a provider placeholder rather than calling Supabase verified. (`prisma/schema.prisma:5-8`, `src/lib/db.ts:1-18`, `src/lib/server/env.ts:16-18`, `PORTING.md:112-117`)
- Resend: lead email notifications use `RESEND_API_KEY`, `LEAD_FROM_EMAIL`, and `LEAD_NOTIFY_EMAIL`. Resend is named by the implementation, but account region and retention are not configured or stated in code. (`src/lib/server/notify.ts:1-64`, `src/lib/server/env.ts:24-30`)
- Website hosting: the code does not identify the Next.js hosting provider or region. (`src/app/layout.tsx`, `src/content/seo.ts:1-8`)
- Calendly: not active today because the scheduling URL is a placeholder. If configured, Calendly would be the third-party scheduling provider for `/book-call`. (`src/content/site.ts:4`, `src/components/booking/CalendlyEmbed.tsx:10-30`)
- Fonts: Inter, Playfair Display, JetBrains Mono, and Satisfy are configured through `next/font/google`; the code uses Next.js-generated font assets and declares no separate in-page script or explicit font request to another host. (`src/app/layout.tsx:9-27`, `src/styles/globals.css:27-33`)

### Retention today

- Audit and quote lead records have no deletion or retention job, field, or migration rule. They remain until an operator changes or deletes them. (`prisma/schema.prisma:10-43`, `src/app/api/audit-requests/route.ts`, `src/app/api/quote-requests/route.ts`)
- Rate-limit hits are deleted once older than 24 hours. (`src/lib/server/rateLimit.ts:3-13`, `src/lib/server/rateLimit.ts:25-67`)
- Notification-provider retention and database backup retention are not configured or stated in code.

## Footer and link inventory

- The footer currently renders `site.footer.legalNotice`, which is the literal text `[Privacy notice] · [Terms of service]`; it is not a link. (`src/content/site.ts:68`, `src/components/layout/Footer.tsx:70`)
- `site.legalPrivacy`, `site.legal.privacy`, `site.legalTerms`, and `site.legal.terms` are also literal placeholders and are not rendered as links. (`src/content/site.ts:34-42`)
- The footer should become two real `AppLink` links: `/privacy` and `/terms`, with the existing bottom-row layout unchanged. (`src/components/layout/Footer.tsx:70`)
- The audit form has a privacy/consent note rendered directly from a plain string in `auditFormContent.privacyNote`; it does not currently carry a link. (`src/content/audit.ts:32-33`, `src/components/forms/AuditRequestForm.tsx:281-284`)
- The quote form has a consent note rendered from the plain string `pricingContent.quoteForm.consentNote`; it does not currently carry a link. (`src/content/pricing.ts:74-75`, `src/components/forms/QuoteRequestForm.tsx:449-451`)
- No existing Privacy or Terms link was found elsewhere in the application. (`src`, searched for `Privacy`, `privacy`, `Terms`, and `terms`)
- For Phase 2, link the words "Privacy Policy" in the audit and quote notes only if the content representation can carry a link without changing the wording. Both notes are currently plain strings, so the planned action is to leave them unchanged and report that limitation.

## Proposed section outlines

### Privacy Policy

1. **Who we are and how to contact us** — Brand Bretosolution, site `bretosolution.com`, the registered business-name/address placeholder, and the privacy email placeholder.
2. **What we collect** — Audit fields, quote fields and their optional fields, hidden honeypot behavior, Calendly scheduling data not currently collected by the code, technical IP hash/user-agent/timestamps/rate-limit records, and browser theme storage.
3. **Why we use it and legal basis** — Consent for form submissions; legitimate interest for security and anti-spam/rate limiting; describe the purpose of each data category.
4. **Who receives it** — PostgreSQL/database host, Resend, website host, and Calendly, with placeholders where provider or region is unknown.
5. **International transfers** — Explain that providers may process data outside Nigeria and rely on their safeguards, without naming a mechanism the code cannot verify.
6. **How long we keep it** — Lead-retention placeholder, 24-hour rate-limit cleanup, and the absence of a lead deletion rule.
7. **Your rights** — Access, correction, deletion, restriction, objection, portability, consent withdrawal, and complaint to the Nigeria Data Protection Commission.
8. **Security** — State only broad, code-verifiable facts and clearly note that hosting HTTPS and operational safeguards are not inspectable in this repository.
9. **Cookies and local storage** — No cookies; only `breto-theme` in localStorage.
10. **Children** — Service is not directed at under-18s.
11. **Changes** — Explain that the policy may be updated and the date changed.
12. **Contact** — Privacy contact placeholder.

### Terms of Service

1. **About these terms and who they apply to** — Visitors and form submitters.
2. **What we offer** — Information about services and requests for an audit or quote.
3. **Free AI Visibility Audit** — Public-information assessment, no guarantees, and no contract.
4. **Quotes and projects** — Quotes are not binding until both parties sign a scope; signed scope controls prices, timelines, payment terms, and deliverables.
5. **Acceptable use** — No unlawful use, form abuse, scraping, or false information.
6. **Your information** — Link to the Privacy Policy.
7. **Intellectual property** — Bretosolution's site content and brand; user rights in submitted material; signed-scope project ownership terms.
8. **Third-party services and links** — Calendly, Google, and AI platforms; third parties are outside Bretosolution's control.
9. **No guarantees and limitation** — As-is website statement, liability limited to the extent allowed by law.
10. **Changes** — Changes to the site and terms.
11. **Governing law** — Nigeria and court/city placeholder.
12. **Contact** — Business contact placeholder.

## Facts needed

- Registered business name and registered address.
- Privacy contact email.
- Retention period for audit and quote leads.
- Database host/provider name and region, if not the intended placeholder.
- Website hosting provider name and region.
- Resend account region or data-processing location, if known.
- Calendly scheduling URL and account/provider details, if Calendly will be used.
- State or city to identify courts under the governing-law clause.
- Any registration number that Bretosolution legally needs or chooses to publish.
