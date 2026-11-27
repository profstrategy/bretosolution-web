# Stage 6: sending and receiving

The Sending and Receiving tabs of `/admin/emails` now show real data from the domain store. This stage adds row actions, a detail panel (with the rendered email), a confirmation step for send and delete, the receiving-not-configured notice, loading and error states, and counts next to the tab labels.

## Inspection and conflicts

I read every file the prompt lists. I found no conflict that needed a STOP. The gaps below were resolved as described:

| Prompt says | What existed | Resolution |
|---|---|---|
| Sent mail rendered "from the stored content" | The rendered HTML of a sent email is not stored. `AdminEmail` stores the composer fields (`bodyHtml`, subject, rows, …) | Sent mail and drafts are both rendered by the preview endpoint from the **stored fields**. A new `renderEmail(email)` action posts the saved row. The panel says "Rendered from the saved content with the current templates." If the templates change later, an old email renders with the new templates. |
| Breadcrumb shows the subject while the panel is open | `AdminBreadcrumb` read a `/admin/emails/<id>` path (no such route) | The panel is a drawer, not a route. Its state is in the URL as `?tab=…&open=<id>`, so Back closes it and a link reopens it. The breadcrumb reads `open` (or the old path form) and shows the subject with `{name}`/`{business}` filled in. |
| `loadInboxMessage` with images | It took no options | It now takes `loadInboxMessage(id, { images })`. |
| The "receiving-not-configured" notice | `listInbox` returned it, but `loadInbox` dropped it | Added `inbox.notice` to the state. The first page sets or clears it; "load more" keeps it. |
| An inline error with "Try again" for failed lists | Done | List loads no longer show a **success** toast: "Emails loaded." would pop up every time a tab opened. Failures still toast. |
| Delete confirmation "Delete this draft? This cannot be undone." | — | Title "Delete this draft?", body "This cannot be undone." |
| Send from a row | — | Asks for confirmation first, with the recipient, subject and attachment. An AUDIT draft without its PDF cannot be confirmed: it says to attach the PDF first. |

## Files

New:
- `src/components/admin/emails/SendingPanel.tsx`: the Sending list, the memoised `EmailRow`, `EmailBadges` and `EmailActions` (shared by rows and the panel).
- `src/components/admin/emails/ReceivingPanel.tsx`: the Receiving list, the memoised `InboxRow`, Refresh, and the notice.
- `src/components/admin/emails/EmailDetail.tsx`: the panel for an email. It holds `MetaList` and `EmailFrame`, the sandboxed iframe.
- `src/components/admin/emails/InboxDetail.tsx`: the panel for a received message. It has Show images, attachments and Reply.
- `src/components/admin/emails/listParts.tsx`: empty, info, skeleton and error states, Load more, `Badge`, `RelativeTime` (one shared minute timer) and `parseAddress`.
- `src/components/admin/DetailDrawer.tsx`: full screen under 640 px; from 640 px, a drawer on the right, up to 640 px wide.
- `src/components/admin/ConfirmDialog.tsx`: an `alertdialog`; focus starts on Cancel.
- `src/components/admin/useModalFocus.ts`: shared modal behaviour: initial focus, Tab trap, Escape, scroll lock and focus return.

Removed: `src/components/admin/emails/EmailPanels.tsx`, replaced by the two panels.

Changed:
- **State** (`domain.state.ts`, `domain.action.ts`, `DomainProvider.tsx`, `index.ts`):
  - `inbox.notice`.
  - New selectors: `selectEmailsLoaded`, `selectEmailsNextCursor`, `selectInboxLoaded`, `selectInboxNextCursor`, `selectInboxNotice`, `selectEmailCountLabel` and `selectInboxCountLabel` ("N", or "20+" while more pages exist).
  - New action `renderEmail`; new options on `loadInboxMessage`.
  - `deleteDraft` resolves to `true`/`false`; `refreshEmailStatus` resolves to the updated email.
  - List loads succeed silently.
- `EmailsView.tsx`: tabs with counts, the panel in the URL, stable row handlers (created once), the composer and the confirmations.
- `AdminBreadcrumb.tsx`: reads `?open=`.
- `src/content/admin.ts`: copy.
- **Bugs fixed** in Stage 4 code while testing:
  - `src/app/api/admin/emails/[id]/route.ts` (PATCH): the guarded update now returns the row, so the third query is gone. One round trip fewer, and the result is the same: 409 for a sent email.
  - `src/lib/server/adminApi.ts`: `serverError` also logs Prisma's error code (for example `P1001`). These codes contain no secrets.
- Tests: 6 new state and action tests (70 in total).

## How it works

- **Loading.** Each panel dispatches its first load when it is first shown (the list is not loaded yet and its request is idle). The store keeps the data, so switching tabs does not refetch. A request already pending is never sent twice.
- **One email changes, one row renders.**
  - `EmailRow` and `InboxRow` are `memo` components that select their own item by id.
  - The handlers object is created once in `EmailsView`.
  - Send, edit, delete and refresh upsert or remove that one email in the store; the list is never refetched.
- **Detail panel.**
  - Rendered HTML is matched to the email's `updatedAt`, so it renders again after an edit or a refresh.
  - The iframe is `sandbox=""` with `srcdoc`.
  - Received HTML (already sanitised on the server) is wrapped in a document whose CSP allows no scripts or network access. Images may load only from `data:`, or `https:` after "Show images". This is a second guard alongside the sandbox.
- **Edit and Reply from the panel** open the composer on top of it; closing the composer returns to the panel.
- **Iframes and history.** A changed document gets a **new** iframe (keyed by a hash of the HTML). Changing `srcdoc` on a live iframe is a navigation that adds a browser history entry, so Back, and closing the panel, would step the iframe instead of the page.

## Verified signed in (production build, headless Edge over CDP)

Setup:
- A locally minted admin session, deleted afterwards. The server ran with `NEXTAUTH_URL=http://localhost:3100`.
- **Sending data:** 24 test rows, all to `composer-test@example.com`, inserted with Prisma: 22 drafts, 1 FAILED and 1 SENT. Every one was deleted afterwards (0 remain).
- **Your own 5 sent emails were never changed by the suite.** One of them had its status refreshed for real afterwards (last row of the table).
- **Real API:** the list, paging, edit (PATCH), delete and the rendered previews.
- **Intercepted in the browser:** `/send` (so no email was sent), `/refresh`, and the whole inbox (Resend has no received mail yet), plus a single forced 500 to test the error state.
- **Temporary per-row render counters** were added for the re-render check and removed afterwards.

| Check | Result |
|---|---|
| List | 20 rows; tab label "Sending 20+". Recipient is the name or the email. The `{business}` subject is filled in. Badges: type, status, and the last event for sent mail ("Sent", "Delivered"). Dates are relative ("20 minutes ago") with the exact time in `title`. |
| Failed row | Shows "Error: The email service rejected the message." Actions: Edit, Send, Delete. |
| Paging | "Load more" brings the list to 29 rows, the label shows "29" and the button goes away. |
| List error | A forced 500 shows "Couldn't load emails." inline with "Try again" and an error toast; Try again loads the list. |
| Refresh status | Badge changes to "Opened" and "Status updated." shows. **Only the sent row re-rendered** (1 of 29 counters changed). No list refetch. |
| Detail panel (sent) | URL `?tab=sending&open=<id>`, breadcrumb "Admin › Emails › Your AI Visibility Audit for Sade Foods". Metadata and the rendered email (`sandbox=""`, `srcdoc`, with the PDF name). Focus on Close; Escape closes and returns focus to the row; the browser's Back also closes it. |
| Edit | From the row: the composer is prefilled; Save shows "Draft saved." and updates that row in place, with no refetch. From the panel: the composer opens on top, and Escape returns to the panel. |
| Send | Confirmation (alertdialog, focus on Cancel, lists recipient and subject), then "Email sent to composer-test@example.com.". The row becomes Sent, with View and Refresh status. No refetch. |
| Delete | "Delete this draft?" / "This cannot be undone." (focus on Cancel). The row is removed for real, the count goes 29 → 28, and "Draft deleted." shows. No refetch. |
| Inbox list | 20 rows, "Receiving 20+", the sender's name or address, a paperclip with a count, relative dates. Load more brings it to 23; Refresh reloads the first page (one request). |
| Open message | From, To, received time and Subject. The body is in a `sandbox=""` iframe whose CSP is `img-src data:`. Attachments are listed. |
| Show images | Sends `GET …?images=1`. The image appears, the CSP becomes `img-src data: https:`, the button goes away and focus moves to the "Message" heading. |
| Download attachment | The link is `/api/admin/inbox/<id>/attachments/<attachmentId>` with `download="brief.pdf"`. Fetching it gave 200 `application/pdf` with `attachment; filename="brief.pdf"` (intercepted). |
| Reply | The composer opens as "Reply", type General. To = the sender's address, Name = their display name, Subject "Re: Question 1 about pricing", In-Reply-To = the message's `messageId`. Closing returns focus to Reply; Escape then closes the panel. |
| Not configured | "Resend is not receiving mail for this address yet. Check your domain's receiving settings (MX records) in Resend." shows instead of the empty state. |
| Inbox error | "Couldn't load the inbox." with "Try again" and a toast. |
| 390 / 1440, light / dark | No horizontal overflow, and no tappable control under 44 px in the lists. The panel is full screen at 390 (0,0,390×844) and 640 px wide on the right at 1440. Message panel: no overflow. |
| Real refresh status | `POST /refresh` on one of **your real** sent emails: HTTP 200, `lastEvent` went from null to `delivered` (Resend `emails.get`). |

Bugs found and fixed while testing:
- **iframe history.** Changing an iframe's `srcdoc` added browser history entries. After "Show images", Escape and Back stepped the iframe instead of closing the panel. Fixed with a keyed remount (see "How it works").
- **Lost focus.** "Show images" removed the focused button, so focus fell to `<body>`, and the composer then returned focus to `<body>`. Focus now moves to the message heading. The composer and `useModalFocus` treat `<body>` as "no opener" and use the fallback.
- **Slow PATCH.** In this environment each database query takes about 1–5 s (Supabase pooler in eu-west-1), so the PATCH's three round trips took 8–26 s and the client's 20 s timeout fired. With the row-returning update it takes about 2 s.
- **Diagnostics.** Intermittent list failures turned out to be `P1001` (database unreachable) and `P1017` (connection closed). Your network to Supabase dropped several times during testing, and the server now logs the code. The UI handled every one correctly: inline error, Try again and a toast.

Gate: `tsc` 0; lint 0 errors (the 8 existing `<img>` warnings); `npm test` 70/70; `npm run build` with every env var blank.

## Not verified / UNKNOWN

- **Reply threading in Gmail.** No real reply was sent. The reply sets `inReplyToMessageId` from the received message's `message_id`, and the Stage 4 send route adds `In-Reply-To` and `References`. Whether Gmail threads it is **not verified**. To check, reply from the panel to a message you sent from Gmail.
- **Real received mail.** The Resend inbox is empty, so the list, message, Show images and attachment download were tested against intercepted responses of the Resend DTO shape. The real `/api/admin/inbox/*` routes were not exercised with real messages, and the attachment stream was not downloaded for real.
- **A real send from a row.** It was intercepted. Real sends work (your 5 sent emails), but not from the new row button. A real refresh **was** verified.
- **The exact "receiving not configured" error from Resend.** This is still UNKNOWN (Stage 4); the notice was tested with an intercepted response.
- **Database latency.** About 1–5 s per query and occasional `P1001`/`P1017` from this machine. In production, host the app near eu-west-1, or move the database closer, so pages and saves stay quick.
- **Deep links.** `?open=<id>` for an email not on the loaded page shows "This email is not in the loaded list" (there is no single-email load action). A deep link to an inbox message works, because the message is fetched by id.
- **Rendering.** Sent mail is rendered from its saved fields with the current templates, not from the exact HTML that was sent.
- **Screen readers and real devices.** Only the ARIA attributes and emulated widths were checked; no screen reader and no physical phone.
