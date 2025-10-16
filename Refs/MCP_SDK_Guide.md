# Model Context Protocol (MCP) - Guía Completa

> **Nota:** Esta documentación está optimizada para ser usada como contexto por agentes de IA durante el desarrollo del proyecto ATLAS.
>
> **Última actualización:** 14 de Octubre, 2025

---

## Tabla de Contenido

1. [Introducción a MCP](#introducción-a-mcp)
2. [Implementación en TypeScript](#implementación-en-typescript)
3. [Capabilities del Protocolo](#capabilities-del-protocolo)
4. [Estructura de un Servidor MCP](#estructura-de-un-servidor-mcp)
5. [Metadatos para Apps SDK](#metadatos-para-apps-sdk)
6. [Ejemplo Completo: Tool con Widget](#ejemplo-completo-tool-con-widget)
7. [Implementación en Python con FastMCP](#implementación-en-python-con-fastmcp)
8. [Esquemas y Validación](#esquemas-y-validación)
9. [Best Practices](#best-practices)
10. [Debugging y Troubleshooting](#debugging-y-troubleshooting)
11. [Referencias MCP](#referencias-mcp)

---

## Introducción a MCP

### ¿Qué es Model Context Protocol?

**Model Context Protocol (MCP)** es un protocolo **open-source** creado para estandarizar la forma en que los Large Language Models (LLMs) interactúan con herramientas externas, datos y servicios.

**Características clave:**

- 🌐 **Transport-agnostic**: Funciona sobre HTTP, SSE, WebSockets
- 📋 **Contratos claros**: JSON Schema para inputs/outputs
- 🔧 **Extensible**: Fácil añadir nuevas capabilities
- 🤝 **Interoperable**: Funciona con cualquier cliente MCP (ChatGPT, Claude, etc.)

### Por qué MCP importa para Apps SDK

El **OpenAI Apps SDK** está construido sobre MCP. Esto significa:

- ✅ Tu servidor MCP funciona automáticamente en ChatGPT
- ✅ Puedes reutilizar el mismo servidor para otros clientes MCP
- ✅ El protocolo evoluciona de forma abierta (no vendor lock-in)
- ✅ Hay SDKs oficiales en múltiples lenguajes

### Arquitectura MCP

```
┌─────────────────────────────────────────────────────────┐
│                  Cliente MCP (ChatGPT)                  │
│                                                         │
│  1. Descubre tools disponibles (list_tools)            │
│  2. Invoca tool con argumentos (call_tool)             │
│  3. Recibe respuesta + metadata (widgets, etc.)        │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ JSON-RPC 2.0 sobre HTTP/SSE
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Servidor MCP (Tu Backend)              │
│                                                         │
│  • Expone lista de tools                               │
│  • Implementa handlers para cada tool                  │
│  • Retorna structured content + metadata               │
│  • Gestiona autenticación (OAuth)                      │
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
            [Base de datos, APIs, etc.]
```

### Conceptos Fundamentales

**Tools**: Funciones que el LLM puede invocar

```typescript
{
  name: "get_weather",
  description: "Get current weather for a location",
  inputSchema: { /* JSON Schema */ },
  _meta: { /* Metadata adicional */ }
}
```

**Resources**: Datos o contenido que el LLM puede consultar

```typescript
{
  uri: "file:///data/users.json",
  name: "User Database",
  mimeType: "application/json"
}
```

**Prompts**: Templates pre-configurados

```typescript
{
  name: "summarize_document",
  description: "Summarize a document with specific style",
  arguments: [{ name: "style", required: false }]
}
```

---

## Implementación en TypeScript

### Instalación

El SDK oficial de TypeScript tiene **10,000+ estrellas** en GitHub y es el más maduro.

```bash
# Instalar SDK
npm install @modelcontextprotocol/sdk

# O con pnpm (recomendado)
pnpm add @modelcontextprotocol/sdk

# Dependencias adicionales útiles
pnpm add zod express cors
```

### Setup Básico de Proyecto

**Estructura recomendada:**

```
mi-mcp-server/
├── src/
│   ├── server.ts          # Punto de entrada
│   ├── tools/             # Definiciones de tools
│   │   ├── index.ts
│   │   ├── weather.ts
│   │   └── calendar.ts
│   ├── schemas/           # JSON Schemas con Zod
│   │   └── index.ts
│   └── utils/             # Utilidades
│       └── validation.ts
├── package.json
├── tsconfig.json
└── .env
```

**package.json:**

```json
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
    "zod": "^3.23.8",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "tsx": "^4.19.2",
    "typescript": "^5.6.3"
  }
}
```

**tsconfig.json:**

```json
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
```

---

## Capabilities del Protocolo

MCP define varias **capabilities** que un servidor puede implementar:

### 1. Tools (Requerido para Apps SDK)

Permite al LLM invocar funciones.

**Request: list_tools**

```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "create_workout",
        "description": "Create a workout plan",
        "inputSchema": {
          "type": "object",
          "properties": {
            "date": { "type": "string" },
            "exercises": { "type": "array" }
          },
          "required": ["date"]
        }
      }
    ]
  }
}
```

**Request: call_tool**

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "create_workout",
    "arguments": {
      "date": "2025-10-15",
      "exercises": [...]
    }
  },
  "id": 2
}
```

### 2. Resources (Opcional)

Expone datos que el LLM puede leer.

**Request: resources/list**

```json
{
  "jsonrpc": "2.0",
  "method": "resources/list",
  "id": 3
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "resources": [
      {
        "uri": "file:///workouts/recent.json",
        "name": "Recent Workouts",
        "mimeType": "application/json"
      }
    ]
  }
}
```

### 3. Prompts (Opcional)

Templates para el LLM.

```json
{
  "jsonrpc": "2.0",
  "method": "prompts/list",
  "id": 4
}
```

---

## Estructura de un Servidor MCP

### Configuración Básica (TypeScript)

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
  type ListToolsRequest,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';

// 1. Crear instancia del servidor
const server = new Server(
  {
    name: 'atlas-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {}, // Habilitar tools
      resources: {}, // Habilitar resources (opcional)
    },
  }
);

// 2. Configurar handlers (veremos en siguiente sección)
setupHandlers(server);

// 3. Iniciar servidor HTTP
startHttpServer(server);
```

### Registro de Tools

**Método 1: Con setRequestHandler (más control)**

```typescript
import { z } from 'zod';

// Definir schema de validación
const CreateWorkoutSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  exercises: z
    .array(
      z.object({
        name: z.string(),
        sets: z.number().int().positive(),
        reps: z.number().int().positive(),
      })
    )
    .min(1),
});

// Listar tools disponibles
server.setRequestHandler(ListToolsRequestSchema, async (_request: ListToolsRequest) => {
  const tools: Tool[] = [
    {
      name: 'create_workout',
      description: 'Create a new workout plan for a specific date',
      inputSchema: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            format: 'date',
            description: 'Date in YYYY-MM-DD format',
          },
          exercises: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                sets: { type: 'number' },
                reps: { type: 'number' },
              },
              required: ['name', 'sets', 'reps'],
            },
            minItems: 1,
          },
        },
        required: ['date', 'exercises'],
      },
      _meta: {
        'openai/outputTemplate': 'ui://widget/workout-plan.html',
        'openai/widgetAccessible': true,
        'openai/resultCanProduceWidget': true,
      },
    },
  ];

  return { tools };
});

// Implementar handler para invocar tool
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  if (name === 'create_workout') {
    // Validar input
    const validated = CreateWorkoutSchema.parse(args);

    // Lógica del negocio
    const workout = await createWorkoutInDB(validated);

    // Retornar respuesta MCP
    return {
      content: [
        {
          type: 'text',
          text: `Created workout for ${validated.date} with ${validated.exercises.length} exercises`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'ui://widget/workout-plan.html',
            mimeType: 'text/html+skybridge',
            text: JSON.stringify({ workout }),
          },
        },
      ],
      _meta: {
        'openai/outputTemplate': 'ui://widget/workout-plan.html',
        'openai/widgetAccessible': true,
      },
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});
```

### Resources y ResourceTemplates

**Resource estático:**

```typescript
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const resources = [
  {
    uri: 'atlas://exercises/library',
    name: 'Exercise Library',
    description: 'Complete list of available exercises',
    mimeType: 'application/json',
  },
];

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources,
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'atlas://exercises/library') {
    const exercises = await db.exercises.findAll();

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(exercises),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});
```

**Resource template (dinámico):**

```typescript
import { ListResourceTemplatesRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const resourceTemplates = [
  {
    uriTemplate: 'atlas://workouts/{date}',
    name: 'Workout by Date',
    description: 'Get workout plan for a specific date',
    mimeType: 'application/json',
  },
];

server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
  resourceTemplates,
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  // Parsear URI template
  const match = uri.match(/^atlas:\/\/workouts\/(.+)$/);
  if (match) {
    const date = match[1];
    const workout = await db.workouts.findByDate(date);

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(workout),
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});
```

### Transporte HTTP/SSE

**Opción 1: Server-Sent Events (Recomendado)**

```typescript
import express from 'express';
import cors from 'cors';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/mcp', async (req, res) => {
  // Crear transport para esta request
  const transport = new SSEServerTransport('/mcp', res);

  // Cleanup al cerrar conexión
  res.on('close', () => {
    transport.close();
  });

  // Conectar servidor al transport
  await server.connect(transport);

  // Procesar request
  try {
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 MCP Server running on http://localhost:${PORT}/mcp`);
});
```

**Opción 2: Streamable HTTP (Alternativa)**

```typescript
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

app.post('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on('close', () => {
    transport.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});
```

### Configuración CORS

```typescript
import cors from 'cors';

app.use(
  cors({
    origin: [
      'https://chatgpt.com',
      'https://chat.openai.com',
      'http://localhost:*', // Para desarrollo
    ],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
```

---

## Metadatos para Apps SDK

Los metadatos en `_meta` son **cruciales** para que ChatGPT sepa cómo renderizar widgets.

### Metadatos Disponibles

| Metadato                         | Tipo    | Descripción                                   | Ejemplo                        |
| -------------------------------- | ------- | --------------------------------------------- | ------------------------------ |
| `openai/outputTemplate`          | string  | URI del widget HTML a renderizar              | `"ui://widget/dashboard.html"` |
| `openai/widgetAccessible`        | boolean | Indica si el resultado puede ser widget       | `true`                         |
| `openai/resultCanProduceWidget`  | boolean | El tool puede retornar un widget              | `true`                         |
| `openai/toolInvocation/invoking` | string  | Mensaje mientras ejecuta (loading)            | `"Creating your plan..."`      |
| `openai/toolInvocation/invoked`  | string  | Mensaje al terminar                           | `"Plan created!"`              |
| `openai/readOnlyHint`            | boolean | Indica si es solo lectura (no modifica datos) | `true`                         |

### Uso en Tools

```typescript
const tools: Tool[] = [
  {
    name: 'atlas_build_plan',
    description: 'Generate weekly workout plan',
    inputSchema: {
      /* ... */
    },
    _meta: {
      // Widget que se renderizará
      'openai/outputTemplate': 'ui://widget/atlas-weekly-board.html',

      // Habilitar rendering como widget
      'openai/widgetAccessible': true,
      'openai/resultCanProduceWidget': true,

      // Mensajes de feedback
      'openai/toolInvocation/invoking': 'Building your personalized plan...',
      'openai/toolInvocation/invoked': 'Your plan is ready!',

      // Metadato de solo lectura (opcional)
      'openai/readOnlyHint': false, // Este tool crea datos
    },
  },
  {
    name: 'atlas_view_progress',
    description: 'View your fitness progress',
    inputSchema: {
      /* ... */
    },
    _meta: {
      'openai/outputTemplate': 'ui://widget/atlas-dashboard.html',
      'openai/widgetAccessible': true,
      'openai/resultCanProduceWidget': true,
      'openai/toolInvocation/invoking': 'Loading your stats...',
      'openai/toolInvocation/invoked': "Here's your progress!",
      'openai/readOnlyHint': true, // Solo lectura
    },
  },
];
```

### Uso en Resources

```typescript
const resources: Resource[] = [
  {
    uri: 'ui://widget/workout-plan.html',
    name: 'Workout Plan Widget',
    description: 'Interactive workout plan',
    mimeType: 'text/html+skybridge',
    _meta: {
      'openai/outputTemplate': 'ui://widget/workout-plan.html',
      'openai/widgetAccessible': true,
    },
  },
];
```

### Retornar Widget en Response

```typescript
async function handleToolCall(name: string, args: any) {
  // ... lógica del tool

  return {
    content: [
      // Texto plano (opcional, para contexto del LLM)
      {
        type: 'text',
        text: `Created workout with ${exercises.length} exercises`,
      },
      // Widget HTML
      {
        type: 'resource',
        resource: {
          uri: 'ui://widget/workout-plan.html',
          mimeType: 'text/html+skybridge',
          text: JSON.stringify({ workout, exercises }), // Datos para el widget
        },
      },
    ],
    _meta: {
      'openai/outputTemplate': 'ui://widget/workout-plan.html',
      'openai/widgetAccessible': true,
    },
  };
}
```

---

## Ejemplo Completo: Tool con Widget

### Servidor Completo (src/server.ts)

```typescript
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

// ===== SCHEMAS =====
const SearchRestaurantsSchema = z.object({
  location: z.string().min(1),
  cuisine: z.string().optional(),
  priceRange: z.enum(['$', '$$', '$$$', '$$$$']).optional(),
});

// ===== MCP SERVER =====
const server = new Server(
  { name: 'restaurant-finder', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
);

// Tools disponibles
const tools = [
  {
    name: 'search_restaurants',
    description: 'Search for restaurants by location and optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City or area to search in',
        },
        cuisine: {
          type: 'string',
          description: 'Type of cuisine (Italian, Mexican, etc.)',
        },
        priceRange: {
          type: 'string',
          enum: ['$', '$$', '$$$', '$$$$'],
          description: 'Price range',
        },
      },
      required: ['location'],
    },
    _meta: {
      'openai/outputTemplate': 'ui://widget/restaurant-list.html',
      'openai/widgetAccessible': true,
      'openai/resultCanProduceWidget': true,
      'openai/toolInvocation/invoking': 'Searching restaurants...',
      'openai/toolInvocation/invoked': 'Found restaurants!',
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

  if (name === 'search_restaurants') {
    // 1. Validar input
    const validated = SearchRestaurantsSchema.parse(args);

    // 2. Buscar restaurantes (simulado)
    const restaurants = await searchRestaurants(validated);

    // 3. Retornar respuesta con widget
    return {
      content: [
        {
          type: 'text',
          text: `Found ${restaurants.length} restaurants in ${validated.location}`,
        },
        {
          type: 'resource',
          resource: {
            uri: 'ui://widget/restaurant-list.html',
            mimeType: 'text/html+skybridge',
            text: JSON.stringify({ restaurants }),
          },
        },
      ],
      _meta: {
        'openai/outputTemplate': 'ui://widget/restaurant-list.html',
        'openai/widgetAccessible': true,
      },
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Resources (widget HTML)
const widgetHtml = `
<div id="restaurant-list-root"></div>
<link rel="stylesheet" href="https://cdn.example.com/restaurant-list.css">
<script type="module" src="https://cdn.example.com/restaurant-list.js"></script>
`;

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'ui://widget/restaurant-list.html',
      name: 'Restaurant List Widget',
      mimeType: 'text/html+skybridge',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'ui://widget/restaurant-list.html') {
    return {
      contents: [
        {
          uri,
          mimeType: 'text/html+skybridge',
          text: widgetHtml,
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// ===== LÓGICA DE NEGOCIO =====
async function searchRestaurants(params: z.infer<typeof SearchRestaurantsSchema>) {
  // Aquí iría tu lógica real (API, DB, etc.)
  return [
    {
      id: '1',
      name: 'La Trattoria',
      cuisine: params.cuisine || 'Italian',
      rating: 4.5,
      priceRange: '$$',
      address: `123 Main St, ${params.location}`,
      thumbnail: 'https://example.com/photos/trattoria.jpg',
    },
    {
      id: '2',
      name: 'Sushi Palace',
      cuisine: 'Japanese',
      rating: 4.8,
      priceRange: '$$$',
      address: `456 Oak Ave, ${params.location}`,
      thumbnail: 'https://example.com/photos/sushi.jpg',
    },
  ];
}

// ===== HTTP SERVER =====
const app = express();
app.use(cors());
app.use(express.json());

app.post('/mcp', async (req, res) => {
  const transport = new SSEServerTransport('/mcp', res);
  res.on('close', () => transport.close());

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', name: 'restaurant-finder' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🍕 Restaurant Finder MCP Server running on port ${PORT}`);
});
```

---

## Implementación en Python con FastMCP

### Instalación

```bash
# Crear virtual environment
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate

# Instalar dependencias
pip install mcp fastmcp uvicorn pydantic
```

### Servidor Básico

```python
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field
import json

# Crear instancia FastMCP
mcp = FastMCP(
    name="atlas-python",
    sse_path="/mcp",
    message_path="/mcp/messages",
    stateless_http=True,
)

# Definir schema con Pydantic
class WorkoutInput(BaseModel):
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    exercises: list[dict] = Field(..., min_length=1)

# Registrar tool
@mcp.tool(
    name="create_workout",
    description="Create a new workout plan",
)
async def create_workout(workout: WorkoutInput):
    # Lógica del negocio
    result = {
        "date": workout.date,
        "exercises": workout.exercises,
        "created_at": "2025-10-14T22:00:00Z",
    }

    # Retornar respuesta MCP
    return {
        "content": [
            {
                "type": "text",
                "text": f"Created workout for {workout.date}",
            },
            {
                "type": "resource",
                "resource": {
                    "uri": "ui://widget/workout-plan.html",
                    "mimeType": "text/html+skybridge",
                    "text": json.dumps(result),
                },
            }
        ],
        "_meta": {
            "openai/outputTemplate": "ui://widget/workout-plan.html",
            "openai/widgetAccessible": True,
        },
    }

# Ejecutar con: uvicorn main:mcp.app --port 8000
```

### Diferencias TypeScript vs Python

| Aspecto         | TypeScript                  | Python                            |
| --------------- | --------------------------- | --------------------------------- |
| **SDK**         | `@modelcontextprotocol/sdk` | `fastmcp`                         |
| **Validación**  | Zod                         | Pydantic                          |
| **Async**       | `async/await` nativo        | `async/await` nativo              |
| **Type Safety** | Tipos estáticos             | Type hints (runtime con Pydantic) |
| **Transporte**  | SSEServerTransport manual   | FastMCP automático                |
| **Madurez**     | Más maduro                  | Más reciente                      |

---

## Esquemas y Validación

### JSON Schema para Inputs

**Ejemplo completo:**

```typescript
const inputSchema = {
  type: 'object',
  properties: {
    // String básico
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      description: 'User name',
    },

    // Email
    email: {
      type: 'string',
      format: 'email',
    },

    // Fecha
    date: {
      type: 'string',
      format: 'date', // YYYY-MM-DD
    },

    // Enum
    status: {
      type: 'string',
      enum: ['active', 'inactive', 'pending'],
    },

    // Número con constraints
    age: {
      type: 'number',
      minimum: 0,
      maximum: 150,
    },

    // Array de objetos
    exercises: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          sets: { type: 'number', minimum: 1 },
          reps: { type: 'number', minimum: 1 },
        },
        required: ['name', 'sets', 'reps'],
      },
      minItems: 1,
      maxItems: 20,
    },

    // Nested object
    address: {
      type: 'object',
      properties: {
        street: { type: 'string' },
        city: { type: 'string' },
        zipCode: { type: 'string', pattern: '^\\d{5}$' },
      },
      required: ['city'],
    },
  },
  required: ['name', 'email', 'date'],
  additionalProperties: false, // No permitir props extra
};
```

### Validación con Zod (TypeScript)

```typescript
import { z } from 'zod';

const WorkoutSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  exercises: z
    .array(
      z.object({
        name: z.string().min(1).max(100),
        sets: z.number().int().min(1).max(10),
        reps: z.number().int().min(1).max(100),
        weight: z.number().min(0).optional(),
      })
    )
    .min(1)
    .max(20),
  notes: z.string().max(500).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

// Usar en handler
async function handleCreateWorkout(args: unknown) {
  try {
    const validated = WorkoutSchema.parse(args);
    // validated tiene tipos inferidos automáticamente
    const workout = await saveWorkout(validated);
    return { success: true, workout };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: 'Validation failed',
        details: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      };
    }
    throw error;
  }
}
```

### Validación con Pydantic (Python)

```python
from pydantic import BaseModel, Field, validator
from typing import Optional
from enum import Enum

class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class Exercise(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    sets: int = Field(..., ge=1, le=10)
    reps: int = Field(..., ge=1, le=100)
    weight: Optional[float] = Field(None, ge=0)

class WorkoutInput(BaseModel):
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    exercises: list[Exercise] = Field(..., min_length=1, max_length=20)
    notes: Optional[str] = Field(None, max_length=500)
    difficulty: Optional[Difficulty] = None

    @validator('date')
    def validate_date(cls, v):
        from datetime import datetime
        try:
            datetime.strptime(v, '%Y-%m-%d')
        except ValueError:
            raise ValueError('Invalid date format')
        return v

# Usar en tool
@mcp.tool("create_workout")
async def create_workout(workout: WorkoutInput):
    # workout ya está validado automáticamente
    result = await save_workout(workout.dict())
    return {"success": True, "workout": result}
```

---

## Best Practices

### 1. Validación Exhaustiva

✅ **Siempre valida inputs:**

```typescript
// Malo
async function handleTool(args: any) {
  const result = await processData(args.value);
  return result;
}

// Bueno
async function handleTool(args: unknown) {
  const validated = InputSchema.parse(args);
  const result = await processData(validated.value);
  return result;
}
```

### 2. Manejo Robusto de Errores

```typescript
async function handleToolCall(name: string, args: unknown) {
  try {
    // Validación
    const validated = schema.parse(args);

    // Lógica
    const result = await performAction(validated);

    // Respuesta exitosa
    return {
      content: [{ type: 'text', text: 'Success' }],
    };
  } catch (error) {
    // Log error
    logger.error('Tool call failed', { name, error });

    // Retornar error amigable
    if (error instanceof z.ZodError) {
      return {
        content: [
          {
            type: 'text',
            text: `Validation error: ${error.errors[0].message}`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: 'An unexpected error occurred. Please try again.',
        },
      ],
      isError: true,
    };
  }
}
```

### 3. Logging Estructurado

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const startTime = Date.now();
  const { name, arguments: args } = request.params;

  logger.info({ event: 'tool_called', tool: name, args });

  try {
    const result = await handleTool(name, args);

    logger.info({
      event: 'tool_success',
      tool: name,
      duration: Date.now() - startTime,
    });

    return result;
  } catch (error) {
    logger.error({
      event: 'tool_error',
      tool: name,
      error: error.message,
      duration: Date.now() - startTime,
    });
    throw error;
  }
});
```

### 4. Timeouts Apropiados

```typescript
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)),
  ]);
}

async function handleTool(args: any) {
  try {
    // Timeout de 25 segundos (ChatGPT tiene timeout de 30s)
    const result = await withTimeout(performLongOperation(args), 25000);
    return result;
  } catch (error) {
    if (error.message === 'Timeout') {
      return {
        content: [
          {
            type: 'text',
            text: 'Operation took too long. Please try again.',
          },
        ],
        isError: true,
      };
    }
    throw error;
  }
}
```

### 5. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const mcpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 requests por minuto
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

app.use('/mcp', mcpLimiter);
```

### 6. Caché de Resultados

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: 300, // 5 minutos por defecto
  checkperiod: 60, // Check de expiración cada 60s
});

async function getCachedOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Intentar obtener de caché
  const cached = cache.get<T>(key);
  if (cached !== undefined) {
    return cached;
  }

  // Fetch y cachear
  const result = await fetchFn();
  cache.set(key, result, ttl);
  return result;
}

// Uso
async function handleGetWorkouts(userId: string) {
  const workouts = await getCachedOrFetch(
    `workouts:${userId}`,
    () => db.workouts.findByUser(userId),
    300 // 5 minutos
  );
  return workouts;
}
```

### 7. Documentación Inline de Schemas

```typescript
const tool = {
  name: 'create_workout',
  description: `
    Create a personalized workout plan for a specific date.
    
    This tool generates a workout plan based on user preferences and fitness level.
    The plan includes exercises, sets, reps, and rest periods.
    
    Example usage:
    - "Create a workout for tomorrow"
    - "Build me a leg day workout for Monday"
  `,
  inputSchema: {
    type: 'object',
    properties: {
      date: {
        type: 'string',
        format: 'date',
        description: 'Target date for the workout in YYYY-MM-DD format',
        example: '2025-10-15',
      },
      focusArea: {
        type: 'string',
        enum: ['upper', 'lower', 'full', 'core'],
        description: 'Which muscle group to focus on',
      },
    },
  },
};
```

---

## Debugging y Troubleshooting

### Logs del Servidor

**Implementar logging detallado:**

```typescript
// Middleware de logging
app.use((req, res, next) => {
  logger.info({
    event: 'http_request',
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Log de todas las requests MCP
server.onerror = (error) => {
  logger.error({
    event: 'mcp_error',
    error: error.message,
    stack: error.stack,
  });
};
```

### Testing Local con curl

```bash
# Test health check
curl http://localhost:8000/health

# Test list tools
curl -X POST http://localhost:8000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'

# Test call tool
curl -X POST http://localhost:8000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "create_workout",
      "arguments": {
        "date": "2025-10-15",
        "exercises": []
      }
    },
    "id": 2
  }'
```

### Errores Comunes y Soluciones

**Error 1: "Tool not found"**

```typescript
// Problema: Nombre de tool no coincide
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;

  if (name === 'createWorkout') {
    // ❌ Mal: camelCase
    // ...
  }

  if (name === 'create_workout') {
    // ✅ Bien: snake_case
    // ...
  }
});
```

**Error 2: "Invalid JSON Schema"**

```typescript
// Problema: Schema mal formado
inputSchema: {
  type: 'object',
  properties: {
    date: { type: 'string' },
  },
  required: 'date',  // ❌ Mal: string en vez de array
}

// Solución:
inputSchema: {
  type: 'object',
  properties: {
    date: { type: 'string' },
  },
  required: ['date'],  // ✅ Bien: array
}
```

**Error 3: "Widget not rendering"**

```typescript
// Problema: MIME type incorrecto
resource: {
  uri: 'ui://widget/dashboard.html',
  mimeType: 'text/html',  // ❌ Mal
}

// Solución:
resource: {
  uri: 'ui://widget/dashboard.html',
  mimeType: 'text/html+skybridge',  // ✅ Bien
}
```

**Error 4: "CORS error"**

```typescript
// Asegurarse de configurar CORS correctamente
app.use(
  cors({
    origin: ['https://chatgpt.com', 'https://chat.openai.com'],
    credentials: true,
  })
);

// También verificar headers en responses de widgets
res.setHeader('Access-Control-Allow-Origin', '*');
```

---

## Referencias MCP

### Documentación Oficial

- **Especificación MCP**: [modelcontextprotocol.io/specification](https://modelcontextprotocol.io/specification)
- **TypeScript SDK**: [github.com/modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- **Python SDK**: [github.com/modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk)

### Repositorios de Ejemplo

- **OpenAI Apps SDK Examples**: [github.com/openai/openai-apps-sdk-examples](https://github.com/openai/openai-apps-sdk-examples)
- **MCP Servers Collection**: [github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)

### Herramientas

- **MCP Inspector**: `npx @modelcontextprotocol/inspector` - Testing de servidores MCP
- **JSON Schema Validator**: [jsonschemavalidator.net](https://www.jsonschemavalidator.net)
- **Zod Documentation**: [zod.dev](https://zod.dev)
- **Pydantic Documentation**: [docs.pydantic.dev](https://docs.pydantic.dev)

### Community

- **MCP Discord**: Comunidad oficial de MCP
- **GitHub Discussions**: Repositorios de los SDKs oficiales
- **Stack Overflow**: Tag `model-context-protocol`

---

## Conclusión

El Model Context Protocol es la **base técnica** del OpenAI Apps SDK. Dominar MCP te permite:

✅ Crear servidores robustos y escalables  
✅ Exponer tools que ChatGPT puede usar naturalmente  
✅ Retornar widgets interactivos con datos dinámicos  
✅ Reutilizar el mismo servidor para múltiples clientes MCP  
✅ Aprovechar un ecosistema open-source en crecimiento

Esta guía ha cubierto desde los fundamentos hasta implementaciones avanzadas. Usa este documento como referencia técnica durante el desarrollo de ATLAS y otros proyectos con MCP.

¡Éxito construyendo con MCP! 🚀🔧
