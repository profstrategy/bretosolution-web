# Admin stage 4 notes: data layer and API

Status: **Done.** The owner added `src/emails/reply` and answered the open
questions (see the two decision sections below and "Outcome" at the end).

## Owner decisions (2026-11-25)

1. **Conflict 1 (templates): option B.** The owner will provide the
   `src/emails/reply` templates or copy. Stage 4 resumes after that.
2. **Conflict 2 (inbox filter): option A.** Fetch a page of 20, then keep
   only items whose `to` or `received_for` contains `ADMIN_INBOX_ADDRESS`
   (case-insensitive).
3. **Conflict 3 (Supabase URL): option A.** Read `SUPABASE_URL`, falling
   back to `NEXT_PUBLIC_SUPABASE_URL`. Add `SUPABASE_URL` to `.env.example`.

The non-blocking contract changes listed below remain the plan for the
resumed run.

Inspected on 2026-11-25 on branch `admin-dashboard` (HEAD `92f3424`, clean).
Read: `README.md`, `PORTING.md`, `ADMIN_PLAN.md`, `STAGE1_NOTES.md`,
`STAGE2_NOTES.md`, `STAGE3_NOTES.md`, `STAGE_S1_NOTES.md`, `prisma/`,
`src/lib/server/*`, `src/emails/**`, `src/lib/auth/*`, `src/state/*`,
`src/lib/admin/apiClient.ts`, and the Resend types (`ADMIN_PLAN.md` §3 and
§6 cite `node_modules/resend/dist/index.d.mts` line by line).

## Resend version

`ADMIN_PLAN.md` §3 confirms that `emails.receiving.list/get` and
`emails.receiving.attachments.get/list` exist in the installed **6.39.0**
(`index.d.mts:2563-2573`). **No upgrade.** `emails.send` accepts
`idempotencyKey` (`:627`, `:179-186`) and custom `headers` (`:581`).
`emails.get` returns `last_event` (`:1503`).

## CONFLICT 1 (blocking): `src/emails/reply` does not exist

Item 4 says to "reuse src/emails/reply: ReplyLayout, parts, tokens, copy;
add a GeneralReply template and let **all three** templates accept sanitised
`bodyHtml` instead of plain paragraphs". That implies existing Audit and
Quote reply templates with fixed paragraph copy.

- `src/emails/` contains only `AuditConfirmation`, `QuoteConfirmation`,
  `AuditRequestNotification`, `QuoteRequestNotification`,
  `components/EmailLayout.tsx`, `render.tsx` and `tokens.ts` (cmd:
  `ls -R src/emails`).
- No file under `src/emails/reply` exists on any branch or in any commit
  (cmd: `git log --all -- 'src/emails/reply*'` returns nothing). Commit
  `360535a` "design email templates for automated audit and quote email"
  only added `public/brand/breto-logo-email.png` and changed
  `rateLimit.ts`.
- There is no reply copy in `src/content/emails.ts`.

There is nothing to reuse. Building it means designing two new customer-facing
templates (audit delivery, quote) and their fixed copy: greeting, sign-off,
what the attachment or table is called, the Calendly button label. That copy
is the business's voice and should not be invented.

Options:
- **A.** I create `src/emails/reply` on top of the existing `EmailLayout`
  and `emailColors`. Each template contains only the admin's sanitised
  `bodyHtml` plus kind-specific blocks: AUDIT gets an "Attached: <file>"
  line, QUOTE gets the rows table, and QUOTE/GENERAL get a Calendly button.
  The only fixed copy would be short labels that you approve, proposed
  below.
- **B.** You provide the reply templates or copy first, and I wire them up.

Proposed labels for option A (`src/content/emails.ts`, `replyCopy`):

| Key | Proposed text |
| --- | --- |
| `calendlyButton` | "Book a call" |
| `attachmentNotice` | "Attached: {filename}" |
| `quoteRowsHeading` | "Quote summary" |
| footer | Reuse `EmailFooter`, but its line "You received this email because you submitted a request on bretosolution.com" (`src/content/emails.ts:30-31`) is not true for a GENERAL email to someone who never submitted a form (`ADMIN_PLAN.md` R9). Proposed footer for replies: "You received this email because you are in contact with Bretosolution." plus the unsubscribe link and postal address |

## CONFLICT 2: `receiving.list` has no `to` filter

Item 5 asks for `resend.emails.receiving.list({ to: [ADMIN_INBOX_ADDRESS], limit: 20, after })`.
The installed type is `ListReceivingEmailsOptions = PaginationOptions`, that
is only `{ limit?, after? | before? }` (`index.d.mts:189-206`, `:1707`).
There is no `to`. Passing it would be a TypeScript error, and the API would
not filter.

Options:
- **A (proposed).** Call `list({ limit: 20, after })`, then keep only the
  items whose `to` or `received_for` (both on `ListReceivingEmail`,
  `:1677`, `:1684`) contain `ADMIN_INBOX_ADDRESS`, case-insensitively.
  `nextCursor` is the last raw item's id when `has_more`, so a page may hold
  fewer than 20 items, or none.
- **B.** No filter: list all received mail for the account.

## CONFLICT 3: Supabase URL variable name

Item 3 says `SUPABASE_URL`. The env files define `NEXT_PUBLIC_SUPABASE_URL`
(and `SUPABASE_SERVICE_ROLE_KEY`), but no `SUPABASE_URL` (cmd:
`sed -E 's/=.*/=<redacted>/' .env`). As written, storage would fail at
runtime.

Options:
- **A (proposed).** Read `SUPABASE_URL`, falling back to
  `NEXT_PUBLIC_SUPABASE_URL`. The URL is public, while the service role key
  stays server-only. Add `SUPABASE_URL` to `.env.example`.
- **B.** Read only `SUPABASE_URL`. You add it to the env files.

## Non-blocking: contract changes to Stage 1 (I will apply these)

Item 5 differs from the client contract written in Stage 1
(`src/lib/admin/apiClient.ts` header comment and `src/state/domain.state.ts`).
The server follows this prompt, and I will update the client, the DTOs and
the Stage 1 tests to match:

| Stage 1 | Stage 4 prompt | Change |
| --- | --- | --- |
| `upload-url` → `{ uploadUrl, storagePath }` | `{ path, signedUrl, token }` | client and type guard |
| `preview` → `{ html, text }` | `{ html }` | client type |
| `GET /api/admin/inbox?cursor=` | `?after=` | client query name |
| `InboxMessageDTO` without `hasRemoteImages` | adds `hasRemoteImages` | add `hasRemoteImages: boolean`. `getInboxMessage(id, { images })` sends `?images=1` |
| `DraftInput` without reply threading | `inReplyToMessageId` column | add optional `inReplyToMessageId: string \| null` |
| `recipientName`, `businessName`: `string` | Prisma `String?` | DTO keeps `string`. Server maps `null` to `''` |
| `attachment: { name, size } \| null` | `attachmentPath/Name/Size` | DTO keeps `{ name, size }`. The path is never sent to the client |
| `rows: { label, value }[]` | `rows Json?` | Validated with zod on read; invalid or `null` becomes `[]` |

Other decisions:
- **Origin check.** Mutations must send an `Origin` equal to the origin of
  `NEXTAUTH_URL` (read lazily). A missing or other `Origin` returns 403.
  The browser always sends `Origin` on `fetch` POST/PATCH/DELETE.
- **Migration.** Generated offline with
  `prisma migrate diff --from-schema-datamodel <HEAD schema copy> --to-schema-datamodel prisma/schema.prisma --script`,
  which needs no database. `ENABLE ROW LEVEL SECURITY` is appended.
- **`ADMIN_PLAN.md` §6.6 vs this stage.** That section recommended
  persisting inbound mail, because attachment URLs expire and Resend's
  retention is unknown. This stage reads received mail live, as the prompt
  asks. Attachments are streamed on demand through our server, so the
  expiring `download_url` is fetched fresh each time.
- **`STAGE_S1_NOTES.md`** describes a different, later design
  (conversations/messages). Nothing in this stage depends on it.

## Owner decisions after the templates arrived (2026-11-26)

`src/emails/reply/` was added by the owner, untracked, containing
`ReplyLayout.tsx`, `parts.tsx`, `tokens.ts`, `brand.ts`, `copy.ts`,
`AuditReply.tsx`, `QuoteReply.tsx` and `build.tsx`. Decisions:

1. **Footer reason line**: "You received this email because you … on
   bretosolution.com" appears **only** when the email answers a confirmed
   website request. It never appears on a newly created or cold email.
   - **Confirmed** means the draft is linked to a request
     (`source: { type: AUDIT|QUOTE, id }`), that `AuditRequest`/`QuoteRequest`
     exists, and its email equals `toEmail` (case-insensitive). This is
     checked on every render (`isConfirmedWebsiteRequest` in
     `src/lib/server/adminEmailRender.ts`).
   - Two columns were added beyond the prompt's model for this:
     `sourceRequestType AdminEmailSourceType?` and `sourceRequestId String?`.
   - **Wording**: per kind from `copy.ts`. Audit says "…requested a free AI
     Visibility Audit…", quote says "…requested a quote…", and general uses
     the owner's sentence "…submitted a request on bretosolution.com."
2. **Address**: `brand.ts` had "20 Jakana Plaza … 211273", which conflicts
   with `site.ts` "35, Jakana Plaza … 600215" (confirmed in
   `EMAIL_PLAN.md`). The owner chose `site.ts`, so `brand.ts` now reads
   name, contact email, address and site URL from `site.ts`/`seo.ts`.
3. **General email**: the subject is personalised per client.
   `subject` is required for GENERAL and may use `{name}` and `{business}`
   placeholders (for example "A quick idea for {business}"), resolved at
   render time. `GeneralReply` has no eyebrow or fixed heading, so it reads
   like a letter.

## Outcome

### Dependencies (npm, as in Stage 2)

- Added `@supabase/supabase-js` 2.119.2, `sanitize-html` 2.18.2 and
  `@types/sanitize-html` 2.16.2.
- **No version drift** in the 11 existing packages checked before and after.
- `tsx` still works, since `@esbuild/win32-x64` is present.
- **Resend was not touched**: 6.39.0 has `emails.receiving` (`ADMIN_PLAN.md` §3).

### Changes to the owner's templates (`src/emails/reply`)

- Audit and Quote take sanitised, styled `bodyHtml` instead of
  `paragraphs`. Added `GeneralReply.tsx` and a `BodyHtml` part.
- `ReplyLayout`'s `footerReason` is optional and rendered only when given.
- `copy.ts`: added a `general` section and a comment on the footer rule.
- `build.tsx`:
  - Builders take `{ subject, bodyHtml, bodyText, confirmedWebsiteRequest, … }`
    and are now **async**.
  - Rendering moved from `react-dom/server` `renderToStaticMarkup` to
    `@react-email/render` `render()`. **Why:** Next 16 fails the build with
    "You're importing a component that imports react-dom/server" when an App
    Route imports it. `render()` is already used by `src/emails/render.tsx`.
    Output now starts with the XHTML 1.0 Transitional doctype.
- `ReplyLayout`: the `<img>`/`<head>` lint warnings are suppressed with
  comments, because this is email HTML, not a page.

### HTML handling (`src/lib/server/emailHtml.ts`)

- **Composer allowlist** (exactly as specified): p, br, strong, b, em, i, u,
  a, ul, ol, li, h2, h3, blockquote.
  - `href` is kept only for absolute `https:` and `mailto:` links, and gets
    `target="_blank" rel="noopener"`.
  - Relative and protocol-relative links are dropped too, because
    sanitize-html's scheme filter only checks absolute URLs.
  - Everything else is stripped. The HTML is sanitised on save and again at
    render.
- **Email styles**: a second pass over the clean HTML sets a fixed inline
  `style` per tag from `emailTokens`.
- **Plain text**: `@react-email/render` `toPlainText` (html-to-text). Blocks
  become line breaks, and links become `text (url)` via `linkBrackets`.
- **Inbound**: strict allowlist.
  - Removed: scripts, styles, iframes, forms, inputs, buttons, objects and
    every `on*` handler.
  - Styles are limited to a property allowlist that excludes position,
    top/left, z-index, transform, float, display, visibility and overflow.
    `url(`, `expression(` and `javascript:` are rejected.
  - `https` images become alt-only unless `?images=1`
    (`hasRemoteImages: true`). `http:` and protocol-relative images are never
    loaded. Inline `data:image/(png|jpeg|gif|webp)` images are kept.

### Database

- `prisma/schema.prisma`:
  - enums `AdminEmailKind`, `AdminEmailStatus`, `AdminEmailSourceType`
  - model `AdminEmail` as specified, plus `sourceRequestType` and
    `sourceRequestId`
- Migration `prisma/migrations/20261126000000_add_admin_email/migration.sql`
  was generated **offline** with
  `prisma migrate diff --from-schema-datamodel <HEAD schema> --to-schema-datamodel prisma/schema.prisma --script`,
  with `ALTER TABLE "AdminEmail" ENABLE ROW LEVEL SECURITY;` appended.
  **Not applied.** The owner runs `npx prisma migrate deploy`.

### Routes

All routes use `runtime = "nodejs"` and `dynamic = "force-dynamic"`. Each one
calls `guardAdmin()` first, which wraps `requireAdminApi()` and also checks
`Origin` on mutations. "M" marks a mutation. Every response carries
`Cache-Control: no-store`.

| Method | Path | Guard | Status codes |
| --- | --- | --- | --- |
| GET | /api/admin/emails?cursor= | admin | 200 `{items,nextCursor}`, 400 bad cursor, 401, 500 |
| POST | /api/admin/emails | admin + M | 201 `{email}`, 400, 401, 403, 413/415 (body), 500 |
| GET | /api/admin/emails/[id] | admin | 200, 401, 404, 500 |
| PATCH | /api/admin/emails/[id] | admin + M | 200, 400, 401, 403, 404, 409 "already been sent", 500 |
| DELETE | /api/admin/emails/[id] | admin + M | 200 `{ok}`, 401, 403, 404, 409, 500 |
| POST | /api/admin/emails/[id]/send | admin + M | 200 `{email}` (SENT), 400 (send rules or bad PDF), 401, 403, 404, 409 (not DRAFT/FAILED, or lost the atomic claim), 500 (provider; row set to FAILED with a safe error) |
| POST | /api/admin/emails/[id]/refresh | admin + M | 200, 401, 403, 404, 409 (not SENT), 500 |
| POST | /api/admin/emails/preview | admin + M | 200 `{html}`, 400, 401, 403, 500 |
| POST | /api/admin/attachments/upload-url | admin + M | 200 `{path,signedUrl,token}`, 400, 401, 403, 500 |
| GET | /api/admin/inbox?after= | admin | 200 `{items,nextCursor[,notice]}`, 400, 401, 500 |
| GET | /api/admin/inbox/[id]?images=1 | admin | 200 `{message}`, 401, 404, 500 |
| GET | /api/admin/inbox/[id]/attachments/[attachmentId] | admin | 200 stream (attachment disposition, original type, `nosniff`), 401, 404, 500 |

Send details:
- **Order of checks**: validate, then claim atomically with `updateMany` on
  `status IN (DRAFT, FAILED)` → SENDING, so 0 rows means 409. Then render,
  download the PDF and check `%PDF-` and ≤ 15 MB.
- **Resend call**: `emails.send({ from: LEAD_FROM_EMAIL, to, replyTo:
  ADMIN_INBOX_ADDRESS, subject, html, text, headers, attachments },
  { idempotencyKey })`.
- **Headers**: `List-Unsubscribe` always; `In-Reply-To` and `References`
  when `inReplyToMessageId` is set.
- **Idempotency key**: `admin-email/<id>/<sha256 of the payload>`. This is a
  deviation from "the email id" alone. With the id alone, re-sending an
  edited FAILED email would reuse the key with a different payload, which
  Resend rejects (`invalid_idempotent_request`). Including a content hash
  keeps "same email + same content → no duplicate" and lets edits send.

Other deviations:
- **403 on bad Origin**: the prompt's status list has no code for it.
- **400 with field errors** when the stored PDF is missing or not a PDF.
- **Upload path**: `admin-emails/<32-hex random id>/<sanitised>.pdf`. A
  random hex id is used instead of a cuid, because no cuid helper exists and
  no dependency was added.
- **`readJsonBody(request, maxBytes = 20 KB)`** gained an optional limit;
  admin routes use 128 KB. The form routes are unchanged.
- **Stage 1 contract updated**: `apiClient.ts` (upload-url shape, preview
  `{html}`, inbox `?after=` and `notice`, `?images=1`,
  `inboxAttachmentUrl()`), DTOs (`inReplyToMessageId`, `source`,
  `hasRemoteImages`), `domain.action.ts` (`listInbox({ after })`) and the
  test fixtures.
- **Env read at runtime**: Next inlines `process.env.NEXT_PUBLIC_*` at build
  time. A build without the value had baked `""` into `storage.ts`, which was
  caught by the smoke test. Storage now reads env with a variable key.

### Gate

All variables are blanked in the shell, so the `.env` files cannot supply
them (see `STAGE2_NOTES.md`).

| Check | Result |
| --- | --- |
| `npx prisma validate` | **Fails when `DIRECT_URL` is an empty string**: Prisma P1012 "You must provide a nonempty direct URL", from the schema's existing `directUrl = env("DIRECT_URL")`. It passes when the env is loaded (run earlier in this stage). This is Prisma's datasource validation, not new code |
| `npx prisma generate` | ok (blank env) |
| `npx tsc --noEmit` | exit 0 (blank env) |
| `npm run lint` | 0 errors. The same 8 existing `<img>` warnings |
| `npm test` | 58 pass: 41 state tests plus 17 new ones for sanitisers, links, plain text and schema rules |
| `npm run build` | success (blank env). All 9 admin API routes are dynamic |

### Runtime smoke test (`next start -p 3100`)

| Check | Result |
| --- | --- |
| Signed out, all 12 method/route pairs | 401 |
| Signed in (locally minted cookie), POST without Origin / with a foreign Origin | 403 / 403 |
| Invalid create body (bad kind, email, rows, unknown key) | 400 with per-field errors |
| GENERAL with rows and no subject | 400 `rows`, `subject` |
| Upload-url with .exe, 0 bytes, text/html | 400 on all three fields |
| Bad id / bad cursor | 404 / 400 |
| Preview GENERAL with `<script>` and a `javascript:` link | 200. No script or `javascript:` in the output, `{business}` filled in, no footer reason (unlinked) |
| Preview AUDIT without a PDF | 200, placeholder callout |
| GET /emails before the migration | 500, generic message. Log: `[admin-api] emails/list failed. PrismaClientKnownRequestError` (no payload) |
| GET /inbox (live Resend, read-only; only the shape was printed) | 200 `{items: [], nextCursor: null}` |
| Upload-url (live Supabase) | 500, logged as `StorageError`. Most likely the bucket `admin-email-attachments` does not exist yet. Setup steps are in `scripts/smoke-admin-api.md` |

The template render check, run with tsx through `build.tsx`, gave:
- the footer reason line present for confirmed audit and general emails,
  and absent for unconfirmed quote and general emails, in both HTML and
  text
- the address from `site.ts` (35, Jakana Plaza / 600215) in all of them
- the email logo URL present

### Not verified / UNKNOWN

- No real send. Not exercised: the Resend send, the idempotency behaviour,
  whether Resend keeps custom `In-Reply-To`/`References` (`ADMIN_PLAN.md`
  U6), and `refresh`. All need the migration and a recipient you own.
- **Direct browser upload without an `apikey` header.** storage-js
  `uploadToSignedUrl` sends a `PUT` to the signed URL but also adds the
  client's `apikey` header. Whether Supabase accepts a plain `fetch` with only
  the signed token is unverified (`ADMIN_PLAN.md` U11). If it does not,
  Stage 5 needs `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- The exact Resend error returned when receiving is not configured. 403/404,
  `restricted_api_key`, `invalid_access` and `not_found` are treated as
  "not configured".
- Inbox pages can hold fewer than 20 items, because filtering happens after
  the fetch.
- A row stuck in `SENDING` (process killed mid-send) has no automatic
  recovery. It needs a manual reset to FAILED.
- Orphaned PDFs are not cleaned up: uploads never attached to a draft stay in
  the bucket.
