# Stage 7: hardening

A review and hardening pass over the admin email dashboard before it goes live.

## What I inspected

- `README.md`, `PORTING.md`, `ADMIN_PLAN.md`, `STAGE1_NOTES.md` to `STAGE6_NOTES.md` and `docs/ADMIN_AUTH.md`.
- `src/app/admin`, `src/app/api/admin`, `src/app/api/auth` and `src/lib/auth`.
- `src/lib/server`, `src/state`, `src/components/admin` and `prisma`.
- `next.config.ts` and `.env.example`.

I also read the dev-only `src/app/api/dev/email-preview`. It returns 404 unless `NODE_ENV === 'development'` and renders only sample data.

**Conflicts: none needed a STOP.**

**The `server-only` package is not a dependency, and none was added.** Ten modules already used `import 'server-only'`, which Next resolves through its own alias (`next/dist/build/create-compiler-aliases.js`, recorded in STAGE2_NOTES). I added the import to seven more server modules. No package was added. In plain Node, outside Next, the import does not resolve, so a module that the unit tests or scripts load directly cannot use it. That is why `emailHtml.ts` has none: it holds no secrets, and the tests load it.

## Changes (smallest fix each)

| # | Finding | Fix |
|---|---|---|
| 1 | Nothing enforced the rule "every admin page and route calls the guard". `(dashboard)/page.tsx` relied on its layout alone. | `scripts/check-admin-guards.ts` checks the TypeScript AST and fails when: a route handler's first statement is not `await guardAdmin(...)`/`requireAdminApi()` followed by `if (x instanceof Response) return x;`; a POST, PUT, PATCH or DELETE does not pass `mutation: true`; a handler is re-exported or exported as a const; a page or layout does not await `requireAdminPage()` first; a server action appears; or the public list is stale. It runs in `npm test` and as `npm run admin:check-guards`. The dashboard index page now calls `requireAdminPage()`. |
| 3 | Seven server modules had no `server-only` marker: `env.ts`, `db.ts`, `notify.ts`, `rateLimit.ts`, `confirmationLimit.ts`, `leadNotifications.ts` and `http.ts`. | Added `import 'server-only'` to each. |
| 5 | A client that bypassed the app could upload any size to the signed URL if the bucket's own limits were not set. The send route then downloaded the whole object into memory before checking its size. | `downloadAttachment(path, maxBytes)` reads the object's size with `storage.info()` (storage-js 2.119.2), checks the Blob size before buffering, and raises `AttachmentTooLargeError`. Send then returns 400 "The attachment is larger than 15 MB…". If `info()` fails, the download goes ahead exactly as before. |
| 7 | Only the JSON helpers set `Cache-Control: no-store`. Body-parser errors (415/413/400 from `http.ts`) and 405s had none, and `/admin` could be framed. | `next.config.ts` adds `Cache-Control: no-store` and `X-Robots-Tag` to `/api/admin/:path*`, and `X-Frame-Options: DENY` to `/admin` pages. |
| 8 | Keyboard: in the composer, a disabled Save, Preview or Send button dropped focus to `<body>`. After a failed preview, Escape and Tab no longer reached the dialog, so the composer could not be closed from the keyboard. | `ComposeEmailModal` remembers the last control focused in the dialog. When an action ends with the dialog still open and focus outside it, focus goes back to that control, or to the To field. |
| 8 | Keyboard: Refresh status, the inbox Refresh button and Load more used `disabled` while working, which also dropped focus to `<body>`. | They now use `aria-disabled` plus a click guard. They look the same and stay focusable. |
| 8 | Keyboard: the rich-text editor showed only a 1 px border colour change on focus. | Its wrapper now shows the same 3 px ring as the other fields while the editable area has focus (`[&:has([contenteditable]:focus)]`). |
| 8 | Keyboard: the email iframe in the detail panels was a Tab stop with no visible focus. Chrome applies neither `:focus` nor `:focus-within` to an `<iframe>` whose content has focus, and fires no focus event on it. | `EmailFrame` sets `data-focused` when the window blurs and `document.activeElement` is the iframe, and clears it on `focus`/`focusin`. The ring is drawn from that attribute. |
| 6 | No test covered `<style>`, `<meta refresh>`, `<link>`, `<base>`, SVG, `srcset`, `background=` or `data:`/`vbscript:` links in received mail. | Added one sanitiser test. It passed without code changes. |
| 10 | No operator documentation for the admin. | `docs/ADMIN.md` covers what it does, the env variables, Google, Supabase and Resend setup, deploying, password rotation and known limits. `PORTING.md` and `.env.example` are updated. |

Also: `package.json` gains the `admin:check-guards` script, and `npm test` now runs it.

## Verified

**Setup.** I tested a production build (`next start -p 3100`, `NEXTAUTH_URL=http://localhost:3100`) with the real `.env`:
- **Session:** a locally minted admin session, deleted afterwards.
- **Test rows:** addressed only to `composer-test@example.com`. All 27 were deleted (0 remain). Your 5 real emails were not touched.
- **No email was sent.** Every send was either intercepted in the browser or failed on purpose before Resend was called.

### 1. Access control

- **Guard script:**
  - It passes on all 14 files. Pages and layouts: `(dashboard)/layout.tsx`, `(dashboard)/page.tsx` and `(dashboard)/emails/page.tsx`. Routes: `attachments/upload-url` [POST], `emails` [GET, POST], `emails/[id]` [GET, PATCH, DELETE], `emails/[id]/send` [POST], `emails/[id]/refresh` [POST], `emails/preview` [POST], `inbox` [GET], `inbox/[id]` [GET] and `inbox/[id]/attachments/[attachmentId]` [GET].
  - Two files are public on purpose: `admin/layout.tsx` (metadata only) and `admin/login/page.tsx`.
  - **Negative test:** I copied the app folder and planted four bad files: an unguarded GET, a DELETE with `mutation: false`, a re-exported POST and an unguarded page. The script reported all four and exited 1.
- **Signed out**, all 12 handlers return `401 {"ok":false,"message":"Authentication required."}` with `Cache-Control: no-store`. `/admin`, `/admin/emails` and `/admin/emails?tab=receiving` return 307 to `/admin/login`. This was re-checked on the final build.

### 2. Origin

Signed in, a `POST /api/admin/emails` returns **403 "Request origin not allowed."** for each of: `Origin: https://evil.example`, no Origin header, `Origin: null`, `http://localhost:3100.evil.example` and `http://localhost:3000`. The same origin returns 201.

PATCH, DELETE, send, refresh, preview and upload-url with an evil origin all return 403. The draft was unchanged afterwards. A GET with a foreign Origin is allowed (reads).

### 3. Secrets

**Method:**
- I built with the **real** `.env` (the worst case for inlining) and again with every variable blank.
- I scanned all 42 files in `.next/static` for the variable **names** and for every **value** loaded from `.env`. The scan printed counts only.

**Results:**
- `service_role`, `RESEND`, `RESEND_API_KEY`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `RATE_LIMIT_SALT`, `ADMIN_PASSWORD_HASH_B64`, `ADMIN_EMAIL` and `GOOGLE_CLIENT_ID` appear **0 times**.
- So do the markers `bcrypt`, `PrismaClient`, `prisma`, `$2b$`, `postgres://`, `pooler.supabase.com`, `eyJhbGciOi`, `getAdminAuthEnv` and `createSignedUploadUrl`.
- The **values** of every secret appear 0 times.

**Expected hits:**

| Hit | Why it is not a leak |
|---|---|
| The name `NEXTAUTH_URL` | next-auth's client reads `process.env.NEXTAUTH_URL ?? VERCEL_URL` at run time; nothing is inlined. |
| The value of `NEXTAUTH_URL` | It is `http://localhost:3000`, which is next-auth's own built-in default string. |
| The value of `ADMIN_INBOX_ADDRESS` | It is the public contact address, already in `src/content/site.ts`. |

**Client imports:** no `'use client'` file imports `@/lib/server`, `@/lib/db`, `@/lib/prisma`, `@/lib/admin/inboxAddress` or `@/lib/auth/{env,options,requireAdmin}`. The only client import from `@/lib/auth` is the secret-free `errors.ts`.

### 4. Login

Calls go to `/api/auth/callback/credentials` with a CSRF token, from a reserved test IP (`198.51.100.77` in `X-Forwarded-For`).

| Attempt | Result |
|---|---|
| Right email, wrong password | `error=CredentialsSignin`, no session cookie |
| Wrong email, wrong password | `error=CredentialsSignin`, the same response |
| Upper-case/spaced wrong email; right email with empty password; another wrong password | `CredentialsSignin` |
| **6th and 7th attempts** | `error=RateLimited` |

The login page shows, per code:
- `CredentialsSignin`: "Email or password is incorrect." This one message is used for both a wrong email and a wrong password.
- `RateLimited`: "Too many attempts. Try again in 15 minutes."
- `AccessDenied`: "This Google account is not allowed."
- `LoginUnavailable`: the unavailable message.
- Anything else: "Sign-in failed. Please try again."

The 5 rate-limit rows for the test IP were deleted afterwards.

**Note on status codes:** next-auth answers the callback with HTTP 401 and the error in the URL; it never sends a 429. The 429-equivalent is the "Too many attempts" message.

**Google:** I called the real `signIn` callback from `options.ts`, loaded with tsx in CommonJS mode with a `server-only` stub.

| Profile | Result |
|---|---|
| `ADMIN_EMAIL`, verified | allowed |
| `ADMIN_EMAIL` upper-case, verified | allowed |
| `ADMIN_EMAIL`, `email_verified: false` | rejected |
| `ADMIN_EMAIL`, `email_verified` missing | rejected |
| Another verified Google account | rejected |
| `ADMIN_EMAIL` + suffix | rejected |
| An unknown provider using `ADMIN_EMAIL` | rejected |

### 5. Sending

- **Concurrent sends (API):** two concurrent `POST /send` for one draft gave one **400** and one **409** "This email has already been sent or is being sent." The draft's PDF pointed to an object that does not exist, so the claimed send failed before Resend was called. The row ended FAILED with that error.
- **Double-click (UI, `/send` intercepted and delayed 1.5 s):** a real mouse double-click on the confirm button made **1** request. Three synchronous `.click()` calls in one task also made **1** request.
- **A SENT row:** PATCH returns **409** "This email has already been sent and cannot be edited.", and so does DELETE. Send returns **409** "…already been sent or is being sent."
- **Client bypassed, upload-url:** a 16 MB file, 15 MB + 1 byte, `text/plain` and `a.exe` each return **400** with field errors.
- **Client bypassed, drafts:** creating a draft with a 16 MB attachment, a `.exe` storage path or a `../` storage path returns **400**, and so does a PATCH to 16 MB.
- **Send-time byte checks:** the size and `%PDF-` checks were reviewed in code but not run, because the bucket does not exist (see "Could not verify").

### 6. Received mail rendering

The browser received a message whose HTML was **deliberately not sanitised**. It contained `<script>`, `onerror`, a remote `<img>`, a CSS `url()` background, a link and a form. This tests the iframe on its own, without the server sanitiser.

Chrome runs sandboxed `srcdoc` frames out of process. The harness attached to each frame target, paused it until network and console logging were on, and recorded the frame's console.

**Before Show images:**
- The iframe has `sandbox=""` (0 tokens), and `iframe.contentDocument` is `null` from the parent.
- The CSP is `default-src 'none'; img-src data:; style-src 'unsafe-inline'`.
- Chrome logged "Blocked script execution in 'about:srcdoc' because the document's frame is sandboxed and the 'allow-scripts' permission is not set." The parent received no `postMessage` from the injected script or the `onerror` handler.
- Chrome logged "Loading the image 'https://example.com/stage7-remote-tracker.png' violates … `img-src data:`. The action has been blocked." It logged the same for the CSS background, and Network showed `blockedReason: csp`.

**After Show images:** the CSP is `img-src data: https:`. Scripts were still blocked (logged again), and still no messages reached the parent.

**Server side:** the sanitiser tests cover the server half (6 `sanitizeInboundHtml` cases in `emailHtml.test.ts`, including the new one).

### 7. Headers

- `/admin`, `/admin/emails` and `/admin/login`: `X-Robots-Tag: noindex, nofollow` and `X-Frame-Options: DENY`.
- `robots.txt`: all 14 user-agent groups contain `Disallow: /admin`.
- `/api/admin` `Cache-Control`:

| Response | Header |
|---|---|
| 401 | `no-store` |
| 200 | `no-store` |
| 404 (invalid id) | `no-store` |
| 415 | `no-store` (was none) |
| 400 malformed JSON | `no-store` (was none) |
| 405 PUT | `no-store` (was none) |
| 404 for an unknown `/api/admin/*` path | Next's own `private, no-cache, no-store, max-age=0, must-revalidate` |

### 8. Accessibility (headless Edge, keyboard events over CDP)

**Login page, both themes:** Tab goes Skip to content → Email → Password → Show password → Sign in → Continue with Google, then out of the page. Every stop has a visible 3 px ring.

**Dashboard at 1440:** Skip link → brand → Emails → Collapse sidebar → breadcrumb → theme → Log out → Send a mail → Sending tab → rows and their actions. Every stop has a visible ring. ArrowRight and ArrowLeft move between tabs and select them.

**Composer, opened with Enter:**
- Focus starts on To.
- 60 Tabs forward and 10 back stay inside the dialog (17 distinct stops), each with a visible ring. This needed the editor fix.
- Escape closes it, and focus returns to "Send a mail".

**Delete confirmation:**
- Focus starts on Cancel.
- Tab cycles Delete ↔ Cancel inside the dialog.
- Escape closes it, focus returns to the row's Delete button, and the draft is kept.

**Detail drawer:**
- Focus starts on "Close details".
- 25 Tabs stay inside: the iframe, Edit, Send, Delete, Close. Each has a visible ring; the iframe's needed the fix above.
- Escape closes it, and focus returns to the row.

**Refresh status from the keyboard:** focus stays on the button while it works and afterwards. This needed the fix above.

**After a failed preview:** focus returns into the composer, and Escape opens the discard prompt. This needed the fix above.

**390 px:**
- The menu opens with Enter, and focus starts on the brand link.
- 12 Tabs stay inside the drawer.
- Escape closes it, and focus returns to "Open navigation menu".

**Contrast (WCAG AA: 4.5:1, or 3:1 for large text):**
- **Method:** a script checked every visible text element against its composited background.
- **Coverage:** the login page and, signed in, the Sending list, composer, delete confirmation, detail drawer and Receiving list, in light and dark at 1440 and 390 (2,962 elements in total).
- **Result: 0 failures.**

### 9. Re-renders (React Profiler)

**Method:**
- `next build --profile`, with a temporary `<Profiler>` inside each memoised `EmailRow` and `InboxRow`, and one around the Sending list (`window.__prof` counted commits per id).
- The instrumentation was removed afterwards (`grep Profiler src` finds nothing), and the final build is a normal one.

**Results** (20 rows mounted):

| Action | Row commits |
|---|---|
| Opening the composer | 0 (the list wrapper committed once, from the parent's state) |
| **Typing 48 characters** in Subject and the editor | **0**, and 0 for the list |
| **An error toast** (a failed preview) | **0**, and 0 for the list |
| **Refreshing one email's status** | **that row 3** (pending, result, settled); the **other 19 rows 0** |

On the refresh, the list wrapper also counted 3. A Profiler reports every commit in its subtree, and the updated row is inside that subtree.

### 10. Docs

`docs/ADMIN.md` is new. `PORTING.md` (environment section and "Admin dashboard result") and `.env.example` (comments) are updated.

**Resend retention** is 30 days on the Free, Pro and Scale plans. Sources:
- <https://resend.com/docs/knowledge-base/account-quotas-and-limits>
- <https://resend.com/security>

### Gate

- `tsc`: 0 errors.
- Lint: 0 errors (the 8 existing `<img>` warnings).
- `npm test`: 71/71, and the guard check passes.
- `npm run build`: passes with every env variable blank.

## Left open

- **The login rate limit trusts `X-Forwarded-For`.** It uses the first entry, and I just changed it per request in testing. That is safe only where the host overwrites the header, as Vercel and most managed hosts do. Behind a proxy that appends instead, an attacker could rotate the header and get past the limit. The limiter is shared with the public form APIs, so I did not change it.
  - If the host is not a managed one, the smallest fix is to read the platform's trusted header, or to add a global (all-IP) cap on `admin-login`.
  - The risk is limited: bcrypt cost 12, passwords of at least 14 characters, and Google sign-in as an alternative.
- **Load more loses focus on the last page.** When the last page arrives, the button is removed and focus falls to `<body>`. Fixing it needs a focus target for the first new row; that is small, but not done.
- **A frame that re-renders while focused** (a slow render finishing after you Tab into it) also drops focus. I saw this once during testing, with database latency of 2–5 s.
- **Database latency and drops from this machine.** During the run, `PrismaClientInitializationError` ("Can't reach database server") occurred twice. Retrying after a short wait worked. The deploy section of `docs/ADMIN.md` recommends a host region near eu-west-1.

## Could not verify

- **A real Google sign-in.** It needs an interactive OAuth consent. The `signIn` callback was tested directly, and the AccessDenied message on the page.
- **Timing equality of wrong-email and wrong-password attempts.** Both run bcrypt, but each attempt here took 2.4–4.2 s, dominated by database latency, so the measurements cannot show a difference.
- **Send-time checks against a real stored object:** an oversized object, a non-PDF object, and `storage.info()` against the real API. The bucket `admin-email-attachments` does not exist yet. The `info()` call is wrapped so that a failure falls back to the previous behaviour.
- **That a real double-click produces exactly one email at Resend.** No real send was made. The database claim (409) and the UI request deduplication were verified, and the Resend idempotency key was reviewed in code.
- **Real received mail through the real `/api/admin/inbox/*` routes.** The Resend inbox is empty. The iframe was tested with intercepted, unsanitised HTML, and the server sanitiser with unit tests.
- **That remote images actually load after "Show images".** The CSP allowed them and the console showed no block, but the `example.com` test image returns 404, so the screenshot shows a broken image either way.
- **Screen readers, real phones, and Firefox/Safari.** Only headless Edge was used. The iframe focus ring in particular relies on window `blur` and `document.activeElement` behaviour, which was only checked in Chromium.
- **Contrast of non-text elements** (focus rings, borders, icons) and text over images. Only text was measured; no text sat on a background image.
