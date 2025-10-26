# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

- Setup
  - corepack enable && pnpm install
- Develop
  - Run both (widgets + MCP):
    - pnpm dev
  - Run individually:
    - pnpm --filter @atlas/widgets dev
    - WIDGET_BASE_URL=https://<public-host> pnpm --filter @atlas/mcp-node dev
  - Typical 3-terminal flow for ChatGPT Developer Mode:
    - pnpm --filter @atlas/widgets dev (serves at http://localhost:4444)
    - ngrok http 4444
    - WIDGET_BASE_URL=https://<ngrok-host> pnpm --filter @atlas/mcp-node dev
- Build
  - Workspace: pnpm build
  - Per package:
    - pnpm --filter @atlas/widgets build
    - pnpm --filter @atlas/mcp-node build
- Test
  - All packages: pnpm -w test
  - Package only:
    - pnpm --filter @atlas/widgets test
    - pnpm --filter @atlas/mcp-node test
  - Single file / single test name (examples):
    - pnpm --filter @atlas/mcp-node test -- src/utils/clinical-guardrails.test.ts
    - pnpm --filter @atlas/widgets test -- -t "merges host props when available"
- Quality
  - Typecheck: pnpm -w typecheck
  - Lint: pnpm -w lint
  - Format: pnpm -w format:check | pnpm -w format

## Architecture (big picture)

- Monorepo (pnpm workspace)
  - packages/widgets – React + TypeScript + Tailwind + Vite multi-entry widgets
  - packages/mcp-node – Node MCP server (stdio) using @modelcontextprotocol/sdk
- MCP server composition (packages/mcp-node)
  - Entry: src/index.ts – registers Tools and Resources, connects via StdioServerTransport
  - Tools: src/tools/*.ts – zod-validated definitions that return content and/or a Resource
    - atlas_dashboard, atlas_weekly_board, atlas_session_checkin, atlas_adaptive_plan, atlas_safety_review
  - Resources: src/resources/*.ts – return HTML (text/html+skybridge) that loads widget entrypoints
  - Safety middleware: src/middleware/safety-policy.ts – applySafetyPolicy(name,args,proceed)
    - Requires check-in data for certain tools
    - Blocks high-risk with red flags; otherwise annotates responses with safety
  - Config: src/config.ts – export const WIDGET_BASE_URL = process.env.WIDGET_BASE_URL || 'http://localhost:4444'
- Widget system (packages/widgets)
  - Entrypoints: src/entrypoints/*.tsx – one bundle per widget (dashboard, weekly-board, session-checkin)
  - Components: src/components/*.tsx – UI building blocks (e.g., Dashboard, SessionCheckin, SafetyNotice)
  - Prop plumbing: src/utils/useWidgetProps.ts – merges defaults with ChatGPT-provided props
  - Build: vite.config.ts – multi-entry rollupOptions.input; outputs hashed assets in dist
  - Dev: resources load TSX entrypoints directly from the dev server for HMR
- UX/design system
  - Tailwind tokens in tailwind.config.js: Electric Violet (#7C4DFF), Deep Purple (#512DA8)
  - Fonts: Josefin Sans (headings), Inter/Source Sans Pro (body)
  - Dark theme as default

## Key paths and conventions

- MCP server
  - Entry/server: packages/mcp-node/src/index.ts
  - Tools: packages/mcp-node/src/tools/*.ts (name: atlas_*)
  - Resources: packages/mcp-node/src/resources/*.ts (uri: atlas://.../widget; serve HTML that loads a widget entrypoint)
  - Safety: packages/mcp-node/src/middleware/safety-policy.ts (intercepts CallTool requests)
  - Config: packages/mcp-node/src/config.ts (WIDGET_BASE_URL consumed by resources)
- Widgets
  - Entrypoints: packages/widgets/src/entrypoints/*.tsx
  - Utilities: packages/widgets/src/utils/useWidgetProps.ts
  - Build config: packages/widgets/vite.config.ts

## CI summary

- GitHub Actions: .github/workflows/ci.yml
  - Node 20.x + pnpm 10
  - Steps: install → typecheck → lint → format:check → test → build widgets → build MCP → verify dist artifacts

## Environment

- WIDGET_BASE_URL
  - Local default: http://localhost:4444
  - For tunnels/production: set WIDGET_BASE_URL to your public widget host (e.g., ngrok/Vercel)

## Repo-specific notes

- Resource base URL consistency
  - All resources now use WIDGET_BASE_URL from config.ts for consistency
- Script: scripts/update-widget-urls.sh can batch-update resource BASE_URLs for different environments (though now redundant since WIDGET_BASE_URL is centralized)

## Sources for this guidance (non-exhaustive)

- README.md (Quick Start, stack)
- CLAUDE.md (commands, architecture, safety model)
- package.json (root and packages) scripts
- packages/mcp-node/src/index.ts, src/middleware/safety-policy.ts, src/config.ts
- packages/mcp-node/src/tools/*.ts, src/resources/*.ts
- packages/widgets/vite.config.ts, src/utils/useWidgetProps.ts
- .github/workflows/ci.yml
