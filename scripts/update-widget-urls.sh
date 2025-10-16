#!/bin/bash
# Actualiza BASE_URL en recursos MCP (para desarrollo con ngrok o producción)
# Uso:
#   ./scripts/update-widget-urls.sh <nueva-url>
#   Ejemplo desarrollo: ./scripts/update-widget-urls.sh https://abc123.ngrok.app
#   Ejemplo producción: ./scripts/update-widget-urls.sh https://atlas-widgets.vercel.app

NEW_URL=$1

if [ -z "$NEW_URL" ]; then
  echo "❌ Error: Debes proporcionar una URL"
  echo ""
  echo "Uso: ./scripts/update-widget-urls.sh <nueva-url>"
  echo ""
  echo "Ejemplos:"
  echo "  Desarrollo (ngrok):  ./scripts/update-widget-urls.sh https://abc123.ngrok.app"
  echo "  Producción (Vercel): ./scripts/update-widget-urls.sh https://atlas-widgets.vercel.app"
  echo "  Local:               ./scripts/update-widget-urls.sh http://localhost:4444"
  exit 1
fi

echo "🔄 Actualizando BASE_URL en recursos MCP..."
echo "   Nueva URL: $NEW_URL"
echo ""

# Archivos de recursos a actualizar
RESOURCES=(
  "packages/mcp-node/src/resources/atlas-dashboard-resource.ts"
  "packages/mcp-node/src/resources/atlas-session-checkin-resource.ts"
)

# Actualizar cada archivo
for file in "${RESOURCES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "⚠️  Archivo no encontrado: $file"
    continue
  fi

  # macOS requiere -i '' en lugar de -i.bak
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|export const BASE_URL = '.*';|export const BASE_URL = '$NEW_URL';|g" "$file"
  else
    sed -i "s|export const BASE_URL = '.*';|export const BASE_URL = '$NEW_URL';|g" "$file"
  fi

  echo "✅ Actualizado: $file"
done

echo ""
echo "🎉 URLs actualizadas correctamente!"
echo "   BASE_URL ahora apunta a: $NEW_URL"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Reinicia el MCP server: pnpm --filter @atlas/mcp-node dev"
echo "   2. Refresca el conector en ChatGPT (Settings → Connectors → Refresh)"
