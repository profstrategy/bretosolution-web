# Admin email API smoke tests

Manual checks for the `/api/admin/*` routes (Stage 4). Run them against a
local server (`npm run dev`, or `npm run build` then `npm run start`).

## One-time setup

1. **Database:** apply the new migration with `npx prisma migrate deploy`.
   It creates the `AdminEmail` table and enables Row Level Security on it.
2. **Supabase Storage:** Dashboard → Storage → New bucket:
   - Name: `admin-email-attachments`
   - **Private** (Public bucket OFF)
   - File size limit: `15 MB`
   - Allowed MIME types: `application/pdf`
3. **Environment** (`.env.local`; see `.env.example`):
   - `SUPABASE_URL` (or the existing `NEXT_PUBLIC_SUPABASE_URL`)
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_INBOX_ADDRESS`
   - `RESEND_API_KEY`, `LEAD_FROM_EMAIL` (sender, verified in Resend)
   - the auth variables from `docs/ADMIN_AUTH.md`
4. **Resend receiving** (for the inbox routes) must be enabled for the
   domain. Without it, `GET /api/admin/inbox` returns
   `{ items: [], nextCursor: null, notice: "receiving-not-configured" }`.

## 1. Every route returns 401 without a session

PowerShell (`curl.exe`), or Git Bash (`curl`). Mutations include a matching
`Origin` so only the session check is being tested.

```powershell
$base = 'http://localhost:3000/api/admin'
$id   = 'ckaaaaaaaaaaaaaaaaaaaaaaa'
$rid  = '00000000-0000-0000-0000-000000000000'
$o    = 'Origin: http://localhost:3000'
$j    = 'Content-Type: application/json'

curl.exe -s -o NUL -w "GET emails %{http_code}`n"              "$base/emails"
curl.exe -s -o NUL -w "POST emails %{http_code}`n"             -X POST   -H $j -H $o --data '{}' "$base/emails"
curl.exe -s -o NUL -w "GET emails/id %{http_code}`n"           "$base/emails/$id"
curl.exe -s -o NUL -w "PATCH emails/id %{http_code}`n"         -X PATCH  -H $j -H $o --data '{}' "$base/emails/$id"
curl.exe -s -o NUL -w "DELETE emails/id %{http_code}`n"        -X DELETE -H $o "$base/emails/$id"
curl.exe -s -o NUL -w "POST send %{http_code}`n"               -X POST   -H $j -H $o --data '{}' "$base/emails/$id/send"
curl.exe -s -o NUL -w "POST refresh %{http_code}`n"            -X POST   -H $j -H $o --data '{}' "$base/emails/$id/refresh"
curl.exe -s -o NUL -w "POST preview %{http_code}`n"            -X POST   -H $j -H $o --data '{}' "$base/emails/preview"
curl.exe -s -o NUL -w "POST upload-url %{http_code}`n"         -X POST   -H $j -H $o --data '{}' "$base/attachments/upload-url"
curl.exe -s -o NUL -w "GET inbox %{http_code}`n"               "$base/inbox"
curl.exe -s -o NUL -w "GET inbox/id %{http_code}`n"            "$base/inbox/$rid"
curl.exe -s -o NUL -w "GET inbox attachment %{http_code}`n"    "$base/inbox/$rid/attachments/$rid"
```

Expected: every line ends in `401`.

## 2. Signed in, from the browser

Sign in at `http://localhost:3000/admin/login`, then open the browser
DevTools console **on a page of the same site** (for example
`/admin/emails`). `fetch` sends the session cookie and the correct
`Origin` header automatically.

```js
const api = (path, init = {}) =>
  fetch(`/api/admin${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => null) }));

// Validation → 400 with field errors
await api('/emails', { method: 'POST', body: JSON.stringify({ kind: 'GENERAL', toEmail: 'nope' }) });

// Create a GENERAL draft to an address you own → 201
const created = await api('/emails', { method: 'POST', body: JSON.stringify({
  kind: 'GENERAL', toEmail: 'you@example.com', recipientName: 'Amina',
  businessName: 'Mama Put', subject: 'A quick idea for {business}',
  bodyHtml: '<p>Hello, this is a test.</p>',
}) });
const id = created.body.email.id;

await api('/emails');                         // list → 200, includes the draft
await api(`/emails/${id}`);                   // get → 200
await api(`/emails/${id}`, { method: 'PATCH', body: JSON.stringify({ subject: 'Updated for {name}' }) }); // 200

// Preview → 200 { html } (open it to look)
const p = await api('/emails/preview', { method: 'POST', body: JSON.stringify({
  kind: 'QUOTE', businessName: 'Mama Put', bodyHtml: '<p>Here is your quote.</p>',
  rows: [{ label: 'Website', value: '₦450,000' }],
}) });
window.open(URL.createObjectURL(new Blob([p.body.html], { type: 'text/html' })));

// Send → 200 and status SENT (a real email to you@example.com)
await api(`/emails/${id}/send`, { method: 'POST', body: '{}' });
// Send again → 409 (double sends are blocked)
await api(`/emails/${id}/send`, { method: 'POST', body: '{}' });
// Edit or delete after sending → 409
await api(`/emails/${id}`, { method: 'PATCH', body: JSON.stringify({ subject: 'x' }) });
await api(`/emails/${id}`, { method: 'DELETE' });
// Delivery status → 200 with lastEvent
await api(`/emails/${id}/refresh`, { method: 'POST', body: '{}' });
```

### Attachment upload (browser → Supabase directly)

```js
// Pick a PDF first: in the console, run  const [file] = await window.showOpenFilePicker().then(h => Promise.all(h.map(x => x.getFile())));
const u = await api('/attachments/upload-url', { method: 'POST', body: JSON.stringify({
  filename: file.name, size: file.size, contentType: 'application/pdf',
}) });
// Same request shape as storage-js uploadToSignedUrl (PUT, raw body branch):
const put = await fetch(u.body.signedUrl, {
  method: 'PUT',
  headers: { 'content-type': 'application/pdf', 'cache-control': 'max-age=3600', 'x-upsert': 'false' },
  body: file,
});
put.status; // UNKNOWN: whether Supabase accepts this without an `apikey` header.
// If it returns 401 ("No API key found"), Stage 5 must upload with
// supabase-js + the public anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY), which is
// not configured yet. See STAGE4_NOTES.md.
// Use it on an AUDIT draft:
await api('/emails', { method: 'POST', body: JSON.stringify({
  kind: 'AUDIT', toEmail: 'you@example.com', recipientName: 'Amina', businessName: 'Mama Put',
  bodyHtml: '<p>Your audit is attached.</p>',
  attachment: { name: file.name, size: file.size, storagePath: u.body.path },
}) });
```

### Inbox

```js
await api('/inbox');                                // 200 { items, nextCursor } or the notice
await api('/inbox/<received-id>');                  // 200, remote images removed, hasRemoteImages
await api('/inbox/<received-id>?images=1');         // 200, https images kept
// Attachment download: open in a tab (uses the session cookie)
window.open('/api/admin/inbox/<received-id>/attachments/<attachment-id>');
```

### Footer reason line

The line "You received this email because…" appears only when the draft has
`source: { type: 'AUDIT' | 'QUOTE', id: '<request id>' }`, that request exists,
and its email matches `toEmail`. Check it in a preview:

```js
// With a real AuditRequest id whose email is you@example.com → line present
await api('/emails/preview', { method: 'POST', body: JSON.stringify({
  kind: 'AUDIT', toEmail: 'you@example.com', bodyHtml: '<p>x</p>',
  source: { type: 'AUDIT', id: '<audit-request-id>' },
}) });
// Without source, or with another toEmail → line absent
```

## 3. Origin check (signed in, from a terminal)

Copy the `next-auth.session-token` cookie value from DevTools → Application →
Cookies, then:

```powershell
$c = 'next-auth.session-token=<value>'
curl.exe -s -o NUL -w "%{http_code}`n" -X POST -H 'Content-Type: application/json' -b $c --data '{}' http://localhost:3000/api/admin/emails
curl.exe -s -o NUL -w "%{http_code}`n" -X POST -H 'Content-Type: application/json' -H 'Origin: https://evil.example' -b $c --data '{}' http://localhost:3000/api/admin/emails
```

Expected: `403` for both (missing Origin, and a foreign Origin).
