# Form API smoke tests

These are manual PowerShell commands, not CI tests. Run them against a local
server after configuring a test database, applying the migration, and setting
the required environment variables. Every valid audit and quote request is
stored and sends an owner notification; requests within the recipient limit
also send a confirmation. Replace `your-owned-address@example.com` in the
payloads with an address you own before running these tests.

The examples create temporary request bodies under the system temp directory.
The six-request tests use a reserved test IP in `X-Forwarded-For`; use these
only against a local server, not behind a production proxy.

```powershell
$base = 'http://localhost:3000'
$tempDir = Join-Path $env:TEMP ("bretosolution-api-smoke-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tempDir | Out-Null
$auditPayloadPath = Join-Path $tempDir 'audit.json'
$quotePayloadPath = Join-Path $tempDir 'quote.json'
$missingPayloadPath = Join-Path $tempDir 'missing.json'
$auditConsentMissingPath = Join-Path $tempDir 'audit-consent-missing.json'
$auditConsentFalsePath = Join-Path $tempDir 'audit-consent-false.json'
$auditConsentStringPath = Join-Path $tempDir 'audit-consent-string.json'
$quoteConsentMissingPath = Join-Path $tempDir 'quote-consent-missing.json'
$quoteConsentFalsePath = Join-Path $tempDir 'quote-consent-false.json'
$quoteConsentStringPath = Join-Path $tempDir 'quote-consent-string.json'
$auditIgnoredConsentMetadataPath = Join-Path $tempDir 'audit-ignored-consent-metadata.json'
$quoteIgnoredConsentMetadataPath = Join-Path $tempDir 'quote-ignored-consent-metadata.json'
$honeypotPayloadPath = Join-Path $tempDir 'honeypot.json'
$largePayloadPath = Join-Path $tempDir 'large.txt'

[System.IO.File]::WriteAllText($auditPayloadPath, '{"businessName":"Smoke Test Bistro","websiteOrInstagram":"https://example.com","city":"Lagos","businessType":"Restaurant","email":"your-owned-address@example.com","consent":true,"hp_trap_7q":""}', [System.Text.Encoding]::ASCII)
[System.IO.File]::WriteAllText($quotePayloadPath, '{"businessType":"Restaurant","helpNeeded":"AI Visibility Optimization","mainChallenge":"Smoke test","contactName":"Smoke Test Owner","businessName":"Smoke Test Bistro","email":"your-owned-address@example.com","phoneOrWhatsapp":"","websiteOrInstagram":"https://example.com","countryRegion":"Nigeria","consent":true,"hp_trap_7q":""}', [System.Text.Encoding]::ASCII)
[System.IO.File]::WriteAllText($missingPayloadPath, '{}', [System.Text.Encoding]::ASCII)
[System.IO.File]::WriteAllText($auditConsentMissingPath, '{"businessName":"Smoke Test Bistro","websiteOrInstagram":"https://example.com","city":"Lagos","businessType":"Restaurant","email":"your-owned-address@example.com","hp_trap_7q":""}', [System.Text.Encoding]::ASCII)
[System.IO.File]::WriteAllText($auditConsentFalsePath, '{"businessName":"Smoke Test Bistro","websiteOrInstagram":"https://example.com","city":"Lagos","businessType":"Restaurant","email":"your-owned-address@example.com","consent":false,"hp_trap_7q":""}', [System.Text.Encoding]::ASCII)
[System.IO.File]::WriteAllText($auditConsentStringPath, '{"businessName":"Smoke Test Bistro","websiteOrInstagram":"https://example.com","city":"Lagos","businessType":"Restaurant","email":"your-owned-address@example.com","consent":"true","hp_trap_7q":""}', [System.Text.Encoding]::ASCII)
[System.IO.File]::WriteAllText($quoteConsentMissingPath, '{"businessType":"Restaurant","helpNeeded":"AI Visibility Optimization","mainChallenge":"Smoke test","contactName":"Smoke Test Owner","businessName":"Smoke Test Bistro","email":"your-owned-address@example.com","phoneOrWhatsapp":"","websiteOrInstagram":"https://example.com","countryRegion":"Nigeria","hp_trap_7q":""}', [System.Text.Encoding]::ASCII)
[System.IO.File]::WriteAllText($quoteConsentFalsePath, '{"businessType":"Restaurant","helpNeeded":"AI Visibility Optimization","mainChallenge":"Smoke test","contactName":"Smoke Test Owner","businessName":"Smoke Test Bistro","email":"your-owned-address@example.com","phoneOrWhatsapp":"","websiteOrInstagram":"https://example.com","countryRegion":"Nigeria","consent":false,"hp_trap_7q":""}', [System.Text.Encoding]::ASCII)
[System.IO.File]::WriteAllText($quoteConsentStringPath, '{"businessType":"Restaurant","helpNeeded":"AI Visibility Optimization","mainChallenge":"Smoke test","contactName":"Smoke Test Owner","businessName":"Smoke Test Bistro","email":"your-owned-address@example.com","phoneOrWhatsapp":"","websiteOrInstagram":"https://example.com","countryRegion":"Nigeria","consent":"true","hp_trap_7q":""}', [System.Text.Encoding]::ASCII)
[System.IO.File]::WriteAllText($auditIgnoredConsentMetadataPath, '{"businessName":"Smoke Test Bistro","websiteOrInstagram":"https://example.com","city":"Lagos","businessType":"Restaurant","email":"your-owned-address@example.com","consent":true,"consentAcceptedAt":"2000-01-01T00:00:00.000Z","consentVersion":"client-sent-version","hp_trap_7q":""}', [System.Text.Encoding]::ASCII)
[System.IO.File]::WriteAllText($quoteIgnoredConsentMetadataPath, '{"businessType":"Restaurant","helpNeeded":"AI Visibility Optimization","mainChallenge":"Smoke test","contactName":"Smoke Test Owner","businessName":"Smoke Test Bistro","email":"your-owned-address@example.com","phoneOrWhatsapp":"","websiteOrInstagram":"https://example.com","countryRegion":"Nigeria","consent":true,"consentAcceptedAt":"2000-01-01T00:00:00.000Z","consentVersion":"client-sent-version","hp_trap_7q":""}', [System.Text.Encoding]::ASCII)
[System.IO.File]::WriteAllText($honeypotPayloadPath, '{"hp_trap_7q":"filled"}', [System.Text.Encoding]::ASCII)
[System.IO.File]::WriteAllText($largePayloadPath, ('x' * 20481), [System.Text.Encoding]::ASCII)
```

## Audit requests

Valid payload — expected HTTP `201`:

```powershell
curl.exe -i -X POST "$base/api/audit-requests" -H 'Content-Type: application/json' --data-binary "@$auditPayloadPath"
```

Missing required fields — expected HTTP `400`:

```powershell
curl.exe -i -X POST "$base/api/audit-requests" -H 'Content-Type: application/json' --data-binary "@$missingPayloadPath"
```

Missing consent — expected HTTP `400` with an error on `consent`:

```powershell
curl.exe -i -X POST "$base/api/audit-requests" -H 'Content-Type: application/json' --data-binary "@$auditConsentMissingPath"
```

Consent `false` — expected HTTP `400` with an error on `consent`:

```powershell
curl.exe -i -X POST "$base/api/audit-requests" -H 'Content-Type: application/json' --data-binary "@$auditConsentFalsePath"
```

Consent string `"true"` — expected HTTP `400` with an error on `consent`:

```powershell
curl.exe -i -X POST "$base/api/audit-requests" -H 'Content-Type: application/json' --data-binary "@$auditConsentStringPath"
```

Client-sent consent metadata — expected HTTP `201`; the server ignores
`consentAcceptedAt` and `consentVersion` and records its own values:

```powershell
curl.exe -i -X POST "$base/api/audit-requests" -H 'Content-Type: application/json' --data-binary "@$auditIgnoredConsentMetadataPath"
```

Filled honeypot — expected HTTP `201`, with no database write or email:

```powershell
curl.exe -i -X POST "$base/api/audit-requests" -H 'Content-Type: application/json' --data-binary "@$honeypotPayloadPath"
```

Body over 20 KB — expected HTTP `413`:

```powershell
curl.exe -i -X POST "$base/api/audit-requests" -H 'Content-Type: application/json' --data-binary "@$largePayloadPath"
```

Wrong content type — expected HTTP `415`:

```powershell
curl.exe -i -X POST "$base/api/audit-requests" -H 'Content-Type: text/plain' --data-binary '{}'
```

Six rapid requests from the same test IP — expected five `201` responses,
then one `429` response with `Retry-After`:

```powershell
1..6 | ForEach-Object { curl.exe -sS -o NUL -w '%{http_code}\n' -X POST -H 'Content-Type: application/json' -H 'X-Forwarded-For: 192.0.2.101' --data-binary "@$auditPayloadPath" "$base/api/audit-requests" }
```

## Quote requests

Valid payload — expected HTTP `201`:

```powershell
curl.exe -i -X POST "$base/api/quote-requests" -H 'Content-Type: application/json' --data-binary "@$quotePayloadPath"
```

Missing required fields — expected HTTP `400`:

```powershell
curl.exe -i -X POST "$base/api/quote-requests" -H 'Content-Type: application/json' --data-binary "@$missingPayloadPath"
```

Missing consent — expected HTTP `400` with an error on `consent`:

```powershell
curl.exe -i -X POST "$base/api/quote-requests" -H 'Content-Type: application/json' --data-binary "@$quoteConsentMissingPath"
```

Consent `false` — expected HTTP `400` with an error on `consent`:

```powershell
curl.exe -i -X POST "$base/api/quote-requests" -H 'Content-Type: application/json' --data-binary "@$quoteConsentFalsePath"
```

Consent string `"true"` — expected HTTP `400` with an error on `consent`:

```powershell
curl.exe -i -X POST "$base/api/quote-requests" -H 'Content-Type: application/json' --data-binary "@$quoteConsentStringPath"
```

Client-sent consent metadata — expected HTTP `201`; the server ignores
`consentAcceptedAt` and `consentVersion` and records its own values:

```powershell
curl.exe -i -X POST "$base/api/quote-requests" -H 'Content-Type: application/json' --data-binary "@$quoteIgnoredConsentMetadataPath"
```

Filled honeypot — expected HTTP `201`, with no database write or email:

```powershell
curl.exe -i -X POST "$base/api/quote-requests" -H 'Content-Type: application/json' --data-binary "@$honeypotPayloadPath"
```

Body over 20 KB — expected HTTP `413`:

```powershell
curl.exe -i -X POST "$base/api/quote-requests" -H 'Content-Type: application/json' --data-binary "@$largePayloadPath"
```

Wrong content type — expected HTTP `415`:

```powershell
curl.exe -i -X POST "$base/api/quote-requests" -H 'Content-Type: text/plain' --data-binary '{}'
```

Six rapid requests from the same test IP — expected five `201` responses,
then one `429` response with `Retry-After`:

```powershell
1..6 | ForEach-Object { curl.exe -sS -o NUL -w '%{http_code}\n' -X POST -H 'Content-Type: application/json' -H 'X-Forwarded-For: 192.0.2.102' --data-binary "@$quotePayloadPath" "$base/api/quote-requests" }
```

## Confirmation recipient limit

Run this case first with a clean owned address that has no audit or quote
submissions in the previous 24 hours. The same address is used by both
payloads: the first two requests are audits and the third is a quote. All
three responses should be `201`; the inbox should receive two confirmations
and three owner notifications. The third request is still saved and the owner
is still notified, but it gets no confirmation.

```powershell
1..2 | ForEach-Object { curl.exe -sS -o NUL -w '%{http_code}\n' -X POST -H 'Content-Type: application/json' -H 'X-Forwarded-For: 192.0.2.103' --data-binary "@$auditPayloadPath" "$base/api/audit-requests" }
curl.exe -sS -o NUL -w '%{http_code}\n' -X POST -H 'Content-Type: application/json' -H 'X-Forwarded-For: 192.0.2.103' --data-binary "@$quotePayloadPath" "$base/api/quote-requests"
```

Use a different reserved test IP if repeating a six-request test within the
one-hour rate-limit window. Remove only the temporary files created above when
finished:

```powershell
Remove-Item -LiteralPath $auditPayloadPath, $quotePayloadPath, $missingPayloadPath, $auditConsentMissingPath, $auditConsentFalsePath, $auditConsentStringPath, $quoteConsentMissingPath, $quoteConsentFalsePath, $quoteConsentStringPath, $auditIgnoredConsentMetadataPath, $quoteIgnoredConsentMetadataPath, $honeypotPayloadPath, $largePayloadPath
Remove-Item -LiteralPath $tempDir
```
