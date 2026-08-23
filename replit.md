# Library Management System

A local-first library operations workspace for managing books, members, circulation, payments, and reports.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/library-management/src/App.tsx` — route map and authenticated application shell
- `artifacts/library-management/src/pages/library-pages.tsx` — auth screens and library management pages
- `artifacts/library-management/src/lib/library-store.ts` — LocalStorage data model, seed data, and derived metrics
- `artifacts/library-management/src/index.css` — shared theme tokens and responsive styling

## Architecture decisions

- The first build is local-first: library records, auth state, settings, theme, transactions, and payments persist in separate LocalStorage keys.
- Demo data is seeded only when its storage key is absent, so later launches do not overwrite user changes.
- Dashboard and report values are derived from the current books, members, transactions, and payments rather than stored counters.

## Product

Leafline gives librarians a focused workspace for collection management, member administration, issuing and returning books, lost-book and fine payments, reporting, and staff organization.

## User preferences

The existing product should be preserved wherever possible; additions should integrate with the current navigation and visual language.

## Gotchas

The demo login is `librarian@leafline.local` with password `library123`; the app intentionally uses simulated frontend authentication and payments for this local-first build.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
