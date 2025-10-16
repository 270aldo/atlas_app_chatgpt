# Guía de Testing Local - ATLAS ChatGPT App

## Prerrequisitos

- Node.js 20.x
- pnpm 8.x+
- ngrok
- ChatGPT Plus con Developer Mode

## Pasos

1. Instalar dependencias

```bash
corepack enable && corepack prepare pnpm@latest --activate
pnpm install
```

2. Iniciar widgets (Vite)

```bash
pnpm --filter @atlas/widgets dev
```

3. Exponer con ngrok (en otra terminal)

```bash
ngrok http 4444
```

4. Actualizar URL del widget en el MCP server

```bash
./scripts/update-widget-urls.sh <subdominio>.ngrok.io
```

5. Iniciar MCP server (otra terminal)

```bash
pnpm --filter @atlas/mcp-node dev
```

6. Configurar en ChatGPT Developer Mode (MCP local via stdio)
   Configurar un comando que ejecute `node` con el `dist/index.js` tras compilar:

```json
{
  "atlas": {
    "command": "node",
    "args": ["/ruta/absoluta/a/atlas_app_chatgpt/packages/mcp-node/dist/index.js"],
    "env": {}
  }
}
```

7. Probar

- "Lista los tools disponibles" → debe aparecer `atlas_dashboard`
- "Muestra mi dashboard semanal de ATLAS" → debe renderizar el widget
