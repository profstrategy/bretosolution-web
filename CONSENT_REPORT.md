# Explicit consent implementation report

## Files changed

### Phase 1

- `src/content/legal.ts`: added `CONSENT_ERROR_MESSAGE`.
- `src/content/audit.ts`: added audit consent label and error copy.
- `src/content/pricing.ts`: added quote consent label and error copy.
- `src/schemas/audit.ts`: added boolean `consent` validation.
- `src/schemas/quote.ts`: added boolean `consent` validation.
- `prisma/schema.prisma`: added nullable consent columns to audit and quote requests.
- `prisma/migrations/20261121171130_add_consent_columns/migration.sql`: added both consent columns to both request tables.
- `src/app/api/audit-requests/route.ts`: validated consent and stored a server-generated timestamp and `LEGAL_VERSION`.
- `src/app/api/quote-requests/route.ts`: validated consent and stored a server-generated timestamp and `LEGAL_VERSION`.
- `src/lib/server/notify.ts`: added consent status, timestamp, and policy version to both notification emails.

### Phase 2

- `src/components/forms/ConsentCheckbox.tsx`: added the shared consent checkbox.
- `src/components/forms/AuditRequestForm.tsx`: registered an unchecked consent checkbox directly above the submit button.
- `src/components/forms/QuoteRequestForm.tsx`: registered an unchecked consent checkbox directly above the final Back/submit row.

### Phase 3

- `scripts/smoke-api.md`: updated valid payloads and added consent missing, false, string, and client-sent metadata cases.
- `PORTING.md`: recorded the legal routes and consent implementation, and the pending migration deployment.
- `CONSENT_REPORT.md`: implementation and verification report.

`LEGAL_PLACEHOLDERS.md` was not changed because the consent implementation did not add or change any legal placeholder.

## Migration

Migration name: `20261121171130_add_consent_columns`

Migration SQL:

- Add `consentAcceptedAt TIMESTAMP(3)` to `AuditRequest`.
- Add `consentVersion TEXT` to `AuditRequest`.
- Add `consentAcceptedAt TIMESTAMP(3)` to `QuoteRequest`.
- Add `consentVersion TEXT` to `QuoteRequest`.

No migration was deployed to a database.

## Commands to run

Configure `DATABASE_URL` and `DIRECT_URL`, then deploy the checked-in migration:

```powershell
npx prisma migrate deploy
```

The migration directory name starts with `20261121171130_add_consent_columns`.

## Verification completed

- `npx prisma validate`: passed.
- `npx prisma generate`: passed.
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with 8 existing Next.js `<img>` warnings.
- `npm run build`: passed.
- `/privacy` and `/terms` remain static routes.

## Could not verify

- Database writes for consent columns.
- That existing and new database rows accept nullable consent fields.
- Resend email delivery of consent lines.
- The actual timestamp and policy version stored in a live database.
- Browser rendering and checkbox interaction.
- Keyboard focus behavior in a browser.
- New-tab opening behavior for the Terms and Privacy links.
- Whether migration deployment succeeds in the target database.
