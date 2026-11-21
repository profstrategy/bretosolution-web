# Explicit Consent Plan

## Audit form

The checkbox will sit in `src/components/forms/AuditRequestForm.tsx`, directly above the submit button, below the final email field and above the existing inline submission-error block. The final order will therefore be: fields, hidden honeypot (tab-skipped), consent checkbox, submit button.

The existing audit consent copy will remain in `src/content/audit.ts`. Add:

- `consentLabel` containing exactly `I agree to the Terms of Service and have read the Privacy Policy.`
- `consentError` containing exactly `Please accept the Terms of Service and Privacy Policy to continue.`

The existing `privacyNote` stays unchanged. It now duplicates the purpose/contact summary before the checkbox and is adjacent to but not conflicting with the explicit consent checkbox.

## Quote form

The checkbox will sit in `src/components/forms/QuoteRequestForm.tsx`, only while step 2 is visible, directly above the Back/submit button row and below the country/region field. The inline submission-error block, if present, remains above the checkbox. This means the requested location for the consent control is: last field, consent checkbox, submit button. The Tab order is fields, hidden honeypot (tab-skipped), consent checkbox, then Back and submit controls.

The quote consent copy will be in `src/content/pricing.ts` under `pricingContent.quoteForm`. Add:

- `consentLabel` containing exactly `I agree to the Terms of Service and have read the Privacy Policy.`
- `consentError` containing exactly `Please accept the Terms of Service and Privacy Policy to continue.`

The existing `consentNote` stays unchanged. It duplicates the general statement that information is used to respond and can be stopped, while the checkbox adds a separate explicit legal acknowledgement. It does not conflict, but the duplicate consent language may be noticed.

## Shared checkbox component

Create `src/components/forms/ConsentCheckbox.tsx`.

The component will be a client-usable server-compatible presentational component with props:

- `id`
- `labelText`? No: the exact label and links must come from content files. Existing content objects can expose two link-free label pieces or the component can receive `label` from the content file and render the two required linked words with fixed route targets. To keep JSX free of the exact label copy, pass `labelPrefix`, `termsText`, `privacyText`, and `labelSuffix` from content, or pass the complete structured label values and fixed route targets outside JSX copy.
- `checked`
- `onChange`
- `error?`
- `name`

It will render:

- `<div>` with a 44px minimum row height.
- `<input type="checkbox" id={id} name={name} checked={checked} ...register(name)>`.
- `<label htmlFor={id}>` containing plain text before and after the links. The words `Terms of Service` and `Privacy Policy` will be real `<a target="_blank" rel="noopener noreferrer" href="/terms">` and `<a target="_blank" rel="noopener noreferrer" href="/privacy">`.
- Checkbox and link clicks must remain independent: the anchor has no `onClick` that changes or toggles the checked state.
- `aria-invalid={Boolean(error)}`
- `aria-describedby` set to `${id}-error` only when an error exists.
- Existing `formControlBaseClass` styling is appropriate for text inputs, not a checkbox. The checkbox itself will use a native checkbox with the existing accent and text tokens, a 44px hit-area wrapper, and `focus-visible:ring-3 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:outline-none`. Existing error styling will reuse `text-[var(--accent)]` and the same 13px paragraph pattern from `FormField`.
- The error `<p id={`${id}-error`} role="alert">` will use the exact content-file error text.
- The component will support `react-hook-form` registration in one of two compatible patterns: pass `...register('consent')` to the checkbox while still controlling `checked`? The checkbox is a registered native boolean input, and `defaultValues.consent: false` prevents a pre-ticked state. The component should accept the react-hook-form field registration props or render `{...register('consent')}` itself. In a shared component, pass `registration={register('consent')}` and spread it into the input.

## react-hook-form and Zod type approach

Both shared schemas will add:

- `consent: z.boolean({ error: CONSENT_ERROR }).refine((value) => value === true, { message: CONSENT_ERROR })`

This makes `z.infer<typeof schema>` produce `consent: boolean`, so `false` is valid as the form's in-progress/default value, but validation rejects `false`, missing values, and strings. The exact string, false, and missing payload behavior is therefore enforced by Zod. `AuditRequestValues` and `QuoteRequestValues` remain inferred and continue to include `consent: boolean` in their type-safe submission objects.

The checkbox default is explicitly:

- `consent: false`

in both `useForm` `defaultValues` blocks. `handleReset`/`reset()` must therefore show it unchecked. React Hook Form's `reset()` uses the original defaults, including `consent: false`. The retry path will call `onSubmit(getValues())`; it must only succeed if `consent` is still `true`, and no code will force it to true during retries.

This also means the client helper types do not need cast or bypass fields: `submitAuditRequest(values: AuditRequestValues)` and `submitQuoteRequest(values: QuoteRequestValues)` already send the full values. Consent remains included in `values`.

## Schema and API changes

Change `src/schemas/audit.ts`:

- Add `consent` to `auditRequestSchema`.
- Export the exact consent error string? It can be exported for plan clarity and reuse by content, but the copy itself must live in `src/content/audit.ts`, not JSX. The schema can import `CONSENT_ERROR_MESSAGE` from a content file or duplicate the exact string. Prefer a single exact source: add `consentError` to `src/content/audit.ts` and import it into the schema, keeping Zod and UI labels server/client aligned.

Change `src/schemas/quote.ts` similarly:

- Add `consent` to `quoteRequestSchema`.
- Import or share the same consent error string. Since the exact copy must live in existing content files and quote content has its own `pricingContent.quoteForm.consentError`, importing `pricingContent` into a schema may introduce content coupling but is existing-file-based. No new dependencies or copy source is needed. The plan will use a shared exported constant from `src/content/audit.ts`? That would put quote schema copy in audit content, not ideal. Better add an exported `CONSENT_ERROR_MESSAGE` to `src/content/legal.ts`, then both content files and schemas import it. But requirement 1 says "Put the label text and error message in the existing content files, not in JSX." `src/content/legal.ts` is existing and is the policy content file. However audit and quote existing content files are explicitly expected. The safest exact approach is: define `consentLabel` and `consentError` in both `auditFormContent` and `pricingContent.quoteForm`, and export a schema-only same string constant from each schema. This duplicates the string once per content file and schema. No copy in JSX. It may drift, so a shared export in `src/content/legal.ts` can be imported by both content files and schemas; yet Phase 1 asks label text and error text in existing content files, and `src/content/legal.ts` qualifies.

For the plan, choose:

- Add `consentErrorMessage` and `consentLabelText` to `src/content/audit.ts` and `pricingContent.quoteForm`.
- In each schema, use the exact string from the corresponding content file. Zod and UI share the content string.

Change `src/app/api/audit-requests/route.ts`:

- `auditRequestSchema.safeParse(bodyResult.value)` already validates `consent`.
- Missing/false/string consent produces existing `{ ok: false, errors: { consent: "..."} }` via `getFieldErrors`, HTTP 400.
- Create one server timestamp: `const consentAcceptedAt = new Date();`.
- Build `values` only from the approved form fields and not from `consent`.
- Prisma `create.data` includes `consentAcceptedAt` and `consentVersion: LEGAL_VERSION`, plus `ipHash`, `userAgent`, and existing values.
- Do not spread `parsed.data` or `consent`; only the explicitly listed fields are accepted.
- Notification helper receives the consent timestamp and version or one consent object. Since the timestamp and version are server-generated, the helper must receive those same server values. For example: `notifyAuditRequest(values, { acceptedAt: consentAcceptedAt, version: LEGAL_VERSION })`.
- Update notification email text with `Consent: accepted ${consentAcceptedAt.toISOString()} (policy version ${LEGAL_VERSION})`.

Change `src/app/api/quote-requests/route.ts` identically.

Change `src/lib/server/notify.ts`:

- Update audit and quote lead types to include consent line inputs only as server-owned arguments.
- Do not accept client consent fields as part of lead types.
- Keep `HONEYPOT_FIELD` omitted from notification types.
- Add the exact consent line to both email text arrays.

Change `src/lib/api/audit.ts` and `src/lib/api/quote.ts`:

- No names, return shapes, or result behavior change.
- Their existing `AuditRequestValues` / `QuoteRequestValues` types automatically include `consent: boolean`; no extra field arguments.
- Existing `submitRequest` JSON serialization automatically sends `consent`.

Change `src/lib/api/submit.ts` only if needed for type safety. It already accepts `values: object` and serializes the object; no required change.

No `.env.example` change is required. No new environment variable is needed.

## Prisma and migration

Add to `model AuditRequest`:

- `consentAcceptedAt DateTime?`
- `consentVersion String?`

Add to `model QuoteRequest`:

- `consentAcceptedAt DateTime?`
- `consentVersion String?`

Both columns are nullable for existing test rows and no boolean is stored.

Create a migration folder with the migration name `add_consent_columns` using the existing migration convention. The SQL will add only:

```sql
ALTER TABLE "AuditRequest"
ADD COLUMN "consentAcceptedAt" TIMESTAMP(3),
ADD COLUMN "consentVersion" TEXT;

ALTER TABLE "QuoteRequest"
ADD COLUMN "consentAcceptedAt" TIMESTAMP(3),
ADD COLUMN "consentVersion" TEXT;
```

This can be hand-written, matching the existing PostgreSQL migration style. Do not run `prisma migrate deploy` or `prisma migrate dev` in implementation. `prisma migrate diff` may be used only to generate SQL and does not deploy; however no database connection is needed for hand-written SQL.

## All files expected to change

Phase 1:

- `src/schemas/audit.ts`
- `src/schemas/quote.ts`
- `prisma/schema.prisma`
- `prisma/migrations/<timestamp>_add_consent_columns/migration.sql`
- `src/app/api/audit-requests/route.ts`
- `src/app/api/quote-requests/route.ts`
- `src/lib/server/notify.ts`
- `src/content/audit.ts` only if the schemas import consent copy (or the shared content approach chosen)
- `src/content/pricing.ts` only if the schemas import consent copy

Phase 2:

- `src/components/forms/ConsentCheckbox.tsx` (new)
- `src/components/forms/AuditRequestForm.tsx`
- `src/components/forms/QuoteRequestForm.tsx`
- `src/content/audit.ts`
- `src/content/pricing.ts`

Potentially no change:

- `src/lib/api/submit.ts`
- `src/lib/api/audit.ts`
- `src/lib/api/quote.ts`
- `.env.example`
- `src/lib/server/http.ts`
- `src/lib/server/rateLimit.ts`
- `src/content/legal.ts`
- `prisma migrations` existing migration files

## Smoke docs and final docs

- `scripts/smoke-api.md`: valid audit and quote payloads get `"consent": true`; add missing, false, and string `"true"` payloads and expected 400 fields; add client `consentVersion` and `consentAcceptedAt` on a valid payload and document that it is ignored.
- `PORTING.md`: mark privacy/terms complete and add explicit consent as implemented.
- `LEGAL_PLACEHOLDERS.md`: no changes are expected unless consent implementation creates no new placeholders.
- `.env.example`: no change.

## Duplication and privacy note

The audit existing `privacyNote` and quote existing `consentNote` explain use of data and withdrawal. They are retained and are adjacent to, but not themselves, the explicit consent sentence. They do not conflict with the checkbox. They duplicate the general privacy/consent theme and should be left unchanged unless the user approves copy changes.
