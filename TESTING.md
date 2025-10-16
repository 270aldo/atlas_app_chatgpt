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

4. Iniciar MCP server (otra terminal)

```bash
WIDGET_BASE_URL=https://<subdominio>.ngrok.app pnpm --filter @atlas/mcp-node dev
```

5. Configurar en ChatGPT Developer Mode (MCP local via stdio)
   Configurar un comando que ejecute `node` con el `dist/index.js` tras compilar:
```json
{
  "atlas": {
    "command": "node",
    "args": ["/ruta/absoluta/a/atlas_app_chatgpt/packages/mcp-node/dist/index.js"],
    "env": {
      "WIDGET_BASE_URL": "https://<subdominio>.ngrok.app"
    }
  }
}
```

6. Probar

- "Lista los tools disponibles" → deben aparecer `atlas_dashboard`, `atlas_weekly_board`, `atlas_session_checkin`, `atlas_adaptive_plan`, `atlas_safety_review`
- "Revisión de seguridad: dolor 8, energía 2, rpe 9, notas 'dolor de pecho'" → debe responder `gate=block`
- "Abrir check-in de sesión con dolor=3, energía=6, rpe=5" → renderiza el formulario con recomendaciones
- "Genera mi plan adaptativo semanal con objetivo equilibrio" → muestra el plan semanal
- "Muestra mi dashboard semanal de ATLAS" → renderiza progreso y avisos
- "Muestra mi plan semanal" → renderiza el weekly board con sesiones
