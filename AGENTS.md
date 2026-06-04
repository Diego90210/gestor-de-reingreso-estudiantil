# Agent Instructions — gestor-de-reingreso-estudiantil

## Project

Student re-enrollment management system (Universidad de Cartagena). Administrative dashboard for managing re-enrollment requests, approval workflows, document management, user/role management, reporting, and audit logging.

Language throughout: **Spanish** (code, SQL, UI, comments, role/enum names).

## Stack

- **Next.js 16** (App Router) — breaking changes from earlier versions; read `node_modules/next/dist/docs/` before writing code
- **React 19**, **TypeScript ^5**
- **Tailwind CSS v4** — CSS-first config (no `tailwind.config.*` file); theme tokens live in `packages/ui/src/styles/globals.css`
- **shadcn/ui radix-nova** — components live in `packages/ui/src/components/` (shared), NOT in `apps/web`. Import via `@workspace/ui/components/*`
- **Clerk** (`@clerk/nextjs`) for auth, **Supabase** (PostgreSQL + JS Client v2) for database
- **Turborepo** monorepo with npm workspaces

## Commands

Run from workspace root (`C:\gestor-de-reingreso-estudiantil`):

```bash
npm run dev          # turbo dev — start all apps
npm run build        # turbo build
npm run lint         # turbo lint
npm run typecheck    # turbo typecheck
npm run format       # turbo format (Prettier)
```

For the web app only (from `apps/web`):

```bash
npx next dev         # single-app dev server
npx next build
npx tsc --noEmit     # typecheck
npx eslint           # lint
```

**No test framework is installed.** There are no test scripts or test files.

**Recommended order:** `format → lint → typecheck → build`

## Monorepo Layout

```
apps/web/              # Main Next.js application (the dashboard)
packages/ui/           # Shared UI components (shadcn/ui), styles, utils
packages/eslint-config/ # Shared ESLint configs
packages/typescript-config/ # Shared tsconfig bases
```

Key path aliases in `apps/web`: `@/*` → `./*`, `@workspace/ui/*` → `../../packages/ui/src/*`

## Code Style

- **No semicolons** (`semi: false`)
- **Double quotes** (`singleQuote: false`)
- Trailing commas: `es5`
- Print width: 80
- Tailwind class sorting via `prettier-plugin-tailwindcss`

## Important Conventions

- **Tailwind v4**: No JS config file. All theme customization uses `@theme inline` CSS directives in `packages/ui/src/styles/globals.css`. When adding new CSS tokens, add them there.
- **shadcn/ui components go in `packages/ui/`**, not in `apps/web/components/`. Use `npx shadcn@latest add <component>` from within `packages/ui/` or update `components.json` aliases accordingly.
- **PostCSS config sharing**: `apps/web/postcss.config.mjs` re-exports from `@workspace/ui/postcss.config`. Don't duplicate PostCSS config.
- **ESLint uses `eslint-plugin-only-warn`**: all ESLint errors are warnings — they won't fail builds. `turbo/no-undeclared-env-vars` is enabled; declare env vars to avoid warnings.
- **Dark mode**: toggle via keyboard shortcut `D` (not Ctrl+D), implemented in `apps/web/components/theme-provider.tsx`.
- **`@clerk/nextjs`** is declared as a root dependency but is NOT in `apps/web/package.json`. It will be hoisted from root `node_modules`, but should be added to `apps/web` dependencies when Clerk integration begins.

## Development Plan

See `plan_desarrollo.md` — the authoritative source for:
- Database schema (6 tables, enums, triggers, RLS policies) — all SQL is provided
- Planned route structure under `apps/web/app/dashboard/`
- Server Actions (`actions/solicitudes.ts`, `actions/usuarios.ts`, `actions/reportes.ts`)
- Supabase client setup (`lib/supabase/client.ts`, `lib/supabase/server.ts`) — not yet created
- Sprint order and acceptance criteria

**Note:** The plan references Next.js 14, but the actual installed version is **16.2.6**. Follow the actual installed version for API behavior.

## Gotchas

- `@clerk/nextjs` middleware must protect `/dashboard/*` routes — this is not wired yet
- `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the client (server-only)
- Supabase triggers auto-generate `numero_radicado` (REI-YYYY-NNNN) and auto-log state changes — don't duplicate this logic in application code
- `historial_estados` is append-only (inserted by trigger, never updated)
- No `.env.example` exists yet — env vars are documented only in `plan_desarrollo.md`
- No CI/CD workflows exist yet
