# Relay frontend

Vite + React + TS (strict), TanStack Router (file routes in `src/routes`) + Query, i18next (EN/ES), sonner. pnpm.
- `pnpm dev` (proxy `/api` to :3000), `pnpm build` (vite build + tsc). Backend contract: `docs/BACKEND_API.md`.
- Styling is plain CSS from the Dispatch design (`src/styles.css`, tokens in `:root`). No Tailwind or shadcn yet.
- Every user-facing string goes in `src/locales/en.ts` and `es.ts` (typed keys). All HTTP goes through `src/api.ts`.
- Route loaders `ensureQueryData`; components `useSuspenseQuery`. Query factories live in `src/queries.ts`.
