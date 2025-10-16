# Repository Guidelines

This repo is a pnpm workspace monorepo targeting ChatGPT Apps/MCP. It contains a React widget UI and a Node MCP server. Use Node 20+ and pnpm 8+ (enable via corepack).

## Project Structure & Module Organization

- `packages/widgets/` – React + TypeScript + Vite + Tailwind UI widgets.
  - Entrypoints: `src/entrypoints/*`, components in `src/components/`.
- `packages/mcp-node/` – MCP server (TypeScript) with tools and resources.
  - Tools: `src/tools/*.ts` (e.g., `atlas-dashboard.ts`).
  - Resources: `src/resources/*-resource.ts`.
- `Refs/` – Reference docs for Apps SDK/MCP.
- `scripts/` – Utility scripts (e.g., `update-widget-urls.sh`).
- `.github/` – CI and templates.

## Build, Test, and Development Commands

- Instalar deps: `pnpm install`
- Dev ambos paquetes (concurrente): `pnpm dev`
- Dev individual: `pnpm --filter @atlas/widgets dev` | `pnpm --filter @atlas/mcp-node dev`
- Build (workspace): `pnpm build`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`
- Formato: `pnpm format:check` / `pnpm format`
- Tests (Vitest): `pnpm -w test`
- Servidor MCP apuntando a widgets públicos: `WIDGET_BASE_URL=https://<host> pnpm --filter @atlas/mcp-node dev`

## Coding Style & Naming Conventions

- Formatting: Prettier (2 spaces, semicolons, single quotes, width 100).
- Linting: ESLint with `@typescript-eslint` (no unused vars; use `_` prefix to ignore; avoid `any`).
- Components/files: `PascalCase` for React components (`Dashboard.tsx`), `camelCase` for functions/vars.
- MCP files: tools `atlas-*.ts`, resources `*-resource.ts`.

## Testing Guidelines

- Usa Vitest (ya configurado) para MCP y widgets (`pnpm -w test`).
- Widgets: Testing Library + jsdom (`*.test.tsx`).
- MCP: Vitest puro (`*.test.ts`).
- Agrega pruebas para nuevas reglas clínicas, generación de planes y hooks.
- Mantén resultados deterministas; mockea red/fecha cuando aplique.

## Commit & Pull Request Guidelines

- Commits: Conventional style recommended: `feat: …`, `fix: …`, `docs: …`, `chore: …`, `refactor: …`, `perf: …`.
- PRs target `develop` (CI runs on PRs to `develop`, `staging`, `main`).
- PR description: what/why, how to test, screenshots (UI), linked issues (`Closes #123`).
- Checklist: lint/typecheck pass, formatted, docs updated, manual check in ChatGPT Developer Mode when relevant.

## Security & Configuration

- No subir secretos; usa variables de entorno.
- Define `WIDGET_BASE_URL` para apuntar a Vite/ngrok/Vercel (sin editar código fuente).
- Tools disponibles: `atlas_dashboard`, `atlas_session_checkin`, `atlas_adaptive_plan`, `atlas_safety_review`.
- Middleware bloquea tools intensas si no hay check-in o detecta red flags; responde a esos bloqueos desde el asistente.
