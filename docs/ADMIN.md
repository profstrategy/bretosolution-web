# Admin email dashboard

A private area at `/admin` for one administrator. From it you can:

- **Send.** Write audit replies, quote replies and general emails in a rich-text editor. You can attach a PDF, save drafts, preview the exact email, and send through Resend.
- **Track.** See every email with its status (Draft, Sending, Sent, Failed) and the last delivery event from Resend (Delivered, Opened, Bounced and so on). "Refresh status" asks Resend again.
- **Read.** Read mail received at the support address (`ADMIN_INBOX_ADDRESS`), download its attachments, and reply. A reply is sent with `In-Reply-To` and `References` set, so the mail client can thread it.

The public website does not link to the admin area. Search engines are told not to index it.

## How it is built

| Part | Where |
| --- | --- |
| Sign-in (next-auth v4, JWT sessions, 8 hours) | `src/lib/auth/*`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/admin/login` |
| Guards | `requireAdminPage()` for pages, `guardAdmin()` / `requireAdminApi()` for API routes (`src/lib/auth/requireAdmin.ts`, `src/lib/server/adminApi.ts`) |
| Pages | `src/app/admin/(dashboard)/*`. The layout and every page call `requireAdminPage()`. |
| API | `src/app/api/admin/**/route.ts`, all JSON and all guarded |
| Email storage | Postgres table `AdminEmail` (Prisma, `prisma/schema.prisma`) |
| PDF attachments | Private Supabase Storage bucket `admin-email-attachments` |
| Sending, status and received mail | Resend API. Received mail is read live from Resend and is not copied into the database. |
| UI state | `src/state/*` (a small store), `src/components/admin/*` |

### Security model

- **One admin.** You can sign in with `ADMIN_EMAIL` and its password, or with a Google account whose verified email is `ADMIN_EMAIL`. There is no user table.
- **Every admin page and API route checks the session itself.** There is no reliance on middleware. `npm test` runs `scripts/check-admin-guards.ts`, which fails if a page or route under `src/app/admin` or `src/app/api/admin` does not call the guard first. It also fails if a mutation skips the Origin check.
- **Requests that change data** (POST, PATCH, DELETE) must carry an `Origin` header equal to `NEXTAUTH_URL`'s origin. Anything else gets a 403, which blocks cross-site request forgery.
- **Password sign-in is limited** to 5 attempts per 15 minutes per IP. Wrong email and wrong password give the same message. Both run a bcrypt comparison, so they are designed to take the same time.
- **Secrets stay on the server.** Every module in `src/lib/server`, `src/lib/auth` (except the client-safe `errors.ts`) and `src/lib/db.ts` starts with `import 'server-only'`, so a client import breaks the build. The one exception is `emailHtml.ts`: it holds no secrets, and the unit tests load it with plain Node. The browser bundle contains no secret names or values.
- **An email is sent only once.** A send first moves the email from DRAFT or FAILED to SENDING in one database update, so a second click gets 409. Resend also receives an idempotency key. A SENT email cannot be edited or deleted (409).
- **Attachments are PDFs of 15 MB or less, checked three times:**
  - when the upload URL is requested (name, type and size);
  - by the bucket's own limits;
  - when sending, where the stored object's size is checked and its bytes must start with `%PDF-`.
- **Received HTML is cleaned on the server.** No scripts, forms, iframes, event handlers, `<style>` or CSS `url()`. It then shows in an `<iframe sandbox="">` (no scripts, forms or popups) whose CSP allows no network access. Remote images are blocked until you click "Show images".
- **Responses are not cached or indexed.** `/admin` pages send `X-Robots-Tag: noindex, nofollow` and `X-Frame-Options: DENY`, and are disallowed in `robots.txt`. `/api/admin` responses send `Cache-Control: no-store`.

## Environment variables

Set these in `.env.local` for development and in the host's settings for production. All are read at request time, so `npm run build` works with none of them set. Never commit their values.

| Variable | Required | What it is |
| --- | --- | --- |
| `NEXTAUTH_URL` | yes | The site origin, e.g. `https://bretosolution.com`. It is also the only origin allowed to make changes through the admin API. |
| `NEXTAUTH_SECRET` | yes | A long random string that signs the session cookie. |
| `ADMIN_EMAIL` | yes | The administrator's email address. |
| `ADMIN_PASSWORD_HASH_B64` | yes | From `npm run admin:hash` (see "Rotating the password"). |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | yes | Google OAuth client (see "Google sign-in"). |
| `DATABASE_URL` | yes | Pooled Postgres URL, used by the app. |
| `DIRECT_URL` | for migrations | Direct Postgres URL, used by `prisma migrate deploy`. |
| `RATE_LIMIT_SALT` | yes | Random string used to hash IP addresses for the login limit. |
| `RESEND_API_KEY` | yes | A Resend key with **full access**. Sending, status and received mail all need it. |
| `LEAD_FROM_EMAIL` | yes | The sender, e.g. `Bretosolution <hello@bretosolution.com>`, on a domain verified in Resend. |
| `LEAD_NOTIFY_EMAIL` | yes | Used by the public forms, and checked together with the other Resend settings. |
| `ADMIN_INBOX_ADDRESS` | no | The support address whose received mail is listed. It is also the reply-to on admin emails. Defaults to `hello@bretosolution.com`. |
| `SUPABASE_URL` | yes | The Supabase project URL. `NEXT_PUBLIC_SUPABASE_URL` is used if this is unset. |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | The service-role key. **Server only.** Never give it a `NEXT_PUBLIC_` name. |

`NEXT_PUBLIC_SITE_URL` is used by the public site.

## Google sign-in

The step-by-step setup is in [ADMIN_AUTH.md](ADMIN_AUTH.md#google-cloud-console). In short:

1. In Google Cloud Console, create an OAuth client of type **Web application**.
2. Add the authorised redirect URI `https://<your domain>/api/auth/callback/google`, plus `http://localhost:3000/api/auth/callback/google` for development.
3. Put the client ID and secret in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

Only a Google account whose **verified** email equals `ADMIN_EMAIL` can sign in. Any other account sees "This Google account is not allowed."

## Supabase setup

1. **Database.** Point `DATABASE_URL` at the pooled connection string, port 6543, with `?pgbouncer=true`. Point `DIRECT_URL` at the direct one, port 5432. Then apply the migrations:

   ```bash
   npx prisma migrate deploy
   ```

2. **Storage bucket.** In the Supabase dashboard, go to **Storage → New bucket**:
   - Name: `admin-email-attachments`
   - Public bucket: **off** (private)
   - Restrict file size: **15 MB**
   - Allowed MIME types: `application/pdf`

   The app does not create the bucket. Until it exists, PDF uploads fail with a clear error, while emails without attachments still work.
3. **Keys.** Copy the project URL into `SUPABASE_URL` and the `service_role` key into `SUPABASE_SERVICE_ROLE_KEY`. The browser never sees this key. The server creates a short-lived signed upload URL, and the browser uploads the PDF straight to it.

## Resend setup

1. Verify the sending domain under **Domains**, so `LEAD_FROM_EMAIL` can send.
2. To receive mail, enable receiving for the domain under **Domains → Receiving**, and add the MX record Resend shows. Until then, the Receiving tab shows "Resend is not receiving mail for this address yet…".
3. Use an API key with full access. A sending-only key cannot read status or received mail.

## Deploying

The app needs a host that runs a **Node.js Next.js server**: route handlers, Prisma and next-auth. Vercel, Netlify (Next runtime), Render, Railway, Fly.io or any Node server running `npm run build && npm start` all work. Plain shared hosting that only serves static files does not.

1. Set every variable above in the host. Set `NEXTAUTH_URL` to the exact public origin, `https://` and with no trailing slash.
2. Run `npx prisma migrate deploy` once, with `DIRECT_URL` set.
3. Build and start: `npm run build`, then `npm start`. A platform such as Vercel runs the build itself.
4. Check: open `/admin/emails` signed out, and you are sent to `/admin/login`. `curl -i https://<domain>/api/admin/emails` returns 401 with `Cache-Control: no-store`.
5. **Place the app close to the database.** The Supabase database is in eu-west-1 (Ireland). Each query from a distant server adds latency, and a save makes two or three queries. Pick a European region (Vercel: `dub1` or `fra1`).
6. **The login limit relies on the client IP from `X-Forwarded-For`.** On Vercel and most managed hosts the platform sets that header. If you run behind your own proxy, make sure it replaces any client-supplied `X-Forwarded-For` rather than appending to it. Otherwise an attacker can change the header to get around the limit.

## Rotating the password

1. Run `npm run admin:hash` in a real terminal (PowerShell, Windows Terminal, macOS or Linux). In Git Bash, use `winpty npm.cmd run admin:hash`. Type the new password (at least 14 characters) twice.
2. Replace `ADMIN_PASSWORD_HASH_B64` in the host with the printed value, then redeploy or restart.
3. Existing sessions stay valid until they expire (8 hours at most). To sign everyone out now, also replace `NEXTAUTH_SECRET` with a new random value:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

To change the admin, change `ADMIN_EMAIL` and the password hash together. Sessions for the old email stop working at once, because the email is checked on every request.

## Known limits

- **Single admin.** There are no other users, roles or audit log of who did what.
- **Received mail lives in Resend only, and Resend keeps email data for 30 days** on the Free, Pro and Scale plans. After that, received messages disappear from the Receiving tab. Sent emails stay listed, because they are in our database, but their delivery status can no longer be refreshed. Longer retention needs a Resend Enterprise plan, or storing received mail ourselves (not built).
- **PDF attachments only, 15 MB at most, one per email.**
- **Sent emails are shown re-rendered from their saved fields** with the current templates, not as the exact HTML that was sent.
- **The Receiving tab lists 20 messages from Resend per page,** then keeps those addressed to `ADMIN_INBOX_ADDRESS`. A page can therefore show fewer than 20.
- **Links inside received mail do not open.** The sandbox blocks pop-ups. Copy a link if you need it.
- **Replies are threaded by headers only.** Whether Gmail and Outlook thread them depends on those clients. This has not been tested with a real mailbox.
