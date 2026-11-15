# Porting Guide: Vite + React Router SPA to Next.js (App Router)

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
   - Replace `react-router-dom`'s `<Link to={href}>` with `next/link`'s `<Link href={href}>`. All internal navigation (`Header`, `Footer`, `Button`, section CTAs, `/audit`, `/book-call`) routes through `AppLink`, so updating this single file updates the entire site.
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

Currently, form submissions are handled by client-side mocks in `src/lib/api/audit.ts` (`submitAuditRequest`) and `src/lib/api/quote.ts` (`submitQuoteRequest`) that wait 700ms, store records in `localStorage`, and return a reference code (`BR-XXXXXX` or `QT-XXXXXX`).

1. **Create `app/api/audit-requests/route.ts` (`POST /api/audit-requests`)**:
   - Parse the JSON request body and validate it with `auditRequestSchema` from `src/schemas/audit.ts`.
   - **Honeypot check**: if `company_site` is non-empty, return `{ ok: true, ref }` with HTTP `200` without storing or sending notifications.
   - **Rate limiting**: enforce per-IP rate limiting (e.g., sliding window by client IP header) and return HTTP `429` when exceeded.
   - Generate a unique `BR-XXXXXX` reference, persist the request to your database, trigger email notification, and return `{ ok: true, ref }`.

2. **Create `app/api/quote-requests/route.ts` (`POST /api/quote-requests`)**:
   - Parse the JSON request body and validate it with `quoteRequestSchema` from `src/schemas/quote.ts` (covering Step 1 fields `businessType`, `helpNeeded`, `mainChallenge` and Step 2 fields `contactName`, `businessName`, `email`, `phoneOrWhatsapp`, `websiteOrInstagram`, `countryRegion`).
   - **Honeypot check**: if `company_site` is non-empty, return `{ ok: true, ref }` with HTTP `200` without storing or sending notifications.
   - **Rate limiting**: enforce per-IP rate limiting and return HTTP `429` when exceeded.
   - Generate a unique `QT-XXXXXX` reference, persist the scoped quote request, trigger email notification, and return `{ ok: true, ref }`.

3. **Update Client Callers (`src/lib/api/audit.ts` & `src/lib/api/quote.ts`)**:
   - Replace the `setTimeout` + `localStorage` logic with `fetch('/api/audit-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })` and `fetch('/api/quote-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })`.
   - `AuditRequestForm` and `QuoteRequestForm` require no changes because they already consume `submitAuditRequest` and `submitQuoteRequest`.

---

### (b) Calendly Inline Embed & Webhook (`POST /api/webhooks/calendly`)

> **Important distinction:** A Calendly webhook **receives booking events** after a visitor schedules or cancels a call; it **does not fetch or render the booking interface**.

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

Configure the following environment variables in `.env.local` / production deployment (no values are hardcoded in the repository):

- `NEXT_PUBLIC_CALENDLY_SCHEDULING_URL` — Public Calendly scheduling URL rendered by the inline iframe on `/book-call` (replaces `"[Calendly scheduling link]"` in `src/content/site.ts`).
- `CALENDLY_WEBHOOK_SIGNING_KEY` — Server-only secret signing key used by `POST /api/webhooks/calendly` to verify `Calendly-Webhook-Signature` headers.
