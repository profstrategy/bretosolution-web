# Admin stage 1 notes: domain state architecture

Inspected on 2026-11-25 on branch `admin-dashboard` (HEAD `720224c`).
Read: `README.md`, `PORTING.md`, `ADMIN_PLAN.md`, `STAGE_S1_NOTES.md`,
`package.json` and the full `src` tree (cmd: `find src -type f`).

## What already exists that this stage touches

| Item | State | Source |
| --- | --- | --- |
| `src/state/` | Does not exist. Created by this stage | cmd: `ls src/state` |
| `src/lib/admin/` | Does not exist. `apiClient.ts` created by this stage | cmd: `ls src/lib/admin` |
| `src/components/admin/` | Does not exist. `Toaster.tsx` created by this stage | cmd: `ls src/components/admin` |
| `/api/admin/*` endpoints (Stage 4) | Do not exist. The client is written against the contract below | cmd: `find src -path '*admin*'` |
| Theme tokens and fonts | `--panel --ink --muted --line --accent --btn2 --shadow` and `--font-sans` in `src/styles/globals.css:3-50`. Reused, not changed | file |
| `cn()` | `src/lib/utils.ts:4-6`. Reused | file |
| `lucide-react` 1.76.0 | Already a dependency (`X` icon for dismiss) | `package.json` |
| React types | `useSyncExternalStore<Snapshot>(subscribe, getSnapshot, getServerSnapshot?)` | `node_modules/@types/react/index.d.ts:1931-1935` (19.3.0) |
| Lint | `eslint-plugin-react-hooks` 7.1.1 through `eslint-config-next` 16.4.6 | `node_modules/*/package.json` |
| Root layout | Untouched. The provider is **not** mounted (Stage 3 mounts it in `src/app/admin/layout.tsx`) | `src/app/layout.tsx` |

## Decisions (non-blocking, made within the prompt's rules)

1. **Test runner.** There is no test runner and `tsx` is not installed
   (cmd: `ls node_modules/.bin`). Node v24.21.0 ships `node:test` and runs
   `.ts` files directly by stripping their types. I verified this in the
   scratchpad with `node --test "*.test.ts"` (1 pass). The tests therefore
   run with
   `node --test "src/state/__tests__/*.test.ts"`, exposed as the
   `npm test` script. This adds no dependency. Consequences:
   - Files loaded by tests must use only erasable TypeScript: no `enum` and
     no parameter properties.
   - Runtime imports between state files use relative `./x.ts` paths,
     which `tsconfig.json` allows with `allowImportingTsExtensions: true`.
2. **API client is injected.** `domain.action.ts` has only **type**
   imports. The async action creators come from
   `createAsyncActions(client)`, and `DomainProvider` binds them to the
   real `adminApiClient`. Tests pass a stub client. Each thunk still has the
   signature `(dispatch, getState) => Promise<void>`.
3. **Extra file `src/state/domain.store.ts`.** It holds `createDomainStore`
   (getState, dispatch for actions and thunks, subscribe), so the store is
   testable without JSX. Selectors live in `domain.state.ts` (pure) and are
   re-exported from `DomainProvider.tsx` and `index.ts`.
4. **DTO field types not given by the prompt:**
   - all dates are ISO-8601 `string` (`sentAt: string | null`)
   - `rows: { label: string; value: string }[]`
   - `calendlyUrl: string | null`
   - `lastEvent: string | null` (Resend's `last_event`, typed as a union at
     `node_modules/resend/dist/index.d.mts:1503`, but this is our DTO)
   - `error: string | null` (a safe, server-written message)
   - `InboxItemDTO.to: string[]` and `from: string`, like Resend's
     `to: string[]`/`from: string` at `index.d.mts:1677-1678`
   - `attachments[].filename: string`. Stage 4 maps Resend's
     `filename: string | null` (`index.d.mts:1668`) to a fallback name.
5. **Stage 4 response contract** (defined in `apiClient.ts` and checked by
   type guards):
   - list endpoints return `{ items, nextCursor }`
   - email endpoints return `{ email }`
   - `inbox/[id]` returns `{ message }`
   - `preview` returns `{ html, text }`
   - `upload-url` returns `{ uploadUrl, storagePath }`
   - `DELETE` returns 204 or `{ ok: true }`
6. **Toasts on success.** As specified, every async action that completes
   pushes a success toast, including loads. A `loadMore*` call with no
   cursor is a no-op: no request and no toast.
7. **Working tree.** Uncommitted changes not made in this stage
   (`bun.lock`, the deleted `package-lock.json`, `src/content/legal.ts`,
   `src/lib/server/rateLimit.ts`) and the untracked `ADMIN_PLAN.md` and
   `STAGE_S1_NOTES.md` are **left out of the commit**. Only Stage 1 files and
   the `test` script are staged, by explicit path. `package.json` is staged
   with only the `test` line changed.

8. **Store per mount uses `useState(() => createDomainStore())`, not
   `useRef`.** `eslint-plugin-react-hooks` 7.1.1 reported "Cannot access
   refs during render" for `value={storeRef.current}`. A lazy `useState`
   initialiser also runs once per mount and returns a stable value.
9. **Snapshot memo moved to `createSelectedSnapshot()` in
   `domain.store.ts`.** The same lint rules rejected a mutable closure
   created inside the hook ("Cannot reassign variable after render
   completes"). The factory is plain code and is unit-tested.
10. **Bundler resolution of `./x.ts` imports not yet exercised.** Nothing
    imports `src/state` yet, so `next build` type-checked these files but
    did not bundle them. **UNKNOWN:** whether Turbopack resolves the
    `.ts`-suffixed relative imports in `domain.store.ts`. Stage 3 checks this
    when it mounts the provider; `next build` will fail loudly if it doesn't.

## Gate results

| Check | Result |
| --- | --- |
| `npm test` (`node --test`) | 41 tests, 41 pass, 0 fail |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | 0 errors. 8 warnings, all existing `<img>` warnings in public-site files (`CalendlyEmbed`, `Footer`, `Header`, `ProblemSolution`, `Services`) |
| `npm run build` | success. Route list unchanged; no `/admin` route |

## Conflicts

None blocking. `STAGE_S1_NOTES.md` (a later stage) replaces the
`emails`/`inbox` slices with conversations/messages/drafts. That is S1's
concern, not this stage's.
