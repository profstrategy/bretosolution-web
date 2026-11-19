# Form API smoke tests

These are manual PowerShell commands, not CI tests. Run them against a local
server after configuring a test database, applying the migration, and setting
the required environment variables. The valid audit and quote requests are
stored and send a Resend notification, so use test data and a test recipient.

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
$honeypotPayloadPath = Join-Path $tempDir 'honeypot.json'
$largePayloadPath = Join-Path $tempDir 'large.txt'

[System.IO.File]::WriteAllText($auditPayloadPath, '{"businessName":"Smoke Test Bistro","websiteOrInstagram":"https://example.com","city":"Lagos","businessType":"Restaurant","email":"owner@example.com","company_site":""}', [System.Text.Encoding]::ASCII)
[System.IO.File]::WriteAllText($quotePayloadPath, '{"businessType":"Restaurant","helpNeeded":"AI Visibility Optimization","mainChallenge":"Smoke test","contactName":"Smoke Test Owner","businessName":"Smoke Test Bistro","email":"owner@example.com","phoneOrWhatsapp":"","websiteOrInstagram":"https://example.com","countryRegion":"Nigeria","company_site":""}', [System.Text.Encoding]::ASCII)
[System.IO.File]::WriteAllText($missingPayloadPath, '{}', [System.Text.Encoding]::ASCII)
[System.IO.File]::WriteAllText($honeypotPayloadPath, '{"company_site":"filled"}', [System.Text.Encoding]::ASCII)
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

Use a different reserved test IP if repeating a six-request test within the
one-hour rate-limit window. Remove only the temporary files created above when
finished:

```powershell
Remove-Item -LiteralPath $auditPayloadPath, $quotePayloadPath, $missingPayloadPath, $honeypotPayloadPath, $largePayloadPath
Remove-Item -LiteralPath $tempDir
```
