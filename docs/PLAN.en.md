# Relay frontend: MVP plan (v4)

Status: design phase. Three static design options are in `design/` (open `design/index.html`). The app scaffold has not started.

## Decisions

| Topic | Decision |
|---|---|
| Framework | Vite + React + TypeScript (strict), pnpm. A single-page app, no SSR. |
| Routing | TanStack Router, file-based routes, `defaultViewTransition: true` |
| Server data | TanStack Query. Route loaders call `ensureQueryData`; components use `useSuspenseQuery`. Polling with `refetchInterval` (no websockets). |
| Forms | TanStack Form + Zod |
| Table | TanStack Table in server mode (`manualFiltering`, `manualSorting`, `manualPagination`) |
| Debounce | TanStack Pacer |
| Auth | Plain calls to the Better Auth endpoints, wrapped in TanStack Query mutations. Cookie session. No Better Auth client library. |
| UI | Tailwind v4 + shadcn/ui, sonner toasts, `motion` for component animations |
| i18n | English and Spanish (i18next + react-i18next, typed keys, `Intl` for dates and numbers) |
| Search | The backend does the work. The frontend sends terms and filters, each group with AND/OR. Highlight runs in the frontend (accent- and case-insensitive). |
| TanStack DB | Not now. We only read, plus append rows, so Query is enough. Revisit if row editing or real-time sync arrives. |
| Mock API (MSW) | Not now. Revisit with the Nest rewrite (OpenAPI + orval can generate client and mocks). |
| Dates | Stored as `timestamptz`, returned as ISO 8601 UTC, converted by the browser. Anything grouped by day gets `?tz=<IANA zone>`. |
| History | One table. `source` is `sheet` or `platform`. `actor` is plain text (an email), with no link to platform users. |

## Permissions (MVP)

| Action | Who |
|---|---|
| View dashboard and data table | All members |
| Add a row (writes to Google Sheets) | **All members** |
| Connect / import sheets | Admins and owner |
| Organization, members, invitations | Admins and owner |

Admin-only screens are hidden from members, and the server enforces the rule.

## Screens

```
/login  /register  /accept-invitation/$id        public
/_app   guard: no session -> /login; no org -> /onboarding
  /onboarding
  /dashboard        reports today, last 15 actions, 30-day chart, top actors, sheet freshness, seats
  /sheets           list, connect, import
  /sheets/$sheetId  data table (all members), search state in the URL
  /org/members  /org/invitations  /org/settings      admins
```

## Build order

1. Scaffold (Vite, TS, Tailwind, shadcn, Router, Query, i18n, proxy `/api` -> `:3000`, `api.ts`, ESLint, Prettier, `CLAUDE.md` with conventions).
2. `docs/BACKEND_API.md`: the contract the backend must implement.
3. Auth pages, guards, onboarding.
4. App layout in the chosen design direction.
5. Sheets list, connect, import.
6. Data table: search, AND/OR, filters, highlight, Add row.
7. Organization members, invitations, settings.
8. Dashboard.

## Backend changes (yours to make)

1. `trustedOrigins` for the dev origin.
2. `GET /google-sheets/:orgId/sheets`.
3. `POST /google-sheets/:orgId/sheets/:sheetId/rows` (search, filters, sort, pagination).
4. `POST /google-sheets/:orgId/sheets/:sheetId/rows/append` (Add row).
5. `history` table with `source`, `actor`, `action`, `details`, `sheetId`, `timestamptz` dates; the webhook writes to it.
6. `GET /orgs/:orgId/dashboard?tz=...`
7. Organization endpoints that wrap `auth.api.*`; a `sendInvitationEmail` stub that logs the link.
8. The service account must be an **Editor** on each sheet (needed for Add row).

## Open questions

- Which design direction (A Ledger, B Dispatch, C Observatory, or a mix)?
- Does the dashboard feed show both sources (sheet and Relay) or only edits coming from the sheet? The mockups show both, with a source label.
- Add row from the platform: confirm that API writes do not fire the Apps Script webhook (so rows aren't logged twice).
