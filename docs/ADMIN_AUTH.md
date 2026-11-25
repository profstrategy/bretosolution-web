# Admin authentication setup

The admin area (`/admin`) has one administrator. Sign-in uses next-auth v4
with JWT sessions that last 8 hours. There is no user table. The admin can
sign in with either:

- **Email and password.** The email must equal `ADMIN_EMAIL`. The password is
  checked against a bcrypt hash stored in `ADMIN_PASSWORD_HASH_B64`.
- **Google.** The Google account email must equal `ADMIN_EMAIL` and be
  verified by Google.

Login attempts with a password are limited to **5 per 15 minutes per IP
address**, stored in the existing `RateLimitHit` table under bucket
`admin-login`. If the database cannot be reached, password login fails
closed.

## Environment variables

Set these in `.env.local` for development and in the hosting provider for
production. Never commit their values.

| Variable | Value |
| --- | --- |
| `NEXTAUTH_URL` | The site origin, e.g. `http://localhost:3000` locally, `https://bretosolution.com` in production |
| `NEXTAUTH_SECRET` | A long random string. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `ADMIN_EMAIL` | The administrator's email address (compared case-insensitively) |
| `ADMIN_PASSWORD_HASH_B64` | Output of `npm run admin:hash` (see below) |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console (see below) |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |

All six are read at request time. `npm run build` works without them, but
sign-in fails until all six are set.

## Generating the password hash

```bash
npm run admin:hash
```

1. Type the password when asked (at least 14 characters), then type it again.
   Nothing is shown while you type, and the password never appears in shell
   history.
2. The script prints one line:
   `ADMIN_PASSWORD_HASH_B64=<base64>`. Copy that line into `.env.local`, or
   the value into your host's settings.

The bcrypt hash (cost 12) is stored base64-encoded because bcrypt hashes
contain `$`, which Next.js env loading can treat as variable expansion. The
app decodes it when it is used.

The script needs an interactive terminal (PowerShell, Windows Terminal, or a
macOS/Linux terminal). In Git Bash on Windows, run
`winpty npm.cmd run admin:hash`.

To change the password, generate a new hash, replace the variable and restart
or redeploy. Existing sessions stay valid until they expire (8 hours). To
end them all immediately, also change `NEXTAUTH_SECRET`.

## Google Cloud Console

1. Open <https://console.cloud.google.com/>, then select or create a project.
2. **APIs & Services → OAuth consent screen**: choose *External* (or
   *Internal* for a Workspace domain), fill in the app name and support
   email, and add the admin address as a test user while the app is in
   *Testing*.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**,
   application type **Web application**.
4. **Authorised JavaScript origins:**
   - `http://localhost:3000`
   - `https://bretosolution.com` (and `https://www.bretosolution.com` if used)
5. **Authorised redirect URIs** (must match exactly):
   - `http://localhost:3000/api/auth/callback/google`
   - `https://bretosolution.com/api/auth/callback/google`
6. Copy the client ID and client secret into `GOOGLE_CLIENT_ID` and
   `GOOGLE_CLIENT_SECRET`.

Any Google account other than `ADMIN_EMAIL`, or one whose email Google has
not verified, is rejected with "This Google account is not allowed."

## How protection works

- `src/lib/auth/requireAdmin.ts` provides three helpers:
  - `getAdminSession()` returns the session or `null`.
  - `requireAdminPage()` redirects to `/admin/login` when there is no admin
    session.
  - `requireAdminApi()` returns a 401 JSON `Response` when there is no admin
    session.
- **Every admin page and every `/api/admin` route must call one of these.**
  Do not rely on proxy/middleware for protection.
- A session counts only if its token has `role: "admin"` and its email still
  equals `ADMIN_EMAIL`.
- `/admin` is disallowed in `robots.txt` for every crawler group and is
  absent from the sitemap. `/admin` responses carry
  `X-Robots-Tag: noindex, nofollow` (set in `next.config.ts`), and the admin
  pages set `robots: noindex` metadata.
