import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { atlasDashboardTool } from './tools/atlas-dashboard.js';
import { atlasWeeklyBoardTool } from './tools/atlas-weekly-board.js';
import { atlasSessionCheckinTool } from './tools/atlas-session-checkin.js';
import { atlasAdaptivePlanTool } from './tools/atlas-adaptive-plan.js';
import { atlasSafetyReviewTool } from './tools/atlas-safety-review.js';
import { atlasDashboardResource } from './resources/atlas-dashboard-resource.js';
import { atlasWeeklyBoardResource } from './resources/atlas-weekly-board-resource.js';
import { atlasSessionCheckinResource } from './resources/atlas-session-checkin-resource.js';
import { atlasWeeklyPlanResource } from './resources/atlas-weekly-plan-resource.js';
import { applySafetyPolicy } from './middleware/safety-policy.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app = express();

// CORS configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', server: 'ATLAS MCP Server' });
});

// Serve widgets from the built assets (avoids needing a second ngrok tunnel)
// Expect WIDGET_BASE_URL to be set to `${publicHost}/widgets`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const widgetsDistDir = path.resolve(__dirname, '../../widgets/dist');
app.use('/widgets', express.static(widgetsDistDir, { fallthrough: true }));

// MCP endpoint (POST) via SSE transport (Apps SDK expects POST /mcp)
app.post('/mcp', async (req, res) => {
  console.log('MCP connection request received');

  const server = new Server(
    { name: 'atlas-mcp-server', version: '0.1.0' },
    { capabilities: { tools: {}, resources: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      atlasDashboardTool.definition,
      atlasWeeklyBoardTool.definition,
      atlasSessionCheckinTool.definition,
      atlasAdaptivePlanTool.definition,
      atlasSafetyReviewTool.definition,
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const args = request.params.arguments;
    return applySafetyPolicy(name, args, async () => {
      if (name === 'atlas_dashboard') return atlasDashboardTool.handler(args);
      if (name === 'atlas_weekly_board') return atlasWeeklyBoardTool.handler(args);
      if (name === 'atlas_session_checkin') return atlasSessionCheckinTool.handler(args);
      if (name === 'atlas_adaptive_plan') return atlasAdaptivePlanTool.handler(args);
      if (name === 'atlas_safety_review') return atlasSafetyReviewTool.handler(args);
      throw new Error(`Unknown tool: ${name}`);
    });
  });

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      atlasDashboardResource.definition,
      atlasWeeklyBoardResource.definition,
      atlasSessionCheckinResource.definition,
      atlasWeeklyPlanResource.definition,
    ],
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri === 'atlas://dashboard/widget') {
      return atlasDashboardResource.handler();
    }
    if (request.params.uri === 'atlas://weekly-board/widget') {
      return atlasWeeklyBoardResource.handler();
    }
    if (request.params.uri === 'atlas://session-checkin/widget') {
      return atlasSessionCheckinResource.handler();
    }
    if (request.params.uri === 'atlas://weekly-plan/widget') {
      return atlasWeeklyPlanResource.handler();
    }
    throw new Error(`Unknown resource: ${request.params.uri}`);
  });

  const transport = new SSEServerTransport('/mcp', res);
  res.on('close', () => transport.close());

  await server.connect(transport);
  // @ts-expect-error - handleRequest exists at runtime for SSEServerTransport in SDK
  await transport.handleRequest(req, res, req.body);
});

app.listen(PORT, () => {
  console.log(`🚀 ATLAS MCP Server (HTTP/SSE) running on http://localhost:${PORT}`);
  console.log(`📡 MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🧩 Widgets (static): http://localhost:${PORT}/widgets`);
});
