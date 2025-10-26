#!/bin/bash

# Script para iniciar ATLAS completo

echo "🚀 Iniciando ATLAS..."
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar dependencias
echo "📦 Verificando dependencias..."
pnpm install > /dev/null 2>&1

# Build
echo "🔨 Compilando proyecto..."
pnpm build > /dev/null 2>&1

# Matar procesos previos
echo "🧹 Limpiando procesos previos..."
pkill -f "vite.*4444" > /dev/null 2>&1
pkill -f "ngrok.*4444" > /dev/null 2>&1
pkill -f "ngrok.*3000" > /dev/null 2>&1
pkill -f "tsx.*server-http" > /dev/null 2>&1

sleep 2

# Iniciar widgets
echo "🎨 Iniciando servidor de widgets (puerto 4444)..."
cd /Users/aldoolivas/atlas_app_chatgpt
pnpm --filter @atlas/widgets dev > /tmp/atlas-widgets.log 2>&1 &
WIDGETS_PID=$!

sleep 3

# Iniciar ngrok para widgets
echo "🌐 Iniciando túnel ngrok para widgets..."
ngrok http 4444 --log=stdout > /tmp/atlas-ngrok-widgets.log 2>&1 &
NGROK_WIDGETS_PID=$!

sleep 5

# Obtener URL de ngrok widgets
WIDGET_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$WIDGET_URL" ]; then
    echo "${RED}❌ Error: No se pudo obtener URL de ngrok para widgets${NC}"
    exit 1
fi

echo "${GREEN}✅ Widgets URL: $WIDGET_URL${NC}"

# Iniciar MCP server HTTP
echo "⚙️  Iniciando servidor MCP HTTP (puerto 3000)..."
cd /Users/aldoolivas/atlas_app_chatgpt
WIDGET_BASE_URL=$WIDGET_URL PORT=3000 pnpm --filter @atlas/mcp-node dev:http > /tmp/atlas-mcp.log 2>&1 &
MCP_PID=$!

sleep 3

# Iniciar ngrok para MCP
echo "🌐 Iniciando túnel ngrok para MCP..."
ngrok http 3000 --log=stdout > /tmp/atlas-ngrok-mcp.log 2>&1 &
NGROK_MCP_PID=$!

sleep 5

# Obtener URL de ngrok MCP
MCP_URL=$(curl -s http://localhost:4041/api/tunnels 2>/dev/null || curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | tail -1 | cut -d'"' -f4)

if [ -z "$MCP_URL" ]; then
    echo "${YELLOW}⚠️  Obteniendo URL de ngrok MCP manualmente...${NC}"
    sleep 2
    MCP_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | grep -v "$WIDGET_URL" | head -1 | cut -d'"' -f4)
fi

echo ""
echo "${GREEN}✅ ATLAS está corriendo!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 URLs para configurar en ChatGPT:"
echo ""
echo "   ${YELLOW}MCP Server URL:${NC}"
echo "   ${GREEN}$MCP_URL/sse${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚙️  Pasos en ChatGPT:"
echo "   1. Ve a Settings → Developer Mode"
echo "   2. Click 'New Connector'"
echo "   3. Name: ATLAS Fitness"
echo "   4. MCP Server URL: ${GREEN}$MCP_URL/sse${NC}"
echo "   5. Authentication: No authentication"
echo "   6. Marca el checkbox y dale Create"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Estado de servicios:"
echo "   Widgets PID: $WIDGETS_PID"
echo "   MCP PID: $MCP_PID"
echo "   ngrok Widgets PID: $NGROK_WIDGETS_PID"
echo "   ngrok MCP PID: $NGROK_MCP_PID"
echo ""
echo "🛑 Para detener todo: pkill -f atlas"
echo ""
echo "📝 Logs:"
echo "   Widgets: tail -f /tmp/atlas-widgets.log"
echo "   MCP: tail -f /tmp/atlas-mcp.log"
echo "   ngrok Widgets: tail -f /tmp/atlas-ngrok-widgets.log"
echo "   ngrok MCP: tail -f /tmp/atlas-ngrok-mcp.log"
echo ""

# Mantener script corriendo
echo "${YELLOW}Presiona Ctrl+C para detener todos los servicios${NC}"
echo ""

trap "echo ''; echo '🛑 Deteniendo servicios...'; kill $WIDGETS_PID $MCP_PID $NGROK_WIDGETS_PID $NGROK_MCP_PID 2>/dev/null; exit 0" INT TERM

wait
