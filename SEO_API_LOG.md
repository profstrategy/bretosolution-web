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
