# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**ATLAS** is a fitness application for older adults that lives inside ChatGPT, built using the OpenAI Apps SDK and Model Context Protocol (MCP). It provides adaptive strength/balance programming, risk screening, interactive dashboards, and health check-ins.

**Tech Stack:**

- Frontend: React + TypeScript + Tailwind CSS + Vite
- Backend: Node.js MCP server using @modelcontextprotocol/sdk
- Architecture: pnpm monorepo with two packages (widgets + mcp-node)

---

## Commands

### Development

```bash
# Start both widgets dev server (port 4444) and MCP server in watch mode
pnpm dev

# Start widgets dev server only
pnpm --filter @atlas/widgets dev

# Start MCP server only (watch mode with tsx)
pnpm --filter @atlas/mcp-node dev

# Build for production
pnpm build
```

### Testing & Quality

```bash
# Run all tests across packages
pnpm test

# Type checking across all packages
pnpm typecheck

# Lint all packages
pnpm lint

# Format check
pnpm format:check

# Format all files
pnpm format
```

### Testing with ChatGPT

To test MCP tools/widgets locally with ChatGPT:

1. Enable **Developer Mode** in ChatGPT (Settings → Connectors)
2. Expose local server: `ngrok http 3000`
3. Register connector in ChatGPT with ngrok URL
4. Invoke tools in chat: "Show my ATLAS dashboard"

---

## Architecture

### Monorepo Structure

This is a **pnpm workspace monorepo** with two packages:

```
packages/
├── widgets/           # React widgets embedded in ChatGPT
│   ├── src/
│   │   ├── entrypoints/       # Vite multi-entry bundles (one per widget)
│   │   ├── components/        # React components (Dashboard, SessionCheckin)
│   │   └── utils/             # useWidgetProps hook
│   └── vite.config.ts         # Multi-entry build config
│
└── mcp-node/          # MCP server (stdio transport)
    └── src/
        ├── index.ts           # Server setup with request handlers
        ├── tools/             # MCP tool definitions & handlers
        └── resources/         # MCP resource definitions & handlers (return widget URLs)
```

### MCP Server Pattern

**File:** `packages/mcp-node/src/index.ts`

The MCP server follows this pattern:

1. **Tools** are defined in `tools/` (e.g., `atlas-dashboard.ts`)
   - Each exports `{ definition, handler }`
   - Handlers return text/plain responses or references to resources
2. **Resources** are defined in `resources/` (e.g., `atlas-dashboard-resource.ts`)
   - Each exports `{ definition, handler }`
   - Handlers return widget URIs (`skybridge://...`) for ChatGPT to render
3. **Main server** (`index.ts`) registers all tools/resources with handlers

When adding new features:

- Create tool in `tools/` and resource in `resources/`
- Import and register both in `index.ts`
- Create corresponding widget entrypoint in `packages/widgets/src/entrypoints/`
- Add entrypoint to `vite.config.ts` input

### Widget Pattern

**Directory:** `packages/widgets/src/`

Widgets use **multi-entry Vite builds**:

- Each entrypoint file (e.g., `atlas-dashboard.tsx`) is a standalone bundle
- Build outputs to `dist/assets/[name].[hash].js`
- MCP resources return Skybridge URIs pointing to these bundles
- ChatGPT fetches and renders the widget in iframe

**Widget props pattern:**

```tsx
import { useWidgetProps } from '../utils/useWidgetProps';

// Props passed from ChatGPT via MCP resource
const props = useWidgetProps<{ userId: string; weekNumber: number }>();
```

---

## Git Workflow

**Branching strategy:**

- `main` – production (protected)
- `feature/*` – new features (branch from main)
- `hotfix/*` – urgent fixes

**Commit conventions (Conventional Commits):**

```
feat(scope): description
fix(scope): description
docs(scope): description
chore(scope): description
```

Examples:

- `feat(dashboard): add weekly adherence metric widget`
- `fix(mcp): correct CORS headers for widget assets`
- `docs(readme): update setup instructions`

**PR requirements:**

- Code compiles without errors
- All tests pass (`pnpm test`)
- Formatted (`pnpm format`)
- Linted (`pnpm lint`)
- Tested in ChatGPT Developer Mode

---

## Design System

**Theme:** Dark premium
**Primary colors:** Electric Violet (#7C4DFF), Deep Purple (#512DA8)
**Typography:** Josefin Sans (headings), Inter/Source Sans Pro (body)
**Components:** shadcn/ui + custom components for older adults

**Accessibility requirements:**

- Font sizes ≥ 16px (ideal 18-20px for older adults)
- Touch targets ≥ 44x44px
- Contrast ratio ≥ 4.5:1
- Full keyboard navigation
- Proper ARIA roles

---

## Key Metrics & Domain

ATLAS tracks:

- **Adherence:** % sessions completed vs planned
- **Progression:** % increase in load, reps, time without pain
- **Balance:** Time Up & Go, One Leg Stand
- **Perceived health:** Pain, fatigue, energy averages
- **Alerts:** Falls, acute pain, missed sessions

**Compliance:**

- No medical diagnosis (educational only)
- PHI must be encrypted
- Auto-referral triggers for medical consultation
- Visible disclaimers on all health interactions

---

## Development Notes

- **Node version:** ≥20.0.0 (enforced in package.json)
- **pnpm version:** ≥8.0.0
- **Widget dev server:** Port 4444 (with CORS enabled)
- **MCP transport:** stdio (for ChatGPT integration)
- TypeScript strict mode enabled across all packages
- ESLint + Prettier configured at monorepo root
