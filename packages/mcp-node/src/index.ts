import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { atlasDashboardTool } from './tools/atlas-dashboard.js';
import { atlasSessionCheckinTool } from './tools/atlas-session-checkin.js';
import { atlasDashboardResource } from './resources/atlas-dashboard-resource.js';
import { atlasSessionCheckinResource } from './resources/atlas-session-checkin-resource.js';

const server = new Server(
  { name: 'atlas-mcp-server', version: '0.1.0' },
  { capabilities: { tools: {}, resources: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    atlasDashboardTool.definition,
    atlasSessionCheckinTool.definition,
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'atlas_dashboard') {
    return atlasDashboardTool.handler(request.params.arguments);
  }
  if (request.params.name === 'atlas_session_checkin') {
    return atlasSessionCheckinTool.handler(request.params.arguments);
  }
  throw new Error(`Unknown tool: ${request.params.name}`);
});

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    atlasDashboardResource.definition,
    atlasSessionCheckinResource.definition,
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === 'atlas://dashboard/widget') {
    return atlasDashboardResource.handler();
  }
  if (request.params.uri === 'atlas://session-checkin/widget') {
    return atlasSessionCheckinResource.handler();
  }
  throw new Error(`Unknown resource: ${request.params.uri}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ATLAS MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
