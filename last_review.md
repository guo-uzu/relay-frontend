# Relay frontend MVP: review notes

Built in the Dispatch style: login, data table, dashboard, team management.
`pnpm build` passes and strict `tsc` is clean. I also ran the whole flow in a headless browser against a throwaway fake backend (not committed): login, dashboard, searching "cafe" (highlights "Café"), adding a row, team page, wrong-password toast. No console errors. It has **not** been run against the real backend.

## What was built (`src/`)

| Area | Files |
|---|---|
| Setup | `package.json`, `vite.config.ts` (proxies `/api` to `:3000`), `tsconfig.json` (strict), `index.html`, `CLAUDE.md` |
| App core | `main.tsx`, `api.ts`, `queries.ts`, `mutations.ts`, `types.ts`, `lib.ts`, `i18n.ts`, `locales/en.ts`, `locales/es.ts` |
| Styles | `styles.css` is the Dispatch CSS, ported mostly verbatim |
| Routes | `login`, `register`, `onboarding`, `accept-invitation.$id`, `_app` (layout and guard), `_app/dashboard`, `_app/sheets/index` (list, connect, import), `_app/sheets/$sheetId` (data table), `_app/team` |
| Docs | `docs/BACKEND_API.md`: the contract the backend must implement |

## Critical parts to review

1. **`src/routes/_app.tsx` (guard).**
   - No session redirects to `/login?next=…`; no organization redirects to `/onboarding`.
   - It also works out your role from the organization query.
   - Team, connect and import are hidden from members in the UI only. The server must enforce the real rule.
2. **`src/api.ts`.** All HTTP goes through it. It sends the cookie and throws `ApiError(status, code)`. `lib.errorText` maps the error code to a translated message.
3. **`src/components/Auth.tsx`.**
   - After login it clears the whole Query cache, because the guards had cached "no session".
   - It only accepts `next` if it starts with `/` and not `//`, to avoid open redirects.
4. **`src/routes/_app/sheets/$sheetId.tsx`.**
   - Search state (`terms`, `mode`, `filters`, `fmode`, `sort`, `dir`, `page`) lives in the URL. `validateSearch` checks it by hand because the URL is user-editable.
   - `Highlight` and `fold` (in `components/bits.tsx` and `lib.ts`) do the accent- and case-insensitive match. The backend must fold the same way, or rows are found but not highlighted.
5. **`src/routes/_app/team.tsx`.** Calls the Better Auth organization endpoints directly and always sends `organizationId`.

## Deliberate departures from the plan

- **Dropped:** shadcn, Tailwind, `motion`, TanStack Form, TanStack Table, Pacer and Zod.
  - Dispatch is plain CSS with CSS animations.
  - The forms are tiny native forms read with `FormData`.
  - Search runs on Enter, so there is nothing to debounce.
  - The table is a plain `<table>` with server-side sort and paging.
  - Adding Tailwind or Table later is a drop-in.
- **Kept:** TanStack Router (file-based), TanStack Query, i18next, sonner.
- **One `/team` page** instead of `/org/members`, `/org/invitations`, `/org/settings`.
- **No ESLint or Prettier yet.** Strict `tsc` is the only check.
- **Added beyond the four screens:** register, onboarding, accept-invitation. Without them a new account can't reach the app or join a team.
- **Dropped from the Dispatch login:** the fake activity lines, so nothing in the UI is made up.

## Things to know

- **The backend is only partly there.** These don't exist yet: the sheet list, the rows search, rows append, the dashboard, `trustedOrigins` for the dev origin, and the invitation email stub. `docs/BACKEND_API.md` lists the exact request and response shapes I coded against, so the first real run will show any mismatch.
- **Language setting:** the EN/ES choice is kept in `localStorage`.
- **Known limits:**
  - Role and org data is read once per navigation, so a role change shows after you navigate.
  - Adding a row doesn't jump to the new row.
  - The sheet "connect" form takes a spreadsheet URL or id, and the tab name.
- **Not tested:** mobile widths. The Dispatch CSS has a 1000px breakpoint, but I only checked 1440px.
- **Fonts:** they load from Google Fonts.
- **Stray files:** `relay-all.html` and `design/build-single.py` are leftovers from the earlier design bundling. Nothing is committed.

## Open questions from the plan (still open)

- Which design direction is final (this build assumes Dispatch).
- Whether the dashboard feed shows both sources (sheet and Relay) or only sheet edits. The build shows both, with a source label.
- Whether Add row from the platform fires the Apps Script webhook (rows could be logged twice).
