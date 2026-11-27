# Admin dashboard and support inbox: inspection plan

Read-only inspection. No application code, dependency or configuration was
changed; this file is the only file written. Inspected on 2026-11-25 on branch
`email-templates` (`git status`: clean at session start).

**Citation format.** `path:line` refers to a file in this repository.
`types:N` means `node_modules/resend/dist/index.d.mts` line N. `impl:N` means
`node_modules/resend/dist/index.mjs` line N. `sw:N` means
`node_modules/standardwebhooks/dist/index.js` line N. `cmd:` is a command
that was run during this inspection. Items that could not be established from
the repository or a command are marked **UNKNOWN: \<how to check\>**.

---

## 0. Files inspected

- Root docs: `README.md`, `PORTING.md`, `EMAIL_PLAN.md`, `EMAIL_NOTES.md`,
  `FILE_STRUCTURE.md`, `CONSENT_PLAN.md`, `CONSENT_REPORT.md`, `LEGAL_PLAN.md`,
  `LEGAL_REPORT.md`, `LEGAL_PLACEHOLDERS.md`, `MIGRATION_PLAN.md`,
  `MIGRATION_LOG.md`, `SEO_API_PLAN.md`, `SEO_API_LOG.md` (cmd: `ls *.md`).
- There is no `docs/` directory, no `STAGE*_NOTES.md`, and no earlier
  `ADMIN_PLAN.md` (cmd: `ls docs`, `ls *.md`).
- Config: `package.json`, `package-lock.json`, `bun.lock`, `tsconfig.json`,
  `next.config.ts`, `postcss.config.mjs`, `prisma7.config.ts`, `.gitignore`,
  `.env.example`, plus variable **names only** from `.env` and `.env.local`
  (values were redacted with `sed` and never printed).
- `prisma/schema.prisma` and both migrations.
- Every file in `src/app`, `src/lib`, `src/schemas` and `src/emails`;
  `src/content/site.ts`, `src/content/emails.ts`, `src/content/legal.ts`
  (searched); `src/components/layout/Header.tsx`, every `src/components/ui/*`
  file and `src/components/forms/FormField.tsx`; `scripts/smoke-api.md`.
- `src/emails/reply` does not exist (cmd: `find src -type f`).
- `FILE_STRUCTURE.md` is out of date. It omits `src/app/api`, `src/emails`,
  `src/lib/server`, `privacy`/`terms` and other files that are now present
  (compare `FILE_STRUCTURE.md` with the tree below).

### Full `src` tree (cmd: `find src -type f | sort`)

```text
src/app/api/audit-requests/route.ts
src/app/api/dev/email-preview/route.ts
src/app/api/quote-requests/route.ts
src/app/audit/page.tsx
src/app/book-call/page.tsx
src/app/layout.tsx
src/app/page.tsx
src/app/pricing/page.tsx
src/app/privacy/page.tsx
src/app/robots.ts
src/app/sitemap.ts
src/app/solutions/page.tsx
src/app/terms/page.tsx
src/components/booking/CalendlyEmbed.tsx
src/components/forms/AuditRequestForm.tsx
src/components/forms/ConsentCheckbox.tsx
src/components/forms/FormField.tsx
src/components/forms/QuoteRequestForm.tsx
src/components/layout/Footer.tsx
src/components/layout/Header.tsx
src/components/legal/LegalDocument.tsx
src/components/sections/AuditProcess.tsx
src/components/sections/Hero.tsx
src/components/sections/HomeClosingCta.tsx
src/components/sections/Offers.tsx
src/components/sections/Principles.tsx
src/components/sections/ProblemSolution.tsx
src/components/sections/Proof.tsx
src/components/sections/Restaurants.tsx
src/components/sections/Services.tsx
src/components/sections/audit/AuditPageSection.tsx
src/components/sections/booking/BookCallSection.tsx
src/components/sections/pricing/PaymentWorksSection.tsx
src/components/sections/pricing/PricingClosingCta.tsx
src/components/sections/pricing/PricingGuidanceSection.tsx
src/components/sections/pricing/RequestQuoteSection.tsx
src/components/sections/pricing/SignedScopeSection.tsx
src/components/sections/pricing/StraightAnswersSection.tsx
src/components/sections/solutions/AcceptanceCriteriaSection.tsx
src/components/sections/solutions/AiSearchVisibilitySection.tsx
src/components/sections/solutions/OngoingGrowthSection.tsx
src/components/sections/solutions/SolutionsClosingCta.tsx
src/components/sections/solutions/SolutionsHero.tsx
src/components/sections/solutions/WebsiteDevelopmentSection.tsx
src/components/seo/JsonLd.tsx
src/components/ui/AppLink.tsx
src/components/ui/Button.tsx
src/components/ui/Container.tsx
src/components/ui/Eyebrow.tsx
src/components/ui/Section.tsx
src/components/ui/SectionHeading.tsx
src/content/assets.ts
src/content/audit.ts
src/content/bookCall.ts
src/content/emails.ts
src/content/home.ts
src/content/legal.ts
src/content/pricing.ts
src/content/seo.ts
src/content/site.ts
src/content/solutions.ts
src/emails/AuditConfirmation.tsx
src/emails/AuditRequestNotification.tsx
src/emails/QuoteConfirmation.tsx
src/emails/QuoteRequestNotification.tsx
src/emails/components/EmailLayout.tsx
src/emails/render.tsx
src/emails/tokens.ts
src/lib/api/audit.ts
src/lib/api/quote.ts
src/lib/api/submit.ts
src/lib/db.ts
src/lib/prisma.ts
src/lib/server/confirmationLimit.ts
src/lib/server/env.ts
src/lib/server/http.ts
src/lib/server/leadNotifications.ts
src/lib/server/notify.ts
src/lib/server/rateLimit.ts
src/lib/theme.ts
src/lib/utils.ts
src/schemas/audit.ts
src/schemas/honeypot.ts
src/schemas/quote.ts
src/styles/globals.css
src/views/AuditView.tsx
src/views/BookCallView.tsx
src/views/HomeView.tsx
src/views/PricingView.tsx
src/views/PrivacyView.tsx
src/views/SolutionsView.tsx
src/views/TermsView.tsx
```

There is no `src/state`, `src/proxy.ts`, `src/middleware.ts`, root
`proxy.ts`/`middleware.ts`, or any `admin` path (same command).

---

## 1. What exists today (section a)

### 1.1 Installed versions

| Package | Installed | Source |
| --- | --- | --- |
| next | 16.4.6 | `node_modules/next/package.json`; `package-lock.json:5887-5888` |
| react / react-dom | 19.3.1 | `node_modules/react/package.json`; `package-lock.json:6466-6467` |
| resend | 6.39.0 (pinned exactly) | `package.json` `"resend": "6.39.0"`; `package-lock.json:6564-6565` |
| prisma / @prisma/client | 6.19.3 (pinned exactly) | `package.json`; `package-lock.json:6364-6365`, `:1407-1408` |
| @react-email/components | 1.0.12 | cmd: `node -p require(...).version` |
| @react-email/render | 2.3.1 | same |
| zod | 4.6.7 | same |
| tailwindcss / @tailwindcss/postcss | 4.1.11 | same; `package.json` |
| typescript | 5.9.3 | same |
| next-auth, bcryptjs, bcrypt, @supabase/supabase-js, @tiptap/react | **not installed** | same command printed `NOT INSTALLED` |

Both `package-lock.json` and `bun.lock` exist. `README.md` documents bun.
`EMAIL_PLAN.md` and `PORTING.md` use npm. The two lockfiles can drift; see
Risk R14.

### 1.2 Routes and layouts

| Route | File | Notes |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | renders `HomeView` (`src/app/page.tsx:23-25`) |
| `/solutions`, `/pricing`, `/audit`, `/book-call`, `/privacy`, `/terms` | `src/app/<route>/page.tsx` | each exports static `metadata` and renders a `src/views/*View` |
| `POST /api/audit-requests` | `src/app/api/audit-requests/route.ts` | `runtime = 'nodejs'`, `force-dynamic` (`:22-23`) |
| `POST /api/quote-requests` | `src/app/api/quote-requests/route.ts` | same (`:22-23`) |
| `GET /api/dev/email-preview` | `src/app/api/dev/email-preview/route.ts` | 404 unless `NODE_ENV === 'development'` (`:52-54`) |
| `/robots.txt` | `src/app/robots.ts` | disallows only `/api/` for `*` (`:9-12`) |
| `/sitemap.xml` | `src/app/sitemap.ts` | 7 public pages (`:5-13`) |

There is **one layout**, `src/app/layout.tsx`. It renders `<JsonLd>`, the
skip link, `<Header />`, `<main id="main">` and `<Footer />` around every
route (`src/app/layout.tsx:149-162`). It sets default robots `index: true`
(`:46-54`). There are no route groups and no nested layouts (cmd:
`find src -type f`).

### 1.3 Theme system

- **Tokens.** Light tokens are on `:root` (`src/styles/globals.css:3-30`).
  Dark tokens are on `html.dark` (`src/styles/globals.css:33-50`). Token
  names: `--bg --alt --ink --muted --line --accent --btn --btnfg --btn2
  --pill --pillline --herotop --herobot --panel --panelhead --foot --shadow`.
  Font tokens are `--font-display --font-script --font-sans --font-mono`
  (`:27-30`).
- **localStorage key:** `breto-theme`. Change event: `breto-theme-change`
  (`src/lib/theme.ts:7-8`). The pre-paint script reads the same key and adds
  or removes `dark` on `<html>`, falling back to `prefers-color-scheme`
  (`src/app/layout.tsx:85-111`).
- **Hook:** `useTheme(): { theme, toggle }` with `useState` + `useEffect` +
  a `storage` listener (`src/lib/theme.ts:59-108`).
- **Toggle component.** There is no standalone component. The toggle is an
  inline `<button>` inside `Header` that uses `Moon`/`Sun` from
  `lucide-react` (`src/components/layout/Header.tsx:101-116`). Its labels are
  `site.header.switchToDarkLabel/LightLabel` (`src/content/site.ts:58-59`).
  An admin header must extract this button or duplicate it.

### 1.4 Fonts

`next/font/google` loads Inter (400/500/600), JetBrains Mono (400/500),
Playfair Display (500/600/700) and Satisfy (400), all with `display: 'swap'`.
Their CSS variables are `--font-*-next` (`src/app/layout.tsx:57-83`), mapped
to the tokens in `src/styles/globals.css:27-30`.

### 1.5 Existing UI components (reusable in admin)

- `AppLink`: `next/link` for internal links, `<a>` for external, `mailto:`,
  `tel:` and `#` (`src/components/ui/AppLink.tsx:9-26`).
- `Button`: variants `primary | secondary | small`, link or button
  (`src/components/ui/Button.tsx:9-73`).
- `Container`: max width 1200px (`src/components/ui/Container.tsx:8-20`).
- `Eyebrow`, `Section` (tones `bg | alt | foot`), `SectionHeading`
  (`src/components/ui/*.tsx`).
- `FormField`, plus the exported `formControlBaseClass` and
  `formTextareaBaseClass` (`src/components/forms/FormField.tsx:3-7`).
- `cn()` = `clsx` + `tailwind-merge` (`src/lib/utils.ts:4-6`).
- There are no table, tabs, dialog, toast, list or rich-text components (cmd:
  `find src -type f`).

### 1.6 Prisma models (`prisma/schema.prisma`)

- Generator `prisma-client-js` (`:6-8`). Datasource is PostgreSQL with `url`
  = `DATABASE_URL` and `directUrl` = `DIRECT_URL` (`:16-20`).
- `enum RequestStatus { NEW CONTACTED CLOSED }` (`:10-14`).
- `AuditRequest` (`:22-36`) and `QuoteRequest` (`:38-56`) are the lead
  records. Both have `status`, `createdAt`, `ipHash`, `userAgent`,
  `notifiedAt`, `consentAcceptedAt` and `consentVersion`. **Neither has an
  index on `email`**, but the confirmation limit queries by email
  (`src/lib/server/confirmationLimit.ts:10-17`).
- `RateLimitHit` (`:58-66`) has indexes `[bucket, ipHash, createdAt]` and
  `[createdAt]`.
- Migrations: `20261119184429_init_lead_requests` (creates all three tables
  and the enum) and `20261121171130_add_consent_columns`.
  `migration_lock.toml` provider is `postgresql`.
- `prisma7.config.ts` exists but is named for Prisma 7. Prisma 6.19.3 does
  not load it under that name (it looks for `prisma.config.ts`). The client
  takes its URL at runtime in `src/lib/db.ts:10-16`. **UNKNOWN:** whether
  anything invokes this file. To check, run `npx prisma --version` and look
  at which config file it reports.
- `PORTING.md` ("Still open") says the migrations have not been confirmed as
  deployed. **UNKNOWN:** the current database state. To check, run
  `npx prisma migrate status`.

### 1.7 Rate limiter (`src/lib/server/rateLimit.ts`)

- `recordRateLimitHit(request, bucket)`. The client IP comes from the first
  `x-forwarded-for` entry, then `x-real-ip`, then `'unknown'` (`:17-22`). It
  is hashed with SHA-256 using `RATE_LIMIT_SALT` (`:23-25`).
- Each call deletes all hits older than 24 hours (`:26-35`). Inside a
  transaction it takes `pg_advisory_xact_lock(hashtext(bucket),
  hashtext(ipHash))` (`:37-40`) and counts the hits in the past hour.
- **The limit is 10 per hour** (`:5-6`). `PORTING.md` §3(a) says "five
  requests per hour", and `scripts/smoke-api.md` expects the 6th request to
  return 429. These contradict the code (Risk R12).
- Both form routes fail open if the limiter throws
  (`src/app/api/audit-requests/route.ts:34-40`). The admin login should
  **fail closed** instead.

### 1.8 Resend helpers and email templates

- `getResendConfig()` returns `{ apiKey: RESEND_API_KEY, from:
  LEAD_FROM_EMAIL, to: LEAD_NOTIFY_EMAIL }` (`src/lib/server/env.ts:32-38`).
- `src/lib/server/notify.ts` creates a new `Resend` on every call and uses
  `resend.emails.send({ from, to, subject, replyTo, headers?, html, text })`
  (`:53-60`, `:99-109`). It never passes `react` (`EMAIL_PLAN.md`
  "Email rendering"). Results are `{ ok: true } | { ok: false, error }`
  (`:32-34`). Subjects are sanitised against CR/LF (`:36-38`).
- Confirmations set `replyTo: site.contactEmail` (= `hello@bretosolution.com`,
  `src/content/site.ts:16,40`) and add `List-Unsubscribe` (`notify.ts:103-106`).
  **Customer replies to confirmations therefore go to hello@.** That is the
  support inbox's main entry point.
- Owner notifications set `replyTo: values.email` (`notify.ts:57`, `:82`).
- `sendLeadNotifications` runs the owner notification and the confirmation
  together. The confirmation is skipped when more than 2 requests came from
  the same email in 24 hours (`src/lib/server/leadNotifications.ts:12-58`,
  `src/lib/server/confirmationLimit.ts:3-19`).
- `renderEmail(node, { includeUnsubscribeUrl? })` returns `{ html, text }`
  using `render` + `toPlainText` from `@react-email/render`
  (`src/emails/render.tsx:9-19`).
- `EmailLayout({ preheader, children, footer? })` uses a 600px container.
  It loads the logo from `${siteUrl}/brand/breto-logo-email.png` when
  `public/brand/breto-logo-email.png` exists, and falls back to the wordmark
  otherwise (`src/emails/components/EmailLayout.tsx:20-25`, `:83-172`).
  `EmailFooter` prints "You received this email because you submitted a
  request on bretosolution.com", an Unsubscribe link and the postal address
  (`:33-81`; copy in `src/content/emails.ts:29-36`).
- Templates: `AuditConfirmation`, `QuoteConfirmation`,
  `AuditRequestNotification`, `QuoteRequestNotification`
  (`src/emails/*.tsx`). Each exports `defaultProps` for previews.
- Colours: `emailColors` (`src/emails/tokens.ts:1-11`) holds fixed
  light-theme hex values.
- There is **no generic or reply template that accepts a free-form body**.
  The only body content is fixed copy from `src/content/emails.ts`. A support
  reply needs a new template (for example `src/emails/reply/SupportReply.tsx`)
  that wraps sanitised composer HTML in `EmailLayout`. `EmailFooter`'s "you
  submitted a request" line does not fit all support replies (Risk R9).

### 1.9 Environment variables

Read by code (cmd: grep of `process.env` across `src`):

| Variable | Read at |
| --- | --- |
| `DATABASE_URL` | `src/lib/server/env.ts:24-26` |
| `RATE_LIMIT_SALT` | `src/lib/server/env.ts:28-30` |
| `RESEND_API_KEY`, `LEAD_FROM_EMAIL`, `LEAD_NOTIFY_EMAIL` | `src/lib/server/env.ts:32-38` |
| `NEXT_PUBLIC_SITE_URL` | via `seoContent.siteUrl` (`EMAIL_NOTES.md` "Environment") |
| `NODE_ENV` | `src/app/api/dev/email-preview/route.ts:52` |
| `DIRECT_URL` | `prisma/schema.prisma:19` (CLI only) |

Listed in `.env.example`: only the seven above, excluding `NODE_ENV`.

Present in `.env` and `.env.local` but **not read by any code and not in
`.env.example`** (names only, cmd: `sed -E 's/=.*/=<redacted>/' .env`):
`RESEND_WEBHOOK_SECRET`, `ADMIN_INBOX_ADDRESS`, `NEXT_PUBLIC_SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`NEXTAUTH_URL`, `ADMIN_EMAIL`, `NEXTAUTH_SECRET`, `ADMIN_PASSWORD_HASH_B64`.

Defects seen in those files (Risk R13):

- In `.env`, `NEXTAUTH_SECRET`, `ADMIN_PASSWORD_HASH_B64` and the second
  `ADMIN_INBOX_ADDRESS` have a leading space.
- `ADMIN_INBOX_ADDRESS` appears twice in both `.env` and `.env.local`.
- There is no `NEXT_PUBLIC_SUPABASE_ANON_KEY`. That is relevant to browser
  uploads in §5.
- The password variable is `ADMIN_PASSWORD_HASH_B64`, a base64-encoded hash.
  That avoids `$` expansion in bcrypt strings, so code must base64-decode it
  before calling `bcrypt.compare`.
- `.env*` is git-ignored except `.env.example` (`.gitignore`). Only
  `.env.example` is tracked (cmd: `git ls-files | grep -i env`).

---

## 2. NextAuth v4 compatibility (section b)

cmd: `npm view next-auth@4 version peerDependencies` (last entries shown):

```text
next-auth@4.24.15 peerDependencies = {
  '@auth/core': '0.34.3',
  next: '^12.2.5 || ^13 || ^14 || ^15 || ^16',
  nodemailer: '^7.0.7',
  react: '^17.0.2 || ^18 || ^19',
  'react-dom': '^17.0.2 || ^18 || ^19'
}
```

- The `latest` dist-tag is `4.24.15` (cmd: `npm view next-auth dist-tags`).
- `@auth/core` and `nodemailer` are optional peers (cmd: `npm view
  next-auth@4.24.15 peerDependenciesMeta` → `{ optional: true }` for both).
- **Verdict:** installed Next.js 16.4.6 is inside `^16`, and React 19.3.1 is
  inside `^19`. next-auth 4.24.12 through 4.24.15 accept Next 16. Nothing was
  installed.
- **UNKNOWN:** whether `next-auth/middleware` (`withAuth`, the v4 helper
  written for `middleware.ts`) works unchanged as a `proxy.ts` export. To
  check, install it in a branch, add `export { default } from
  'next-auth/middleware'` plus a matcher in `src/proxy.ts`, run `next build`,
  then request `/admin` without a cookie. The fallback is to call `getToken()`
  from `next-auth/jwt` inside a hand-written `proxy()`.

---

## 3. Resend SDK capabilities in installed 6.39.0 (section c)

All of these exist in 6.39.0. **No upgrade is required.** All return
`Promise<Response<T>>`, where
`Response<T> = ({ data: T; error: null } | { error: ErrorResponse; data: null }) & { headers: Record<string,string> | null }`
(types:125-133). `ErrorResponse = { message; statusCode: number | null; name: RESEND_ERROR_CODE_KEY }`
(types:134-138). The SDK returns errors as values and does not throw for API
errors.

| Method | Exact signature | Source |
| --- | --- | --- |
| `emails.send` | `send(payload: CreateEmailOptions, requestOptions?: CreateEmailRequestOptions): Promise<CreateEmailResponse>` | types:2586 |
| `emails.get` | `get(id: string, requestOptions?: RequestOptions): Promise<GetEmailResponse>` | types:2588 |
| `emails.list` | `list(options?: ListEmailsOptions, requestOptions?: RequestOptions): Promise<ListEmailsResponse>` | types:2589 |
| `emails.receiving.list` | `list(options?: ListReceivingEmailsOptions, requestOptions?: RequestOptions): Promise<ListReceivingEmailsResponse>` | types:2573 |
| `emails.receiving.get` | `get(id: string, options?: GetReceivingEmailOptions, requestOptions?: RequestOptions): Promise<GetReceivingEmailResponse>` | types:2572 |
| `emails.receiving.attachments.get` | `get(options: GetAttachmentOptions, requestOptions?: RequestOptions): Promise<GetAttachmentResponse>` | types:2563 |
| `emails.receiving.attachments.list` | `list(options: ListAttachmentsOptions, requestOptions?: RequestOptions): Promise<ListAttachmentsResponse>` | types:2564 |

Details:

- **`CreateEmailOptions`**: `from`, `to` (max 50), `subject`, `cc?`, `bcc?`,
  `replyTo?`, `headers?: Record<string, string>`, `attachments?:
  Attachment[]` ("max 40mb per email"), `tags?`, `topicId?`, `scheduledAt?`,
  plus at least one of `react | html | text`, or a `template` (types:551-626).
- **`Attachment`**: `{ content?: string | Buffer | Uint8Array | ArrayBuffer; filename?; path?: string; contentType?; contentId? }`
  (types:633-647). `path` is a URL that Resend fetches, so bytes never pass
  through our function.
- **Idempotency key:** `CreateEmailRequestOptions extends PostOptions,
  IdempotentRequest` (types:627). `IdempotentRequest = { idempotencyKey?:
  string }`, sent as the `Idempotency-Key` header (types:179-186;
  impl:1823). Errors `invalid_idempotency_key`, `invalid_idempotent_request`
  and `concurrent_idempotent_requests` exist (types:124).
- **Send response:** `CreateEmailResponseSuccess = { id: string }` only
  (types:628-631).
- **`ListEmailsOptions` / `ListReceivingEmailsOptions`** = `PaginationOptions`
  = `{ limit?: 1-100 (default 20) } & ({ after?: string } | { before?: string })`
  (types:189-206, 1605, 1707).
- **`ListReceivingEmailsResponse`** is not wrapped in `Response<>`, so it has
  no `headers` field (types:1714-1720). This is cosmetic.
- **Batch send** cannot carry attachments (types:667-672).

---

## 4. Request-interception convention in Next 16.4.6 (section d)

- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/middleware.md:11`:
  "The `middleware.js` file convention has been **deprecated** in Next.js 16
  and renamed to `proxy.js`."
- `proxy.md:25`: "Create a `proxy.ts` … in the project root, or inside `src`
  if applicable, so that it is located at the same level as `pages` or
  `app`." This project uses `src/app`, so the file goes at **`src/proxy.ts`**.
- Export `export function proxy(request: NextRequest)` or a default export,
  plus an optional `export const config = { matcher: [...] }` (`proxy.md:34-39`,
  `:64`). Matchers must be static constants (`proxy.md:138`).
- Runtime: "Proxy defaults to using the Node.js runtime. The `runtime` config
  option is not available in Proxy files. Setting \[it\] will throw an error"
  (`proxy.md:255-257`).
- Constants: `MIDDLEWARE_FILENAME = 'middleware'` and
  `PROXY_FILENAME = 'proxy'` (`node_modules/next/dist/lib/constants.js:287,289`).
- `proxy.md:251-253` warns that Server Functions are POSTs to the page route,
  and that auth must be checked **inside each Server Function or route
  handler, not only in Proxy**. Every `/api/admin/*` handler and every Server
  Action must therefore call `getServerSession()` itself.
- When proxy is used, request bodies are buffered up to 10MB by default
  (`experimental.proxyClientMaxBodySize`;
  `.../next-config-js/proxyClientMaxBodySize.md:7-9`). Server Action bodies
  are limited to 1MB by default (`.../next-config-js/serverActions.md:61`).
  `next.config.ts` sets neither (`next.config.ts:3`).

---

## 5. Hosting (section e)

- No host config is in the repo. `vercel.json`, `netlify.toml`, `fly.toml`,
  `Dockerfile`, `render.yaml`, `railway.json`, `.vercel/`, `.netlify/` and
  `.github/` are all absent (cmd: `ls ...` → "No such file or directory").
- **The privacy policy names the host as GoDaddy:** "The website hosting
  provider is godaddy" (`src/content/legal.ts:53`). The database host is
  Supabase and the Resend region is US (same line).
- Vercel limit (stated in the request, not verifiable from the repo): a
  function request body is about 4.5 MB, so PDFs must upload from the browser
  straight to storage. That design is also correct for any host, because
  Server Actions cap at 1MB by default (§4).
- **UNKNOWN:** the actual production host and whether it runs a Node.js
  Next.js server (route handlers, `proxy.ts`, Prisma). To check, look at the
  DNS A/CNAME target for the site and the deploy method actually used.
  Ordinary GoDaddy shared hosting cannot run Next.js route handlers. If the
  site really is on GoDaddy, the existing form APIs are also affected.
- Direct-to-storage upload plan: the server (an admin-authenticated route)
  calls Supabase Storage `createSignedUploadUrl(path)` with the service-role
  key. The browser then uploads to that signed URL. **UNKNOWN:** whether the
  browser-side `uploadToSignedUrl` needs the anon key, given that
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` is not set. To check, read
  `@supabase/storage-js` types after installing `@supabase/supabase-js`
  (2.119.2 is latest per cmd: `npm view @supabase/supabase-js version`), or
  PUT to the signed URL with `fetch` and no SDK.

---

## 6. Support system

Goal: the Emails tab becomes a customer-support inbox. Conversations are
grouped by customer and thread. Each has a read/unread/resolved status.
Replies go out from `hello@bretosolution.com` in the branded templates.
Customer attachments are stored and displayed.

### 6.1 `webhooks.verify`

- **Signature:** `verify(payload: VerifyWebhookOptions): WebhookEventPayload`
  (types:3597). It is **synchronous** and makes no network call.
- **Inputs:** `VerifyWebhookOptions = { payload: string; headers: { id:
  string; timestamp: string; signature: string }; webhookSecret: string }`
  (types:3577-3586). The implementation maps these to `webhook-id`,
  `webhook-timestamp` and `webhook-signature` and calls
  `new Webhook(webhookSecret).verify(payload, …)` from `standardwebhooks`
  1.1.1 (impl:1674-1680; `node_modules/standardwebhooks/package.json`).
  The route must read the raw body with `await request.text()` before any
  JSON parse, and read the three `webhook-*` request headers.
- **Return:** the parsed JSON body typed as `WebhookEventPayload`, a union of
  37 event types (types:3422). It returns `undefined` if the body is an empty
  string (sw:66-69), which the declared return type does not reflect.
- **Error behaviour** (all thrown, never returned):
  - `Error("Expected secret to be of type string")` or
    `Error("Secret can't be empty.")` when the secret is bad. A `whsec_`
    prefix is stripped and the rest base64-decoded (sw:34-46).
  - `WebhookVerificationError("Missing required headers")` (sw:56-58).
  - `"Invalid Signature Headers"` when the timestamp is not a number (sw:103-104).
  - `"Message timestamp too old"` / `"too new"` outside **±5 minutes**
    (sw:7, 106-110).
  - `"No matching signature found"` (sw:83).
  - `JSON.parse` errors on a malformed body.
  - Comparison is constant-time (sw:73).
  - `WebhookVerificationError` is **not re-exported by `resend`** (the
    `export {}` at impl:1877 lists only constants and `Resend`). Catch
    everything and return 400/401.
- **Idempotency:** retries reuse the same `webhook-id`. Store it with a
  unique constraint and skip duplicates. The id is also the dedupe key
  recommended by `standardwebhooks`.
- **Relevant events** (types:3085): `email.received` with
  `ReceivedEmailEventData = { email_id, created_at, from, to[], bcc[], cc[],
  received_for[], message_id, subject, attachments: { id, filename | null,
  content_type, content_disposition | null, content_id | null }[] }`
  (types:3115-3133). This payload carries **no body and no headers**, so the
  handler must call `emails.receiving.get(email_id)`.
- `email.sent`, `email.delivered`, `email.bounced` and others carry
  `BaseEmailEventData`, which **includes `message_id`** (types:3086-3096 region;
  `BaseEmailEventData` fields `email_id, message_id, from, to, subject`).
- Inbox events: `inbox.email.received`, `inbox.email.sent` and
  `inbox.thread.*` carry `inbox_id`, `thread_id`, `email_id` and an optional
  `email` (`InboxMessage` without html/text) (types:3186-3203).
- `RESEND_WEBHOOK_SECRET` is already set in `.env` but unused (§1.9).

### 6.2 `emails.receiving.list` / `emails.receiving.get`

- Signatures: §3. `get` hits `GET /emails/receiving/{id}[?html_format=…]`
  (impl:846-851).
- `GetReceivingEmailResponseSuccess` (types:1674-1694):

  ```ts
  {
    object: 'email'; id: string; to: string[]; from: string; created_at: string;
    subject: string; bcc: string[] | null; cc: string[] | null;
    reply_to: string[] | null; received_for: string[];
    html: string | null; text: string | null;
    headers: Record<string, string> | null;
    message_id: string;
    raw?: { download_url: string; expires_at: string } | null;
    attachments: InboundAttachment[];   // { id, filename|null, size, content_type, content_id|null, content_disposition|null }
  }
  ```

- **HTML and text bodies are returned** (`html`, `text`, both nullable).
  Inline images default to `data:` URIs inside `html`. Pass
  `{ html_format: 'cid' }` to keep `cid:` references (types:1696-1704).
- **Reply-To is returned** as the typed field `reply_to`.
- **Message-ID is returned** as the typed field `message_id`.
- **Raw headers are returned as `headers: Record<string, string> | null`.**
  The type does not list keys. **UNKNOWN:** whether `In-Reply-To`,
  `References` and `Auto-Submitted` are present, their key casing, and how
  repeated headers are combined into one string value. To check, send a
  reply from Gmail to a message from hello@, then log
  `Object.keys(data.headers)` from `emails.receiving.get(id)`.
- **Reliable fallback for headers:** `raw.download_url` is the full RFC 822
  message (types:1689-1692). The SDK already downloads it with `fetch` and
  parses it with `postal-mime` 2.7.6, a direct dependency of `resend`
  (impl:893-905, 948-976; `node_modules/resend/package.json` dependencies).
  `PostalMime.parse()` exposes `inReplyTo`, `references` and the full header
  list. Using it directly means adding `postal-mime` as a direct dependency.
- `list` items omit `html`, `text`, `headers`, `raw` and `object`
  (`ListReceivingEmail`, types:1708). That is fine for an index view, but
  not for threading.
- **UNKNOWN:** how long Resend keeps received emails, and so whether "read
  live" stays viewable indefinitely. To check, look at Resend's receiving docs
  or plan limits. This is why §6.6 recommends persisting inbound mail.

### 6.3 Downloading a received attachment

- Method: `resend.emails.receiving.attachments.get({ emailId, id })`
  (types:2563, 1467-1470) → `GET /emails/receiving/{emailId}/attachments/{id}`
  (impl:831). Use `attachments.list({ emailId, limit?, after? })` for all of
  them (types:2564, 1477-1485; impl:835).
- It returns **a temporary download URL, not bytes**:
  `{ object: 'attachment', id, filename?, size, content_type,
  content_disposition: 'inline' | 'attachment', content_id?, download_url,
  expires_at }` (types:21-30, 1471-1474). The comment at types:11-20 calls
  these "signed-URL endpoints".
- **Expiry:** given as the string `expires_at`. The duration is not in the
  types. **UNKNOWN:** the TTL. To check, compare `expires_at` with the request
  time on one real call.
- To store the file: a server-side `fetch(download_url)` returns the bytes,
  which are then uploaded to the private Supabase bucket. This is an outbound
  fetch, so the 4.5 MB inbound request-body limit does not apply. Function
  memory and duration do apply (Risk R6).

### 6.4 `emails.send`: custom headers, idempotency, Message-ID

- **Custom headers:** accepted as `headers?: Record<string, string>`
  (types:576-581). The type does not restrict names.
  **UNKNOWN:** whether `POST /emails` honours a caller-supplied
  `In-Reply-To` and `References` (rather than rejecting or overwriting them).
  The only explicit rule is on the *inbox* endpoints: "The `In-Reply-To`,
  `References` and `Reply-To` headers are set by Resend and cannot be set
  here. Sending one … returns a 422" (types:1971-1972, 2146-2147,
  2239-2240). That rule does not cover `emails.send`. To check, send a test
  with both headers to a Gmail address you own, open **Show original**, and
  confirm the headers are present and the message threads.
- **Idempotency key:** yes, as the second argument:
  `resend.emails.send(payload, { idempotencyKey })` (types:627, 179-186;
  impl:1823).
- **Message-ID of the sent email:**
  - The send response does **not** include it; it returns `{ id }` only
    (types:628-631).
  - `emails.get(id)` returns `message_id: string` (types:1502).
  - The `email.sent` / `email.delivered` webhooks carry `message_id` in
    `BaseEmailEventData`.
  - **UNKNOWN:** whether that value is the literal RFC 5322 `Message-ID`
    header, with or without `<>`, and whether it is populated while the
    email is still `queued`. To check, call `emails.get(id)` right after
    sending and again after `email.delivered`, then compare with the
    `Message-ID` shown in Gmail **Show original**.
- If 6.4 turns out to be unworkable, the alternative is
  `inboxes.threads.emails.reply` (§6.5), where Resend sets the threading
  headers itself.

### 6.5 Inboxes and threads API (exists in 6.39.0)

`resend.inboxes` is a top-level resource (types:3625). It was earlier
published under the `preview-inboxes` dist-tag (cmd: `npm view resend
dist-tags` shows `preview-inboxes: '6.32.1-preview-inboxes.6'`; `latest:
'6.39.0'`).

| Method | Signature (types line) |
| --- | --- |
| `inboxes.create/list/get/update/remove` | `get(idOrEmail: string, …): Promise<GetInboxResponse>` etc. (2678-2682). `Inbox` includes `unread: number` (1826-1835) |
| `inboxes.threads.list` | `list(options: ListInboxThreadsOptions, …)`. Options: `InboxSelector & { folders?: ('inbox'\|'archive'\|'spam'\|'sent'\|'trash')[]; labels?: string[]; read?: boolean } & PaginationOptions` (2663, 2186-2190) |
| `inboxes.threads.search` | `query`, `from[]`, `to[]`, `hasAttachment`, `startDate`, `endDate` (2664, 2253-2262) |
| `inboxes.threads.get` | returns `InboxThreadSummary { id, subject, folder, labels, read }` (2665, 2085-2092) |
| `inboxes.threads.update` | **updates the read flag**: `InboxSelector & { threadId } & RequireAtLeastOne<{ read?: boolean; folder?: 'inbox'\|'archive'\|'spam'\|'trash' }>` (2666, 2282-2287) |
| `inboxes.threads.remove` | (2667) |
| `inboxes.threads.emails.list/get` | `InboxMessage { id, direction: 'inbound'\|'outbound', from, to, cc, bcc, reply_to, subject, message_id, html, text, attachments: {id, filename, size}[], read, received_at }` (2642-2643, 2098-2113) |
| `inboxes.threads.emails.reply` | `{ threadId, emailId, html?/text?, cc?, bcc?, subject?, replyAll?, attachments?: Attachment[] (≤10 files, ≤25 MB content), headers? }` + `{ idempotencyKey }`; Resend sets `In-Reply-To`/`References`/`Reply-To` (2644, 2218-2250) |
| `inboxes.threads.emails.forward` | (2645, 2125-2157) |
| `inboxes.threads.labels.add/set/remove`, `inboxes.labels.*`, `inboxes.drafts.*` (create/get/list/update/remove/send), `inboxes.agent.get/update` | (2629-2655, 2617-2626, 2609-2614) |

`InboxThread` (list item) has `read: boolean`, `email_count`,
`has_attachment`, `has_draft`, `received_at` and `folder` (types:2070-2084).
`InboxSelector` is `{ inboxId }` or `{ emailAddress }` (types:1817-1825).

Per instruction, the plan uses `thread_id` **only as an optional hint**. The
local database stays the source of truth for status (unread/read/resolved).

**UNKNOWN:**
- Whether the account has Inboxes enabled. To check, call
  `resend.inboxes.list()` with the real key.
- Whether `hello@bretosolution.com` is, or can be, a Resend inbox.
- Whether a domain can use both "receiving" and "inboxes" at once.
- What `ADMIN_INBOX_ADDRESS` (already in `.env`) is meant to hold. Ask the
  owner.

### 6.6 How the support design fits these facts (evaluation, not built)

1. **Ingest.** `POST /api/webhooks/resend` (Node runtime, `force-dynamic`):
   1. Read the raw text and verify it (§6.1).
   2. Dedupe on `webhook-id`.
   3. On `email.received`, call `emails.receiving.get(email_id)`, and parse
      `raw` with `postal-mime` if the headers are incomplete.
   4. Copy each attachment through `attachments.get` → `download_url` →
      Supabase private bucket.
   5. Insert a `SupportMessage` row.

   Persisting the message is required, because Resend attachment URLs expire
   (§6.3) and Resend's retention is UNKNOWN (§6.2). That is a change to the
   original "received mail read live" idea (Risk R4).
2. **Loop and noise guard.** Skip or flag inbound mail with
   `Auto-Submitted` ≠ `no`, `Precedence: bulk|auto_reply`, or a `List-Id`
   header, and anything `from` our own domain. Owner notifications go to
   `LEAD_NOTIFY_EMAIL`. **UNKNOWN:** whether that equals hello@. To check,
   compare the two values locally. If they match, every lead notification
   lands in the support inbox (Risk R8).
3. **Threading key, in priority order:**
   1. `In-Reply-To` / `References` matched against stored `messageId`s of
      both our sent and received messages.
   2. Resend `thread_id` (when using inboxes) as a hint.
   3. Normalised subject (strip `Re:`/`Fwd:`) plus the customer address,
      within N days.
   4. Otherwise a new conversation.

   The customer key is the lower-cased `from` address (or `reply_to[0]`).
   It links optionally to `AuditRequest`/`QuoteRequest` by email.
4. **Reply.** Render the new `SupportReply` template through the existing
   `renderEmail`. Then call `emails.send({ from: 'Bretosolution
   <hello@bretosolution.com>', to, subject: 'Re: …', html, text, headers: {
   'In-Reply-To', 'References' }, attachments: [{ path: <short-lived Supabase
   signed URL>, filename }] }, { idempotencyKey: <AdminEmail id> })`.
   Record `id`, then fill `messageId` from the `email.sent` webhook or
   `emails.get`. If the 6.4 UNKNOWN fails, switch to
   `inboxes.threads.emails.reply`.
5. **Proposed tables** (names only; to be finalised in the build phase):
   - `SupportConversation` (customerEmail, subject, status `OPEN | RESOLVED`,
     unreadCount, lastMessageAt, resendThreadId?)
   - `SupportMessage` (direction, resendEmailId @unique, messageId @unique?,
     inReplyTo, references, from, to[], cc[], subject, html (sanitised),
     text, receivedAt, readAt?)
   - `SupportAttachment` (messageId FK, storagePath, filename, contentType,
     size, contentId?)
   - `WebhookEvent` (webhookId @unique, type, receivedAt)

   The originally planned `AdminEmail` (drafts + sent) becomes the outbound
   side of `SupportMessage` plus a draft flag, or stays separate for
   non-reply mail. Decide in the build phase.
6. **Display of untrusted HTML.** Inbound `html` must be sanitised and shown
   in a sandboxed `<iframe srcdoc sandbox>`. Never inject it into the admin
   DOM. Default `html_format` produces `data:` images, which work inside
   `srcdoc`.

---

## 7. Evaluation of the rest of the target architecture

| Component | Fit with codebase | Source |
| --- | --- | --- |
| `/admin`, `/admin/login` | The root layout wraps every route in the marketing `Header`/`Footer`/JSON-LD and `index: true`. Admin needs a route-group split, e.g. `src/app/(site)/layout.tsx` holding Header/Footer, with the root layout keeping only `<html>`, fonts and the theme script. URLs are unchanged. Add `robots: { index: false }` to the admin metadata, and `/admin` to `robots.ts` disallow | `src/app/layout.tsx:46-54,149-162`; `src/app/robots.ts:9-12` |
| NextAuth v4 credentials + Google, JWT | Compatible (§2). Credentials requires a JWT session. Restrict Google in the `signIn` callback to `ADMIN_EMAIL` with `email_verified`. Rate-limit credentials attempts with the existing `recordRateLimitHit` (bucket `admin-login`), failing **closed** | §2; `src/lib/server/rateLimit.ts` |
| bcrypt hash from env | The env var is `ADMIN_PASSWORD_HASH_B64`, so decode base64 first. `bcryptjs` 3.0.3 is latest (cmd: `npm view bcryptjs version`); it is pure JS with no native build | §1.9 |
| Domain store in `src/state` with `useSyncExternalStore` | React 19.3.1 provides it. No existing global store exists. `useTheme` uses `useState` + events, so the patterns differ but do not conflict. The store must be created per `DomainProvider` instance (not module-global) so it is never shared across server requests | `src/lib/theme.ts:59-108` |
| Private Supabase Storage bucket | Env vars present. SDK not installed. Browser → signed upload URL. Outbound mail attaches via `path` = short-lived signed URL | §1.9, §3, §5 |
| Tiptap composer | Not installed. `@tiptap/react` 3.35.0 peers accept React 19 (cmd: `npm view @tiptap/react version peerDependencies`). Must be a `'use client'` leaf. Output HTML must be sanitised server-side before render and send | cmd output |
| Emails in existing branded templates | `EmailLayout` + `renderEmail` are reusable. A new body-accepting template is needed. `EmailFooter` copy is lead-specific | §1.8 |

---

## 8. Risks and conflicts (section f)

- **R1. Host mismatch.** The privacy policy says GoDaddy
  (`src/content/legal.ts:53`), while the request assumes Vercel limits.
  `proxy.ts`, NextAuth and webhooks all need a Node server (§4, §5).
  UNKNOWN until the host is confirmed.
- **R2. Privacy policy becomes false.** It says the app uses no cookies
  (`src/content/legal.ts:34`, `:97`). NextAuth sets session and CSRF cookies.
  It also lists only lead data in Postgres, sent via Resend (`:52`). Support
  mail bodies and attachments in Supabase Storage are not disclosed. Retention
  copy is already contradictory: "kept for 48 hours" versus "no deletion
  rule" (`:70`). A `LEGAL_VERSION` bump (`:1`) and a copy update are needed.
- **R3. MX records.** Receiving hello@ through Resend requires Resend MX on
  the receiving domain (`ReceivingRecord`, types:74-82). If hello@ is
  currently hosted by another mailbox provider, changing MX moves all mail
  for that address. **UNKNOWN:** run `nslookup -type=mx bretosolution.com`
  locally, and check the Resend dashboard for domain `capabilities.receiving`
  (types:44-47).
- **R4. "Read received mail live" versus "attachments stored".** Resend
  attachment URLs expire (`expires_at`, types:29) and retention is UNKNOWN.
  Inbound mail and attachments must be persisted at webhook time. This
  changes the original plan item.
- **R5. Threading headers on `emails.send` are unverified** (§6.4 UNKNOWN).
  If Resend drops them, replies will not thread in Gmail or Outlook, and the
  inbox API reply path becomes the fallback.
- **R6. Attachment sizes.**
  - Outbound: `emails.send` allows 40 MB (types:553); inbox reply allows
    25 MB of content and at most 10 files (types:2230-2232).
  - Inbound copy to storage runs inside the webhook function. Large files
    risk timeouts.
  - Webhooks retry, so the copy must be idempotent (upsert by
    `resendEmailId` + attachment `id`).
- **R7. Root layout leaks into admin** (§7): marketing header and footer,
  JSON-LD, and `index: true`.
- **R8. Notification loop or noise.** Owner notifications are sent to
  `LEAD_NOTIFY_EMAIL` with `replyTo` = the lead (`notify.ts:55-57`). If that
  address is hello@, they enter the support inbox. Inbound auto-replies (out
  of office) to our confirmations also arrive there. Filter by
  `Auto-Submitted` (§6.6). We do not currently set `Auto-Submitted:
  auto-generated` on confirmations (`notify.ts:104-106`).
- **R9. The footer copy is wrong for support replies.** "You received this
  email because you submitted a request" (`src/content/emails.ts:30-31`) may
  be untrue for a customer who wrote in directly. It also adds a
  marketing-style Unsubscribe link.
- **R10. Untrusted HTML (XSS).** This applies to inbound `html` and to
  Tiptap output. A sanitiser library (not installed) and a sandboxed
  `iframe` are needed.
- **R11. Auth only in proxy is insufficient** (`proxy.md:251-253`). Each
  admin route handler and Server Action must re-check the session.
  `next-auth/middleware` compatibility with `proxy.ts` is UNKNOWN (§2).
- **R12. Docs and code disagree on the rate limit.** The code allows 10 per
  hour (`src/lib/server/rateLimit.ts:5`). `PORTING.md` §3(a) and
  `scripts/smoke-api.md` say 5.
- **R13. Env file hygiene** (§1.9): leading spaces, a duplicate
  `ADMIN_INBOX_ADDRESS`, admin variables missing from `.env.example`, no
  Supabase anon key. **UNKNOWN:** whether `@next/env` trims the leading
  spaces. To check, run `node -e "require('@next/env').loadEnvConfig(process.cwd()); console.log(typeof process.env.NEXTAUTH_SECRET)"`.
- **R14. Two lockfiles** (`package-lock.json`, `bun.lock`). Adding
  next-auth, Supabase, Tiptap and bcryptjs with only one tool lets the other
  lockfile go stale.
- **R15. Prisma state.** Migrations may not be deployed (`PORTING.md` "Still
  open"). New support tables add a third migration on top. There is no
  `email` index on the lead tables, but support linkage will query by email
  (`prisma/schema.prisma:22-56`).
- **R16. Webhook route versus `robots.ts`.** `/api/` is already disallowed
  for `*` (`robots.ts:11`), so that is fine. The webhook route must **not**
  go through `readJsonBody`, because it enforces a 20 KB limit and parses
  JSON (`src/lib/server/http.ts:4`, `:51-129`), while verification needs
  the raw text.
- **R17. `Resend` is created on every call** (`notify.ts:45`, `:70`, …). A
  shared server-only factory is better once admin, webhooks and support all
  use it. This is not a blocker.
- **R18. The Inboxes API is newer.** It was previously behind the
  `preview-inboxes` tag. Account availability is UNKNOWN (§6.5). Depending
  on it for core status would couple the inbox to a recently promoted API,
  which is why the local DB stays the source of truth.

---

## 9. Open UNKNOWNs (checklist)

| # | Unknown | How to check |
| --- | --- | --- |
| U1 | Production host; Node server available? | DNS target of the site; deploy method (§5) |
| U2 | `next-auth/middleware` as `src/proxy.ts` default export | Branch install + `next build` + request `/admin` (§2) |
| U3 | Received `headers` keys (In-Reply-To, References, Auto-Submitted), casing, multi-value handling | `emails.receiving.get` on a real reply; log keys (§6.2) |
| U4 | Resend received-mail retention | Resend receiving docs or plan (§6.2) |
| U5 | Attachment `download_url` TTL | Compare `expires_at` to request time (§6.3) |
| U6 | `emails.send` honours custom `In-Reply-To`/`References` | Test send + Gmail **Show original** (§6.4) |
| U7 | `message_id` format and when it is populated | `emails.get` before and after delivery; compare with the real header (§6.4) |
| U8 | Inboxes enabled; hello@ as inbox; meaning of `ADMIN_INBOX_ADDRESS` | `resend.inboxes.list()`; ask the owner (§6.5) |
| U9 | Current MX for the receiving domain | `nslookup -type=mx bretosolution.com` (R3) |
| U10 | `LEAD_NOTIFY_EMAIL` equals hello@? | Compare local env values (R8) |
| U11 | Supabase signed-upload from browser without anon key | `@supabase/storage-js` types after install (§5) |
| U12 | `@next/env` handling of leading-space keys | Command in R13 |
| U13 | Database migration status | `npx prisma migrate status` (§1.6) |
| U14 | Whether `prisma7.config.ts` is used | `npx prisma --version` (§1.6) |

**Minimum resend version:** not applicable. Everything required in §3 and
§6.1–6.4 exists in the installed 6.39.0 (citations above). No upgrade was
made.
