# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Vite + React + TypeScript (strict), pnpm, single-page app, no SSR. TanStack Router/Query/Form/Table/Pacer, Tailwind v4 + shadcn/ui, sonner, `motion`, i18next. Decided in `docs/PLAN.en.md`; scaffold not started.

## Users
Organization members (the majority) who search and filter team data daily, add rows, and check recent activity. A smaller group of admins/owners connect and import sheets and manage members and invitations. Members cannot see admin screens.

## Product Purpose
An organization connects Google Sheets tabs, Relay imports them into PostgreSQL (a copy replaced on each import), and the team searches and filters that data quickly without touching the sheet. Members can also add rows from the platform, which are written back to Google Sheets. Success: a member finds the rows they need fast.

## Positioning
Fast shared search over sheet data: server-side AND/OR term and filter groups, accent- and case-insensitive highlight, search state kept in the URL. Not a BI tool and not a sheet editor.

## Operating Context
Login-gated dashboard behind Better Auth (cookie session, organizations plugin). Express 5 + Drizzle + PostgreSQL backend. Dashboard shows reports today, last 15 actions (source `sheet` or `platform`), 30-day chart, top actors, sheet freshness, seats. Dates are UTC `timestamptz`, shown in the browser's zone; day grouping uses `?tz=`.

## Capabilities and Constraints
- Routes: /login, /register, /accept-invitation/$id, /onboarding, /dashboard, /sheets, /sheets/$sheetId, /org/members, /org/invitations, /org/settings.
- One organization per user. Read plus append only; no row editing, no real-time sync, polling only.
- English and Spanish required; backend errors mapped by code.
- MVP: results first, details refined with usage.
- Open: which of three static design options in `design/` (Ledger, Dispatch, Observatory, or a mix); whether the feed shows both sources; whether API writes fire the Apps Script webhook.

## Evidence on Hand
Three static design prototypes with shared mock data in `design/`, and the plan in `docs/`. No customers, testimonials, or metrics exist; do not fabricate any.

## Product Principles
- Search speed and clarity over feature breadth.
- Members' daily path comes first; admin tools stay out of their way.
- Show the source and freshness of data, so people trust what they see.
- Ship the smallest working MVP; add depth from real usage.

## Accessibility & Inclusion
Bilingual (EN/ES); no specific accessibility standard stated yet.
