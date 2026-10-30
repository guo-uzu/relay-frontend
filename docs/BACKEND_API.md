# Backend API contract (what the frontend calls)

Base path `/api/v1`, JSON, cookie session (`credentials: include`). Dev: Vite proxies `/api` to `:3000`.
Errors: non-2xx with `{ message, code? }`. The frontend maps `code` to a translated message (`error.<CODE>` in `src/locales`); anything else shows a generic one.
`:orgId` must be checked against the caller's membership on every route. Admin = role `admin` or `owner`.

## Exists today: Better Auth (`/auth/*`)
`sign-in/email`, `sign-up/email`, `sign-out` (POST `{}`), `get-session` (GET, `null` when logged out),
`organization/{list,create,get-full-organization,invite-member,cancel-invitation,remove-member,update-member-role,accept-invitation}`.
The frontend always sends `organizationId` explicitly, so it never relies on the "active" organization.
Still needed: `trustedOrigins` for the dev origin, and a `sendInvitationEmail` stub that logs `<origin>/accept-invitation/<invitationId>`.

## Exists today: sheets
- `POST /google-sheets/:orgId/test-sheet` `{ sheetId }` (admin) -> `true | false` (bot can read the sheet)
- `POST /google-sheets/:orgId/set-sheet-id` `{ sheetId, nameSheet }` (admin)
- `POST /google-sheets/:orgId/import-sheet` `{ connectionId }` (admin)

## To build
1. `GET /google-sheets/:orgId/sheets` -> `{ id, name, rowCount, importedAt|null }[]` (`id` = connection id).
2. `POST /google-sheets/:orgId/sheets/:sheetId/rows`
   body `{ terms: string[], mode: 'and'|'or', filters: {column, op, value}[], fmode: 'and'|'or', sort?: column, dir: 'asc'|'desc', page (1-based), size }`
   `op` is one of `contains | equals | startsWith | gt | lt | isEmpty`. Terms match any column, accent- and case-insensitive (the frontend highlights the same way).
   Response: `{ headers: string[], sheetName, total, rows: { n: sheetRowNumber, cells: string[] }[] }`
3. `POST /google-sheets/:orgId/sheets/:sheetId/rows/append` `{ cells: string[] }` (any member). Writes to Google Sheets; the service account must be Editor.
4. `GET /orgs/:orgId/dashboard?tz=<IANA>` ->
   `{ series: ({date:'YYYY-MM-DD'} & Record<'added'|'edited'|'deleted'|'imported'|'connected', number>)[]  (30 days, last = today in tz),
      events: { id, action, source:'sheet'|'platform', actor: email, at: ISO UTC, sheetName, row?, column?, old?, new?, n? }[]  (latest 15),
      actors: { email, count }[]  (this week),
      sheets: same shape as 1,
      seats: { used (members + pending invites), max } }`
5. `history` table (`source`, `actor`, `action`, `details`, `sheetId`, `timestamptz`); the webhook and API writes feed it.
