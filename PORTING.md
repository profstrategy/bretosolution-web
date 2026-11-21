# Bretosolution Site Guide (Next.js App Router)

This codebase is structured so that components, content modules, validation schemas, and theme tokens move 1:1 into a Next.js App Router project with minimal changes.

---

## 1. Route & Page Mapping

Each page in `src/pages/` only composes section components from `src/components/sections/` and sets page metadata. Move them into Next.js `app/` routes as Server Components:

| Current Route | Current Page File | Next.js App Router File | Sections Rendered |
| :--- | :--- | :--- | :--- |
| `/` | `src/pages/Home.tsx` | `app/page.tsx` | `Hero`, `ProblemSolution`, `Principles`, `Services`, `AuditProcess`, `Restaurants`, `Offers`, `Proof`, `HomeClosingCta` |
| `/solutions` | `src/pages/Solutions.tsx` | `app/solutions/page.tsx` | `SolutionsHero`, `AiSearchVisibilitySection`, `WebsiteDevelopmentSection`, `OngoingGrowthSection`, `AcceptanceCriteriaSection`, `SolutionsClosingCta` |
| `/pricing` | `src/pages/Pricing.tsx` | `app/pricing/page.tsx` | `RequestQuoteSection` (with two-step `QuoteRequestForm`), `PricingGuidanceSection` (with expandable packages dropdown), `PaymentWorksSection`, `SignedScopeSection`, `StraightAnswersSection` (FAQ accordion), `PricingClosingCta` |
| `/audit` | `src/pages/Audit.tsx` | `app/audit/page.tsx` | `AuditPageSection` (with single-step `AuditRequestForm` and link to `/book-call`) |
| `/book-call` | `src/pages/BookCall.tsx` | `app/book-call/page.tsx` | `BookCallSection` (with `CalendlyEmbed` inline scheduling frame and link to `/audit`) |

### Metadata per Route
Replace the `useEffect` `document.title` assignments in `src/pages/*.tsx` with Next.js static `metadata` exports in each `page.tsx`, sourcing titles from `src/content/*.ts`:
- `app/page.tsx`: `homeContent.documentTitle`
- `app/solutions/page.tsx`: `solutionsContent.documentTitle`
- `app/pricing/page.tsx`: `pricingContent.documentTitle`
- `app/audit/page.tsx`: `auditPageContent.documentTitle`
- `app/book-call/page.tsx`: `bookCallContent.documentTitle`

---

## 2. Layout, Fonts, Theme & Navigation

1. **Root Layout (`app/layout.tsx`)**
   - Import `src/styles/globals.css`.
   - Move the inline pre-paint theme script from `index.html` into `<head>` using `<script dangerouslySetInnerHTML={{ __html: ... }} />` and set `<html lang="en" suppressHydrationWarning>`.
   - Render the `"Skip to content"` link (`#main-content`), `<Header />`, `{children}`, and `<Footer />`.
2. **Fonts (`next/font/google`)**
   - Load `Playfair_Display`, `Satisfy`, `Inter`, and `JetBrains_Mono` with `display: 'swap'` in `app/layout.tsx`, bound to `--font-display`, `--font-script`, `--font-sans`, and `--font-mono`, and remove the `@import url(...)` line at the top of `src/styles/globals.css`.
3. **Link Primitive (`src/components/ui/AppLink.tsx`)**
   - Internal navigation uses `next/link`'s `<Link href={href}>`. All internal navigation (`Header`, `Footer`, `Button`, section CTAs, `/audit`, `/book-call`) routes through `AppLink`.
4. **`'use client'` Boundaries**
   - Add `'use client';` to interactive leaf components only:
     - `src/lib/theme.ts` and `src/components/layout/Header.tsx` (replace `useLocation()` with `usePathname()` from `next/navigation`)
     - `src/components/forms/AuditRequestForm.tsx` (single-step audit form on `/audit`)
     - `src/components/forms/QuoteRequestForm.tsx` (two-step quote form on `/pricing`)
     - `src/components/sections/pricing/PricingGuidanceSection.tsx` (expandable packages dropdown and smooth scroll/focus handler for `#quote`)
     - `src/components/sections/pricing/StraightAnswersSection.tsx` (FAQ accordion)
     - `src/components/booking/CalendlyEmbed.tsx` (iframe `onLoad` and 8-second slow-load fallback timer)

---

## 3. Replace the Mocks

### (a) Audit & Quote Form API Routes (`POST /api/audit-requests` & `POST /api/quote-requests`)

**Implemented:** `src/app/api/audit-requests/route.ts` and
`src/app/api/quote-requests/route.ts` are Node.js, force-dynamic POST routes.
They enforce JSON and 20 KB limits, preserve the `company_site` honeypot,
validate with the existing Zod schemas, rate-limit to five requests per hour
per hashed IP and route bucket, and persist the approved form fields through
Prisma. Raw IP addresses are not stored. Resend sends a plain-text lead
notification after persistence; a notification failure does not discard the
saved request.

The routes return HTTP `201` with `{ ok: true, id }`. The client helpers
`submitAuditRequest` and `submitQuoteRequest` call those routes with a
15-second timeout and map `id` to the existing UI `ref` field. Other failures
use the generic error UI; HTTP `429` has a separate rate-limit message.
Database migration deployment and real email delivery remain to be verified.

---

### (b) Calendly Inline Embed & Webhook (`POST /api/webhooks/calendly`)

> **Important distinction:** A Calendly webhook **receives booking events** after a visitor schedules or cancels a call; it **does not fetch or render the booking interface**.

**Not implemented:** this webhook remains out of scope; no Calendly webhook
route or booking database model was created. The existing scheduling URL is
still a placeholder.

1. **Booking Interface (`/book-call` page & `src/components/booking/CalendlyEmbed.tsx`)**:
   - The `/book-call` page keeps the inline `<iframe>` embed of the public Calendly scheduling URL (`NEXT_PUBLIC_CALENDLY_SCHEDULING_URL` wired into `calendlyUrl` in `src/content/site.ts`).
   - When `calendlyUrl` is set to a real `https://` scheduling link, `CalendlyEmbed` automatically switches from the preview placeholder card to the live inline iframe (`?hide_gdpr_banner=1`) with loading skeleton and 8-second slow-load fallback, and enables the `"Open Calendly in a new tab"` link.

2. **Webhook Endpoint (`app/api/webhooks/calendly/route.ts` — `POST /api/webhooks/calendly`)**:
   - Receives asynchronous event notifications from Calendly for:
     - `invitee.created` (a new audit call booking was scheduled)
     - `invitee.canceled` (an existing audit call booking was canceled)
   - **Signature Verification**:
     - Read the raw request body (`await request.text()`) and the `Calendly-Webhook-Signature` header (`t=<timestamp>,v1=<signature>`).
     - Compute the expected HMAC-SHA256 digest over `${t}.${rawBody}` using `CALENDLY_WEBHOOK_SIGNING_KEY` and compare using `crypto.timingSafeEqual`.
     - Reject requests with invalid signatures or stale timestamps outside tolerance (e.g., > 5 minutes) with HTTP `401`.
   - **Idempotency**:
     - Key stored events/bookings by Calendly's unique event/invitee URI (or webhook event UUID) using an upsert or unique constraint so retried webhook deliveries from Calendly do not create duplicate booking records.
   - **Persistence**:
     - On `invitee.created`, store the invitee's name, email, scheduled start/end times, answers, and status (`scheduled`).
     - On `invitee.canceled`, mark the corresponding booking record as `canceled` with its cancellation timestamp and reason.

---

## 4. Environment Variables

The active site and form API variables are listed without values in
`.env.example`. Configure them in the deployment environment:

**Status:** the API variables below are now read by the application where
needed. Calendly configuration remains open and is not read by these API
routes.

- `NEXT_PUBLIC_SITE_URL` — Public canonical site origin; defaults to
  `https://bretosolution.com`.
- `DATABASE_URL` — Pooled PostgreSQL URL used by the Prisma Client.
- `DIRECT_URL` — Direct PostgreSQL URL used by Prisma migrations.
- `RATE_LIMIT_SALT` — Server-only salt used to hash client IP addresses.
- `RESEND_API_KEY` — Server-only Resend API key.
- `LEAD_NOTIFY_EMAIL` — Recipient for new audit and quote notifications.
- `LEAD_FROM_EMAIL` — Verified sender address for those notifications.

The following Calendly variables remain for the unimplemented integration:

- `NEXT_PUBLIC_CALENDLY_SCHEDULING_URL` — Public scheduling URL; the current
  content still contains a placeholder.
- `CALENDLY_WEBHOOK_SIGNING_KEY` — Only needed if the deferred Calendly
  webhook is implemented. No webhook route currently reads it.

## Migration result

### Completed

- Migrated the marketing site to the Next.js App Router with static server-rendered routes for `/`, `/solutions`, `/pricing`, `/audit`, and `/book-call`.
- Added static `/privacy` and `/terms` routes with real footer links and consent links for public form legal acknowledgements.
- Added explicit, unchecked consent checkboxes to the audit and quote forms.
- Added shared Zod consent validation and Prisma consent timestamp/version columns for both lead request models.
- Preserved the existing section content, styling, public asset paths, form schemas, and booking placeholder.
- Added the shared layout, existing font families/weights through `next/font`, and pre-paint theme initialization.
- Added static SEO metadata, JSON-LD, a sitemap, and robots rules. `/audit` and `/book-call` are currently `noindex, follow`.
- Added dynamic audit and quote API routes, PostgreSQL Prisma models/migration, rate limiting, and Resend lead notifications. The form helpers now call those routes.

### Deviations and verification limits

- Next.js 16 rewrites the requested TypeScript `jsx: preserve` setting to its required `react-jsx` value during build.
- The approved system color-scheme fallback changes the old light default when no valid theme is saved.
- Native fragment navigation replaces the old custom scroll/focus behavior.
- Browser-based visual parity, hydration-console checks, and interactive form/menu/accordion checks could not be verified because browser access was denied. No parity claim is made.

### Still open

- Run `npx prisma migrate deploy` against the intended Supabase database after setting `DATABASE_URL` and `DIRECT_URL`; this repository change did not contact the database.
- Apply the checked-in `20261121171130_add_consent_columns` migration together with any pending migrations before testing consent database writes.
- Verify real form persistence, Resend delivery, and rate-limit behavior behind the production proxy.
- A real Calendly scheduling URL and booking integration.
- Bracketed placeholders for business contact details, legal notices, and Calendly.
- A 1200 × 630 social sharing image; no suitable existing image was found.

## SEO and API result

- SEO metadata, structured data, sitemap, robots, and the two form API routes
  are implemented. The five site pages remain statically rendered; only the
  API routes are dynamic.
- The checked-in migration was generated without connecting to a database.
  The operator must configure `DATABASE_URL` and `DIRECT_URL` and run
  `npx prisma migrate deploy` against Supabase.
- No production database write, Resend delivery, Google Rich Results Test,
  or production-proxy rate-limit test was performed.
- The current document has no numbered sections 5 or 6. Theme migration is
  recorded as completed above; placeholder status is listed under “Still
  open.” No new numbered sections were invented.
