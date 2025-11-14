# 🚀 Guía Completa: Configurar ATLAS en ChatGPT

> **Proyecto:** ATLAS - Fitness para Adultos Mayores
> **Fecha:** 14 de Noviembre, 2025
> **Versión:** 1.0.0

---

## 📋 Tabla de Contenido

1. [Análisis del Proyecto Actual](#análisis-del-proyecto-actual)
2. [Requisitos Previos](#requisitos-previos)
3. [Arquitectura de la App](#arquitectura-de-la-app)
4. [Paso a Paso: Setup Completo](#paso-a-paso-setup-completo)
5. [Configuración en ChatGPT](#configuración-en-chatgpt)
6. [Mejores Prácticas](#mejores-prácticas)
7. [Troubleshooting](#troubleshooting)

---

## 📊 Análisis del Proyecto Actual

### Estado del Proyecto

**ATLAS** es una aplicación de fitness especializada para adultos mayores que se ejecutará dentro de ChatGPT usando el **OpenAI Apps SDK** y **Model Context Protocol (MCP)**.

#### ✅ Lo que tienes actualmente:

- ✅ **Documentación completa** (4,973 líneas)
  - `OpenAI_Apps_SDK_Reference.md` - Referencia maestra
  - `MCP_SDK_Guide.md` - Guía técnica detallada
  - `Apps_SDK_Documentation.md` - Guía práctica
  - `VALIDATION_REPORT.md` - Reporte de validación
- ✅ **Estructura de proyecto definida**
- ✅ **Workflows de GitHub** configurados
- ✅ **Documentación de contribución**

#### ❌ Lo que falta implementar:

- ❌ **Código de la aplicación** (widgets React)
- ❌ **Servidor MCP** (backend)
- ❌ **Assets y CDN** (hosting de widgets)
- ❌ **Base de datos** (PostgreSQL/MongoDB)
- ❌ **Sistema de autenticación** (OAuth 2.1)

### Funcionalidades Planificadas

Según tu documentación, ATLAS incluirá:

1. **🏋️ Programación Adaptativa**
   - Fuerza, balance y movilidad personalizados

2. **🔍 Screening de Riesgos**
   - Evaluación de caídas, prótesis, dolor crónico

3. **📊 Dashboards Interactivos**
   - Métricas de adherencia, progresión, equilibrio

4. **✅ Check-ins de Salud**
   - Ajustes automáticos seguros

5. **🎓 Educación Integrada**
   - Micro-videos y tips contextuales

---

## 🔧 Requisitos Previos

### Software Necesario

```bash
# 1. Node.js 20+ (recomendado)
node --version  # Debe ser v20.x o superior

# 2. pnpm (gestor de paquetes)
npm install -g pnpm
pnpm --version

# 3. Python 3.10+ (para servidor MCP Python - opcional)
python3 --version

# 4. Git
git --version

# 5. ngrok (para testing local)
# macOS
brew install ngrok/ngrok/ngrok

# Linux
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
  echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
  sudo tee /etc/apt/sources.list.d/ngrok.list && \
  sudo apt update && sudo apt install ngrok

# Autenticar ngrok
ngrok config add-authtoken TU_NGROK_TOKEN
```

### Cuentas Necesarias

1. **OpenAI ChatGPT Plus/Pro/Enterprise**
   - Necesario para acceder a Developer Mode
   - Verifica tu suscripción en: https://chatgpt.com/

2. **Cuenta ngrok** (para desarrollo local)
   - Registrarse en: https://ngrok.com/
   - Obtener authtoken del dashboard

3. **Hosting para producción**
   - **CDN**: Vercel, Cloudflare, AWS S3+CloudFront
   - **Backend**: Render, Railway, Fly.io, Vercel Functions

---

## 🏗️ Arquitectura de la App

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                    ChatGPT Interface                     │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Conversación + Widgets ATLAS (React)          │    │
│  │  - Dashboard Semanal                           │    │
│  │  - Tablero de Ejercicios                       │    │
│  │  - Check-in de Sesión                          │    │
│  └────────────────┬───────────────────────────────┘    │
└───────────────────┼──────────────────────────────────────┘
                    │ MCP Protocol (HTTPS)
                    ▼
┌──────────────────────────────────────────────────────────┐
│             Tu Servidor MCP (Backend)                     │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  MCP Server (Node.js/Python)                     │   │
│  │  - atlas_dashboard (tool)                        │   │
│  │  - atlas_build_plan (tool)                       │   │
│  │  - atlas_session_checkin (tool)                  │   │
│  │  - atlas_progress_widget (tool)                  │   │
│  └──────────────────┬───────────────────────────────┘   │
└─────────────────────┼────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│               Base de Datos + APIs                        │
│  - PostgreSQL/MongoDB (datos de usuarios)                │
│  - Redis (caché)                                          │
│  - Cloudflare R2 / S3 (videos educativos)               │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│               CDN (Widgets Assets)                        │
│  - Vercel/Cloudflare                                      │
│  - atlas-dashboard-[hash].js                             │
│  - atlas-weekly-board-[hash].js                          │
│  - atlas-session-checkin-[hash].js                       │
└──────────────────────────────────────────────────────────┘
```

---

## 🎯 Paso a Paso: Setup Completo

### Fase 1: Preparar el Proyecto

#### 1.1 Crear Estructura de Carpetas

```bash
cd /home/user/atlas_app_chatgpt

# Crear estructura de directorios
mkdir -p widgets/src
mkdir -p mcp/node/src
mkdir -p mcp/python
mkdir -p .github/workflows

# Verificar estructura
tree -L 2
```

#### 1.2 Inicializar Proyecto de Widgets

```bash
cd widgets

# Crear package.json
cat > package.json << 'EOF'
{
  "name": "atlas-widgets",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.446.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3",
    "vite": "^5.4.10"
  }
}
EOF

# Instalar dependencias
pnpm install
```

#### 1.3 Configurar Vite

```bash
cd widgets

cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'assets',
    rollupOptions: {
      input: {
        'atlas-dashboard': './src/atlas-dashboard.tsx',
        'atlas-weekly-board': './src/atlas-weekly-board.tsx',
        'atlas-session-checkin': './src/atlas-session-checkin.tsx',
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
})
EOF
```

#### 1.4 Configurar Tailwind CSS

```bash
cd widgets

# Crear tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
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
}
EOF

# Crear postcss.config.js
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Crear archivo CSS principal
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Estilos personalizados para adultos mayores */
@layer base {
  html {
    font-size: 18px; /* Tipografía más grande */
  }

  body {
    @apply font-body;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-heading;
  }
}

@layer components {
  .btn {
    @apply px-6 py-3 rounded-xl font-medium transition-all;
    @apply focus:outline-none focus:ring-4 focus:ring-electricViolet/50;
    @apply min-h-[48px] min-w-[48px]; /* Tamaños táctiles grandes */
  }

  .btn-primary {
    @apply bg-electricViolet text-white hover:bg-deepPurple;
  }

  .btn-secondary {
    @apply bg-white border-2 border-electricViolet text-electricViolet;
    @apply hover:bg-electricViolet hover:text-white;
  }
}
EOF
```

#### 1.5 Crear Widget de Ejemplo (Dashboard)

```bash
cd widgets/src

cat > atlas-dashboard.tsx << 'EOF'
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, TrendingUp, Heart, Target } from 'lucide-react';
import '../index.css';

interface DashboardData {
  adherence: number;
  strengthProgress: number;
  balanceScore: number;
  painLevel: number;
  period: 'week' | 'month';
}

function AtlasDashboard() {
  // En producción, esto vendrá de window.openai.widgetProps
  const data: DashboardData = (window as any).openai?.widgetProps?.data || {
    adherence: 0.86,
    strengthProgress: 0.12,
    balanceScore: 0.75,
    painLevel: 2,
    period: 'week',
  };

  const metrics = [
    {
      label: 'Adherencia',
      value: `${Math.round(data.adherence * 100)}%`,
      icon: Activity,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Progreso Fuerza',
      value: `+${Math.round(data.strengthProgress * 100)}%`,
      icon: TrendingUp,
      color: 'text-electricViolet',
      bg: 'bg-purple-50',
    },
    {
      label: 'Balance',
      value: `${Math.round(data.balanceScore * 100)}%`,
      icon: Target,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Dolor Promedio',
      value: `${data.painLevel}/10`,
      icon: Heart,
      color: data.painLevel <= 3 ? 'text-green-600' : 'text-orange-600',
      bg: data.painLevel <= 3 ? 'bg-green-50' : 'bg-orange-50',
    },
  ];

  return (
    <div className="antialiased w-full max-w-2xl mx-auto">
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-black/5">
          <h2 className="text-2xl font-bold text-deepPurple mb-2">
            Dashboard ATLAS
          </h2>
          <p className="text-base text-black/60">
            Tu progreso esta {data.period === 'week' ? 'semana' : 'mes'}
          </p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className={`${metric.bg} rounded-xl p-4 transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`${metric.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div className={`text-3xl font-bold ${metric.color} mb-1`}>
                  {metric.value}
                </div>
                <div className="text-sm text-black/70 font-medium">
                  {metric.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-black/5 text-sm text-black/60 text-center">
          💪 ¡Sigue así! Tu constancia es tu mayor fortaleza.
        </div>
      </div>
    </div>
  );
}

// Renderizar widget
const rootElement = document.getElementById('atlas-dashboard-root');
if (rootElement) {
  createRoot(rootElement).render(<AtlasDashboard />);
}
EOF
```

#### 1.6 Crear archivo HTML para desarrollo

```bash
cd widgets

cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ATLAS Widgets - Dev</title>
</head>
<body class="bg-gray-100 p-8">
  <h1 class="text-3xl font-bold mb-8 text-center">ATLAS Widgets Development</h1>

  <div class="mb-8">
    <h2 class="text-xl font-semibold mb-4">Dashboard</h2>
    <div id="atlas-dashboard-root"></div>
  </div>

  <script type="module" src="/src/atlas-dashboard.tsx"></script>
</body>
</html>
EOF
```

### Fase 2: Servidor MCP (Node.js)

#### 2.1 Inicializar Proyecto MCP

```bash
cd mcp/node

# Crear package.json
cat > package.json << 'EOF'
{
  "name": "atlas-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "zod": "^3.23.8",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^22.8.6",
    "tsx": "^4.19.2",
    "typescript": "^5.6.3"
  }
}
EOF

pnpm install
```

#### 2.2 Configurar TypeScript

```bash
cd mcp/node

cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOF
```

#### 2.3 Crear Servidor MCP

```bash
cd mcp/node/src

cat > server.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import 'dotenv/config';

// ===== CONFIGURACIÓN =====
const PORT = process.env.PORT || 8000;
const WIDGET_BASE_URL = process.env.WIDGET_BASE_URL || 'http://localhost:4444';

// ===== SCHEMAS =====
const DashboardInputSchema = z.object({
  period: z.enum(['week', 'month']).default('week'),
  userId: z.string().optional(),
});

// ===== MCP SERVER =====
const server = new Server(
  {
    name: 'atlas-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// ===== TOOLS =====
const tools = [
  {
    name: 'atlas_dashboard',
    description: 'Muestra el dashboard de métricas de fitness del usuario',
    inputSchema: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          enum: ['week', 'month'],
          description: 'Período de tiempo para las métricas',
          default: 'week',
        },
        userId: {
          type: 'string',
          description: 'ID del usuario (opcional en desarrollo)',
        },
      },
    },
    _meta: {
      'openai/outputTemplate': `${WIDGET_BASE_URL}/src/atlas-dashboard.tsx`,
      'openai/widgetAccessible': true,
      'openai/resultCanProduceWidget': true,
      'openai/toolInvocation/invoking': 'Cargando tu dashboard...',
      'openai/toolInvocation/invoked': '¡Dashboard actualizado!',
      'openai/readOnlyHint': true,
    },
  },
];

// Handler: listar tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

// Handler: invocar tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'atlas_dashboard') {
    // Validar input
    const validated = DashboardInputSchema.parse(args);

    // Simular obtención de datos (en producción, consultar DB)
    const data = {
      adherence: 0.86,
      strengthProgress: 0.12,
      balanceScore: 0.75,
      painLevel: 2,
      period: validated.period,
    };

    return {
      content: [
        {
          type: 'text',
          text: `Dashboard de ${validated.period === 'week' ? 'esta semana' : 'este mes'}: Adherencia ${Math.round(data.adherence * 100)}%, Progreso de fuerza +${Math.round(data.strengthProgress * 100)}%`,
        },
        {
          type: 'resource',
          resource: {
            uri: `${WIDGET_BASE_URL}/src/atlas-dashboard.tsx`,
            mimeType: 'text/html+skybridge',
            text: JSON.stringify({ data }),
          },
        },
      ],
      _meta: {
        'openai/outputTemplate': `${WIDGET_BASE_URL}/src/atlas-dashboard.tsx`,
        'openai/widgetAccessible': true,
      },
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// ===== RESOURCES =====
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: `${WIDGET_BASE_URL}/src/atlas-dashboard.tsx`,
      name: 'ATLAS Dashboard Widget',
      mimeType: 'text/html+skybridge',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === `${WIDGET_BASE_URL}/src/atlas-dashboard.tsx`) {
    return {
      contents: [
        {
          uri,
          mimeType: 'text/html+skybridge',
          text: `<div id="atlas-dashboard-root"></div>
<link rel="stylesheet" href="${WIDGET_BASE_URL}/src/index.css">
<script type="module" src="${WIDGET_BASE_URL}/src/atlas-dashboard.tsx"></script>`,
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// ===== HTTP SERVER =====
const app = express();

// CORS
app.use(
  cors({
    origin: [
      'https://chatgpt.com',
      'https://chat.openai.com',
      'http://localhost:*',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    name: 'atlas-mcp-server',
    version: '1.0.0',
  });
});

// MCP endpoint
app.post('/mcp', async (req, res) => {
  const transport = new SSEServerTransport('/mcp', res);

  res.on('close', () => {
    transport.close();
  });

  await server.connect(transport);

  try {
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 ATLAS MCP Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 MCP endpoint: http://localhost:${PORT}/mcp`);
});
EOF
```

#### 2.4 Crear archivo .env

```bash
cd mcp/node

cat > .env.example << 'EOF'
PORT=8000
WIDGET_BASE_URL=http://localhost:4444
NODE_ENV=development
EOF

cp .env.example .env
```

### Fase 3: Testing Local

#### 3.1 Levantar Servidores

```bash
# Terminal 1: Servidor de Widgets
cd widgets
pnpm dev
# Debería estar en http://localhost:4444

# Terminal 2: Servidor MCP
cd mcp/node
pnpm dev
# Debería estar en http://localhost:8000

# Terminal 3: Exponer con ngrok
ngrok http 8000
# Copia la URL HTTPS que te da (ej: https://abc123.ngrok.io)
```

#### 3.2 Verificar que Funciona

```bash
# Probar health check
curl http://localhost:8000/health

# Debería retornar:
# {"status":"ok","name":"atlas-mcp-server","version":"1.0.0"}

# Probar MCP - listar tools
curl -X POST http://localhost:8000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

---

## 🔗 Configuración en ChatGPT

### Paso 1: Activar Developer Mode

1. **Abrir ChatGPT**
   - Ve a: https://chatgpt.com/

2. **Acceder a Settings**
   - Click en tu perfil (esquina superior derecha)
   - Selecciona **Settings**

3. **Ir a Connectors**
   - En el menú lateral: **Apps & Connectors**
   - Scroll hasta el final
   - Busca **Advanced settings**

4. **Habilitar Developer Mode**
   - Toggle **Developer Mode** a ON
   - ⚠️ **Advertencia de OpenAI**: "Poderoso pero peligroso - permite operaciones de escritura reales"
   - Acepta los términos

### Paso 2: Crear Connector

1. **Crear Nuevo Connector**
   - En la sección Connectors, click **Create**
   - O click **Add Connector** si ya tienes otros

2. **Configurar Detalles**

   **Name:** (requerido)
   ```
   ATLAS Fitness
   ```

   **Description:** (opcional)
   ```
   App de fitness especializada para adultos mayores con dashboards interactivos, planes adaptativos y seguimiento de métricas de longevidad.
   ```

   **MCP Server URL:** (requerido)
   ```
   https://TU_URL_NGROK.ngrok.io/mcp
   ```

   ⚠️ **Importante**:
   - Debe ser HTTPS (ngrok lo proporciona automáticamente)
   - Incluir `/mcp` al final
   - No funciona con `localhost` - debes usar ngrok u otro tunnel

3. **Configurar Autenticación**

   Para desarrollo (sin OAuth):
   - **Authentication:** Selecciona "None"

   Para producción (con OAuth 2.1):
   - **Authentication:** Selecciona "OAuth"
   - **Authorization URL:** `https://tu-app.com/oauth/authorize`
   - **Token URL:** `https://tu-app.com/oauth/token`
   - **Client ID:** (obtenido de tu OAuth provider)
   - **Client Secret:** (obtenido de tu OAuth provider)
   - **Scopes:** `read:profile write:workouts`

4. **Guardar Connector**
   - Click **Save**
   - Habilita el connector (toggle a ON)

### Paso 3: Probar la App

1. **Abrir un Nuevo Chat**
   - Ve a: https://chatgpt.com/
   - Inicia una nueva conversación

2. **Invocar la App**

   Prueba estos prompts:

   ```
   Muestra mi dashboard semanal de ATLAS
   ```

   ```
   Quiero ver mi progreso de esta semana en fitness
   ```

   ```
   Dashboard mensual ATLAS
   ```

3. **Verificar el Widget**

   Deberías ver:
   - ✅ Mensaje del LLM procesando
   - ✅ Loading state: "Cargando tu dashboard..."
   - ✅ Widget renderizado con tus métricas
   - ✅ Interfaz responsive y accesible

### Paso 4: Debugging

Si algo no funciona:

1. **Verificar logs del servidor MCP**
   ```bash
   # En la terminal donde corre pnpm dev
   # Deberías ver requests llegando
   ```

2. **Verificar ngrok**
   ```bash
   # Acceder a ngrok inspector
   # Ve a: http://localhost:4040
   # Verás todas las requests y responses
   ```

3. **Verificar Network en ChatGPT**
   - Abre DevTools (F12)
   - Tab **Network**
   - Filtra por `ngrok` o `mcp`
   - Revisa requests/responses

4. **Errores Comunes**

   **Error: "Failed to connect to MCP server"**
   - ✅ Verifica que ngrok esté corriendo
   - ✅ Verifica que la URL tenga `/mcp` al final
   - ✅ Verifica que el servidor MCP esté corriendo

   **Error: "Widget not rendering"**
   - ✅ Verifica que Vite esté sirviendo en puerto 4444
   - ✅ Verifica CORS en el servidor
   - ✅ Revisa consola del navegador por errores

   **Error: "Tool not found"**
   - ✅ Verifica que el tool esté registrado en `tools` array
   - ✅ Verifica el nombre del tool (debe ser `atlas_dashboard`)

---

## 🎯 Mejores Prácticas

### Desarrollo

1. **Usar variables de entorno**
   - Nunca hardcodear URLs o secrets
   - Usar `.env` para configuración local
   - Usar secrets management en producción

2. **Validación de inputs**
   - Siempre usar Zod o similar para validar
   - Sanitizar inputs para prevenir XSS
   - Validar tipos y rangos

3. **Logging estructurado**
   ```typescript
   console.log(JSON.stringify({
     event: 'tool_called',
     tool: 'atlas_dashboard',
     userId: userId,
     timestamp: new Date().toISOString(),
   }));
   ```

4. **Error handling robusto**
   ```typescript
   try {
     const result = await callApi();
     return result;
   } catch (error) {
     logger.error('API call failed', { error });
     return {
       content: [{
         type: 'text',
         text: 'Lo siento, ocurrió un error. Por favor intenta de nuevo.',
       }],
       isError: true,
     };
   }
   ```

### Accesibilidad (Adultos Mayores)

1. **Tipografía grande**
   ```css
   html {
     font-size: 18px; /* Base más grande */
   }

   .text-lg {
     font-size: 1.25rem; /* 22.5px */
   }
   ```

2. **Alto contraste**
   ```css
   /* Ratio mínimo 4.5:1 para texto normal */
   /* Ratio mínimo 3:1 para texto grande */
   color: #1a1a1a;
   background: #ffffff;
   ```

3. **Tamaños táctiles generosos**
   ```css
   .btn {
     min-width: 48px;
     min-height: 48px;
     padding: 12px 24px;
   }
   ```

4. **Focus visible**
   ```css
   button:focus {
     outline: 3px solid #7C4DFF;
     outline-offset: 2px;
   }
   ```

### Seguridad

1. **Nunca exponer secretos**
   - API keys en variables de entorno
   - No commitear `.env`
   - Usar servicios de secrets (AWS Secrets Manager, etc.)

2. **Sanitizar HTML**
   ```typescript
   import DOMPurify from 'dompurify';

   const cleanHTML = DOMPurify.sanitize(userInput);
   ```

3. **HTTPS en producción**
   - Nunca usar HTTP en producción
   - Usar certificados válidos
   - Habilitar HSTS

4. **Rate limiting**
   ```typescript
   import rateLimit from 'express-rate-limit';

   const limiter = rateLimit({
     windowMs: 60 * 1000, // 1 minuto
     max: 30, // 30 requests
   });

   app.use('/mcp', limiter);
   ```

### Compliance (Salud/Fitness)

1. **Disclaimers claros**
   ```typescript
   const disclaimer = "⚠️ ATLAS proporciona información educativa. No reemplaza consulta médica profesional. Consulta a tu médico antes de iniciar cualquier programa de ejercicios.";
   ```

2. **Gatillos de derivación médica**
   ```typescript
   if (painLevel >= 8 || reportedFall || chestPain) {
     return {
       content: [{
         type: 'text',
         text: '🚨 Por tu seguridad, te recomendamos consultar a un profesional de salud antes de continuar.',
       }],
     };
   }
   ```

3. **No almacenar PHI sin cifrado**
   ```typescript
   // Cifrar datos de salud sensibles
   const encrypted = await encrypt(userData, process.env.ENCRYPTION_KEY);
   await db.save(encrypted);
   ```

---

## 🐛 Troubleshooting

### Problema: ngrok timeout

**Síntoma:** Requests tardan >30s y fallan

**Solución:**
```typescript
// Agregar timeout a operaciones largas
const result = await Promise.race([
  longOperation(),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 25000)
  ),
]);
```

### Problema: Widget en blanco

**Síntoma:** Widget no renderiza nada

**Checklist:**
- ✅ Vite está sirviendo en puerto correcto
- ✅ CORS habilitado en Vite
- ✅ URL del widget es correcta en `_meta`
- ✅ MIME type es `text/html+skybridge`
- ✅ Revisar consola del navegador

### Problema: CORS errors

**Síntoma:** `Blocked by CORS policy`

**Solución:**
```typescript
app.use(cors({
  origin: [
    'https://chatgpt.com',
    'https://chat.openai.com',
  ],
  credentials: true,
}));
```

### Problema: Tool no se invoca

**Síntoma:** ChatGPT no llama al tool

**Checklist:**
- ✅ Description del tool es clara y específica
- ✅ Nombre del tool sigue convención snake_case
- ✅ inputSchema es válido JSON Schema
- ✅ Tool está en el array `tools`

---

## 🚀 Deployment a Producción

### Opción 1: Vercel (Recomendado para inicio)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy widgets
cd widgets
vercel --prod

# Deploy MCP server
cd ../mcp/node
vercel --prod

# Actualizar .env con URLs de producción
WIDGET_BASE_URL=https://tu-app.vercel.app
```

### Opción 2: Railway (MCP Server)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd mcp/node
railway init
railway up
```

### Opción 3: Cloudflare Pages (Widgets)

```bash
# Instalar Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
cd widgets
wrangler pages publish assets/
```

### Actualizar Connector en ChatGPT

1. Ve a Settings → Apps & Connectors
2. Edita tu connector ATLAS
3. Actualiza **MCP Server URL** con tu URL de producción:
   ```
   https://tu-mcp-server.railway.app/mcp
   ```
4. Actualiza variables de entorno:
   ```
   WIDGET_BASE_URL=https://tu-widgets.vercel.app
   ```
5. Guarda y prueba

---

## 📚 Recursos Adicionales

### Documentación Oficial

- **OpenAI Apps SDK**: https://developers.openai.com/apps-sdk/
- **Model Context Protocol**: https://modelcontextprotocol.io/
- **MCP TypeScript SDK**: https://github.com/modelcontextprotocol/typescript-sdk

### Repositorios de Ejemplo

- **OpenAI Apps Examples**: https://github.com/openai/openai-apps-sdk-examples
- **MCP Servers Collection**: https://github.com/modelcontextprotocol/servers

### Herramientas

- **ngrok**: https://ngrok.com/
- **Vercel**: https://vercel.com/
- **Railway**: https://railway.app/
- **Cloudflare Pages**: https://pages.cloudflare.com/

---

## ✅ Checklist Final

Antes de publicar en el directorio de ChatGPT:

- [ ] App funciona en Developer Mode
- [ ] OAuth 2.1 implementado y probado
- [ ] Widgets responsive y accesibles
- [ ] Disclaimers de salud visibles
- [ ] Rate limiting configurado
- [ ] Logging y monitoring activo
- [ ] Variables de entorno en secrets manager
- [ ] HTTPS en producción
- [ ] Compliance con políticas de OpenAI
- [ ] Documentación de usuario completa

---

**¡Éxito con ATLAS! 💪🏠🌟**

Si tienes dudas, revisa la documentación en `/Refs` o consulta los ejemplos oficiales de OpenAI.
