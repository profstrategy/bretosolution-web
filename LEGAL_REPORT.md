# Legal implementation report

## Verification summary

- `npm run build`: passed.
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with 8 existing Next.js `<img>` warnings.
- `/privacy` and `/terms` are prerendered static routes in the Next.js build.
- The served `/privacy` HTML has one `<h1>`, the table of contents, and the "Who we are and how to contact us" section.
- The served `/terms` HTML has one `<h1>`, the table of contents, and the "About these terms and who they apply to" section.
- `/privacy` and `/terms` are both present in `/sitemap.xml`.
- The footer serves real `/privacy` and `/terms` links.
- No `src/pages` directory exists.

## Open placeholders

| Placeholder | Exact file and section |
|---|---|
| `[[PLACEHOLDER: registered business name]]` | `src/content/legal.ts`, Privacy Policy, "Who we are and how to contact us" |
| `[[PLACEHOLDER: registered business address]]` | `src/content/legal.ts`, Privacy Policy, "Who we are and how to contact us" |
| `[[PLACEHOLDER: privacy contact email]]` | `src/content/legal.ts`, Privacy Policy, "Who we are and how to contact us"; Privacy Policy, "Contact"; Terms of Service, "Contact" |
| `[[PLACEHOLDER: database host provider name or region]]` | `src/content/legal.ts`, Privacy Policy, "Who receives it" |
| `[[PLACEHOLDER: website hosting provider name or region]]` | `src/content/legal.ts`, Privacy Policy, "Who receives it" |
| `[[PLACEHOLDER: Resend account region or processing location]]` | `src/content/legal.ts`, Privacy Policy, "Who receives it" |
| `[[PLACEHOLDER: retention period for leads]]` | `src/content/legal.ts`, Privacy Policy, "How long we keep it" |
| `[[PLACEHOLDER: state or city for courts]]` | `src/content/legal.ts`, Terms of Service, "Governing law" |
| `[Calendly scheduling link]` | `src/content/site.ts`, `calendlyUrl`; also used by `src/components/booking/CalendlyEmbed.tsx` to decide that the live booking iframe is not active |
| `[Business email]` | `src/content/site.ts`, `site.contactEmail` |
| `[Business email]` | `src/content/site.ts`, `site.contact.email` |
| `[Phone or WhatsApp]` | `src/content/site.ts`, `site.contactPhone` |
| `[Phone or WhatsApp]` | `src/content/site.ts`, `site.contact.phone` |
| `[Privacy notice]` | `src/content/site.ts`, `site.legalPrivacy` |
| `[Terms of service]` | `src/content/site.ts`, `site.legalTerms` |
| `[Privacy notice]` | `src/content/site.ts`, `site.legal.privacy` |
| `[Terms of service]` | `src/content/site.ts`, `site.legal.terms` |
| `[Privacy notice] · [Terms of service]` | `src/content/site.ts`, `site.footer.legalNotice`; no longer used for the legal footer links |

The register of all `[[PLACEHOLDER: ...]]` values is [LEGAL_PLACEHOLDERS.md](./LEGAL_PLACEHOLDERS.md). No placeholder has been removed or guessed.

## Required differences from assumptions

- No lead retention rule exists in the code. Audit and quote records have no deletion or expiration rule, and the database models contain no retention field or cleanup job.
- Rate-limit records are the only server records with implemented cleanup: they are deleted after 24 hours.
- Raw IP addresses are not stored. The server stores a SHA-256 hash built from the request IP and `RATE_LIMIT_SALT`.
- The form submission user-agent is stored only after truncation to 200 characters.
- The code has no cookie implementation, session-storage implementation, IndexedDB use, or localStorage use except `breto-theme`.
- The Calendly booking interface is inactive today because `src/content/site.ts` contains `[Calendly scheduling link]`. The code cannot receive or store booking fields from Calendly while that placeholder remains.
- The database implementation names PostgreSQL, not a database provider or region.
- Resend is the implemented email provider, but its account region and processing location are not specified by the code.
- The code does not document a specific hosting provider or hosting region.
- Next.js font generation is configured for Inter, Playfair Display, JetBrains Mono, and Satisfy. The code does not establish a separate browser-side font request or script host.
- No automated database backup or provider-retention period is defined in the repository.
- The audit and quote privacy/consent notes remain plain strings in `src/content/audit.ts` and `src/content/pricing.ts`, so they were not turned into link-bearing fragments. Their locations are:
  - `src/content/audit.ts`, `auditFormContent.privacyNote`, rendered by `src/components/forms/AuditRequestForm.tsx`
  - `src/content/pricing.ts`, `pricingContent.quoteForm.consentNote`, rendered by `src/components/forms/QuoteRequestForm.tsx`

## Could not verify

- Whether a real database is deployed or whether the checked-in migrations have been applied.
- Whether database, application, email, or hosting backups exist and for how long.
- The database host, website hosting provider, their regions, and their data-processing arrangements.
- The Resend account region and provider retention period.
- Whether the Resend delivery recipient, sender, API key, and lead email settings are configured in production.
- Whether submitted audit and quote records are actually being persisted and delivered in production.
- Whether rate-limit behavior works correctly behind the production proxy.
- Whether the production host serves the site over HTTPS. Hosting configuration is outside the repository.
- The registered business name and address.
- The designated privacy contact email.
- The applicable retention period for audit and quote leads.
- The state or city to identify courts for the governing-law clause.
- Whether a real Calendly account and scheduling URL are in use.
