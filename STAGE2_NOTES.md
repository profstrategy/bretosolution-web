# Admin stage 2 notes: authentication

Status: **Done.** The conflict below was resolved by the owner: **option A
(npm)**, and **add tsx**. See "Outcome" at the end.

Inspected on 2026-11-25 on branch `admin-dashboard`. HEAD is `1da1bd0`.
Read: `README.md`, `PORTING.md`, `ADMIN_PLAN.md`, `STAGE1_NOTES.md`,
`STAGE_S1_NOTES.md`, `package.json`, `next.config.ts`, every route and
layout under `src/app`, `src/lib/server/{env,rateLimit}.ts`,
`src/app/robots.ts` and `.env.example`.

## Compatibility (step 1)

cmd: `npm view next-auth@4 peerDependencies` printed this for `4.24.15`
(latest v4):

```text
'@auth/core': '0.34.3'
next: '^12.2.5 || ^13 || ^14 || ^15 || ^16'
nodemailer: '^7.0.7'
react: '^17.0.2 || ^18 || ^19'
'react-dom': '^17.0.2 || ^18 || ^19'
```

The installed `next` 16.4.6 and `react`/`react-dom` 19.3.1 are inside these
ranges. `@auth/core` and `nodemailer` are optional peers
(`npm view next-auth@4.24.15 peerDependenciesMeta`, see `ADMIN_PLAN.md` §2).
**No compatibility conflict**, so neither `--force` nor
`--legacy-peer-deps` is needed.

## CONFLICT: which package manager and lockfile to install with

Facts:

- Commit `1da1bd0` (by the repository owner) **deleted `package-lock.json`**
  (cmd: `git show --stat 1da1bd0`). The only tracked lockfile is now
  `bun.lock` (cmd: `git ls-files | grep lock`).
- **`bun.lock` is stale.** Its workspace `dependencies` list is missing
  `resend`, `@react-email/components`, `@react-email/render`,
  `@prisma/client`, and the devDependency `prisma`. The `packages` map has
  no `resend@`, `@react-email/*@` or `@prisma/client@` entries (cmd:
  `sed -n '1,40p' bun.lock`; `grep -n 'resend@\|@prisma/client@' bun.lock`
  → no match). So nothing in the repo pins the currently installed tree.
- The current `node_modules` was installed by npm (`package-lock.json`
  existed at the time). It holds the versions recorded in `ADMIN_PLAN.md`
  §1.1.
- bun 1.4.4 and npm 12.2.2 are both installed (cmd: `bun --version`,
  `npm --version`). `package.json` uses npm's `allowScripts` field for
  Prisma's install scripts. bun runs dependency lifecycle scripts only for
  `trustedDependencies`, which `package.json` does not declare, so a
  `bun add` may skip `prisma`'s engine download and `prisma generate`.
- The prompt's own commands (`npm view`, `--legacy-peer-deps`, `npm run`)
  assume npm.

Why this blocks: step 2 needs an install, and whichever tool runs it will
re-resolve the whole dependency tree.

- **npm** recreates `package-lock.json`, which you just deleted. Caret
  ranges (for example `@react-email/components ^1.0.12`, `lucide-react ^1.76.0`) may
  resolve to newer versions than the tested ones.
- **bun** rewrites `bun.lock` from a stale base and reinstalls
  `node_modules` in bun's layout. It may also skip Prisma's install scripts.

Options:

| Option | What happens |
| --- | --- |
| **A. npm (recommended)** | `npm install next-auth@4 bcryptjs` and `npm install -D tsx`. This recreates and commits `package-lock.json` and leaves `bun.lock` as is. It matches how `node_modules` was built and how `allowScripts` is set up. Afterwards I report any version that moved |
| B. bun | `bun add next-auth@4 bcryptjs` and `bun add -d tsx`. This rewrites `bun.lock` to the full current tree and commits it. Risks: Prisma scripts (I would check `prisma generate` and the build), and version drift from the stale lock |
| C. You regenerate the lockfile first | You run `bun install` or `npm install` and commit the result, then I add the three packages with the same tool |

**Decision needed:** A, B or C.

## Decisions I will apply once unblocked (none conflict with the prompt)

1. **Lazy auth options.** next-auth v4 reads `NEXTAUTH_URL` and
   `NEXTAUTH_SECRET` from `process.env` itself. Creating `authOptions` at
   module load would also read `ADMIN_EMAIL` and the Google keys during
   `next build`. So `src/lib/auth/options.ts` will export
   `getAuthOptions()`, which builds and caches the options on first use
   through `src/lib/auth/env.ts`. The route handler and `getServerSession`
   call it per request. The exact v4 App Router handler form and the
   `authorize` throw → `?error=` behaviour will be read from the installed
   `node_modules/next-auth` before writing the handler.
2. **Rate limiter parameters.** `recordRateLimitHit` currently has fixed
   limits: `REQUEST_LIMIT = 5` per `WINDOW_MS` = 1 hour
   (`src/lib/server/rateLimit.ts:5-6`). It also takes a full `Request`
   (`:13-16`), but `authorize(credentials, req)` gets only headers. I will
   add an optional `{ limit, windowMs }` argument whose defaults are today's
   values, so the form routes don't change. I will also widen the first
   parameter to `{ headers: Headers }`. `admin-login` uses `{ limit: 5,
   windowMs: 15 min }`. Unlike the forms (`audit-requests/route.ts:34-40`),
   login **fails closed** when the limiter throws.
3. **`/admin` placeholder.** The login page must redirect signed-in users to
   `/admin`, but no `/admin` route exists (cmd: `find src/app -path '*admin*'`).
   I will add a minimal `src/app/admin/page.tsx` that calls
   `requireAdminPage()` and shows "Signed in as …" with a sign-out button.
   Stage 3 replaces it.
4. **Public chrome on the login page.** The single root layout renders the
   public `Header`/`Footer` around every route (`src/app/layout.tsx:149-162`),
   so `/admin/login` will show them too. Removing them needs a route-group
   split that moves the public pages' files (`ADMIN_PLAN.md` R7). That
   change belongs to Stage 3 with the admin layout. In this stage the login
   card renders inside the existing chrome, and the public site's look stays
   unchanged.
5. **`tsx`.** It is not installed (cmd: `ls node_modules/.bin`), so it will
   be added as a devDependency for `admin:hash`, as the prompt asks. Note
   that Node v24 could run the `.ts` script directly with no dependency.
   I'll do that instead if you prefer.
6. **`.env`.** `NEXTAUTH_SECRET`, `ADMIN_PASSWORD_HASH_B64` and the second
   `ADMIN_INBOX_ADDRESS` have a leading space (`.env` lines 19-21). A check
   with `@next/env` `loadEnvConfig` reported all six auth variables as set
   (values not printed), so this does not break anything (closes
   `ADMIN_PLAN.md` U12). `.env.example` currently lists none of the six; they
   will be added without values.

## Outcome

### Install (npm, as decided)

- `npm install next-auth@4 bcryptjs` installed `next-auth` 4.24.15 and
  `bcryptjs` 3.0.3. bcryptjs ships its own types (`index.d.ts`,
  `umd/index.d.ts`), so no `@types/bcryptjs` is needed.
- `npm install -D tsx` installed `tsx` 4.23.15.
- **No version drift.** The 17 existing packages that were checked kept
  the same version before and after (cmd: a `diff` of the version
  snapshots).
- `package-lock.json` was regenerated and is committed. `bun.lock` was not
  touched and is still stale.
- Two install problems:
  1. npm 12 blocked install scripts for `esbuild` (used by tsx) and
     `@tailwindcss/oxide`, which are not in `allowScripts`. The first install
     also left the optional package `@esbuild/win32-x64` empty, so `tsx`
     failed with "The package @esbuild/win32-x64 could not be found". A
     plain `npm install` from the new lockfile fixed it (cmd:
     `npx tsx -e ...` printed `tsx ok`).
  2. During that second install, `prisma generate` hit
     `EPERM: rename ... query_engine-windows.dll.node`. The engine DLL is
     held open by node processes started on 2026-11-23 (likely a running dev
     server or the editor). The client types were regenerated and the engine
     file is unchanged (same version and size). The leftover `.tmp` copy in
     `node_modules/.prisma/client` was deleted. To fully regenerate, stop
     other node processes and run `npx prisma generate`.

### APIs read from node_modules (not memory)

- App Router handler: `NextAuth(req: NextRequest, res: RouteHandlerContext, options)`
  (`next-auth/next/index.d.ts`). Calling it per request allows lazy options.
- `getServerSession(options)` in RSC awaits `headers()`/`cookies()` from
  `next/headers` (`next-auth/next/index.js`).
- `authorize(credentials, req)` gets `req.headers` as a plain object
  (`providers/credentials.d.ts`; `RequestInternal.headers` is
  `Record<string, any>` in `core/index.d.ts`).
- A thrown `authorize` error goes to `/api/auth/error?error=<message>`, and a
  `null` return gives `error=CredentialsSignin`. A `signIn` callback that
  returns `false` gives `error=AccessDenied` (`core/routes/callback.js`).
  `/api/auth/error` then redirects to `pages.error` with the same `error`
  (`core/index.js:215-217`).
- The client `signIn()` reads `error` from the returned URL's query
  (`react/index.js:267`), and `SignInResponse` is
  `{ error, status, ok, url }` (`react/types.d.ts`).
- `GoogleProfile.email_verified: boolean` (`providers/google.d.ts`).
  `Profile` has no `email_verified`, so the code narrows with `in`.
- `server-only` is aliased by Next itself
  (`next/dist/build/create-compiler-aliases.js:232-240`); no package is
  installed for it.

### Gate (run with all six auth variables set to empty in the shell)

`@next/env` does not override keys already present in `process.env`
(`typeof p[t]==="undefined"` in `node_modules/@next/env/dist/index.js`), so
empty shell values hide the `.env` files' values.

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | 0 errors. 8 existing `<img>` warnings in public-site files |
| `npm test` | 41 pass, 0 fail |
| `npm run build` | success. New dynamic routes: `/admin`, `/admin/login`, `/api/auth/[...nextauth]`. Public pages still static |

### Runtime smoke test (`next start -p 3100`, GET requests only, no DB writes)

| Request | Result |
| --- | --- |
| `/admin` signed out | 307 → `/admin/login`, `X-Robots-Tag: noindex, nofollow` |
| `/admin/login` | 200, `X-Robots-Tag`, `<meta name="robots" content="noindex, nofollow">` |
| `/admin/login?error=AccessDenied` / `RateLimited` / `CredentialsSignin` | Shows each of the three required messages |
| `/admin/login?callbackUrl=https://evil.example` | Form callback falls back to `/admin` (the URL only appears in Next's router state) |
| `/robots.txt` | `Disallow: /admin` in all 14 groups |
| `/` | No `X-Robots-Tag`, so the public site is unchanged |
| `/api/auth/providers`, `/csrf`, `/session`, `/signin/google` | 200, 200, 200 `{}`, 302. This used a valid `NEXTAUTH_URL` and a throwaway hash from the shell (below) |

### Problems found in the local `.env` / `.env.local` (values not printed)

1. **`NEXTAUTH_URL` is malformed.** Next loads it as the literal string
   `http://localhost:3000" || "https://bretosolution.com`. The file probably
   has `NEXTAUTH_URL="http://localhost:3000" || "https://bretosolution.com"`.
   Env files have no `||` fallback. `next-auth/react` parses this value at
   module load and throws `ERR_INVALID_URL`, so **`/admin/login` returns 500
   until it is fixed.** Set it to exactly `http://localhost:3000` locally,
   and to `https://bretosolution.com` in production.
2. **`ADMIN_PASSWORD_HASH_B64` is not an encoded bcrypt hash.** It is 15
   characters long and decodes to 11 characters, while bcrypt hashes are 60.
   `getAdminAuthEnv()` rejects it, so every auth call fails with "Missing or
   invalid environment variable: ADMIN_PASSWORD_HASH_B64". Replace it with
   the output of `npm run admin:hash`.

### Other changes outside the new files

- `src/lib/server/rateLimit.ts`: `recordRateLimitHit(request: { headers: Headers }, bucket, { limit, windowMs } = {})`.
  The defaults are unchanged (5 per hour), so the form routes behave as
  before.
- `src/app/robots.ts`: `/admin` added to every user-agent group, because a
  crawler obeys only its most specific group.
- `next.config.ts`: `headers()` sends `X-Robots-Tag: noindex, nofollow` for
  `/admin` and `/admin/:path*`.
- The sitemap is unchanged (`/admin` was never in it).
- Added `src/app/admin/page.tsx`, a placeholder ("Signed in as …" plus a
  sign-out button) protected by `requireAdminPage()`. Stage 3 replaces it.
- The login page still renders inside the public Header and Footer from the
  root layout. Decision 4 above applies: Stage 3 does the route-group split.
