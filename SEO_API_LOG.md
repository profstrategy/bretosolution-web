# SEO and API implementation log

## Phase 0 — plan

- Read the current Next.js pages, rendered section headings, content, form
  schemas/API mocks, environment example and migration guide.
- Created `SEO_API_PLAN.md` with current metadata/headings, visible facts, FAQ
  behavior, form validation/API behavior, proposed schema and metadata.
- User approved the proposed schema and all five metadata pairs.
- The repository had incomplete untracked Prisma 7 setup, but no Prisma
  packages installed. Prisma 7 requires `@prisma/adapter-pg`, which is outside
  the dependency allowlist. Based on the official Prisma 6.19.3 docs, aligned
  the existing setup to Prisma 6.19.3, which supports the approved PostgreSQL
  URL/direct URL configuration without an additional adapter dependency.
- `npx prisma generate` passed with `DATABASE_URL` and `DIRECT_URL` unset.
  Build, TypeScript and lint passed after the repair. Lint reports existing
  `<img>` warnings.

## Phase 1 — metadata

- Added approved page titles, descriptions and canonical paths in
  `src/content/seo.ts`; set the requested default site URL and logo path.
- Added root metadata defaults and page-level canonical/Open Graph metadata.
- Set `/audit` and `/book-call` to `noindex, follow`, as directed.
- No suitable 1200 × 630 social image was found in `public/`; omitted OG image
  and used the `summary` Twitter card.
- Verification passed: production build lists all five routes as static;
  `npx tsc --noEmit` passed; `npm run lint` passed with eight existing
  `<img>` warnings. Curl checks of each built route confirmed one H1, the
  approved title/description, canonical URL, expected robots behavior,
  Open Graph defaults and page-specific tags, and `twitter:card=summary`.

## Phase 2 — JSON-LD

- Added a server-rendered JSON-LD component that safely escapes `<` in the
  serialized data.
- Added the Organization/WebSite graph to the root layout, breadcrumbs on
  `/solutions` and `/pricing`, and a `/pricing` FAQPage generated from the same
  plain-text FAQ rows rendered by the page.
- Verified all four generated JSON-LD blocks parse as JSON. The organization
  description is an excerpt of the visible home hero sentence; organization
  name, contact email, logo asset, breadcrumbs, and pricing questions/answers
  are also represented in rendered content.
- Production build, type check, and lint passed; all five routes remain static.
- Google Rich Results Test was not run; see the "Could not verify" items below.

## Phase 3 — sitemap and robots

- Added a sitemap containing only `/`, `/solutions`, and `/pricing`, with
  absolute URLs and no build-time modification dates, priorities, or change
  frequencies.
- Added robots rules allowing all user agents, disallowing `/api/`, and
  advertising the sitemap URL. No crawler-specific rules were added.
- `npm run build`, `npx tsc --noEmit`, and `npm run lint` passed; the build
  lists the five site pages as static, along with static metadata routes.
  Lint reports the same eight existing `<img>` warnings.
- Production-server curl checks confirmed `robots.txt` directives and exactly
  three sitemap URLs (`/`, `/solutions`, `/pricing`), with no audit/book-call
  entries or optional date/priority/change-frequency fields.

## Phase 4 — database and API routes

- Added the approved `AuditRequest`, `QuoteRequest`, and `RateLimitHit` models
  for PostgreSQL, plus the initial migration generated from the Prisma schema.
  Added a `createdAt` index to keep the required per-request 24-hour cleanup
  efficient, alongside the approved compound rate-limit index.
- Added a lazy Prisma 6.19.3 singleton, lazy Zod-validated environment
  accessors, bounded JSON/response helpers, and rate limiting using salted
  SHA-256 IP hashes. A transaction-scoped PostgreSQL advisory lock keeps
  concurrent checks for the same route/IP bucket serialized.
- Added Node.js-only dynamic POST routes for audit and quote requests. Both
  use the existing Zod schemas, omit the honeypot from storage, truncate
  user-agent data to 200 characters, store no raw IP, save before notifying,
  and preserve success if notification fails.
- Added the allowed Resend dependency (`resend` 6.39.0), a Prisma `postinstall`
  generation step, and all required environment variable names to
  `.env.example`.
- Verification passed: Prisma schema validation/generation, checked-in
  migration-to-schema diff, `npm run build` with `.env.local` temporarily
  disabled and no app environment variables set, `npx tsc --noEmit`, and
  `npm run lint`. The build lists the five site pages as static and only the
  two API routes as dynamic. Lint has eight existing `<img>` warnings.
- Local production-server checks confirmed 415 for non-JSON, 413 for a body
  over 20 KB, and 201 for both honeypot routes without database or Resend
  configuration. No database or email service was contacted.
- Could not verify real database writes/migration deployment, Resend delivery,
  or rate limiting behind the production proxy.

## Phase 5 — wire the forms

- Replaced both localStorage mocks with POST requests through a shared fetch
  helper. It uses a 15-second `AbortController` timeout and maps the returned
  database ID to the existing `ref` success shape.
- The forms show the 429 message from their existing content files. Other HTTP
  and network failures retain the generic error UI and preserve form values;
  server field errors are not mapped because these forms have no server-error
  field handling today.
- The existing form fields, labels, honeypot name, success copy, pending
  disable behavior, and layout are unchanged.
- Verification passed: production build with `.env.local` temporarily disabled,
  `npx tsc --noEmit`, and `npm run lint`. The five site pages remain static;
  only the API routes are dynamic. The local development submission test is
  left for the user as requested.

### Open items / decisions

- OG image needed (1200x630).
- Confirm the configured production site URL and whether
  `hello@bretosolution.com` is a monitored address.
- The user specified `noindex` for `/audit` and `/book-call`; this can be
  reversed if desired.
- Privacy notice/Terms text and Resend sender-domain verification remain
  unresolved.
- Do not claim successful Google Rich Results Test, database writes, email
  delivery, or proxy-aware rate limiting without the corresponding external
  tests.
