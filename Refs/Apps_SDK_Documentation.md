# Apps SDK Documentation — Guía práctica paso a paso

> Nota: Esta documentación está optimizada para ser usada como contexto por agentes de IA durante el desarrollo del proyecto ATLAS.
> Última actualización: 2025-10-14

## Tabla de Contenido

- 1. Introducción y alcance
- 2. Prerrequisitos
- 3. Estructura de proyecto recomendada
- 4. Setup del repositorio de ejemplos (openai-apps-sdk-examples)
  - 4.1 Clonar repositorio
  - 4.2 Instalar dependencias
  - 4.3 Build de assets
  - 4.4 Servidor de desarrollo (Vite)
  - 4.5 Servidor de producción (estático)
- 5. Configuración de Vite para widgets
  - 5.1 Entrypoints múltiples
  - 5.2 Naming/versionado de assets
  - 5.3 Tailwind y CSS
- 6. Anatomía de un widget React (Apps SDK UI)
  - 6.1 Hooks esenciales
  - 6.2 Estilos y accesibilidad
  - 6.3 Estado y sincronización con ChatGPT
  - 6.4 Consumo de datos desde MCP
- 7. Servidores MCP (Node y Python)
  - 7.1 Node: estructura y ejecución
  - 7.2 Python: FastMCP/Uvicorn
  - 7.3 Transporte y CORS
- 8. Pruebas en ChatGPT (Developer Mode)
  - 8.1 Activar Developer Mode
  - 8.2 ngrok para exponer localmente
  - 8.3 Registrar el conector
  - 8.4 Invocar tools y ver widgets
  - 8.5 Debugging
- 9. Deployment
  - 9.1 Hosting de assets (CDN)
  - 9.2 Backend MCP (HTTPS)
  - 9.3 Variables de entorno
  - 9.4 CI/CD
- 10. Starters y templates de la comunidad
  - 10.1 Vercel Labs Next.js Starter
  - 10.2 Demos hosteados (LastMile/Oficiales)
  - 10.3 Template inicial para ATLAS
- 11. Troubleshooting común
- 12. Optimización de performance
- 13. Seguridad y buenas prácticas
- 14. Referencias y recursos

---

## 1. Introducción y alcance

Este documento explica, de forma práctica y paso a paso, cómo configurar un entorno de desarrollo con el OpenAI Apps SDK, construir widgets UI que se renderizan dentro de ChatGPT y conectar herramientas (tools) vía MCP (Model Context Protocol). Está alineado con los requerimientos del proyecto ATLAS (fitness para adultos mayores) y complementa:

- OpenAI_Apps_SDK_Reference.md (documento maestro)
- MCP_SDK_Guide.md (deep dive técnico de MCP)

Al finalizar, tendrás:

- Un servidor de assets para widgets (con Vite)
- Uno o más servidores MCP (Node o Python)
- Flujo de pruebas en ChatGPT Developer Mode
- Bases para deployment con CDN + backend MCP

## 2. Prerrequisitos

- Node.js 18+ (recomendado 20+)
  - Verifica:
    ```bash
    node --version
    ```
- pnpm instalado globalmente
  ```bash
  npm install -g pnpm
  ```
- Python 3.10+ (si usarás servidores MCP en Python)
  - Verifica:
    ```bash
    python3 --version
    ```
- Git
- Cuenta de OpenAI con acceso a ChatGPT (Plus/Pro/Enterprise) con Developer Mode
- ngrok instalado y autenticado para exponer endpoints locales
  ```bash
  # macOS (brew)
  brew install ngrok/ngrok/ngrok
  ngrok config add-authtoken {{NGROK_AUTHTOKEN}}
  ```

Sugerencias ATLAS (accesibilidad):

- Usa tipografías grandes y alto contraste para widgets
- Navegación por teclado y roles ARIA

## 3. Estructura de proyecto recomendada

Una estructura mínima para separar assets (widgets) y servidores MCP:

```
/atlas_app_chatgpt
  /Refs
  /apps
  /mcp
    /node
      package.json
      src/server.ts
    /python
      requirements.txt
      main.py
  /widgets
    /src
      atlas-dashboard.tsx
      atlas-weekly-board.tsx
    index.html (desarrollo)
    vite.config.ts
    tailwind.config.js
    package.json
```

Puedes mantener widgets en un repo separado si prefieres despliegue independiente.

## 4. Setup del repositorio de ejemplos (openai-apps-sdk-examples)

Si quieres partir de ejemplos oficiales y luego adaptar a ATLAS:

### 4.1 Clonar repositorio

```bash
git clone https://github.com/openai/openai-apps-sdk-examples.git
cd openai-apps-sdk-examples
```

### 4.2 Instalar dependencias

```bash
pnpm install
```

### 4.3 Build de assets

```bash
pnpm run build
# Genera carpeta assets/ con bundles versionados
# p.ej.: pizzaz-list-<hash>.js, pizzaz-carousel-<hash>.css
```

### 4.4 Servidor de desarrollo (Vite)

```bash
pnpm run dev
# Servirá widgets con hot reload en http://localhost:4444 (o el puerto definido)
```

### 4.5 Servidor de producción (estático)

```bash
pnpm run serve
# Sirve assets/ de forma estática con CORS habilitado
```

Tip: Para ATLAS, puedes copiar la configuración y crear tus propios entrypoints en /widgets.

## 5. Configuración de Vite para widgets

Un ejemplo de Vite con múltiples entradas, útil para exponer varios widgets (dashboard, weekly board, etc.).

```ts
// vite.config.ts (ejemplo)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'assets',
    rollupOptions: {
      input: {
        'atlas-dashboard': './src/atlas-dashboard.tsx',
        'atlas-weekly-board': './src/atlas-weekly-board.tsx',
      },
      output: {
        entryFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
  },
  server: {
    port: 4444,
    strictPort: true,
    cors: true,
  },
});
```

- Entrypoints múltiples: permite un archivo HTML/JS por widget
- Versionado por hash: facilita cache busting en CDN
- CORS: necesario para que ChatGPT pueda cargar assets

Tailwind (opcional, recomendado para velocidad de diseño):

```js
// tailwind.config.js (ejemplo)
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        electricViolet: '#7C4DFF',
        deepPurple: '#512DA8',
      },
      fontFamily: {
        heading: ['Josefin Sans', 'Inter', 'Source Sans Pro', 'sans-serif'],
        body: ['Inter', 'Source Sans Pro', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

## 6. Anatomía de un widget React (Apps SDK UI)

### 6.1 Hooks esenciales

Los hooks varían según el kit de UI usado por los ejemplos. Un patrón común:

```tsx
// Ejemplo de patrones de hooks
import React from 'react';

function AtlasDashboardWidget(props: { data: any }) {
  const [state, setState] = React.useState({ filter: 'week' });

  // Evita guardar datos sensibles; el estado del widget es efímero
  const onFilterChange = (filter: 'week' | 'month') => {
    setState({ filter });
    // Puede sincronizar con el host si se expone una API global
    // window.openai?.setWidgetState?.({ filter })
  };

  return (
    <div className="p-4 text-base">
      <h2 className="text-xl font-bold mb-2">ATLAS — Dashboard</h2>
      <div className="flex gap-2 mb-4">
        <button className="btn" onClick={() => onFilterChange('week')}>
          Semana
        </button>
        <button className="btn" onClick={() => onFilterChange('month')}>
          Mes
        </button>
      </div>
      {/* Renderiza métricas desde props.data */}
      <pre className="text-xs bg-black/20 p-2 rounded">{JSON.stringify(props.data, null, 2)}</pre>
    </div>
  );
}

export default AtlasDashboardWidget;
```

### 6.2 Estilos y accesibilidad

- Alto contraste y tamaño de tipografía mayor (público adulto mayor)
- Focus visible, roles ARIA en componentes interactivos
- Navegación por teclado y tamaños de objetivo táctil generosos

### 6.3 Estado y sincronización con ChatGPT

- Mantén el estado local del widget simple y serializable
- Si usas una API global del host para sincronizar, hazlo de forma epónima y segura
- No almacenes datos sensibles en estado del cliente

### 6.4 Consumo de datos desde MCP

- Los tools pueden adjuntar “resource” con `mimeType: text/html+skybridge` y `text` serializado (p. ej. JSON) para inicializar el widget
- El widget parsea `props` y renderiza UI acorde

## 7. Servidores MCP (Node y Python)

### 7.1 Node: estructura y ejecución

```ts
// mcp/node/src/server.ts (esquema simplificado)
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'atlas-mcp-node',
  version: '0.1.0',
});

server.tool(
  'atlas_dashboard',
  'Devuelve datos agregados para el dashboard ATLAS',
  {
    period: z.enum(['week', 'month']).default('week'),
    userId: z.string().describe('Usuario autenticado'),
  },
  async ({ period, userId }) => {
    // TODO: obtener datos reales desde tu backend/DB
    const data = {
      period,
      adherence: 0.86,
      strengthProgress: 0.12,
      balanceScore: 0.75,
    };

    return {
      content: [
        {
          type: 'resource',
          resource: {
            uri: 'https://cdn.example.com/widgets/atlas-dashboard.html',
            mimeType: 'text/html+skybridge',
            text: JSON.stringify({ data }),
          },
        },
      ],
      _meta: {
        'openai/outputTemplate': 'https://cdn.example.com/widgets/atlas-dashboard.html',
        'openai/widgetAccessible': true,
        'openai/resultCanProduceWidget': true,
        'openai/toolInvocation/invoking': 'Generando dashboard de ATLAS…',
        'openai/toolInvocation/invoked': 'Dashboard actualizado.',
      },
    };
  }
);

// Transporte HTTP/SSE, CORS, etc. según el SDK utilizado
```

Ejecución típica:

```bash
# en /mcp/node
pnpm install
pnpm run build # si usas tsup/esbuild
pnpm start     # inicia servidor (usa puerto definido, e.g. 3000)
```

### 7.2 Python: FastMCP/Uvicorn

```python
# mcp/python/main.py (esquema simplificado)
from fastapi import FastAPI
from fastmcp import McpServer

app = FastAPI()
server = McpServer(name="atlas-mcp-python", version="0.1.0")

@server.tool(
    name="atlas_dashboard",
    description="Devuelve datos agregados para el dashboard ATLAS",
    schema={
        "type": "object",
        "properties": {
            "period": {"type": "string", "enum": ["week", "month"], "default": "week"},
            "userId": {"type": "string"}
        },
        "required": ["userId"]
    }
)
async def atlas_dashboard(period: str = "week", userId: str = ""):
    data = {
        "period": period,
        "adherence": 0.86,
        "strengthProgress": 0.12,
        "balanceScore": 0.75,
    }
    return {
        "content": [
            {
                "type": "resource",
                "resource": {
                    "uri": "https://cdn.example.com/widgets/atlas-dashboard.html",
                    "mimeType": "text/html+skybridge",
                    "text": json.dumps({"data": data})
                }
            }
        ],
        "_meta": {
            "openai/outputTemplate": "https://cdn.example.com/widgets/atlas-dashboard.html",
            "openai/widgetAccessible": True,
            "openai/resultCanProduceWidget": True,
            "openai/toolInvocation/invoking": "Generando dashboard de ATLAS…",
            "openai/toolInvocation/invoked": "Dashboard actualizado."
        }
    }

# Montaje del servidor en FastAPI/Starlette
from fastapi import APIRouter
router = APIRouter()

# server.mount(router)  # según el framework/adapter usado para MCP
app.include_router(router, prefix="/mcp")

# Lanzar con: uvicorn mcp.python.main:app --host 0.0.0.0 --port 3000
```

Requisitos y ejecución:

```bash
# en /mcp/python
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn mcp.python.main:app --host 0.0.0.0 --port 3000
```

### 7.3 Transporte y CORS

- Usa transporte HTTP con SSE o WebSocket según el SDK de MCP
- Habilita CORS para que ChatGPT pueda acceder al endpoint /mcp
- Requiere HTTPS en producción

## 8. Pruebas en ChatGPT (Developer Mode)

### 8.1 Activar Developer Mode

- En ChatGPT: Settings → Connectors → Developer Mode → Enable

### 8.2 ngrok para exponer localmente

```bash
# Exponer servidor MCP local en el puerto 3000
ngrok http 3000
# Copia la URL https://<subdominio>.ngrok.io
```

### 8.3 Registrar el conector

- En ChatGPT, Add Connector
- Pega la URL de ngrok + "/mcp". Ejemplo: https://xxxxx.ngrok.io/mcp
- Guarda y habilita

### 8.4 Invocar tools y ver widgets

Prueba prompts como:

- "Mostrar mi dashboard semanal de ATLAS"
- "Actualizar el tablero mensual para el usuario 123"

Deberías ver el widget renderizado inline con datos de ejemplo. Interactúa y valida que el estado responda.

### 8.5 Debugging

- Revisa logs del servidor MCP (Node/Python)
- Inspecciona Network en el navegador si usas la vista web
- Revisa logs de ngrok para ver tráfico y errores de conexión

## 9. Deployment

### 9.1 Hosting de assets (CDN)

Opciones: Vercel, Cloudflare, AWS S3 + CloudFront. Requisitos:

- CORS habilitado
- HTTPS
- Cache y versionado por hash

Ejemplo de headers (Node/Express):

```js
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
```

### 9.2 Backend MCP (HTTPS)

- Deploy en Render, Railway, Fly.io, Vercel Functions (si aplicable)
- Health checks: GET /health
- Logging estructurado
- Observabilidad (p. ej. OpenTelemetry) opcional

### 9.3 Variables de entorno

No expongas secretos en el código. Usa variables de entorno y gestores de secretos.

```bash
# ejemplo .env (no commitear)
OPENAI_API_KEY={{OPENAI_API_KEY}}
DATABASE_URL={{DATABASE_URL}}
WIDGET_BASE_URL=https://cdn.example.com/widgets
```

Consumo en Node (dotenv):

```ts
import 'dotenv/config';
const baseUrl = process.env.WIDGET_BASE_URL;
```

### 9.4 CI/CD

- GitHub Actions para build y deploy de assets: build → upload a CDN
- Pipeline para backend MCP: test → deploy a plataforma
- Revisa que los URLs en `_meta["openai/outputTemplate"]` apunten al CDN

## 10. Starters y templates de la comunidad

### 10.1 Vercel Labs Next.js Starter

- Ofrece ruta /api/mcp
- assetPrefix para servir desde CDN
- Middleware para CORS
- Despliegue rápido en Vercel

### 10.2 Demos hosteados (LastMile/Oficiales)

- Útiles para validar rápido el render de widgets y transporte
- Analiza cómo estructuran `_meta` y los resources

### 10.3 Template inicial para ATLAS

- Widgets: atlas-dashboard, atlas-weekly-board, atlas-session-checkin
- Tools MCP: atlas_intake_screen, atlas_build_plan, atlas_session_checkin, atlas_progress_widget
- Estilos accesibles: tipografía grande, contraste alto, controles simples

## 11. Troubleshooting común

- CORS: "Blocked by CORS policy" → habilita Access-Control-Allow-Origin: \* en el servidor de assets
- Tool timeout: reduce payloads, agrega caché, ajusta timeouts
- JSON Schema inválido: valida tipos, required, enum
- Estado no persiste: revisa serialización y uso de (set)WidgetState
- ngrok falla: reinicia túnel, verifica firewall, cambia de región
- Widget en blanco: verifica consola, URL de assets, MIME type

## 12. Optimización de performance

- Code splitting y lazy loading
- Optimiza imágenes (formatos modernos, tamaños adecuados)
- Minimiza bundles (tree-shaking)
- CDN caching con versionado por hash

## 13. Seguridad y buenas prácticas

- Principio de mínimo privilegio en scopes y tools
- Sanitiza entradas (evita XSS en widgets)
- Evita exponer secretos en el cliente
- Registra errores y eventos críticos
- Para salud/fitness: disclaimers, no diagnóstico, flujos de derivación médica

## 14. Referencias y recursos

- Repos y ejemplos oficiales del Apps SDK
- Documentación MCP y SDKs TS/Python
- Starters de la comunidad (Vercel Labs)
- Foros/Comunidades para soporte
