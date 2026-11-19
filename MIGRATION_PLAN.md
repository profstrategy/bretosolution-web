# Next.js Migration Plan

## Phase 0 audit

Read-only inspection of the current application and migration guide. No application files or dependencies were changed.

### Routes

| Current path | Current page file | New App Router file | New view file |
| --- | --- | --- | --- |
| `/` | `src/pages/Home.tsx` | `src/app/page.tsx` | `src/views/HomeView.tsx` |
| `/solutions` | `src/pages/Solutions.tsx` | `src/app/solutions/page.tsx` | `src/views/SolutionsView.tsx` |
| `/pricing` | `src/pages/Pricing.tsx` | `src/app/pricing/page.tsx` | `src/views/PricingView.tsx` |
| `/audit` | `src/pages/Audit.tsx` | `src/app/audit/page.tsx` | `src/views/AuditView.tsx` |
| `/book-call` | `src/pages/BookCall.tsx` | `src/app/book-call/page.tsx` | `src/views/BookCallView.tsx` |

`src/App.tsx` defines exactly these five routes. It has no redirect, catch-all, or fallback route. The shared `Header`, skip link, and `Footer` are rendered outside the router.

### Client/server inventory

Classification is based on the file's own hooks, event handlers, browser API usage, and form/router hooks. Server-safe components may still be included in a client bundle when imported by a client component.

| File | Classification | Evidence |
| --- | --- | --- |
| `src/components/booking/CalendlyEmbed.tsx` | client | `useEffect`, `useState`, iframe `onLoad`, `window` timer |
| `src/components/forms/AuditRequestForm.tsx` | client | React state, react-hook-form, submit/reset/retry handlers |
| `src/components/forms/FormField.tsx` | server-safe | Presentational wrapper; no hooks or browser APIs |
| `src/components/forms/QuoteRequestForm.tsx` | client | React state/effect, react-hook-form, DOM focus and window event |
| `src/components/layout/Footer.tsx` | server-safe | Static markup and current-year value; no browser APIs |
| `src/components/layout/Header.tsx` | client | State/effects, keyboard event handling, theme hook, router location |
| `src/components/sections/AuditProcess.tsx` | server-safe | Static section markup |
| `src/components/sections/Hero.tsx` | server-safe | Static section markup |
| `src/components/sections/HomeClosingCta.tsx` | server-safe | Static section markup |
| `src/components/sections/Offers.tsx` | server-safe | Static section markup |
| `src/components/sections/Principles.tsx` | server-safe | Static section markup |
| `src/components/sections/ProblemSolution.tsx` | server-safe | Static section markup and image data |
| `src/components/sections/Proof.tsx` | server-safe | Static section markup |
| `src/components/sections/Restaurants.tsx` | server-safe | Static section markup |
| `src/components/sections/Services.tsx` | server-safe | Static markup, inline CSS, image data |
| `src/components/sections/audit/AuditPageSection.tsx` | server-safe | Static section composing the client audit form |
| `src/components/sections/booking/BookCallSection.tsx` | server-safe | Static section composing the client calendar embed |
| `src/components/sections/pricing/PaymentWorksSection.tsx` | server-safe | Static section markup |
| `src/components/sections/pricing/PricingClosingCta.tsx` | server-safe | Static section markup |
| `src/components/sections/pricing/PricingGuidanceSection.tsx` | client | `useState`, dropdown handler, DOM scrolling/focus and `window` |
| `src/components/sections/pricing/RequestQuoteSection.tsx` | server-safe | Static section composing the client quote form |
| `src/components/sections/pricing/SignedScopeSection.tsx` | server-safe | Static section markup |
| `src/components/sections/pricing/StraightAnswersSection.tsx` | client | `useState` and accordion click handlers |
| `src/components/sections/solutions/AcceptanceCriteriaSection.tsx` | server-safe | Static section markup |
| `src/components/sections/solutions/AiSearchVisibilitySection.tsx` | server-safe | Static section markup |
| `src/components/sections/solutions/OngoingGrowthSection.tsx` | server-safe | Static section markup |
| `src/components/sections/solutions/SolutionsClosingCta.tsx` | server-safe | Static section markup |
| `src/components/sections/solutions/SolutionsHero.tsx` | server-safe | Static section markup |
| `src/components/sections/solutions/WebsiteDevelopmentSection.tsx` | server-safe | Static section markup |
| `src/components/ui/AppLink.tsx` | server-safe | Link wrapper; no hooks or browser APIs |
| `src/components/ui/Button.tsx` | server-safe | Presentational button/link wrapper; no own browser APIs |
| `src/components/ui/Container.tsx` | server-safe | Presentational wrapper |
| `src/components/ui/Eyebrow.tsx` | server-safe | Presentational wrapper |
| `src/components/ui/Section.tsx` | server-safe | Presentational wrapper |
| `src/components/ui/SectionHeading.tsx` | server-safe | Presentational wrapper |
| `src/hooks/use-mobile.ts` | client | `useEffect` and `window.matchMedia` |
| `src/lib/api/audit.ts` | client | Mock uses `window.localStorage` |
| `src/lib/api/quote.ts` | client | Mock uses `window.localStorage` |
| `src/lib/theme.ts` | client | Hook, `window`, `document`, localStorage and event listeners |
| `src/lib/utils.ts` | server-safe | Pure class-name utility |

Only the six interactive component files listed as client need client boundaries; `FormField` and presentational shared components do not use hooks themselves.

### Theme

- The old inline script in `index.html` runs before the app bundle, reads `localStorage['breto-theme']`, adds `dark` to `document.documentElement` only for the exact value `dark`, and removes it for every other value. It is wrapped in `try/catch`.
- `src/styles/globals.css` applies dark tokens under `html.dark`.
- `src/lib/theme.ts` uses the same key. `useTheme()` begins in light state, then reads storage in an effect; valid `dark`/`light` values are honored, missing/invalid/blocked storage falls back to light. It applies the class, listens for the app's `breto-theme-change` event and storage events, and writes storage on toggle with caught storage errors.
- **UNKNOWN:** The migration instructions request a `prefers-color-scheme` fallback, but neither the old inline script nor `src/lib/theme.ts` checks that preference. The existing behavior is light when there is no saved `dark` value. Confirm whether preserving the old behavior takes precedence over adding a system preference.

### Fonts and stylesheet

`src/styles/globals.css` loads Google Fonts through an `@import` in this order:

- Inter: 400, 500, 600; CSS variable `--font-sans` with system fallbacks.
- JetBrains Mono: 400, 500; CSS variable `--font-mono`.
- Playfair Display: 500, 600, 700; CSS variable `--font-display` with Georgia/serif fallbacks.
- Satisfy: default/400; CSS variable `--font-script` with cursive fallback.

The stylesheet keeps the four CSS variable names and stacks in `:root`. `index.html` separately preconnects to `fonts.googleapis.com` and `fonts.gstatic.com` (crossorigin on the latter). `package.json` has Tailwind CSS **v4** (`tailwindcss` 4.1.11, `@tailwindcss/postcss` 4.1.11, and the Vite-specific Tailwind plugin 4.1.11). The CSS is CSS-first (`@import "tailwindcss"`); there is no Tailwind config file. `postcss.config.mjs` uses `@tailwindcss/postcss` and `autoprefixer` and appears usable as-is with Next.js.

### Hash and scroll behavior

- `App.tsx` mounts `ScrollToHash`. On pathname/hash/key changes it resets to the top without a hash, otherwise decodes the hash and retries lookup with animation frames for up to 500 ms. A found target is scrolled into view, smoothly unless reduced motion is requested.
- For `#quote`, it dispatches `breto:focus-quote-form` and focuses `#quote-business-type`; other targets have their heading (or target) made focusable and focused.
- `PricingGuidanceSection.tsx` separately intercepts the “Discuss a small project” `#quote` link, prevents native navigation, smoothly scrolls to `#quote-form` or `#quote`, dispatches the same event, and focuses the first field.
- Pricing's quote section has `id="quote"` and `scroll-mt-[96px]`; the form also has `scroll-mt-[96px]`. `Section.tsx` adds `scroll-mt-[96px]` whenever an ID is supplied, including the three Solutions targets: `#ai-search-visibility`, `#website-development`, and `#ongoing-digital-growth`.
- Hash behavior to preserve under the migration requirements: retain these IDs and 96px offsets, remove the custom router hash mount/scroll behavior, and use fragment navigation for direct loads and client navigation. The old focus/scroll behavior is additional behavior that will not be provided by native fragment scrolling.

### Existing entry files and replacement duties

| File | Current duties to carry into Next.js or record in the migration log |
| --- | --- |
| `index.html` | `lang=en`, charset and viewport; home title and global description; Open Graph title/description; font preconnects; pre-paint theme script; `#root` and module entry. Root layout/metadata/font loading replaces these duties. |
| `src/main.tsx` | React `StrictMode`, `createRoot(#root)`, `BrowserRouter`, and global CSS import. The App Router root layout and route tree replace it; CSS remains at `src/styles/globals.css`. |
| `src/App.tsx` | Five routes; shared skip link (`#main-content`), Header and Footer; custom hash scrolling. App Router files/layout replace route/shared layout duties. |
| `vite.config.ts` | React and Tailwind Vite plugins; `@` alias to `src`; host `0.0.0.0`, port 3000; `DISABLE_HMR` switch. Next configuration and `tsconfig.json` replace relevant duties; the Vite-only settings are retired. |
| `metadata.json` | AI Studio app name/description, empty frame permissions and a Gemini server capability declaration. No app source imports it; Next metadata replaces the site's document metadata. |
| `bun.lock` | Bun lockfile for the current package/dependency set; it has no runtime behavior. Replace with npm's `package-lock.json`. |

The five current page files each set `document.title` from their matching content module in an effect and render their own `<main id="main-content">`. The title values are present in `home.ts`, `solutions.ts`, `pricing.ts`, `audit.ts`, and `bookCall.ts`. The root layout will need to own the single main landmark, so those page wrappers must be removed from the views. The current skip link targets `#main-content`; the requested root layout landmark ID is `main`, so its fragment target must be updated to match.

### Mock APIs and callers

- `src/lib/api/audit.ts` waits 700 ms, generates `BR-` plus six characters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, and returns a mock success. A non-empty honeypot returns success without storing. Otherwise it attempts to read/append a normalized audit record under `bretosolution.audit-requests` in localStorage. Storage/parse errors are swallowed and still return success.
- `src/lib/api/quote.ts` behaves similarly with `QT-`, stores normalized quote fields under `bretosolution.quote-requests`, and skips storage for a filled honeypot. Storage errors are swallowed and still return success.
- `AuditRequestForm.tsx` calls `submitAuditRequest`; `QuoteRequestForm.tsx` calls `submitQuoteRequest`. Neither sends a network request. No API route exists in the current app.

### Unreferenced items and dependency candidates

- `src/hooks/use-mobile.ts` exports `useIsMobile` but no source file imports it.
- `allBrandAssetList` in `src/content/assets.ts` has no imports/usages; the assets module itself is used.
- All components under `src/components` are used in the five current page compositions. No other unreferenced component, hook, or library file was found.
- No source imports were found for `@google/genai`, `motion`, `class-variance-authority`, `@tailwindcss/typography`, `tw-animate-css`, or `firebase-tools`; confirm these as removal candidates when editing the manifests. `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, and `react-router-dom` are Vite/router setup dependencies. `postcss`, `autoprefixer`, `tailwindcss`, `@tailwindcss/postcss`, `clsx`, `tailwind-merge`, `lucide-react`, `react-hook-form`, `zod`, and `@hookform/resolvers` are referenced by the project/configuration.

### Environment and metadata observations

- `.env.example` contains `GEMINI_API_KEY` and `APP_URL`, but no app source reads either. `vite.config.ts` reads `DISABLE_HMR`; that read disappears with Vite. No `import.meta.env`, other process environment reads, or current Calendly environment variable exists in source.
- The only current description is the global description in `index.html`; the five content modules contain document titles, not page-specific meta descriptions. Existing Open Graph title and description are also in `index.html`. The Phase 4 scope allows only existing title/description values, so missing page-specific descriptions remain open rather than being authored.
- **UNKNOWN:** The compatible Next.js version and its required React versions have not been selected; verify from npm/package metadata during Phase 1 rather than assuming a version.

### Unexpected findings

- `FILE_STRUCTURE.md` is tracked but omitted from the requested current-structure list. It says the two `public/assets/aistudio/` images are deleted, while both images are present and tracked in this checkout. Do not modify `public/`; keep this existing file untouched unless explicitly requested.
- The current theme fallback and requested `prefers-color-scheme` fallback conflict, as noted above.
- The user-requested `<main id="main">` differs from the old `#main-content` target; the skip-link target must be kept in sync.
- Phase 2's native fragment navigation intentionally replaces custom smooth-scroll/focus handling described above.

## Phase 0 gate

- [x] This file exists.
- [x] Every route defined in `src/App.tsx` is listed in the route table.
- [x] Every file under `src/components` is listed in the client/server table.
- [x] No application code, dependency manifest, or existing content was changed during the audit.

**Result: PASS. Awaiting approval before Phase 1.**
