# Stage S1 notes: support inbox state

Status: **STOPPED on conflicts before changing any code.** This file is the
only file written. Nothing was installed and nothing was committed.

Inspected on 2026-11-25 on branch `admin-dashboard`. HEAD is `720224c`.

## What was inspected

| Item | Result | Source |
| --- | --- | --- |
| `README.md`, `PORTING.md`, `ADMIN_PLAN.md` (incl. §6 "Support system") | Read | files |
| `STAGE*_NOTES.md` | **None exist** | cmd: `ls STAGE*_NOTES.md` → no such file |
| `src/state` | **Does not exist** | cmd: `ls -R src/state` → no such file |
| `src/lib/admin` (incl. `apiClient.ts`) | **Does not exist** | cmd: `ls -R src/lib/admin` |
| `src/components/admin` | **Does not exist** | cmd: `ls -R src/components/admin` |
| Any `admin` path, `proxy.ts`, `middleware.ts` | **None** | cmd: `find src -path '*admin*' -o -name proxy.ts -o -name middleware.ts` |
| `src/app` | Only marketing pages + `api/{audit-requests,quote-requests,dev}` | cmd: `ls src/app` |
| Test runner | **None.** No `test` script; no vitest, jest, tsx or ts-node in `node_modules/.bin` | `package.json` scripts; cmd: `ls node_modules/.bin` |
| Node | v24.21.0 | cmd: `node --version` |
| Git log | No Stage 1 / admin commit; last commit `720224c` | cmd: `git log --oneline -8` |

## Conflicts (blocking)

### C1. Stage 1 was never built

The task says to keep the Stage 1 architecture, keep the `requests` and
`toasts` slices as they are, replace the `emails`/`inbox` slices "if Stage 1
created them", and update `apiClient.ts`. None of these exist:
`domain.state.ts`, `domain.action.ts`, `DomainProvider.tsx`,
`src/lib/admin/apiClient.ts`, and the `requests`/`toasts` slices (see the
table above).

There is nothing to keep or update. S1 would have to invent Stage 1 as well:
the store shape, the `requests` and `toasts` slices, the provider and the
API client. Stage 1 is also where NextAuth, the admin layout and the route
split from ADMIN_PLAN §7 would land. Those are not part of S1's scope.

**Decision needed:** either run Stage 1 first, or authorise S1 to also create
the Stage 1 foundation. That foundation would be the store, provider,
`requests` and `toasts` slices, and the API client, but **no** auth, routes
or UI. I would define the `requests` and `toasts` shapes myself and record
them here.

### C2. Tests are required, but there is no runner and no new dependencies are allowed

The gate requires tests, but no test runner is installed (see the table
above). Installing vitest or jest would break "no new dependencies".

The only zero-dependency option is Node 24's built-in `node --test`, which
can run `.ts` files directly by stripping their types. It has two limits:

- It does not resolve the `@/*` path alias (`tsconfig.json` `paths`). Files
  under `src/state` would have to import each other by relative path with
  `.ts` extensions. `tsconfig.json` already allows this with
  `allowImportingTsExtensions: true`.
- It only strips types. It does not run TypeScript features that emit code
  (`enum`, `namespace`, parameter properties). The state code would avoid
  them, using string-literal unions only.

The reducer, actions and selectors would also have to avoid importing
`'use client'` or `@/` modules. The API client would be injected into the
thunks (for example a `deps` argument) so tests can stub it.

**Decision needed:** approve `node --test` and a `"test"` script in
`package.json`, which is a script, not a dependency, or allow one dev
dependency (vitest).

### C3. Uncommitted changes that are not mine are in the working tree

cmd: `git status --short` / `git diff --stat`:

- `M bun.lock`: package name changed from `ai-studio-applet` to `bretosolution`.
- `D package-lock.json`: deleted, 7,565 lines.
- `M src/content/legal.ts`: removed the "no cookies" sentence. The hosting
  line now reads "hostinger deployed on vercel".
- `M src/lib/server/rateLimit.ts`: `REQUEST_LIMIT` changed from 10 to 5.
- `?? ADMIN_PLAN.md`: untracked.

The commit "Admin S1: support inbox state" would include only S1 files,
staged by explicit path, unless you say otherwise. These changes resolve
ADMIN_PLAN risks R1 (host is now stated as Vercel), R2 (in part, the cookie
sentence) and R12 (the rate-limit mismatch). R14 (two lockfiles) is now
resolved in favour of bun.

Effect on the gate: `npm run build`/`lint` still work through
`node_modules`, but with `package-lock.json` deleted, any `npm` install would
rebuild it. I would run the gate with the existing `node_modules` and bun
scripts. **UNKNOWN:** whether `bun` is installed on this machine. To check,
run `bun --version`.

**Decision needed:** should these changes stay out of the S1 commit? (That
is my default.)

### C4. Underspecified DTO fields (strict TS, no `any`)

| Field | Problem | Proposed default |
| --- | --- | --- |
| `DraftDTO.rows` | Type not given. ADMIN_PLAN has no "rows" concept | `{ label: string; value: string }[]`, matching the label/value rows in `AuditRequestNotification` (`src/emails/AuditRequestNotification.tsx:56-76`) |
| `MessageDTO.lastEvent` | Type not given | `string \| null`. The Resend `last_event` union is in `node_modules/resend/dist/index.d.mts:1503`, but inbound messages have none |
| `MessageDTO.error` | Type not given | `string \| null` |
| `MessageDTO.direction` | Values not given | `'INBOUND' \| 'OUTBOUND'`, matching `ConversationDTO.lastDirection` |
| `MessageDTO.at`, `ConversationDTO.lastMessageAt`, `DraftDTO.updatedAt` | Date or string? | ISO-8601 `string`, which is JSON-safe across the API |
| `MessageDTO.status: 'DRAFT'` versus the separate `drafts` slice | Two homes for drafts | Unsent drafts live only in `drafts`. A `MessageDTO` with `DRAFT` comes only from the server and is shown but not edited |
| `DraftDTO.attachment` (single `{name,size}`) versus `MessageDTO.attachments[]` | One attachment per draft only | Keep one, as specified. Note the limit |
| `ContactDTO.name` | Nullable? | `string \| null` |
| `kind` on `DraftDTO` | Same union as the message? | `'AUDIT' \| 'QUOTE' \| 'GENERAL'` (not null on a draft) |

**Decision needed:** confirm these defaults or give the types.

### C5. The S3 endpoints do not exist yet

Every endpoint the API client must call is missing (cmd: `find src -path
'*admin*'`): `/api/admin/conversations*`, `/inbox/sync`, `/drafts*`,
`/attachments/upload-url`. There are also no Prisma support models
(`prisma/schema.prisma` has only `AuditRequest`, `QuoteRequest` and
`RateLimitHit`).

The client can be written against the contracts in the task, but nothing
checks it end to end. Response shapes are **UNKNOWN** until S3 exists, so
each response would be validated with a hand-written type guard, because no
new dependencies are allowed and `zod` is already present. To check, write
S3, then run the client against it.

Proposed response shapes (to confirm):

- `GET /conversations?filter=&q=&cursor=` returns
  `{ items: ConversationDTO[]; nextCursor: string | null }`.
- `GET /conversations/[id]` returns
  `{ conversation: ConversationDTO; messages: MessageDTO[] }`.
- `GET /unread-count` returns `{ count: number }`.

## Non-blocking notes

- The `listKey` format `"<filter>|<search>"` breaks if the search text
  contains `|`. I propose building it as
  `` `${filter}|${encodeURIComponent(search.trim().toLowerCase())}` `` with a
  single `makeListKey()` helper.
- Optimistic status changes also have to adjust `unreadCount` and move
  conversations between cached lists such as `unread|…`. The plan is to apply
  the patch to `byId` and `unreadCount` only, and to mark other affected lists
  stale (`loaded: false`) rather than reorder them. On rollback, restore the
  previous `byId` entries and the previous count.
- `DraftDTO.calendlyUrl`: `site.calendlyUrl` is still the placeholder
  `'[Calendly scheduling link]'` (`src/content/site.ts:14`).
- ADMIN_PLAN §6.6 uses the local database as the source of truth for status,
  with the Resend `thread_id` only as a hint. The requested DTOs (with
  `isRead`, `status`) are consistent with that.

## Decisions requested before S1 proceeds

1. **C1:** run Stage 1 first, or let S1 create the minimal store, provider,
   `requests`/`toasts` and API client foundation?
2. **C2:** `node --test` with a `"test"` script and relative imports, or one
   dev dependency (vitest)?
3. **C3:** leave your uncommitted changes out of the S1 commit?
4. **C4:** accept the proposed field types?
5. **C5:** accept the proposed API response shapes?
