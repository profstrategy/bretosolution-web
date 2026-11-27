# Admin stage 3 notes: shell UI

Inspected on 2026-11-25 on branch `admin-dashboard` (HEAD `6cb3edd`, clean).
Read: `README.md`, `PORTING.md`, `ADMIN_PLAN.md`, `STAGE1_NOTES.md`,
`STAGE2_NOTES.md`, `STAGE_S1_NOTES.md`, `src/state/*`, `src/lib/auth/*`,
`src/styles/globals.css`, `src/lib/theme.ts`,
`src/components/layout/{Header,Footer}.tsx`, `src/components/ui/*`,
`src/app/layout.tsx` and `src/app/admin/**`.

## What exists that this stage touches

| Item | State | Source |
| --- | --- | --- |
| Domain store | `DomainProvider`, `useDomainSelector`, `selectRequest`, `requestKeys.emailsList = 'emails/list'`, `requestKeys.inboxList = 'inbox/list'`. Not yet mounted | `src/state/index.ts`, `src/state/domain.action.ts` |
| Toaster | `src/components/admin/Toaster.tsx`, not mounted | file |
| Auth helpers | `requireAdminPage()`, `getAdminSession()`, `ADMIN_LOGIN_PATH` | `src/lib/auth/requireAdmin.ts` |
| Admin routes | `src/app/admin/page.tsx` (Stage 2 placeholder, protected), `src/app/admin/login/page.tsx` | cmd: `ls -R src/app/admin` |
| Theme | Tokens on `:root` and `html.dark` (`globals.css:3-50`). Hook `useTheme()`, key `breto-theme`, event `breto-theme-change` (`src/lib/theme.ts:7-8,59-108`). The toggle is an inline button in the public `Header` (`Header.tsx:101-116`), not a component | files |
| Fonts | `--font-display` (Playfair), `--font-sans` (Inter), `--font-mono` (JetBrains Mono) | `globals.css:27-30`, `layout.tsx:57-83` |
| UI kit | `Button` (primary/secondary/small), `AppLink`, `Eyebrow`, `cn()` | `src/components/ui/*`, `src/lib/utils.ts` |
| lucide-react | 1.76.0, already installed | `package.json` |
| Env | `NEXTAUTH_URL` is valid and `ADMIN_PASSWORD_HASH_B64` is a valid bcrypt hash (both fixed since Stage 2). `ADMIN_INBOX_ADDRESS` is set. Checked by shape only; values not printed | scratch script with `@next/env` |
| Screenshots | Playwright **not installed**. Microsoft Edge is at `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`, so screenshots can use Edge headless through the DevTools protocol and Node 24's built-in `WebSocket`. No dependency is needed | cmd: `ls` |

## CONFLICT: the root layout wraps /admin in the public site chrome

`src/app/layout.tsx:149-162` renders, around **every** route including
`/admin/*`:

- the JSON-LD `Organization`/`WebSite` graph
- the "Skip to content" link to `#main`
- the public `<Header />` (logo, Solutions/Pricing nav, "Free AI Visibility
  Audit" CTA, theme toggle)
- `<main id="main">`
- the public `<Footer />`

It also sets default `robots: index: true` (`:46-54`), which the admin
metadata overrides. `ADMIN_PLAN.md` R7 and `STAGE2_NOTES.md` decision 4
flagged this.

The prompt needs an admin shell with its own sticky header, sidebar and
breadcrumb. Inside the current root layout, that shell would sit under the
public header pill and above the public footer: two headers and two theme
toggles. Removing the public chrome from `/admin` means changing how the
public layout is put together, which touches "do not change the public site".

Options:

| Option | Change | Public site |
| --- | --- | --- |
| **A. Route-group split (recommended)** | Root `layout.tsx` keeps only `<html>`, fonts, `globals.css`, the theme pre-paint script, base metadata and `<body>`. A new `src/app/(site)/layout.tsx` holds JSON-LD, skip link, `Header`, `<main id="main">` and `Footer`. The seven public `page.tsx` folders, `robots.ts` and `sitemap.ts` stay where they are or move into `(site)` (route groups do not change URLs) | Same URLs, same HTML and look. Files move and the root layout is split. Verified by comparing the HTML of every public route before and after |
| B. Client-side hiding | Wrap `Header` and `Footer` in a small client component that returns `null` when `usePathname()` starts with `/admin` | No files move, but `layout.tsx` changes and the public `Header`/`Footer` render through a client wrapper. JSON-LD and the skip link still appear on admin pages |
| C. Leave it | The admin shell renders inside the public header and footer | Unchanged, but the admin shell looks broken (two headers) |

**Decision needed:** A, B or C.

## Decisions I will apply (non-blocking)

1. **Route structure:**
   - `src/app/admin/layout.tsx` is shared by admin and login. It sets
     `dynamic = 'force-dynamic'` and noindex metadata, and only passes
     `children` through.
   - `src/app/admin/(dashboard)/layout.tsx` calls `requireAdminPage()` and
     wraps the protected pages in `SessionProvider`, `DomainProvider`, the
     shell and `Toaster`.
   - `/admin/login` stays outside `(dashboard)`, so it is not protected or
     wrapped.
   - The Stage 2 placeholder `src/app/admin/page.tsx` moves to
     `(dashboard)/page.tsx` and becomes `redirect('/admin/emails')`.
     `src/components/admin/SignOutButton.tsx` is then unused and is removed.
2. **Theme switch.** A new admin `ThemeToggle` reuses `useTheme()` from
   `src/lib/theme.ts` (same key, same event, same Moon/Sun icons and
   labels from `site.header`). The public `Header` is not changed.
3. **Breadcrumb subject.** Detail routes (`/admin/emails/[id]`) do not exist
   yet. The breadcrumb takes the third segment from the path and reads the
   subject from the store (`selectEmailById` or `selectInboxItemById`). It
   falls back to "Email" and is truncated with CSS.
4. **Subtitle address.** Read on the server from `ADMIN_INBOX_ADDRESS`
   (trimmed and validated as an email), with fallback
   `hello@bretosolution.com`. It is passed to the client as a prop; no
   other env value reaches the client.
5. **Signed-in check.** Gives the screenshot browser a session cookie made
   locally with `next-auth/jwt` `encode()` and `NEXTAUTH_SECRET`, read
   inside a scratch script and never printed. This avoids
   making login attempts that would write rate-limit rows.

## Resolution

The owner chose **option B (hide on /admin, client-side)**.

- `src/components/layout/SiteChrome.tsx` (client) renders `{header}`,
  `<main id="main" tabIndex={-1} className="outline-none">` and `{footer}`,
  the exact markup the root layout used before, except under `/admin`, where
  it renders only `children`.
- `src/app/layout.tsx` now passes `<Header />` and `<Footer />` to it. JSON-LD
  and the skip link still render on admin pages. The skip link targets
  `#main`, which the admin shell and the login page now provide.
- This also removes the public chrome from `/admin/login`. Its 112 px top
  padding (made for the public header) became `py-12`, and it got its own
  `<main id="main">`.

## Outcome

### Files

- New routes:
  - `src/app/admin/layout.tsx` (noindex, `force-dynamic`, title template)
  - `src/app/admin/(dashboard)/layout.tsx` (`requireAdminPage`, providers,
    shell, Toaster)
  - `src/app/admin/(dashboard)/page.tsx` (redirects to `/admin/emails`)
  - `src/app/admin/(dashboard)/emails/page.tsx`
- New components in `src/components/admin/`:
  - `AdminProviders` (SessionProvider + DomainProvider)
  - `AdminShell`, `AdminHeader`, `AdminBreadcrumb`, `AdminSidebar`,
    `AdminDrawer`
  - `ThemeToggle` (uses `useTheme()`, key `breto-theme`)
  - `LogoutButton`
  - `paths.ts`
  - `emails/EmailsView`, `emails/EmailPanels`, `emails/SendMailButton`
- Other new files: `src/components/layout/SiteChrome.tsx`,
  `src/content/admin.ts` (copy), `src/lib/admin/inboxAddress.ts`
  (server-only `ADMIN_INBOX_ADDRESS`, fallback `hello@bretosolution.com`).
- Removed `src/app/admin/page.tsx` and `src/components/admin/SignOutButton.tsx`
  (the Stage 2 placeholder).
- Changed `src/app/layout.tsx` (SiteChrome) and
  `src/app/admin/login/page.tsx` (padding, `<main>`).

### Gate

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | exit 0. An earlier run failed only on stale `.next/types` and `.next/dev/types` that still referenced the deleted `admin/page.tsx`. `next build` regenerated them |
| `npm run lint` | 0 errors. The same 8 existing `<img>` warnings. The sidebar logo uses `next/image`, so it adds none |
| `npm test` | 41 pass |
| `npm run build` | success. New dynamic routes `/admin` and `/admin/emails`. Bundling `src/state` works, which resolves the open `.ts`-import question from STAGE1_NOTES item 10 |

### Public site unchanged

The HTML of `/`, `/solutions`, `/pricing`, `/audit`, `/book-call`,
`/privacy`, `/terms`, `/robots.txt` and `/sitemap.xml` was captured from the
HEAD build before any change. It was compared with the final build after
removing `<script>` blocks, hashed `/_next/static/*` URLs and preload links.
All 9 are **identical**.

### Auth checks (`next start -p 3100`)

- Signed out: `/admin`, `/admin/emails` and `/admin/emails?tab=receiving` all
  return 307 → `/admin/login`.
- Signed in: `/admin` returns 307 → `/admin/emails`, `/admin/emails` returns
  200 (no public header in the HTML), and `/admin/login` returns 307 →
  `/admin`.
- `X-Robots-Tag: noindex, nofollow` is present.
- The session cookie was minted locally with `next-auth/jwt` `encode()`
  (secret read in a scratch script, token never printed, file deleted
  afterwards). This avoided real login attempts and rate-limit writes. The
  real password and Google sign-in were **not** exercised in this stage.

### Browser checks (headless Edge through the DevTools protocol, Node `WebSocket`, no dependency)

Screenshots were taken of `/admin/emails` in light and dark at 390, 768 and
1440 px, plus the Receiving tab, the drawer, the collapsed sidebar tooltip
and the login page in both themes.

| Check | Result |
| --- | --- |
| Horizontal overflow | none at 390 / 768 / 1440, in both themes |
| Header height | 64 px |
| Breakpoints | Menu button and drawer under 1024 px. Sidebar at 1440. "Send a mail" fills the width at 390 (358 px) and is auto width at 768 and 1440 (165 px). Email hidden at 390 (screenshot) |
| Breadcrumb | "Admin › Emails", with `aria-current="page"` on "Emails" |
| Tabs | ArrowRight moves focus and selection to Receiving and sets `?tab=receiving`. Reload keeps Receiving. `history.back()` returns to Sending |
| Sidebar | 240 → 72 px on collapse. `aria-expanded` changes true → false. `localStorage['breto-admin-sidebar'] = 'collapsed'`, and the width stays 72 after reload |
| Tooltip (collapsed) | opacity 1 on mouse hover and on keyboard (Tab) focus |
| Drawer (390) | Opens with focus inside, `aria-expanded=true`, body scroll locked. Escape closes it, returns focus to the menu button and unlocks scroll |
| Themes | `html.dark` applied from `breto-theme`. Tokens render in both (screenshots) |

Not verified:
- The loading skeleton visually. No request is pending until Stage 6 wires
  loading; the logic is `status === 'pending' && ids.length === 0`.
- Screen-reader announcements.
- Real reduced-motion rendering. The global `prefers-reduced-motion` rule in
  `globals.css:84-93` and the `motion-safe:` skeleton pulse are in place, but
  were not emulated.
- The Log out round trip in a browser.
