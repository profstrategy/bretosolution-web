# SEO and API plan — Phase 0

Read-only inspection completed on branch `seo-and-api`. This plan is based on
the current worktree, including its pre-existing changes. No other files have
been changed for this phase.

## a. Current page metadata and heading outlines

All five page files currently export `title` from their page content and use
the same `siteDescription` from `src/content/site.ts`:

> Bretosolution helps restaurants and hospitality businesses improve their
> visibility on Google and AI search platforms and builds websites that
> convert visitors into customers.

The titles below are the current metadata values (the root layout has no title
template today).

### `/`

- Current title: `Bretosolution — AI Visibility & Web Growth`
- Current description: shared `siteDescription` above.
- One H1: “Be discovered by the customers already searching for what you
  offer.”
- Outline:
  - H2 “Rise in social media followers — Your search discovery should, too.”
  - H2 “What we sell, and what we don’t.”
    - H3 “Verifiable improvements”; “Dated, repeatable tests”; “No guaranteed
      rankings”
  - H2 “Three services that work together.”
  - H2 “See how your business appears before you spend anything.”
    - H3 “Verify the business”; “Test live on AI search”; “Review the
      foundations”; “Prioritise and plan”
  - H2 “Guests ask AI where to eat. Then they look for a menu and a way to
    book.”
  - H2 “Start free. Pay only for scoped work.”
    - H3 “AI Visibility Diagnostic”; “AI Visibility Optimization”; “Website +
      AI Visibility”; “Visibility Growth Management”
  - H2 “We publish a case study only when the results are real.”
  - H2 “See how search and AI describe your restaurant.”

### `/solutions`

- Current title: `Solutions | Bretosolution`
- Current description: shared `siteDescription` above.
- One H1: “Built around how guests find and choose a restaurant.”
- Outline:
  - H2 “Know exactly how search and AI describe your business.”
    - H3 “AI discovery testing”; “Website discoverability”; “Local search
      presence”; “Brand authority”; “Content quality”; “Conversion readiness”
  - H2 “A restaurant website built in four phases.”
    - H3 “Discovery and planning”; “Website development”; “Search
      optimization”; “Testing and handover”; “Add-on modules”
  - H2 “A monthly report you can act on.”
  - H2 “Every project has acceptance criteria, agreed before we start.”
    - H3 “Website”; “Performance”; “Technical SEO”; “Structured data”; “Local
      SEO”; “Analytics”; “AI visibility”; “Conversion”
  - H2 “Not sure where to start? Start with the audit, it costs nothing.”

### `/pricing`

- Current title: `Pricing & Request a Quote | Bretosolution`
- Current description: shared `siteDescription` above.
- One H1: “Tell us what you need, we’ll price it by scope.”
- Outline:
  - H2 form step “Your needs” (initial step) / “Your details” (second step)
  - H2 “Priced by scope, not by page count.”
    - H3 “AI Visibility Diagnostic”; “AI Visibility Optimization”
    - Three expandable package-card H3s: “AI Visibility Optimization”;
      “Website + AI Visibility”; “Visibility Growth Management”
  - H2 “No surprises on the invoice.”
    - H3 “Smaller projects”; “Larger projects”; “Third-party costs”
  - H2 “Everything agreed in writing before we start.”
    - H3 “Deliverables, listed one by one”; “Acceptance criteria for each area
      of work”; “Revision limits”; “Timeline and what we need from you, and
      when”; “Exclusions”; “Ownership and handover terms”
  - H2 “The questions owners ask before they hire us.”
    - H3 “Can you guarantee ChatGPT will recommend us?”; “We already have a
      website.”; “AI doesn’t bring us customers.”; “The price is too high for
      us.”
  - H2 “See your own numbers first, then decide.”

### `/audit`

- Current title: `Request a free AI visibility audit | Bretosolution`
- Current description: shared `siteDescription` above.
- One H1: “Find out how your restaurant appears to customers who ask AI.”
- No other headings in the initial page content.

### `/book-call`

- Current title: `Book an audit call | Bretosolution`
- Current description: shared `siteDescription` above.
- One H1: “Book an Audit Call.”
- No other headings in the initial page content.

The source contains one H1 per page. The outlines follow H1 → H2 → H3; no
heading-order violation was found.

## b. Facts available for structured data

| Fact | Current evidence | Classification / use |
| --- | --- | --- |
| Brand name | “Bretosolution” appears in the footer description and copyright; “BRETO” appears in the header/footer wordmark. | Visible. Use the displayed brand name, not an asserted registered entity name. |
| Legal entity name | No registered/legal business name is shown. The footer legal notice is `[Privacy notice] · [Terms of service]`. | Placeholder / unknown. Omit. |
| Website URL | `site.domain` is `bretosolution.com`, but the domain is not printed as page copy. The requested `NEXT_PUBLIC_SITE_URL`/default determines the origin. | Configured, not visibly displayed. `UNKNOWN: confirm bretosolution.com is the authoritative production canonical origin before deployment.` |
| Logo | `/brand/breto-logo.webp`, alt text “Breto logo”; used in the header and footer. Asset metadata declares 120 × 120. | Visible; eligible as the existing logo. |
| Description | The current metadata description is not rendered verbatim in page copy. The home hero has visible descriptive copy, and the footer has a separate visible brand description. | Use only an approved description copied from visible home-page copy for Organization JSON-LD. |
| Contact email | Footer displays `hello@bretosolution.com`. | Visible as a value, with no bracket placeholder. `UNKNOWN: whether it is monitored/verified; no delivery test has been done.` |
| Phone | `[Phone or WhatsApp]` exists in content data but is not rendered as a real phone value. | Placeholder / not visibly shown; omit. |
| Social links | No social profile links are rendered. | Not shown; omit `sameAs`. |
| Address, awards, reviews, ratings, testimonials | No eligible address, awards, ratings or review claims were found. Home-page sample figures are explicitly labeled illustrative/not a client result. | Omit; do not turn illustrative figures into claims. |
| Open Graph image | `public/` contains the logo, platform marks, sketch arrow and two site screenshots; no file is identified as a 1200 × 630 social image. The logo is declared 120 × 120. | No known OG image. `UNKNOWN: verify actual dimensions of public image files before deciding whether any existing image qualifies.` |

## c. Pricing FAQ

The FAQ is `pricingContent.straightAnswers.rows` in `src/content/pricing.ts`.
`StraightAnswersSection` maps that same array to question headings and answer
paragraphs. Both question and answer values are plain strings; answers are
rendered as text in `<p>` elements, not markup. The first answer is initially
expanded; the others are rendered in collapsed accordion panels. This shared
array is suitable as the single source if FAQ JSON-LD is approved.

## d. Forms, validation, honeypot, and current API behavior

### Audit form

`auditRequestSchema` in `src/schemas/audit.ts`:

| Field | Zod type and validation |
| --- | --- |
| `businessName` | String, trimmed, 2–100 characters. |
| `websiteOrInstagram` | String, trimmed, 2–200 characters; must match the schema’s accepted `none yet`, `@handle`, domain or URL pattern. |
| `city` | String, trimmed, at least 1 character; no maximum is set. |
| `businessType` | Enum: `Restaurant`, `Lounge or bar`, `Hotel`, `Restaurant group`, `Other`. |
| `email` | String, trimmed, non-empty, valid email. |
| `company_site` | Optional string; hidden honeypot. It is not a business-data field. |

`submitAuditRequest(values: AuditRequestValues):
Promise<AuditSubmissionResult>` currently waits 700 ms, generates a `BR-…`
reference, and stores non-honeypot submissions in
`bretosolution.audit-requests` in localStorage. It returns
`{ ok: true, ref: string }`; a filled honeypot returns the same shape without
storage. `AuditRequestForm` calls it. The form uses `ref` in the success state,
sets success/error states based on its result/throw, shows its generic error
copy on error, preserves values for retry, and disables the submit button while
pending.

### Quote form

`quoteRequestSchema` in `src/schemas/quote.ts`:

| Field | Zod type and validation |
| --- | --- |
| `businessType` | Required string refined to the audit business-type options. |
| `helpNeeded` | Required string refined to `AI Visibility Optimization`, `Website + AI Visibility`, `Visibility Growth Management`, or `Not sure yet`. |
| `mainChallenge` | Optional trimmed string, maximum 1,000 characters. |
| `contactName` | Required trimmed string, 2–100 characters. |
| `businessName` | Required trimmed string, 2–100 characters. |
| `email` | Required trimmed string, valid email. |
| `phoneOrWhatsapp` | Optional trimmed string, maximum 60 characters. |
| `websiteOrInstagram` | Optional trimmed string, maximum 200 characters. |
| `countryRegion` | Required string refined to `Nigeria` or `Another country`. |
| `company_site` | Optional string; hidden honeypot. It is not a business-data field. |

`submitQuoteRequest(values: QuoteRequestValues):
Promise<QuoteSubmissionResult>` currently waits 700 ms, generates a `QT-…`
reference, and stores non-honeypot submissions in
`bretosolution.quote-requests` in localStorage. It returns
`{ ok: true, ref: string }`; a filled honeypot returns the same shape without
storage. `QuoteRequestForm` calls it. The form uses `ref` in the success state,
sets success/error states based on its result/throw, shows its generic error
copy on error, preserves values for retry, and disables submit/back while
pending. Server field errors are not currently applied to form fields.

### Proposed response-shape bridge

The requested server routes return `{ ok: true, id }`, while the existing
components expect a `ref` string and display it as the reference. The API
helpers can preserve their exported `{ ok: true, ref }` result by mapping the
returned `id` to `ref`; that preserves UI behavior but changes the displayed
reference format from `BR-…`/`QT-…` to the database id.

## e. Proposed Prisma model and field mapping (approval required)

Proposed schema fields, derived from the validated form data and the required
request metadata:

```prisma
enum RequestStatus {
  NEW
  CONTACTED
  CLOSED
}

model AuditRequest {
  id                 String        @id @default(cuid())
  businessName       String
  websiteOrInstagram String
  city               String
  businessType       String
  email              String
  status             RequestStatus @default(NEW)
  createdAt          DateTime      @default(now())
  ipHash             String
  userAgent          String?
  notifiedAt         DateTime?
}

model QuoteRequest {
  id                 String        @id @default(cuid())
  businessType       String
  helpNeeded         String
  mainChallenge      String?
  contactName        String
  businessName       String
  email              String
  phoneOrWhatsapp    String?
  websiteOrInstagram String?
  countryRegion      String
  status             RequestStatus @default(NEW)
  createdAt          DateTime      @default(now())
  ipHash             String
  userAgent          String?
  notifiedAt         DateTime?
}

model RateLimitHit {
  id        String   @id @default(cuid())
  bucket    String
  ipHash    String
  createdAt DateTime @default(now())

  @@index([bucket, ipHash, createdAt])
}
```

Mapping: every non-honeypot `auditRequestSchema` business field maps by its
existing name to `AuditRequest`; every non-honeypot
`quoteRequestSchema` business field maps by its existing name to
`QuoteRequest`. Optional Zod fields (`mainChallenge`, `phoneOrWhatsapp`,
`websiteOrInstagram`) are nullable in the database. `company_site` is
deliberately excluded from both models. Required metadata maps as follows:
`id` is a cuid; `status` uses the listed enum/default; `createdAt` defaults to
now; `ipHash` stores only the salted hash; `userAgent` is limited to 200
characters by the route; `notifiedAt` is nullable. Rate-limit hits store only
the route bucket, hash and timestamp, with the required compound index.

`UNKNOWN: confirm whether `userAgent` should be nullable when the request
header is absent; the proposal uses `String?`.`

Repository state relevant to Phase 4: `npm ls prisma @prisma/client
@prisma/adapter-pg resend --depth=0` finds none installed. The pre-existing
untracked `prisma/schema.prisma` uses the Prisma 7 `prisma-client` generator,
and `prisma7.config.ts` is configured for only `DATABASE_URL`. A pre-existing
untracked `src/lib/prisma.ts` imports `@prisma/adapter-pg` and a generated
client, but neither dependency is declared/installed. The task’s dependency
allowlist does not include `@prisma/adapter-pg`.

`UNKNOWN: before Phase 4, verify the supported Prisma major and connection
configuration against that major’s official docs, including whether the
required PostgreSQL runtime can be implemented without adding a dependency
outside the explicit allowlist, and how `DIRECT_URL` is supported for
migrations. Do not treat the incomplete untracked setup as a working client.`

## f. Proposed metadata for approval

Titles below are the page title values before the planned ` | Bretosolution`
layout template. The complete rendered title, including the template suffix,
is at most 60 characters. Descriptions are copied from visible copy on the
corresponding page and are at most 155 characters.

| Page | Proposed title | Complete title length | Proposed description | Description length |
| --- | --- | ---: | --- | ---: |
| `/` | `AI Search Visibility` | 36 | `We help businesses improve their visibility across search engines and AI-powered platforms.` | 91 |
| `/solutions` | `How Guests Find and Choose a Restaurant` | 55 | `Search visibility, a website that converts, and the monthly work that keeps both improving. Each service stands alone and works better together.` | 144 |
| `/pricing` | `Request a Quote` | 31 | `Describe your restaurant and the problem you want solved. We reply with a scoped quote, not a generic package price.` | 116 |
| `/audit` | `Free AI Visibility Audit` | 40 | `Tell us about your business. We review each request, run the tests described on our site and reply by email with what we find.` | 126 |
| `/book-call` | `Book an Audit Call` | 34 | `Choose a time to talk about how your restaurant appears on Google and AI search, and where to start.` | 100 |

These are proposals, not approvals. The `/audit` and `/book-call` index
directives are specified by the task, with the user’s note that they may be
reversed.

## g. PORTING.md coverage and conflicts

- `PORTING.md` section 3 (“Replace the Mocks”) is still open. It describes
  localStorage mocks, reference codes, route creation, honeypots and rate
  limiting. The user’s requested route response is HTTP 201 with `{ ok: true,
  id }`, not the section’s HTTP 200 `{ ok: true, ref }`; the form helper bridge
  above is needed to preserve the present UI shape.
- `PORTING.md` section 3 also describes a Calendly webhook. This task
  explicitly says not to create that route, so the webhook remains out of
  scope.
- `PORTING.md` section 4 documents only Calendly environment variables. The
  requested database, rate-limit and Resend configuration is not yet
  documented in `.env.example`.
- The existing Migration result says the five App Router pages and theme/font
  migration are complete; SEO, real API persistence/notifications, Calendly,
  privacy and Terms remain open. This task covers SEO and the audit/quote
  APIs, but not a real Calendly URL/webhook or Privacy/Terms pages.
- The actual `PORTING.md` has sections 1–4 and “Migration result”; it has no
  sections 5 or 6. The Phase 6 instruction to mark sections 3, 4, 5 and 6
  therefore does not match the current document. `UNKNOWN: during Phase 6,
  update the actual sections and Migration result without inventing sections
  5/6, unless the user wants those sections added.`
- `.env.example` currently says no variables are read. `package.json` has no
  Prisma or Resend dependency and exposes `build`, `dev`, `start` and `lint`
  scripts; `npx tsc --noEmit` is available only if TypeScript is installed
  from the existing dependency tree.
- Current pre-existing worktree changes include `package.json`,
  `package-lock.json`, `src/content/pricing.ts`, and untracked Prisma/config
  files. They were read but not modified.
