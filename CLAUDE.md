# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**ATLAS** is a fitness application for older adults that lives inside ChatGPT, built using the OpenAI Apps SDK and Model Context Protocol (MCP). It provides adaptive strength/balance programming, risk screening, interactive dashboards, and health check-ins with **clinical safety guardrails**.

**Tech Stack:**

- Frontend: React + TypeScript + Tailwind CSS + Vite
- Backend: Node.js MCP server using @modelcontextprotocol/sdk
- Architecture: pnpm monorepo with two packages (widgets + mcp-node)
- Safety: Clinical guardrails with risk classification and middleware interception

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

# Start MCP server with custom widget URL (for ngrok or production)
WIDGET_BASE_URL=https://abc123.ngrok.app pnpm --filter @atlas/mcp-node dev

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

To test MCP tools/widgets locally with ChatGPT (requires **3 terminals**):

**Terminal 1 - Widget Dev Server:**

```bash
cd packages/widgets
pnpm dev  # Runs on localhost:4444
```

**Terminal 2 - ngrok Tunnel:**

```bash
ngrok http 4444  # Creates HTTPS tunnel, note the URL (e.g., https://abc123.ngrok.app)
```

**Terminal 3 - MCP Server:**

```bash
WIDGET_BASE_URL=https://abc123.ngrok.app pnpm --filter @atlas/mcp-node dev
```

**ChatGPT Setup:**

1. Enable **Developer Mode** (Settings → Connectors)
2. Register connector pointing to `packages/mcp-node`
3. Refresh connector in ChatGPT
4. Test with: "Show my ATLAS dashboard"

---

## Architecture

### Monorepo Structure

This is a **pnpm workspace monorepo** with two packages:

```
packages/
├── widgets/           # React widgets embedded in ChatGPT
│   ├── src/
│   │   ├── entrypoints/       # Vite multi-entry bundles (one per widget)
│   │   ├── components/        # React components (Dashboard, SessionCheckin, SafetyNotice, ConsentBanner, DailyNudge)
│   │   └── utils/             # useWidgetProps hook
│   └── vite.config.ts         # Multi-entry build config
│
└── mcp-node/          # MCP server (stdio transport)
    └── src/
        ├── index.ts           # Server setup with request handlers
        ├── tools/             # MCP tool definitions & handlers
        ├── resources/         # MCP resource definitions & handlers (return widget URLs)
        ├── middleware/        # Safety policy middleware
        ├── utils/             # Clinical guardrails (triageCheckin)
        └── config.ts          # Centralized configuration (WIDGET_BASE_URL)
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

## Clinical Safety System

ATLAS implements a **multi-layer safety system** to protect older adults from injury and ensure appropriate medical referrals.

### 1. Clinical Guardrails (`utils/clinical-guardrails.ts`)

**Function:** `triageCheckin(checkinData, currentWeek)`

Analyzes user check-in data and classifies risk into three tiers:

- **Low Risk**: Pain ≤3, Energy ≥5, RPE ≤6, no red flags
- **Moderate Risk**: Pain 4-6, Energy 3-4, RPE 7-8, or some concerns
- **High Risk**: Pain ≥7, Energy ≤2, RPE ≥9, or red flags detected

**Red Flags (auto-triggers high risk):**

- "dolor de pecho" / "chest pain"
- "mareo" / "dizzy"
- "desmayo" / "fainted"
- "caída" / "fell"
- "inflamación severa" / "severe swelling"

**Output:**

```typescript
{
  risk: 'low' | 'moderate' | 'high',
  recommendations: string[],
  disclaimer: string,
  triggerEvents: string[]
}
```

### 2. Safety Policy Middleware (`middleware/safety-policy.ts`)

**Function:** `applySafetyPolicy(toolName, args, handler)`

Intercepts ALL MCP tool calls and applies safety logic:

1. If tool is `atlas_session_checkin`:
   - Runs `triageCheckin()` on the check-in data
   - If **high risk + red flags**, returns blocked tool response with safety recommendations
   - If **high risk + no red flags**, allows tool but injects safety warnings into response
   - If **moderate/low risk**, allows tool normally

2. For all other tools (`atlas_dashboard`, `atlas_adaptive_plan`):
   - Allows execution normally

**Blocked Tool Response:**

```typescript
{
  type: 'text',
  text: '⚠️ IMPORTANTE: Check-in bloqueado por seguridad...',
  structuredContent: {
    blockedTool: 'atlas_session_checkin',
    reason: 'HIGH_RISK_WITH_TRIGGERS',
    risk: 'high',
    recommendations: [...],
    disclaimer: '...',
    triggerEvents: [...]
  }
}
```

### 3. Safety Review Tool (`tools/atlas-safety-review.ts`)

**Tool Name:** `atlas_safety_review`

Manual safety review tool for trainers/system to explicitly check a user's safety status.

**Input:**

```typescript
{
  userId: string,
  recentCheckins: CheckinData[],
  currentWeek: number
}
```

**Output:** Risk classification and recommendations for the most recent check-in.

### 4. Adaptive Plan Generator (`tools/atlas-adaptive-plan.ts`)

**Tool Name:** `atlas_adaptive_plan`

Generates personalized workout plans based on user's safety profile.

**Input:**

```typescript
{
  userId: string,
  currentWeek: number,
  recentCheckins: CheckinData[],
  goals: string[]
}
```

**Output:** JSON workout plan with exercises, sets, reps, and safety modifications.

### 5. UI Safety Components

**SafetyNotice** (`components/SafetyNotice.tsx`):

- Displays risk level with color-coded badge (green/yellow/red)
- Shows recommendations and medical disclaimer
- Used in Dashboard and SessionCheckin widgets

**ConsentBanner** (`components/ConsentBanner.tsx`):

- Medical disclaimer and consent acknowledgment
- Dismissible, persists in localStorage
- Required on SessionCheckin widget

**DailyNudge** (`components/DailyNudge.tsx`):

- Tracks last check-in timestamp in localStorage
- Shows reminder if >24h since last check-in
- Dismissible but reappears after 24h

### Safety Integration Flow

```
User → "I want to check in"
  ↓
ChatGPT → calls atlas_session_checkin tool with { pain: 8, notes: "dolor de pecho" }
  ↓
applySafetyPolicy() middleware intercepts
  ↓
triageCheckin() → { risk: 'high', triggerEvents: ['chest_pain'] }
  ↓
Tool BLOCKED → ChatGPT receives safety recommendations
  ↓
ChatGPT → "⚠️ Por tu seguridad, consulta a un médico inmediatamente..."
```

### Configuration

**WIDGET_BASE_URL** (`config.ts`):

```typescript
export const WIDGET_BASE_URL = process.env.WIDGET_BASE_URL?.trim() || 'http://localhost:4444';
```

- Default: `http://localhost:4444` (local development)
- Development with ngrok: `https://abc123.ngrok.app`
- Production: `https://atlas-widgets.vercel.app`

All MCP resources use this centralized config to generate widget URLs.

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

## MCP Tools

ATLAS provides **4 MCP tools** that ChatGPT can invoke:

### 1. `atlas_dashboard`

**Description:** Shows user's weekly progress dashboard with sessions completed, streak, and upcoming sessions.

**Input:**

```typescript
{
  userId: string,
  weekNumber?: number  // defaults to 1
}
```

**Output:** Skybridge resource URI pointing to Dashboard widget.

**Usage in ChatGPT:**

- "Show my ATLAS dashboard"
- "How am I doing this week?"
- "Display my progress"

**Implementation:**

- Tool: `packages/mcp-node/src/tools/atlas-dashboard.ts`
- Resource: `packages/mcp-node/src/resources/atlas-dashboard-resource.ts`
- Widget: `packages/widgets/src/entrypoints/atlas-dashboard.tsx`

---

### 2. `atlas_session_checkin`

**Description:** Interactive form for users to report pain, energy, RPE, and notes after a workout session. **Protected by safety middleware.**

**Input:**

```typescript
{
  userId: string,
  sessionId: string,
  defaults?: {
    pain?: number,    // 0-10
    energy?: number,  // 0-10
    rpe?: number,     // 1-10
    notes?: string
  }
}
```

**Output:**

- If **high risk + red flags**: Blocked tool response with safety recommendations
- Otherwise: Skybridge resource URI pointing to SessionCheckin widget

**Safety Features:**

- Middleware intercepts tool call
- Runs `triageCheckin()` on check-in data
- Blocks dangerous check-ins (chest pain, severe symptoms)
- Shows SafetyNotice and ConsentBanner in widget

**Usage in ChatGPT:**

- "I want to check in after my workout"
- "Let me report my session"
- "Check in: pain 5, energy 7, felt good"

**Implementation:**

- Tool: `packages/mcp-node/src/tools/atlas-session-checkin.ts`
- Resource: `packages/mcp-node/src/resources/atlas-session-checkin-resource.ts`
- Widget: `packages/widgets/src/entrypoints/atlas-session-checkin.tsx`
- Middleware: `packages/mcp-node/src/middleware/safety-policy.ts`

---

### 3. `atlas_adaptive_plan`

**Description:** Generates personalized workout plan based on user's safety profile, recent check-ins, and goals.

**Input:**

```typescript
{
  userId: string,
  currentWeek: number,
  recentCheckins: Array<{
    pain: number,
    energy: number,
    rpe: number,
    notes: string
  }>,
  goals: string[]  // e.g., ["balance", "strength", "flexibility"]
}
```

**Output:** JSON workout plan with exercises, sets, reps, tempo, rest, and safety modifications.

**Example Output:**

```json
{
  "week": 1,
  "plan": [
    {
      "day": 1,
      "exercises": [
        {
          "name": "Chair Squat",
          "sets": 3,
          "reps": "10-12",
          "tempo": "2-0-2",
          "rest": "60s",
          "notes": "Hold chair for balance"
        }
      ]
    }
  ],
  "safetyModifications": ["Reduced volume due to moderate pain..."]
}
```

**Usage in ChatGPT:**

- "Generate my workout plan for this week"
- "Create an adaptive plan based on my recent check-ins"

**Implementation:**

- Tool: `packages/mcp-node/src/tools/atlas-adaptive-plan.ts`

---

### 4. `atlas_safety_review`

**Description:** Manual safety review tool for trainers/system to check a user's current risk status.

**Input:**

```typescript
{
  userId: string,
  recentCheckins: Array<{
    pain: number,
    energy: number,
    rpe: number,
    notes: string
  }>,
  currentWeek: number
}
```

**Output:** Risk classification (low/moderate/high) with recommendations and trigger events.

**Example Output:**

```json
{
  "risk": "high",
  "recommendations": [
    "Consulta a un médico inmediatamente por dolor intenso",
    "Suspende ejercicios hasta evaluación médica"
  ],
  "disclaimer": "Esto no es un diagnóstico médico...",
  "triggerEvents": ["high_pain", "chest_pain"]
}
```

**Usage in ChatGPT:**

- "Review safety status for user123"
- "Is this user safe to continue training?"

**Implementation:**

- Tool: `packages/mcp-node/src/tools/atlas-safety-review.ts`
- Uses: `packages/mcp-node/src/utils/clinical-guardrails.ts`

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

## Testing

**Test Coverage:** 11/11 tests passing across all packages

### Widget Tests (`packages/widgets`)

**Test Files:**

- `src/utils/useWidgetProps.test.tsx` (2 tests)

**Key Tests:**

- ✅ Returns defaults when no window.openai available
- ✅ Merges defaults with window.openai.widget.getProps()

**Running Tests:**

```bash
cd packages/widgets
pnpm test
```

### MCP Tests (`packages/mcp-node`)

**Test Files:**

- `src/utils/clinical-guardrails.test.ts` (4 tests)
- `src/middleware/safety-policy.test.ts` (5 tests)

**Key Tests:**

- ✅ Clinical guardrails: low/moderate/high risk classification
- ✅ Red flags detection (chest pain, dizziness, falls)
- ✅ Safety middleware: blocks high-risk check-ins
- ✅ Safety middleware: allows low/moderate risk
- ✅ Safety middleware: injects warnings for high risk without triggers

**Running Tests:**

```bash
cd packages/mcp-node
pnpm test
```

### Testing in ChatGPT

**Safety Testing Prompts:**

1. **Low Risk (should succeed):**
   - "Check in: pain 2, energy 8, RPE 4, felt great today"

2. **Moderate Risk (should succeed with warnings):**
   - "Check in: pain 5, energy 4, RPE 7, a bit tired"

3. **High Risk with Red Flags (should block):**
   - "Check in: pain 8, notes: 'dolor de pecho'"
   - "Check in: pain 9, energy 1, notes: 'mareo y caída'"

4. **Dashboard & Adaptive Plan (should work always):**
   - "Show my ATLAS dashboard"
   - "Generate workout plan based on my check-ins"

---

## Development Best Practices

### Adding a New MCP Tool

1. **Create Tool Definition** (`packages/mcp-node/src/tools/my-tool.ts`):

```typescript
export const definition = {
  name: 'atlas_my_tool',
  description: 'Description for ChatGPT',
  inputSchema: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'User ID' },
    },
    required: ['userId'],
  },
};

export async function handler(args: { userId: string }) {
  // If returning widget, reference a resource
  return {
    content: [
      {
        type: 'resource',
        resource: { uri: 'skybridge://atlas_my_tool_resource', mimeType: 'text/html+skybridge' },
      },
    ],
  };
}
```

2. **Create Resource** (`packages/mcp-node/src/resources/atlas-my-tool-resource.ts`):

```typescript
import { WIDGET_BASE_URL } from '../config';

export const definition = {
  uri: 'skybridge://atlas_my_tool_resource',
  name: 'ATLAS My Tool Widget',
  mimeType: 'text/html+skybridge',
};

export async function handler() {
  return {
    contents: [
      {
        uri: 'skybridge://atlas_my_tool_resource',
        mimeType: 'text/html+skybridge',
        text: `${WIDGET_BASE_URL}/atlas-my-tool.html`,
      },
    ],
  };
}
```

3. **Register in MCP Server** (`packages/mcp-node/src/index.ts`):

```typescript
import * as myTool from './tools/my-tool';
import * as myToolResource from './resources/atlas-my-tool-resource';

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'atlas_my_tool') {
    return await myTool.handler(request.params.arguments);
  }
  // ...
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === 'skybridge://atlas_my_tool_resource') {
    return await myToolResource.handler();
  }
  // ...
});
```

4. **Create Widget** (`packages/widgets/src/entrypoints/atlas-my-tool.tsx`):

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MyToolComponent } from '../components/MyToolComponent';
import '../styles/globals.css';

const defaultProps = {
  /* ... */
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MyToolComponent {...defaultProps} />
  </React.StrictMode>
);
```

5. **Add to Vite Config** (`packages/widgets/vite.config.ts`):

```typescript
input: {
  'atlas-dashboard': resolve(__dirname, 'src/entrypoints/atlas-dashboard.tsx'),
  'atlas-session-checkin': resolve(__dirname, 'src/entrypoints/atlas-session-checkin.tsx'),
  'atlas-my-tool': resolve(__dirname, 'src/entrypoints/atlas-my-tool.tsx'), // ← Add this
}
```

6. **Write Tests**:
   - Add unit tests in `packages/mcp-node/src/tools/my-tool.test.ts`
   - Add component tests in `packages/widgets/src/components/MyToolComponent.test.tsx`

7. **Verify**:

```bash
pnpm typecheck  # ✅ No TypeScript errors
pnpm test       # ✅ All tests passing
pnpm lint       # ✅ No lint warnings
pnpm build      # ✅ Successful build
```

### Widget Props Pattern

**Always use `useWidgetProps` to merge defaults with ChatGPT data:**

```tsx
import { useWidgetProps } from '../utils/useWidgetProps';

interface MyWidgetProps {
  userId: string;
  data: number[];
}

const defaultProps: MyWidgetProps = {
  userId: 'demo',
  data: [1, 2, 3],
};

export const MyWidget: React.FC<MyWidgetProps> = (props) => {
  // Merges props with window.openai.widget.getProps()
  const { userId, data } = useWidgetProps<MyWidgetProps>(props);

  return (
    <div>
      User: {userId}, Data: {data.join(',')}
    </div>
  );
};
```

### Environment Variables

**WIDGET_BASE_URL** is the ONLY environment variable:

- Local: `http://localhost:4444` (default)
- Development: Set via `WIDGET_BASE_URL=https://abc123.ngrok.app`
- Production: Set via Vercel environment variables

### Code Quality Standards

- **TypeScript:** Strict mode enabled, no `any` without eslint-disable comment
- **Testing:** All new features must have tests
- **Formatting:** Prettier with 2-space indentation
- **Linting:** ESLint with React + TypeScript rules
- **Commits:** Follow Conventional Commits format

---

## Common Issues & Solutions

### Issue: TypeScript error "does not satisfy constraint"

**Error:**

```
Type 'MyProps' does not satisfy the constraint 'Record<string, unknown>'.
Index signature for type 'string' is missing.
```

**Solution:** Use `Record<string, any>` with eslint-disable:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useWidgetProps<T extends Record<string, any>>(defaults: T): T;
```

### Issue: Tests failing with "Found multiple elements"

**Error:**

```
TestingLibraryElementError: Found multiple elements by: [data-testid="value"]
```

**Solution:** Add `cleanup()` in `afterEach`:

```typescript
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

### Issue: Widget not loading in ChatGPT

**Checklist:**

1. ✅ Widget dev server running on localhost:4444?
2. ✅ ngrok tunnel active and HTTPS URL obtained?
3. ✅ MCP server started with `WIDGET_BASE_URL=https://abc123.ngrok.app`?
4. ✅ Connector refreshed in ChatGPT Settings → Connectors?
5. ✅ Resource handler returning correct widget URL?

### Issue: Safety middleware not blocking dangerous check-ins

**Checklist:**

1. ✅ `applySafetyPolicy()` imported and wrapping tool handler?
2. ✅ Check-in data includes `notes` field with red flag keywords?
3. ✅ Tool name exactly matches `atlas_session_checkin`?
4. ✅ Tests in `safety-policy.test.ts` passing?

### Issue: ngrok tunnel expired

**Solution:** Restart ngrok and update WIDGET_BASE_URL:

```bash
# Terminal 2
ngrok http 4444  # Note new URL: https://xyz789.ngrok.app

# Terminal 3 (restart MCP server)
WIDGET_BASE_URL=https://xyz789.ngrok.app pnpm --filter @atlas/mcp-node dev
```

---

## Development Notes

- **Node version:** ≥20.0.0 (enforced in package.json)
- **pnpm version:** ≥8.0.0
- **Widget dev server:** Port 4444 (with CORS enabled)
- **MCP transport:** stdio (for ChatGPT integration)
- TypeScript strict mode enabled across all packages
- ESLint + Prettier configured at monorepo root
- All dependencies installed and up to date
- 11/11 tests passing across all packages

---

## Quick Reference

### Essential Commands

```bash
# Install dependencies
pnpm install

# Verification pipeline
pnpm typecheck && pnpm test && pnpm lint && pnpm build

# Development (3 terminals)
# Terminal 1: Widget dev server
pnpm --filter @atlas/widgets dev

# Terminal 2: ngrok tunnel
ngrok http 4444

# Terminal 3: MCP server with ngrok URL
WIDGET_BASE_URL=https://abc123.ngrok.app pnpm --filter @atlas/mcp-node dev
```

### Key File Locations

**MCP Server:**

- Tools: `packages/mcp-node/src/tools/*.ts`
- Resources: `packages/mcp-node/src/resources/*.ts`
- Safety: `packages/mcp-node/src/middleware/safety-policy.ts`
- Clinical Guardrails: `packages/mcp-node/src/utils/clinical-guardrails.ts`
- Config: `packages/mcp-node/src/config.ts`
- Main: `packages/mcp-node/src/index.ts`

**Widgets:**

- Entrypoints: `packages/widgets/src/entrypoints/*.tsx`
- Components: `packages/widgets/src/components/*.tsx`
- Hook: `packages/widgets/src/utils/useWidgetProps.ts`
- Build: `packages/widgets/vite.config.ts`

**Tests:**

- Widget tests: `packages/widgets/src/utils/*.test.tsx`
- MCP tests: `packages/mcp-node/src/**/*.test.ts`

### MCP Tools Quick Ref

| Tool Name               | Description                     | Safety Protected |
| ----------------------- | ------------------------------- | ---------------- |
| `atlas_dashboard`       | Weekly progress dashboard       | No               |
| `atlas_session_checkin` | Check-in form (pain/energy/RPE) | ✅ Yes           |
| `atlas_adaptive_plan`   | Generate workout plan           | No               |
| `atlas_safety_review`   | Manual safety review            | No               |

### Safety Risk Thresholds

| Risk Level   | Pain | Energy | RPE | Action              |
| ------------ | ---- | ------ | --- | ------------------- |
| **Low**      | ≤3   | ≥5     | ≤6  | Allow               |
| **Moderate** | 4-6  | 3-4    | 7-8 | Allow with warnings |
| **High**     | ≥7   | ≤2     | ≥9  | Block if red flags  |

**Red Flags:** chest pain, dizzy, fainted, fell, severe swelling

### Testing Prompts for ChatGPT

**Dashboard:**

- "Show my ATLAS dashboard"
- "How am I doing this week?"

**Safe Check-in:**

- "Check in: pain 2, energy 8, RPE 4, felt great"

**Blocked Check-in:**

- "Check in: pain 8, notes: 'dolor de pecho'"
- "Check in: pain 9, energy 1, notes: 'mareo y caída'"

**Adaptive Plan:**

- "Generate my workout plan for this week"

**Safety Review:**

- "Review safety status for user123"

### Current Project Status

✅ **All systems operational:**

- Dependencies: Installed and up to date
- TypeScript: Compiles without errors
- Tests: 11/11 passing (9 MCP + 2 widgets)
- Linting: 0 warnings
- Build: Successful
- Features: Clinical safety system fully implemented
- Environment: ngrok configured, ready for ChatGPT testing

**Branch:** `feature/session-checkin`
**Last Major Update:** Clinical safety system with guardrails, middleware, and safety tools
