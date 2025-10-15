#!/bin/bash
# Actualiza URLs del widget en el MCP server tras un deploy
VERCEL_URL=$1
if [ -z "$VERCEL_URL" ]; then
  echo "Usage: ./scripts/update-widget-urls.sh <vercel-url>"
  exit 1
fi
sed -i.bak "s|http://localhost:4444|https://$VERCEL_URL|g" \
  packages/mcp-node/src/resources/atlas-dashboard-resource.ts

echo "✅ Widget URLs updated to: https://$VERCEL_URL"
