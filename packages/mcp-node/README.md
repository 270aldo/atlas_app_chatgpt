# @atlas/mcp-node

Servidor MCP (Model Context Protocol) para ATLAS app en ChatGPT.

## Desarrollo

```bash
pnpm dev     # Modo watch con tsx
pnpm build   # Compilar TypeScript
pnpm start   # Ejecutar servidor compilado
```

## Tools disponibles

- atlas_dashboard: Renderiza el dashboard semanal del usuario

## Arquitectura

- Servidor MCP sobre stdio
- Tools con Zod para validación
- Resources con text/html+skybridge para widgets
- Metadatos OpenAI en `_meta`
