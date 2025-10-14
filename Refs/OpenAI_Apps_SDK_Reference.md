# OpenAI Apps SDK - Referencia Completa

> **Nota:** Esta documentación está optimizada para ser usada como contexto por agentes de IA durante el desarrollo del proyecto ATLAS.
> 
> **Última actualización:** 14 de Octubre, 2025

---

## Tabla de Contenido

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Base Técnica](#base-técnica)
3. [Anatomía de una App ChatGPT](#anatomía-de-una-app-chatgpt)
4. [Widgets Disponibles (Pizzaz)](#widgets-disponibles-pizzaz)
5. [Autenticación y Seguridad](#autenticación-y-seguridad)
6. [Estado y Almacenamiento](#estado-y-almacenamiento)
7. [Developer Mode](#developer-mode)
8. [Seguridad y Privacidad](#seguridad-y-privacidad)
9. [Políticas del Directorio](#políticas-del-directorio)
10. [Ejemplos Existentes](#ejemplos-existentes)
11. [Repositorios Oficiales](#repositorios-oficiales)
12. [MCP Server - Fundamentos](#mcp-server---fundamentos)
13. [🎯 ATLAS - Adulto Mayor y Longevidad](#-atlas---adulto-mayor-y-longevidad)
14. [Checklist de Implementación](#checklist-de-implementación)
15. [Referencias y Recursos](#referencias-y-recursos)

---

## Resumen Ejecutivo

### ¿Qué es el Apps SDK de OpenAI?

El **OpenAI Apps SDK** es un framework nuevo (en preview) que permite crear **aplicaciones interactivas que viven dentro de ChatGPT**. Estas apps se invocan por lenguaje natural o son sugeridas por el modelo y ofrecen interfaces ricas directamente en el chat.

**Puntos clave:**
- 🚀 **Canal de distribución nativo**: ChatGPT se convierte en una plataforma donde los usuarios pueden descubrir y usar tu app sin salir del chat
- 🛠️ **Construido sobre MCP**: Utiliza Model Context Protocol (estándar abierto) para conectar herramientas con LLMs
- 🎨 **UI interactiva**: Widgets embebidos que se renderizan inline en las respuestas del asistente
- 💰 **Monetización futura**: OpenAI planea anunciar opciones de monetización y soporte al Agentic Commerce Protocol (checkout instantáneo en ChatGPT)

### Por qué importa

ChatGPT tiene **millones de usuarios activos diarios**. Al construir una app dentro de ChatGPT:
- ✅ Eliminas fricción de onboarding (los usuarios ya están en ChatGPT)
- ✅ Aprovechas el lenguaje natural como interfaz primaria
- ✅ Accedes a un directorio/app store integrado (próximamente)
- ✅ Puedes ofrecer experiencias transaccionales directamente en el chat

### Estado Actual

**Preview público**: Los desarrolladores pueden construir y probar apps hoy. Las postulaciones para publicar en el directorio oficial se abrirán **este año (2025)**.

**Apps ya disponibles**: Booking.com, Canva, Coursera, Expedia, Figma, Spotify, Zillow, entre otras.

---

## Base Técnica

### Model Context Protocol (MCP)

MCP es un **protocolo open-source** creado para conectar LLMs con herramientas externas, datos y UIs. Es transport-agnostic y define contratos claros para:
- **Tools**: Funciones que el modelo puede invocar
- **Resources**: Datos o contenido que el modelo puede consultar
- **Prompts**: Plantillas pre-configuradas

### Apps SDK como Extensión de MCP

El **Apps SDK extiende MCP** para incluir metadatos que permiten:
- Renderizar **widgets HTML** inline en ChatGPT
- Gestionar **estado efímero** entre el widget y el servidor
- Manejar **OAuth 2.1** para autenticación segura

```
┌─────────────────────────────────────────┐
│         ChatGPT (Cliente MCP)           │
│  ┌───────────────────────────────────┐  │
│  │  Conversación + UI Widgets        │  │
│  └───────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │ MCP Protocol (HTTP/SSE)
               ▼
┌──────────────────────────────────────────┐
│       Tu MCP Server (Backend)            │
│  ┌────────────────────────────────────┐  │
│  │  Tools + Resources + Metadata      │  │
│  └────────────────────────────────────┘  │
└──────────────┬───────────────────────────┘
               │
               ▼
         [Tu base de datos]
         [APIs externas]
```

### Distribución

OpenAI planea lanzar un **directorio de apps** (similar a una app store) dentro de ChatGPT donde:
- Los usuarios descubrirán apps recomendadas por el asistente
- Los desarrolladores publicarán tras pasar verificación
- Se habilitarán opciones de monetización y comercio

---

## Anatomía de una App ChatGPT

Una app para ChatGPT consta de **tres componentes principales**:

### 1. MCP Server (Backend)

Tu backend expone **tools** que ChatGPT puede invocar. Cada tool:
- Define un **JSON Schema** para inputs
- Retorna **contenido estructurado** + opcionalmente HTML para UI
- Incluye **metadatos** que indican a ChatGPT cómo renderizar el widget

**Ejemplo de estructura de tool:**

```typescript
{
  name: "search_pizzerias",
  description: "Search for pizza places by location",
  inputSchema: {
    type: "object",
    properties: {
      location: { type: "string", description: "City or area" },
      cuisine: { type: "string", description: "Type of pizza" }
    },
    required: ["location"]
  },
  _meta: {
    "openai/outputTemplate": "ui://widget/pizza-list.html",
    "openai/widgetAccessible": true,
    "openai/resultCanProduceWidget": true,
    "openai/toolInvocation/invoking": "Searching pizzerias...",
    "openai/toolInvocation/invoked": "Found restaurants!"
  }
}
```

### 2. Widgets (UI Embebida)

Los widgets son **componentes React** empaquetados como bundles HTML/JS/CSS que se renderizan en un iframe dentro de ChatGPT.

**Características:**
- Construidos con **React + Tailwind CSS**
- Empaquetados con **Vite** (múltiples entry points)
- Hospedados en un **CDN** (CORS habilitado)
- Reciben **datos vía `window.openai`**

**Ejemplo de widget básico:**

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { useWidgetProps } from './hooks';

function PizzaListWidget() {
  const props = useWidgetProps(); // Datos del MCP server
  const places = props?.places || [];

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <h2 className="text-xl font-medium mb-4">Best Pizzerias</h2>
      <div className="flex flex-col gap-2">
        {places.map((place) => (
          <div key={place.id} className="flex items-center gap-3 p-2 hover:bg-black/5 rounded-lg">
            <img src={place.thumbnail} className="w-12 h-12 rounded-lg" />
            <div>
              <div className="font-medium">{place.name}</div>
              <div className="text-sm text-black/60">{place.city}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

createRoot(document.getElementById('pizza-list-root')).render(<PizzaListWidget />);
```

### 3. Metadatos Clave

Los metadatos en `_meta` indican a ChatGPT cómo manejar la respuesta del tool:

| Metadato | Descripción | Ejemplo |
|----------|-------------|---------|
| `openai/outputTemplate` | URI del widget HTML a renderizar | `"ui://widget/pizza-list.html"` |
| `openai/widgetAccessible` | Indica que el resultado puede mostrarse como widget | `true` |
| `openai/resultCanProduceWidget` | El tool puede producir un widget | `true` |
| `openai/toolInvocation/invoking` | Mensaje mientras ejecuta (loading) | `"Searching restaurants..."` |
| `openai/toolInvocation/invoked` | Mensaje al completar | `"Found 12 places!"` |

---

## Widgets Disponibles (Pizzaz)

OpenAI proporciona una **galería de widgets de ejemplo** llamada **Pizzaz**. Estos widgets están listos para reutilizar y adaptar:

### 1. List (pizzaz-list)

**Uso:** Listas de items con imágenes, títulos, descripciones, ratings.

**Props esperados:**
```typescript
{
  places: Array<{
    id: string;
    name: string;
    thumbnail: string;
    city: string;
    rating: number;
  }>
}
```

**Características:**
- Diseño responsive (mobile-first)
- Hover states
- Iconos con Lucide React
- Diseño compacto con scroll vertical

**Código fuente (simplificado):**

```jsx
import { Star, PlusCircle } from 'lucide-react';

function PizzaList() {
  const places = markers?.places || [];
  
  return (
    <div className="antialiased w-full text-black px-4 pb-2 border border-black/10 rounded-2xl bg-white">
      <div className="flex items-center gap-4 border-b border-black/5 py-4">
        <img src="https://persistent.oaistatic.com/pizzaz/title.png" className="w-16 h-16 rounded-xl" />
        <div>
          <div className="text-xl font-medium">National Best Pizza List</div>
          <div className="text-sm text-black/60">Ranking of best pizzerias</div>
        </div>
      </div>
      
      <div className="flex flex-col">
        {places.slice(0, 7).map((place, i) => (
          <div key={place.id} className="px-3 -mx-2 rounded-2xl hover:bg-black/5">
            <div className="flex items-center gap-2 py-3">
              <img src={place.thumbnail} className="h-11 w-11 rounded-lg" />
              <div className="text-sm">{i + 1}</div>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{place.name}</div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-3 w-3" />
                  <span>{place.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="text-sm text-black/60">{place.city}</div>
              <PlusCircle className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. Carousel (pizzaz-carousel)

**Uso:** Carrusel horizontal de imágenes/lugares con navegación.

**Props esperados:**
```typescript
{
  items: Array<{
    id: string;
    title: string;
    image: string;
    description: string;
  }>
}
```

**Características:**
- Scroll horizontal con snap
- Navegación con flechas
- Auto-scroll opcional
- Lazy loading de imágenes

### 3. Map (pizzaz)

**Uso:** Mapa interactivo con markers (usa Mapbox GL).

**Props esperados:**
```typescript
{
  markers: Array<{
    id: string;
    lat: number;
    lng: number;
    name: string;
    thumbnail: string;
  }>,
  center: { lat: number; lng: number },
  zoom: number
}
```

**Características:**
- Mapa interactivo con Mapbox
- Popups customizables
- Clustering de markers (opcional)
- Estilos de mapa personalizados

### 4. Albums (pizzaz-albums)

**Uso:** Galería de fotos en grid con lightbox.

**Props esperados:**
```typescript
{
  images: Array<{
    id: string;
    url: string;
    thumbnail: string;
    caption: string;
  }>
}
```

**Características:**
- Grid responsive
- Lightbox para ver en grande
- Lazy loading
- Soporte para captions

### 5. Video (pizzaz-video)

**Uso:** Reproductor de video embebido.

**Props esperados:**
```typescript
{
  videoUrl: string;
  thumbnail: string;
  title: string;
}
```

**Características:**
- Player HTML5 nativo
- Controles custom
- Poster/thumbnail inicial
- Responsive

---

## Autenticación y Seguridad

### OAuth 2.1 con PKCE

El Apps SDK soporta **OAuth 2.1** (con PKCE - Proof Key for Code Exchange) para autenticar usuarios de forma segura.

**Flujo:**

```
1. Usuario invoca tool que requiere autenticación
   ↓
2. ChatGPT redirige al OAuth provider (tu servidor)
   ↓
3. Usuario autoriza la app
   ↓
4. ChatGPT recibe token de acceso
   ↓
5. Token se envía en headers de requests subsecuentes
   ↓
6. Tu MCP server valida token y retorna datos del usuario
```

**Configuración en MCP:**

```typescript
{
  securitySchemes: {
    oauth2: {
      type: "oauth2",
      flows: {
        authorizationCode: {
          authorizationUrl: "https://tu-app.com/oauth/authorize",
          tokenUrl: "https://tu-app.com/oauth/token",
          scopes: {
            "read:profile": "Read user profile",
            "write:workouts": "Manage workouts"
          }
        }
      }
    }
  }
}
```

**Validación de token en tu servidor:**

```typescript
async function validateToken(token: string): Promise<User | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.users.findOne({ id: decoded.sub });
    return user;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}
```

### Security Schemes por Tool

Puedes especificar diferentes niveles de seguridad por tool:

```typescript
{
  name: "get_public_workouts",
  security: [], // No requiere auth
  // ...
},
{
  name: "create_workout",
  security: [{ oauth2: ["write:workouts"] }], // Requiere OAuth con scope específico
  // ...
}
```

---

## Estado y Almacenamiento

### Estado Efímero (window.openai)

ChatGPT expone un objeto global `window.openai` en widgets para gestionar estado temporal:

**API disponible:**

```typescript
interface OpenAI {
  // Establecer estado del widget (persiste durante la sesión)
  setWidgetState(state: Record<string, any>): void;
  
  // Obtener estado actual
  widgetState: Record<string, any>;
  
  // Props pasados desde el MCP server
  widgetProps: Record<string, any>;
  
  // Información del usuario (si está autenticado)
  user?: {
    id: string;
    name: string;
    email: string;
  };
}
```

**Ejemplo de uso con hook React:**

```typescript
import { useWidgetState } from './use-widget-state';

function ExerciseSelector() {
  const [selected, setSelected] = useWidgetState<string[]>([]);
  
  const toggleExercise = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };
  
  return (
    <div>
      {exercises.map((ex) => (
        <button
          key={ex.id}
          onClick={() => toggleExercise(ex.id)}
          className={selected.includes(ex.id) ? 'bg-blue-500 text-white' : 'bg-gray-200'}
        >
          {ex.name}
        </button>
      ))}
      <p>Selected: {selected.length}</p>
    </div>
  );
}
```

**Hook `useWidgetState` (código):**

```typescript
import { useCallback, useEffect, useState, type SetStateAction } from 'react';

export function useWidgetState<T extends Record<string, any>>(
  defaultState: T | (() => T)
): readonly [T, (state: SetStateAction<T>) => void] {
  const widgetStateFromWindow = window.openai?.widgetState as T;
  
  const [widgetState, _setWidgetState] = useState<T>(() => {
    if (widgetStateFromWindow != null) {
      return widgetStateFromWindow;
    }
    return typeof defaultState === 'function' ? defaultState() : defaultState;
  });
  
  useEffect(() => {
    _setWidgetState(widgetStateFromWindow);
  }, [widgetStateFromWindow]);
  
  const setWidgetState = useCallback((state: SetStateAction<T>) => {
    _setWidgetState((prevState) => {
      const newState = typeof state === 'function' ? state(prevState) : state;
      if (newState != null) {
        window.openai.setWidgetState(newState);
      }
      return newState;
    });
  }, []);
  
  return [widgetState, setWidgetState] as const;
}
```

### Datos Durables (Backend)

Para datos que deben persistir más allá de la sesión:
- ✅ Almacena en tu base de datos (PostgreSQL, MongoDB, etc.)
- ✅ Asocia datos con `userId` obtenido del token OAuth
- ✅ Implementa políticas de retención apropiadas
- ✅ Cifra datos sensibles (especialmente PHI/PII)

---

## Developer Mode

**Developer Mode** permite probar apps localmente en ChatGPT sin publicarlas en el directorio oficial.

### Activación

1. Abre ChatGPT (web o app)
2. Ve a **Settings → Connectors**
3. Activa **"Developer mode"**
4. Haz clic en **"Add Connector"**

### Registro de Connector Local

Para probar tu MCP server local:

**Opción A: Usar ngrok (recomendado para desarrollo)**

```bash
# En una terminal, inicia tu MCP server
node server.js
# O: uvicorn main:app --port 8000

# En otra terminal, expón el puerto con ngrok
ngrok http 8000

# Copia la URL generada (ej: https://abc123.ngrok-free.app)
```

**Opción B: Deployment temporal (Render, Railway, Fly.io)**

Si prefieres no usar ngrok, despliega tu servidor en un servicio que proporcione HTTPS automático.

### Conectar en ChatGPT

1. En Settings → Connectors → Add Connector
2. Pega la URL de tu servidor + `/mcp`
   - Ejemplo: `https://abc123.ngrok-free.app/mcp`
3. Dale un nombre (ej: "ATLAS Dev")
4. Guarda y habilita el connector

### Testing

Una vez conectado:
- Haz una pregunta que active tu tool
  - Ejemplo: *"Show me this week's workout plan"*
- ChatGPT invocará tu tool automáticamente
- El widget debe renderizarse inline
- Puedes interactuar con el widget
- Los cambios de estado deben reflejarse

### Debugging

**Logs del servidor:**
```bash
# Revisa logs en tiempo real
tail -f server.log

# O usa console.log en Node.js / print en Python
console.log('Tool invoked:', toolName, args);
```

**Logs de ngrok:**
```bash
# ngrok muestra requests en tiempo real
# Puedes ver headers, body, respuestas
```

**Network tab del navegador:**
- Abre DevTools en ChatGPT (F12)
- Ve a la tab Network
- Filtra por "mcp" para ver requests
- Inspecciona payloads y responses

---

## Seguridad y Privacidad

### Principios de Seguridad

1. **Mínimo privilegio**: Solo solicita los scopes OAuth que realmente necesitas
2. **Consentimiento explícito**: Informa claramente qué datos accederás y por qué
3. **Defensa en profundidad**: Valida inputs, sanitiza outputs, usa rate limiting
4. **Auditoría**: Registra eventos importantes (accesos, cambios, errores)
5. **Confirmación de acciones destructivas**: Pide confirmación antes de eliminar o modificar datos críticos

### Validación de Inputs

**Siempre valida inputs del usuario:**

```typescript
import { z } from 'zod';

const WorkoutInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  exercises: z.array(z.object({
    name: z.string().min(1).max(100),
    sets: z.number().int().min(1).max(20),
    reps: z.number().int().min(1).max(100),
  })).max(30),
  notes: z.string().max(500).optional(),
});

async function handleCreateWorkout(args: unknown) {
  try {
    const validated = WorkoutInputSchema.parse(args);
    // Proceder con datos validados
  } catch (error) {
    return { error: 'Invalid input', details: error.errors };
  }
}
```

### Protección contra XSS

**En widgets React:**
- ✅ Usa React (escapa automáticamente)
- ❌ **Nunca** uses `dangerouslySetInnerHTML` con contenido no confiable
- ✅ Sanitiza URLs con bibliotecas como `validator`

### Rate Limiting

**Implementa límites por usuario/IP:**

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de requests
  message: 'Demasiados requests, intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/mcp', limiter);
```

### PHI/PCI Compliance

> ⚠️ **Advertencia:** Si tu app maneja información de salud (PHI) o pagos (PCI), debes cumplir con regulaciones específicas.

**Para apps de fitness/salud como ATLAS:**
- ✅ **No almacenes PHI sin cifrado** (AES-256 o superior)
- ✅ Usa **HTTPS** para todas las comunicaciones
- ✅ Implementa **logs de auditoría** para accesos a datos sensibles
- ✅ Considera usar **servicios HIPAA-compliant** (ej: AWS HIPAA, Google Cloud Healthcare API)
- ✅ **Disclaimers claros**: "Esta app no proporciona diagnóstico médico"

---

## Políticas del Directorio

Para publicar tu app en el directorio oficial de ChatGPT, deberás cumplir con:

### Verificación de Desarrollador

- ✅ Cuenta de OpenAI verificada
- ✅ Dominio verificado (si usas OAuth)
- ✅ Información de contacto válida

### Privacidad y Transparencia

- ✅ Política de privacidad pública y accesible
- ✅ Descripción clara de qué datos se recopilan
- ✅ Opción de eliminar datos del usuario
- ✅ Consentimiento explícito antes de acceder a datos personales

### Contenido Apropiado

- ✅ Apto para audiencias generales (13+)
- ❌ No contenido violento, sexual explícito, o que promueva actividades ilegales
- ✅ Respetar derechos de autor y propiedad intelectual

### Restricciones Técnicas

- ❌ **No scraping** no autorizado de sitios web
- ❌ **No almacenamiento de PHI/PCI** sin compliance apropiado
- ✅ Responder en **< 30 segundos** (o usar indicadores de loading)
- ✅ Proveer **fallbacks** en caso de errores

---

## Ejemplos Existentes

Apps disponibles en ChatGPT (Oct 2025):

| App | Funcionalidad | Widgets Principales |
|-----|---------------|---------------------|
| **Booking.com** | Búsqueda de hoteles y vuelos | Mapas, listas de resultados |
| **Canva** | Diseño gráfico y presentaciones | Canvas interactivo, galería de plantillas |
| **Coursera** | Cursos y certificaciones | Lista de cursos, preview de lecciones |
| **Expedia** | Viajes y alojamiento | Mapas, carruseles de destinos |
| **Figma** | Colaboración en diseño | Preview de archivos, comentarios |
| **Spotify** | Música y playlists | Reproductor, listas de canciones |
| **Zillow** | Búsqueda de propiedades | Mapas con listings, fichas de inmuebles |

### Patrones UX Comunes

1. **Búsqueda + Resultados**: Input de texto → tool invocation → lista/mapa de resultados
2. **Confirmación de acciones**: Mostrar preview → botón "Confirmar" → ejecutar
3. **Navegación por pasos**: Wizard multi-paso para procesos complejos
4. **Actualización en tiempo real**: Usar `setWidgetState` para reflejar cambios sin recargar
5. **Fallbacks**: Mostrar mensajes amigables si no hay resultados

---

## Repositorios Oficiales

### openai/openai-apps-sdk-examples

**Repo:** [github.com/openai/openai-apps-sdk-examples](https://github.com/openai/openai-apps-sdk-examples)

**Estrellas:** 1,390+ (Octubre 2025)

**Contenido:**
- Galería de widgets **Pizzaz** (List, Carousel, Map, Albums, Video)
- Servidor MCP en **Node.js** (`pizzaz_server_node`)
- Servidor MCP en **Python** (`pizzaz_server_python`)
- Ejemplo 3D (**Solar System** con Three.js)
- Build system con **Vite**

**Estructura:**

```
openai-apps-sdk-examples/
├── src/                         # Código de widgets
│   ├── pizzaz-list/
│   │   └── index.jsx
│   ├── pizzaz-carousel/
│   ├── pizzaz-albums/
│   ├── pizzaz/                  # Map widget
│   └── solar-system/
├── pizzaz_server_node/          # MCP server TypeScript
│   ├── src/
│   │   └── server.ts
│   └── package.json
├── pizzaz_server_python/        # MCP server Python
│   ├── main.py
│   └── requirements.txt
├── assets/                      # Build output (bundles)
├── build-all.mts                # Script de build
├── vite.config.mts              # Configuración Vite
└── package.json
```

**Comandos principales:**

```bash
# Instalar dependencias
pnpm install

# Build de todos los widgets
pnpm run build

# Servidor de desarrollo (hot reload)
pnpm run dev

# Servir assets estáticos (producción)
pnpm run serve

# Iniciar MCP server (Node)
cd pizzaz_server_node && pnpm start

# Iniciar MCP server (Python)
python -m venv .venv
source .venv/bin/activate
pip install -r pizzaz_server_python/requirements.txt
uvicorn pizzaz_server_python.main:app --port 8000
```

---

## MCP Server - Fundamentos

### Estructura de un Servidor MCP

**Node.js (TypeScript):**

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';

// 1. Crear servidor MCP
const server = new Server(
  {
    name: 'atlas-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// 2. Definir tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'create_workout',
      description: 'Create a new workout plan',
      inputSchema: {
        type: 'object',
        properties: {
          date: { type: 'string', format: 'date' },
          exercises: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                sets: { type: 'number' },
                reps: { type: 'number' },
              },
            },
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
  ],
}));

// 3. Implementar handler del tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'create_workout') {
    const validated = WorkoutSchema.parse(args);
    const workout = await createWorkout(validated);
    
    return {
      content: [
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

// 4. Configurar transporte HTTP
import { createServer } from 'node:http';

const httpServer = createServer(async (req, res) => {
  if (req.url === '/mcp' && req.method === 'POST') {
    const transport = new SSEServerTransport('/mcp', res);
    await server.connect(transport);
    // ... handle request
  }
});

httpServer.listen(8000);
```

**Python (FastMCP):**

```python
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel

mcp = FastMCP(
    name="atlas-python",
    sse_path="/mcp",
    message_path="/mcp/messages",
    stateless_http=True,
)

class WorkoutInput(BaseModel):
    date: str
    exercises: list[dict]

@mcp.tool(
    name="create_workout",
    description="Create a new workout plan",
)
async def create_workout(workout: WorkoutInput):
    # Lógica de creación
    result = await db.create_workout(workout)
    
    return {
        "content": [
            {
                "type": "resource",
                "resource": {
                    "uri": "ui://widget/workout-plan.html",
                    "mimeType": "text/html+skybridge",
                    "text": json.dumps({"workout": result}),
                },
            }
        ],
        "_meta": {
            "openai/outputTemplate": "ui://widget/workout-plan.html",
            "openai/widgetAccessible": True,
        },
    }

# Ejecutar con: uvicorn main:app --port 8000
```

---

## 🎯 ATLAS - Adulto Mayor y Longevidad

Esta sección detalla cómo implementar **ATLAS**, una app de fitness especializada en adultos mayores, usando el OpenAI Apps SDK.

### 13.1 Jobs-to-be-done

ATLAS resuelve necesidades específicas de adultos mayores:

1. **Screening de riesgos y preferencias**
   - Evaluación de movilidad, historial de caídas, uso de prótesis, dolor crónico
   - Identificación de contraindicaciones (ej: cirugía reciente, mareos frecuentes)
   - Preferencias de ejercicio (en casa vs gym, con/sin equipo)

2. **Programación adaptable**
   - Planes de fuerza, balance y movilidad personalizados
   - Ajustes semana a semana basados en adherencia y feedback
   - Progresiones seguras (volumen, intensidad, complejidad)

3. **Check-ins rápidos**
   - Evaluación pre-sesión de energía y dolor (escala 1-10)
   - Regresiones automáticas si reportan dolor > 6 o fatiga > 8
   - Recomendaciones contextuales ("Descansa hoy", "Reduce volumen 20%")

4. **Educación integrada**
   - Micro-videos de técnica (< 60 segundos)
   - Tips de seguridad (respiración, postura, cuándo parar)
   - Contenido accesible (texto grande, contraste alto, audio opcional)

### 13.2 Tools MCP Sugeridos para ATLAS

#### Tool 1: `atlas_intake_screen`

**Propósito:** Recopilar información inicial del usuario y generar perfil de riesgo.

**JSON Schema:**

```typescript
{
  name: "atlas_intake_screen",
  description: "Initial screening questionnaire for older adults to assess fitness readiness and risks",
  inputSchema: {
    type: "object",
    properties: {
      age: {
        type: "number",
        description: "User's age in years",
        minimum: 55,
        maximum: 110,
      },
      mobility_level: {
        type: "string",
        enum: ["independent", "assistance_sometimes", "assistance_always", "wheelchair"],
        description: "Current mobility status",
      },
      recent_falls: {
        type: "boolean",
        description: "Has the user experienced falls in the past 6 months?",
      },
      chronic_pain: {
        type: "object",
        properties: {
          has_pain: { type: "boolean" },
          locations: {
            type: "array",
            items: { type: "string", enum: ["knee", "hip", "back", "shoulder", "ankle", "other"] },
          },
          severity: { type: "number", minimum: 1, maximum: 10 },
        },
      },
      medical_conditions: {
        type: "array",
        items: { type: "string", enum: ["hypertension", "diabetes", "arthritis", "osteoporosis", "heart_disease", "none"] },
      },
      current_activity_level: {
        type: "string",
        enum: ["sedentary", "light", "moderate", "active"],
      },
      goals: {
        type: "array",
        items: { type: "string", enum: ["reduce_fall_risk", "improve_strength", "increase_mobility", "manage_pain", "maintain_independence"] },
      },
    },
    required: ["age", "mobility_level", "recent_falls", "current_activity_level", "goals"],
  },
  _meta: {
    "openai/outputTemplate": "ui://widget/atlas-screening-result.html",
    "openai/widgetAccessible": true,
    "openai/resultCanProduceWidget": true,
    "openai/toolInvocation/invoking": "Evaluating your fitness profile...",
    "openai/toolInvocation/invoked": "Profile created!",
  },
}
```

**Lógica de backend:**

```typescript
async function handleIntakeScreen(input: IntakeInput): Promise<IntakeResult> {
  // Calcular banderas rojas
  const redFlags = [];
  
  if (input.recent_falls) {
    redFlags.push({
      severity: "high",
      message: "Recent falls detected. Balance training is priority.",
      recommendation: "Start with seated exercises and chair support.",
    });
  }
  
  if (input.chronic_pain?.has_pain && input.chronic_pain.severity >= 7) {
    redFlags.push({
      severity: "high",
      message: "Chronic pain > 7/10 reported.",
      recommendation: "Consult with a physical therapist before starting. We'll focus on pain-free movements.",
    });
  }
  
  if (input.medical_conditions.includes("heart_disease")) {
    redFlags.push({
      severity: "medium",
      message: "Heart disease detected.",
      recommendation: "Ensure medical clearance. Monitor heart rate during exercise.",
    });
  }
  
  // Generar perfil
  const profile = {
    userId: input.userId,
    ageGroup: input.age >= 75 ? "75+" : "55-74",
    riskLevel: redFlags.length > 1 ? "high" : redFlags.length === 1 ? "medium" : "low",
    redFlags,
    recommendedPrograms: determinePrograms(input),
    createdAt: new Date().toISOString(),
  };
  
  await db.profiles.insert(profile);
  
  return {
    profile,
    nextSteps: [
      "Review your personalized plan",
      "Watch the safety video (2 min)",
      redFlags.length > 0 ? "Consult with healthcare provider if needed" : null,
    ].filter(Boolean),
  };
}
```

**Widget de resultado:**

```jsx
function ScreeningResultWidget({ profile, nextSteps }) {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {profile.ageGroup}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Your ATLAS Profile</h2>
          <p className="text-gray-600">Risk Level: {profile.riskLevel.toUpperCase()}</p>
        </div>
      </div>
      
      {profile.redFlags.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes:</h3>
          {profile.redFlags.map((flag, i) => (
            <div key={i} className="mb-3">
              <p className="text-sm font-medium text-yellow-900">{flag.message}</p>
              <p className="text-sm text-yellow-700 mt-1">→ {flag.recommendation}</p>
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">Next Steps:</h3>
        <ol className="space-y-2">
          {nextSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                {i + 1}
              </span>
              <span className="text-gray-700">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
```

#### Tool 2: `atlas_build_plan`

**Propósito:** Generar plan semanal de ejercicios basado en el perfil del usuario.

**JSON Schema:**

```typescript
{
  name: "atlas_build_plan",
  description: "Generate a weekly workout plan for older adults based on their profile",
  inputSchema: {
    type: "object",
    properties: {
      profile_id: { type: "string" },
      week_number: { type: "number", minimum: 1 },
      focus_areas: {
        type: "array",
        items: { type: "string", enum: ["strength", "balance", "mobility", "cardio"] },
      },
    },
    required: ["profile_id"],
  },
  _meta: {
    "openai/outputTemplate": "ui://widget/atlas-weekly-board.html",
    "openai/widgetAccessible": true,
    "openai/resultCanProduceWidget": true,
  },
}
```

**Ejemplo de plan generado:**

```typescript
{
  weekNumber: 1,
  sessions: [
    {
      day: "Monday",
      type: "Strength + Balance",
      duration: 25,
      exercises: [
        {
          id: "chair-squat",
          name: "Chair Squats",
          sets: 2,
          reps: 10,
          restSeconds: 60,
          videoUrl: "https://cdn.atlas.app/videos/chair-squat.mp4",
          thumbnail: "https://cdn.atlas.app/thumbs/chair-squat.jpg",
          cues: ["Sit back like sitting in a chair", "Keep chest up", "Push through heels"],
          modifications: {
            easier: "Use arms to assist standing",
            harder: "Pause 3 seconds at bottom",
          },
        },
        {
          id: "single-leg-stand",
          name: "Single Leg Stand (with support)",
          sets: 3,
          duration: 20,
          restSeconds: 30,
          videoUrl: "https://cdn.atlas.app/videos/single-leg-stand.mp4",
          cues: ["Hold chair for balance", "Focus on a spot ahead", "Keep standing leg slightly bent"],
          safetyNote: "Stop if you feel dizzy",
        },
        // ... más ejercicios
      ],
    },
    {
      day: "Wednesday",
      type: "Mobility + Light Cardio",
      // ...
    },
    {
      day: "Friday",
      type: "Strength + Balance",
      // ...
    },
  ],
}
```

**Widget "Weekly Board":**

```jsx
function WeeklyBoardWidget({ plan }) {
  const [selectedDay, setSelectedDay] = useState(0);
  const session = plan.sessions[selectedDay];
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Selector de días */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {plan.sessions.map((s, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(i)}
            className={`flex-shrink-0 px-4 py-3 rounded-xl font-medium ${
              selectedDay === i
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="text-sm">{s.day}</div>
            <div className="text-xs opacity-75">{s.type}</div>
          </button>
        ))}
      </div>
      
      {/* Detalles de la sesión */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{session.type}</h2>
            <p className="text-gray-600">{session.duration} minutes</p>
          </div>
          <button className="px-6 py-2 bg-green-500 text-white rounded-full font-medium hover:bg-green-600">
            Start Workout
          </button>
        </div>
        
        {/* Lista de ejercicios */}
        <div className="space-y-4">
          {session.exercises.map((ex, i) => (
            <div key={ex.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
              <img
                src={ex.thumbnail}
                alt={ex.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-800">{i + 1}. {ex.name}</h3>
                <div className="flex gap-4 mt-1 text-sm text-gray-600">
                  {ex.sets && <span>{ex.sets} sets</span>}
                  {ex.reps && <span>{ex.reps} reps</span>}
                  {ex.duration && <span>{ex.duration}s hold</span>}
                </div>
                <div className="mt-2 flex gap-2">
                  <button className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                    📹 Watch Video
                  </button>
                  <button className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded-full">
                    💡 Tips
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### Tool 3: `atlas_session_checkin`

**Propósito:** Check-in pre-sesión para ajustar el plan basándose en dolor y energía.

**JSON Schema:**

```typescript
{
  name: "atlas_session_checkin",
  description: "Pre-session check-in to assess pain and energy levels",
  inputSchema: {
    type: "object",
    properties: {
      session_id: { type: "string" },
      pain_level: {
        type: "number",
        minimum: 0,
        maximum: 10,
        description: "Pain level from 0 (none) to 10 (severe)",
      },
      pain_location: {
        type: "array",
        items: { type: "string" },
      },
      energy_level: {
        type: "number",
        minimum: 0,
        maximum: 10,
        description: "Energy level from 0 (exhausted) to 10 (fully energized)",
      },
      sleep_quality: {
        type: "string",
        enum: ["poor", "fair", "good", "excellent"],
      },
    },
    required: ["session_id", "pain_level", "energy_level"],
  },
  _meta: {
    "openai/outputTemplate": "ui://widget/atlas-checkin-result.html",
    "openai/widgetAccessible": true,
    "openai/resultCanProduceWidget": true,
  },
}
```

**Lógica de ajuste:**

```typescript
async function handleSessionCheckin(input: CheckinInput): Promise<CheckinResult> {
  const session = await db.sessions.findById(input.session_id);
  let adjustments = [];
  let recommendation = "proceed";
  
  // Lógica de ajuste basada en dolor
  if (input.pain_level >= 7) {
    recommendation = "skip";
    adjustments.push({
      type: "critical",
      message: "High pain level detected. It's best to rest today.",
      action: "Skip this session and focus on gentle stretching.",
    });
  } else if (input.pain_level >= 5) {
    recommendation = "reduce";
    adjustments.push({
      type: "warning",
      message: "Moderate pain detected. Let's reduce intensity.",
      action: "Reduce volume by 30% and avoid exercises that increase pain.",
    });
    
    // Modificar plan de sesión
    session.exercises = session.exercises.map(ex => ({
      ...ex,
      sets: Math.ceil(ex.sets * 0.7),
      modification: "Use easier variation",
    }));
  }
  
  // Lógica basada en energía
  if (input.energy_level <= 3) {
    recommendation = recommendation === "proceed" ? "reduce" : recommendation;
    adjustments.push({
      type: "warning",
      message: "Low energy today. Let's take it easy.",
      action: "Shorten workout by 10 minutes and increase rest periods.",
    });
    
    session.duration = Math.ceil(session.duration * 0.7);
  }
  
  // Guardar check-in en DB
  await db.checkins.insert({
    sessionId: input.session_id,
    painLevel: input.pain_level,
    energyLevel: input.energy_level,
    adjustments,
    recommendation,
    createdAt: new Date().toISOString(),
  });
  
  return {
    recommendation,
    adjustments,
    modifiedSession: session,
    motivationalMessage: getMotivationalMessage(input),
  };
}

function getMotivationalMessage(input: CheckinInput): string {
  if (input.pain_level >= 7 || input.energy_level <= 2) {
    return "Rest is part of progress. Listen to your body today. 💙";
  }
  if (input.energy_level >= 8) {
    return "Great energy today! Let's make the most of it. 💪";
  }
  return "You're showing up, and that's what matters. Let's move! 🌟";
}
```

#### Tool 4: `atlas_progress_widget`

**Propósito:** Dashboard de progreso con métricas clave.

**JSON Schema:**

```typescript
{
  name: "atlas_progress_widget",
  description: "Display user's progress dashboard with key metrics",
  inputSchema: {
    type: "object",
    properties: {
      user_id: { type: "string" },
      period: {
        type: "string",
        enum: ["week", "month", "quarter"],
        default: "month",
      },
    },
    required: ["user_id"],
  },
  _meta: {
    "openai/outputTemplate": "ui://widget/atlas-dashboard.html",
    "openai/widgetAccessible": true,
    "openai/resultCanProduceWidget": true,
  },
}
```

### 13.3 Componentes UI para ATLAS

#### Diseño Adaptado a Adultos Mayores

**Principios de diseño:**

1. **Tipografía:**
   - Tamaño mínimo de texto: **18px** (preferible 20px)
   - Interlineado generoso: **1.6-1.8**
   - Fuentes sans-serif legibles (Inter, Open Sans, Roboto)
   - Peso de fuente: 400 (regular) o 500 (medium), evitar thin

2. **Contraste:**
   - Ratio mínimo de contraste: **4.5:1** (WCAG AA)
   - Preferible: **7:1** (WCAG AAA)
   - Usar herramientas: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

3. **Espaciado:**
   - Botones grandes: mínimo **44x44px** (touch targets)
   - Padding generoso en cards: **24px** o más
   - Gap entre elementos: **16px+**

4. **Iconos:**
   - Acompañar siempre con texto
   - Tamaño mínimo: **24px**
   - Usar iconos universales (🏠 casa, ⚙️ configuración, ❤️ favoritos)

5. **Color:**
   - Evitar depender solo del color para comunicar (usar texto + iconos)
   - Paleta limitada y consistente
   - Considerar deuteranopia/protanopia (daltonismo rojo-verde)

**Ejemplo de paleta para ATLAS:**

```css
:root {
  /* Primarios */
  --color-primary: #4F46E5; /* Índigo vibrante */
  --color-secondary: #06B6D4; /* Cyan */
  
  /* Neutros */
  --color-text: #1F2937; /* Gris oscuro */
  --color-text-light: #6B7280;
  --color-bg: #FFFFFF;
  --color-bg-light: #F9FAFB;
  
  /* Estados */
  --color-success: #10B981; /* Verde */
  --color-warning: #F59E0B; /* Ámbar */
  --color-error: #EF4444; /* Rojo */
  
  /* Tipografía */
  --font-base: 20px;
  --font-large: 24px;
  --line-height: 1.7;
}
```

#### Componente: Exercise Card

```jsx
function ExerciseCard({ exercise, onStartVideo }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
      {/* Thumbnail con overlay */}
      <div className="relative mb-4">
        <img
          src={exercise.thumbnail}
          alt={exercise.name}
          className="w-full h-48 object-cover rounded-lg"
        />
        <button
          onClick={onStartVideo}
          className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 hover:opacity-100 transition"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
            </svg>
          </div>
        </button>
      </div>
      
      {/* Información del ejercicio */}
      <h3 className="text-2xl font-semibold text-gray-800 mb-2">
        {exercise.name}
      </h3>
      
      <div className="flex items-center gap-4 text-lg text-gray-600 mb-4">
        {exercise.sets && <span className="flex items-center gap-1">
          <span className="font-medium">{exercise.sets}</span> sets
        </span>}
        {exercise.reps && <span className="flex items-center gap-1">
          <span className="font-medium">{exercise.reps}</span> reps
        </span>}
        {exercise.duration && <span className="flex items-center gap-1">
          <span className="font-medium">{exercise.duration}s</span> hold
        </span>}
      </div>
      
      {/* Cues (consejos) */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Key Cues:</h4>
        <ul className="space-y-1 text-blue-800">
          {exercise.cues.map((cue, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>{cue}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Safety note */}
      {exercise.safetyNote && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-yellow-800 font-medium">
            ⚠️ {exercise.safetyNote}
          </p>
        </div>
      )}
      
      {/* Modificaciones */}
      <div className="grid grid-cols-2 gap-3">
        <button className="px-4 py-3 bg-green-100 text-green-800 rounded-lg font-medium hover:bg-green-200">
          ✓ Easier Option
        </button>
        <button className="px-4 py-3 bg-orange-100 text-orange-800 rounded-lg font-medium hover:bg-orange-200">
          ⚡ Harder Option
        </button>
      </div>
    </div>
  );
}
```

### 13.4 Dashboards para Adultos Mayores

#### Métricas Clave

| Categoría | Métrica | Por qué importa | Cálculo |
|-----------|---------|-----------------|---------|
| **Adherencia** | % sesiones completadas | Predice resultados a largo plazo | (completadas / planificadas) × 100 |
| **Volumen/Carga** | Total minutos activos semanales | Indica estímulo acumulado | Σ duración de sesiones |
| **Progresión** | % aumento en carga/reps | Evidencia de adaptación | ((semana_n - semana_1) / semana_1) × 100 |
| **Funcionalidad** | Puntaje Time Up & Go | Predictor de independencia | Tiempo en segundos (< 12s = bajo riesgo) |
| **Funcionalidad** | Puntaje One Leg Stand | Indicador de balance | Tiempo en segundos (> 10s = buen balance) |
| **Salud percibida** | Promedio dolor diario | Detecta overtraining | Media de check-ins semanales |
| **Salud percibida** | Promedio energía | Indica recuperación | Media de check-ins semanales |
| **Alertas** | Días consecutivos omitidos | Previene abandono | Contador de sesiones skipped |
| **Comparación** | Percentil vs cohorte similar | Motivación y contexto | Ranking anónimo por edad/género |

#### Vistas de Dashboard

**Vista 1: Estado General (Home)**

```jsx
function DashboardHome({ metrics }) {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-6">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {metrics.userName}! 👋</h1>
        <p className="text-xl opacity-90">You're on week {metrics.currentWeek} of your journey</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <KpiCard
          title="Adherence"
          value={`${metrics.adherence}%`}
          change={`+${metrics.adherenceChange}%`}
          trend="up"
          icon="✓"
          color="green"
        />
        <KpiCard
          title="Strength Progress"
          value={`+${metrics.strengthProgress}%`}
          change="vs last month"
          trend="up"
          icon="💪"
          color="blue"
        />
        <KpiCard
          title="Balance Score"
          value={`${metrics.balanceScore}s`}
          change={`+${metrics.balanceImprovement}s`}
          trend="up"
          icon="⚖️"
          color="purple"
        />
      </div>
      
      {/* Gráfico de carga semanal */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Weekly Activity</h2>
        <WeeklyVolumeChart data={metrics.weeklyVolume} />
      </div>
      
      {/* Alertas (si existen) */}
      {metrics.alerts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-yellow-800 mb-3">⚠️ Attention Needed</h3>
          {metrics.alerts.map((alert, i) => (
            <div key={i} className="mb-2">
              <p className="text-yellow-900">{alert.message}</p>
              <p className="text-sm text-yellow-700 mt-1">→ {alert.recommendation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function KpiCard({ title, value, change, trend, icon, color }) {
  const colorClasses = {
    green: 'bg-green-50 text-green-800 border-green-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
  };
  
  return (
    <div className={`rounded-xl p-6 border-2 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-4xl">{icon}</span>
        <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
      <div className="text-4xl font-bold mb-1">{value}</div>
      <div className="text-lg opacity-75">{title}</div>
    </div>
  );
}
```

**Vista 2: Movilidad y Equilibrio**

```jsx
function MobilityDashboard({ data }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Balance & Mobility Progress</h1>
      
      {/* Gráfico de tendencia One Leg Stand */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">One Leg Stand Test</h2>
        <p className="text-gray-600 mb-4">Time balanced on one leg (seconds)</p>
        <LineChart
          data={data.oneLegStandHistory}
          xAxis="week"
          yAxis="seconds"
          target={10}
          targetLabel="Target: 10s+ (good balance)"
        />
      </div>
      
      {/* Comparación semanal */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">This Week vs Last Week</h2>
        <div className="grid grid-cols-2 gap-6">
          <ComparisonCard
            label="Balance Hold Time"
            current={data.currentWeek.balanceHold}
            previous={data.previousWeek.balanceHold}
            unit="seconds"
          />
          <ComparisonCard
            label="Mobility Exercises"
            current={data.currentWeek.mobilityCount}
            previous={data.previousWeek.mobilityCount}
            unit="completed"
          />
        </div>
      </div>
    </div>
  );
}
```

**Vista 3: Dolor y Bienestar**

```jsx
function WellnessDashboard({ data }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Pain & Wellness Tracking</h1>
      
      {/* Heatmap de dolor */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pain Levels (Last 30 Days)</h2>
        <PainHeatmap data={data.dailyPain} />
        <p className="text-sm text-gray-600 mt-4">
          🟢 0-2: Minimal · 🟡 3-5: Moderate · 🟠 6-7: High · 🔴 8-10: Severe
        </p>
      </div>
      
      {/* Gráfico de energía vs dolor */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Energy vs Pain Correlation</h2>
        <DualLineChart
          data={data.energyPainHistory}
          series={[
            { key: 'energy', label: 'Energy Level', color: '#10B981' },
            { key: 'pain', label: 'Pain Level', color: '#EF4444' },
          ]}
        />
      </div>
      
      {/* Insights automáticos */}
      {data.insights.length > 0 && (
        <div className="bg-blue-50 rounded-2xl p-6 mt-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-3">💡 Insights</h3>
          {data.insights.map((insight, i) => (
            <p key={i} className="text-blue-800 mb-2">{insight}</p>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 13.5 Arquitectura Técnica de Dashboards

#### Backend: ETL Pipeline

```typescript
// Cron job que corre diariamente
async function computeDailyAggregates(userId: string, date: string) {
  const sessions = await db.sessions.find({
    userId,
    date,
    status: 'completed',
  });
  
  const checkins = await db.checkins.find({
    userId,
    date,
  });
  
  const aggregate = {
    userId,
    date,
    
    // Adherencia
    sessionsPlanned: await db.sessions.count({ userId, date }),
    sessionsCompleted: sessions.length,
    adherenceRate: (sessions.length / plannedCount) * 100,
    
    // Volumen
    totalMinutes: sessions.reduce((sum, s) => sum + s.duration, 0),
    totalExercises: sessions.reduce((sum, s) => sum + s.exercises.length, 0),
    
    // Salud percibida
    avgPainLevel: checkins.length > 0
      ? checkins.reduce((sum, c) => sum + c.painLevel, 0) / checkins.length
      : null,
    avgEnergyLevel: checkins.length > 0
      ? checkins.reduce((sum, c) => sum + c.energyLevel, 0) / checkins.length
      : null,
    
    // Alertas
    consecutiveSkips: await countConsecutiveSkips(userId, date),
    highPainDays: checkins.filter(c => c.painLevel >= 7).length,
    
    createdAt: new Date().toISOString(),
  };
  
  await db.dailyAggregates.insert(aggregate);
}
```

#### Tool MCP: `atlas_dashboard`

```typescript
{
  name: "atlas_dashboard",
  description: "Display comprehensive dashboard with fitness metrics",
  inputSchema: {
    type: "object",
    properties: {
      user_id: { type: "string" },
      period: {
        type: "string",
        enum: ["week", "month", "quarter"],
        default: "month",
      },
      view: {
        type: "string",
        enum: ["home", "mobility", "wellness", "progress"],
        default: "home",
      },
    },
    required: ["user_id"],
  },
  _meta: {
    "openai/outputTemplate": "ui://widget/atlas-dashboard.html",
    "openai/widgetAccessible": true,
    "openai/resultCanProduceWidget": true,
  },
}
```

**Handler del tool:**

```typescript
async function handleDashboard(input: DashboardInput): Promise<DashboardData> {
  const { userId, period, view } = input;
  
  // Calcular rango de fechas
  const endDate = new Date();
  const startDate = new Date();
  if (period === 'week') startDate.setDate(endDate.getDate() - 7);
  else if (period === 'month') startDate.setMonth(endDate.getMonth() - 1);
  else startDate.setMonth(endDate.getMonth() - 3);
  
  // Obtener agregados
  const aggregates = await db.dailyAggregates.find({
    userId,
    date: { $gte: startDate, $lte: endDate },
  });
  
  // Calcular métricas
  const metrics = {
    userName: (await db.users.findById(userId)).name,
    currentWeek: calculateWeekNumber(userId, endDate),
    
    // Adherencia
    adherence: Math.round(
      (aggregates.reduce((sum, a) => sum + a.adherenceRate, 0) / aggregates.length)
    ),
    adherenceChange: calculateChange(aggregates, 'adherenceRate', period),
    
    // Progresión
    strengthProgress: await calculateStrengthProgress(userId, period),
    balanceScore: await getLatestBalanceScore(userId),
    balanceImprovement: calculateChange(aggregates, 'balanceScore', period),
    
    // Volumen semanal
    weeklyVolume: await getWeeklyVolume(userId, period),
    
    // Alertas
    alerts: await generateAlerts(userId, aggregates),
  };
  
  // Caché del resultado (5 minutos)
  await cache.set(`dashboard:${userId}:${period}`, metrics, 300);
  
  return metrics;
}
```

#### Widget Interactivo con Filtros

```jsx
function DashboardWidget() {
  const props = useWidgetProps();
  const [state, setState] = useWidgetState({
    period: 'month',
    view: 'home',
  });
  
  // Cuando el usuario cambia el periodo, actualizar estado
  // ChatGPT detectará el cambio y volverá a invocar el tool
  const handlePeriodChange = (newPeriod: string) => {
    setState({ ...state, period: newPeriod });
  };
  
  return (
    <div>
      {/* Selector de periodo */}
      <div className="flex gap-2 mb-6">
        {['week', 'month', 'quarter'].map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className={`px-6 py-3 rounded-lg font-medium ${
              state.period === p
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {p === 'week' ? 'Last 7 Days' : p === 'month' ? 'Last 30 Days' : 'Last 3 Months'}
          </button>
        ))}
      </div>
      
      {/* Contenido del dashboard */}
      <DashboardHome metrics={props.metrics} />
    </div>
  );
}
```

#### Caché y Optimización

```typescript
// Redis para cachear resultados
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

async function getCachedOrCompute<T>(
  key: string,
  ttlSeconds: number,
  computeFn: () => Promise<T>
): Promise<T> {
  // Intentar obtener de caché
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Computar y cachear
  const result = await computeFn();
  await redis.setex(key, ttlSeconds, JSON.stringify(result));
  return result;
}

// Uso en el handler
const metrics = await getCachedOrCompute(
  `dashboard:${userId}:${period}`,
  300, // 5 minutos
  () => computeMetrics(userId, period)
);
```

#### Seguridad: OAuth Validation

```typescript
import jwt from 'jsonwebtoken';

async function validateRequest(req: Request): Promise<User | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing token');
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { sub: string };
    const user = await db.users.findById(decoded.sub);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    console.error('Token validation failed:', error);
    throw new Error('Unauthorized: Invalid token');
  }
}

// En el handler de dashboard
async function handleDashboard(input: DashboardInput, req: Request) {
  const user = await validateRequest(req);
  
  // Verificar que el userId del input coincide con el usuario autenticado
  if (input.userId !== user.id) {
    throw new Error('Forbidden: Cannot access other user data');
  }
  
  // Proceder con la lógica del dashboard...
}
```

#### Logging de Eventos

```typescript
import pino from 'pino';
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

async function handleDashboard(input: DashboardInput, req: Request) {
  const startTime = Date.now();
  const user = await validateRequest(req);
  
  logger.info({
    event: 'dashboard_invoked',
    userId: user.id,
    period: input.period,
    view: input.view,
  });
  
  try {
    const result = await computeDashboard(input);
    
    logger.info({
      event: 'dashboard_success',
      userId: user.id,
      duration: Date.now() - startTime,
    });
    
    return result;
  } catch (error) {
    logger.error({
      event: 'dashboard_error',
      userId: user.id,
      error: error.message,
      duration: Date.now() - startTime,
    });
    
    throw error;
  }
}
```

### 13.6 Ejemplos de Código para ATLAS

#### Ejemplo Completo: Tool `atlas_build_plan`

```typescript
import { z } from 'zod';

const BuildPlanInputSchema = z.object({
  profileId: z.string(),
  weekNumber: z.number().int().min(1).max(52),
  focusAreas: z.array(z.enum(['strength', 'balance', 'mobility', 'cardio'])).optional(),
});

async function handleBuildPlan(input: unknown) {
  // 1. Validar input
  const validated = BuildPlanInputSchema.parse(input);
  
  // 2. Obtener perfil del usuario
  const profile = await db.profiles.findById(validated.profileId);
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  // 3. Generar plan basándose en perfil y semana
  const plan = await generateWeeklyPlan({
    profile,
    weekNumber: validated.weekNumber,
    focusAreas: validated.focusAreas || ['strength', 'balance', 'mobility'],
  });
  
  // 4. Guardar plan en DB
  await db.plans.insert({
    userId: profile.userId,
    weekNumber: validated.weekNumber,
    ...plan,
    createdAt: new Date().toISOString(),
  });
  
  // 5. Retornar respuesta MCP con widget
  return {
    content: [
      {
        type: 'text',
        text: `Created your week ${validated.weekNumber} plan with ${plan.sessions.length} sessions!`,
      },
      {
        type: 'resource',
        resource: {
          uri: 'ui://widget/atlas-weekly-board.html',
          mimeType: 'text/html+skybridge',
          text: JSON.stringify({ plan }),
        },
      },
    ],
    _meta: {
      'openai/outputTemplate': 'ui://widget/atlas-weekly-board.html',
      'openai/widgetAccessible': true,
    },
  };
}

// Lógica de generación de plan
async function generateWeeklyPlan(params: {
  profile: Profile;
  weekNumber: number;
  focusAreas: string[];
}): Promise<WeeklyPlan> {
  const { profile, weekNumber, focusAreas } = params;
  
  // Ajustar volumen según el riesgo
  const baseVolume = {
    low: { sessions: 3, duration: 30 },
    medium: { sessions: 2, duration: 20 },
    high: { sessions: 2, duration: 15 },
  }[profile.riskLevel];
  
  // Progresión semanal (5-10% por semana)
  const progressionFactor = 1 + (weekNumber - 1) * 0.07;
  const volume = {
    sessions: baseVolume.sessions,
    duration: Math.round(baseVolume.duration * Math.min(progressionFactor, 1.5)),
  };
  
  // Generar sesiones
  const sessions = [];
  const days = ['Monday', 'Wednesday', 'Friday'].slice(0, volume.sessions);
  
  for (const day of days) {
    const session = await createSession({
      day,
      duration: volume.duration,
      focusAreas,
      riskLevel: profile.riskLevel,
      weekNumber,
    });
    sessions.push(session);
  }
  
  return {
    weekNumber,
    sessions,
    totalDuration: sessions.reduce((sum, s) => sum + s.duration, 0),
  };
}

async function createSession(params: {
  day: string;
  duration: number;
  focusAreas: string[];
  riskLevel: string;
  weekNumber: number;
}): Promise<Session> {
  const { day, duration, focusAreas, riskLevel, weekNumber } = params;
  
  // Seleccionar ejercicios de la biblioteca
  const exercisePool = await db.exercises.find({
    categories: { $in: focusAreas },
    riskLevel: { $lte: riskLevel }, // Ejercicios apropiados para el nivel de riesgo
  });
  
  // Filtrar por progresión (aumentar dificultad gradualmente)
  const exercises = selectExercisesForWeek(exercisePool, weekNumber, duration);
  
  return {
    day,
    type: focusAreas.join(' + '),
    duration,
    exercises,
  };
}
```

#### Ejemplo Completo: Widget Dashboard con Interactividad

```jsx
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useWidgetProps, useWidgetState } from './hooks';
import { LineChart, BarChart } from './charts';

function AtlasDashboard() {
  const props = useWidgetProps<DashboardProps>();
  const [state, setState] = useWidgetState({
    selectedPeriod: 'month',
    selectedView: 'home',
  });
  
  const metrics = props?.metrics || {};
  
  const handlePeriodChange = (period: string) => {
    setState({ ...state, selectedPeriod: period });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Your ATLAS Dashboard
        </h1>
        <p className="text-xl text-gray-600">
          Track your progress and stay motivated! 🚀
        </p>
      </header>
      
      {/* Period Selector */}
      <div className="flex gap-3 mb-8">
        {['week', 'month', 'quarter'].map((period) => (
          <button
            key={period}
            onClick={() => handlePeriodChange(period)}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition ${
              state.selectedPeriod === period
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {period === 'week' ? 'Last 7 Days' :
             period === 'month' ? 'Last Month' :
             'Last 3 Months'}
          </button>
        ))}
      </div>
      
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          icon="✓"
          title="Adherence"
          value={`${metrics.adherence}%`}
          subtitle={`${metrics.adherenceChange > 0 ? '+' : ''}${metrics.adherenceChange}% vs last period`}
          color="green"
          trend={metrics.adherenceChange >= 0 ? 'up' : 'down'}
        />
        
        <MetricCard
          icon="💪"
          title="Strength Gain"
          value={`+${metrics.strengthProgress}%`}
          subtitle="Compared to baseline"
          color="blue"
          trend="up"
        />
        
        <MetricCard
          icon="⚖️"
          title="Balance Score"
          value={`${metrics.balanceScore}s`}
          subtitle={`${metrics.balanceImprovement > 0 ? '+' : ''}${metrics.balanceImprovement}s improvement`}
          color="purple"
          trend={metrics.balanceImprovement >= 0 ? 'up' : 'down'}
        />
      </div>
      
      {/* Activity Chart */}
      <div className="bg-white rounded-2xl p-8 shadow-xl mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Weekly Activity Minutes
        </h2>
        <BarChart
          data={metrics.weeklyVolume}
          xKey="week"
          yKey="minutes"
          color="#4F46E5"
          height={300}
        />
      </div>
      
      {/* Alerts Section */}
      {metrics.alerts && metrics.alerts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-4xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-yellow-800 mb-3">
                Attention Needed
              </h3>
              {metrics.alerts.map((alert, i) => (
                <div key={i} className="mb-4">
                  <p className="text-lg font-medium text-yellow-900">
                    {alert.message}
                  </p>
                  <p className="text-yellow-700 mt-1">
                    → {alert.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Progress Highlights */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">🎉 Milestones Achieved</h2>
        <ul className="space-y-3 text-xl">
          <li className="flex items-center gap-3">
            <span className="text-2xl">✓</span>
            <span>Completed {metrics.totalSessions} workout sessions</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-2xl">✓</span>
            <span>Improved balance by {metrics.balanceImprovement}%</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-2xl">✓</span>
            <span>Maintained {metrics.adherence}% consistency</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, subtitle, color, trend }) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
  };
  
  const trendIcon = trend === 'up' ? '↑' : '↓';
  const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';
  
  return (
    <div className={`rounded-2xl p-6 border-2 ${colorClasses[color]} shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-5xl">{icon}</span>
        <span className={`text-2xl font-bold ${trendColor}`}>
          {trendIcon}
        </span>
      </div>
      <div className="text-5xl font-bold mb-2">{value}</div>
      <div className="text-lg font-medium mb-1">{title}</div>
      <div className="text-sm opacity-75">{subtitle}</div>
    </div>
  );
}

// Renderizar
createRoot(document.getElementById('atlas-dashboard-root')).render(<AtlasDashboard />);
```

### 13.7 Compliance y Seguridad ATLAS

#### Disclaimers Obligatorios

**En cada interacción inicial:**

```
⚠️ IMPORTANTE: ATLAS es una herramienta informativa y educativa, NO un sustituto de consejo médico profesional. Siempre consulta con tu médico antes de iniciar cualquier programa de ejercicio, especialmente si tienes condiciones médicas pre-existentes.
```

**En widgets de resultados:**

```jsx
function DisclaimerBanner() {
  return (
    <div className="bg-gray-100 border-l-4 border-gray-400 p-4 mb-6">
      <p className="text-sm text-gray-700">
        <strong>Nota:</strong> Esta app no proporciona diagnóstico médico ni tratamiento. 
        La información presentada es solo para fines educativos. Si experimentas dolor 
        inusual, mareos, o cualquier síntoma preocupante, detén el ejercicio y consulta 
        con un profesional de la salud.
      </p>
    </div>
  );
}
```

#### Gatillos de Derivación Médica

**Situaciones que requieren alerta:**

```typescript
const MEDICAL_REFERRAL_TRIGGERS = [
  {
    condition: (input) => input.recent_falls && input.age >= 75,
    message: "Múltiples caídas recientes en adulto mayor requieren evaluación médica.",
    action: "RECOMMEND_MEDICAL_CONSULT",
    urgency: "HIGH",
  },
  {
    condition: (input) => input.chronic_pain?.severity >= 8,
    message: "Dolor severo (8-10/10) puede indicar lesión o condición subyacente.",
    action: "RECOMMEND_MEDICAL_CONSULT",
    urgency: "HIGH",
  },
  {
    condition: (input) => input.chest_pain_during_exercise,
    message: "Dolor torácico durante ejercicio requiere atención médica inmediata.",
    action: "STOP_PROGRAM",
    urgency: "CRITICAL",
  },
  {
    condition: (input) => input.dizziness_frequency === "frequent",
    message: "Mareos frecuentes deben ser evaluados por un médico.",
    action: "RECOMMEND_MEDICAL_CONSULT",
    urgency: "MEDIUM",
  },
];

async function evaluateMedicalReferral(input: IntakeInput): Promise<Alert[]> {
  const alerts = [];
  
  for (const trigger of MEDICAL_REFERRAL_TRIGGERS) {
    if (trigger.condition(input)) {
      alerts.push({
        type: "MEDICAL_REFERRAL",
        severity: trigger.urgency,
        message: trigger.message,
        recommendation: trigger.urgency === "CRITICAL"
          ? "Busca atención médica inmediata. No inicies este programa sin autorización médica."
          : "Consulta con tu médico antes de continuar.",
      });
      
      // Logging para auditoría
      logger.warn({
        event: "medical_referral_triggered",
        userId: input.userId,
        trigger: trigger.message,
        urgency: trigger.urgency,
      });
    }
  }
  
  return alerts;
}
```

#### Cifrado de Datos Sensibles

**Nunca almacenar PHI sin cifrar:**

```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes

function encrypt(text: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

function decrypt(encrypted: string, iv: string, tag: string): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Uso en almacenamiento
async function saveHealthData(userId: string, data: HealthData) {
  const serialized = JSON.stringify(data);
  const { encrypted, iv, tag } = encrypt(serialized);
  
  await db.healthRecords.insert({
    userId,
    encrypted,
    iv,
    tag,
    createdAt: new Date().toISOString(),
  });
}

async function getHealthData(userId: string): Promise<HealthData> {
  const record = await db.healthRecords.findOne({ userId });
  const decrypted = decrypt(record.encrypted, record.iv, record.tag);
  return JSON.parse(decrypted);
}
```

#### Auditoría y Logging

**Registrar eventos críticos:**

```typescript
enum AuditEvent {
  USER_CREATED = 'USER_CREATED',
  PROFILE_CREATED = 'PROFILE_CREATED',
  MEDICAL_ALERT_TRIGGERED = 'MEDICAL_ALERT_TRIGGERED',
  PLAN_GENERATED = 'PLAN_GENERATED',
  SESSION_COMPLETED = 'SESSION_COMPLETED',
  DATA_ACCESSED = 'DATA_ACCESSED',
  DATA_DELETED = 'DATA_DELETED',
}

async function logAuditEvent(event: {
  type: AuditEvent;
  userId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}) {
  await db.auditLogs.insert({
    ...event,
    timestamp: new Date().toISOString(),
  });
  
  // También loguear en servicio externo (ej: AWS CloudWatch)
  logger.info({
    audit: true,
    ...event,
  });
}

// Uso
await logAuditEvent({
  type: AuditEvent.MEDICAL_ALERT_TRIGGERED,
  userId: user.id,
  metadata: {
    trigger: 'chest_pain_during_exercise',
    severity: 'CRITICAL',
  },
  ipAddress: req.ip,
});
```

---

## Checklist de Implementación

### Setup Inicial

- [ ] **Crear proyecto**
  - [ ] Inicializar repositorio Git
  - [ ] Configurar TypeScript/JavaScript
  - [ ] Setup ESLint + Prettier
  
- [ ] **Instalar dependencias**
  - [ ] `@modelcontextprotocol/sdk` (servidor MCP)
  - [ ] `react` + `react-dom` (widgets)
  - [ ] `vite` (build system)
  - [ ] `tailwindcss` (estilos)
  - [ ] `zod` (validación)

### Backend (MCP Server)

- [ ] **Configurar servidor MCP**
  - [ ] Implementar endpoint `/mcp`
  - [ ] Configurar transporte (HTTP/SSE)
  - [ ] Añadir middleware CORS
  
- [ ] **Definir tools**
  - [ ] Escribir JSON Schemas para inputs
  - [ ] Implementar handlers
  - [ ] Añadir metadatos `_meta` para widgets
  - [ ] Testing de tools con MCP Inspector
  
- [ ] **Database**
  - [ ] Diseñar schema (users, profiles, sessions, etc.)
  - [ ] Implementar migrations
  - [ ] Índices apropiados para queries frecuentes

### Widgets (Frontend)

- [ ] **Setup de build**
  - [ ] Configurar `vite.config.ts` con múltiples entry points
  - [ ] Configurar Tailwind CSS
  - [ ] Script de build para generar bundles
  
- [ ] **Desarrollar widgets**
  - [ ] Crear hooks (`useWidgetState`, `useWidgetProps`)
  - [ ] Implementar componentes React
  - [ ] Estilos con Tailwind
  - [ ] Testing local con `pnpm run dev`
  
- [ ] **Hosting de assets**
  - [ ] Elegir CDN (Vercel, Cloudflare, AWS S3)
  - [ ] Configurar CORS
  - [ ] Implementar cache headers
  - [ ] Desplegar bundles

### Autenticación (OAuth 2.1)

- [ ] **Configurar OAuth provider**
  - [ ] Implementar `/oauth/authorize` endpoint
  - [ ] Implementar `/oauth/token` endpoint
  - [ ] Validación de PKCE
  - [ ] Generación de JWT tokens
  
- [ ] **Integrar con MCP**
  - [ ] Añadir `securitySchemes` en server config
  - [ ] Middleware de validación de tokens
  - [ ] Scopes apropiados por tool

### Testing

- [ ] **Developer Mode**
  - [ ] Activar en ChatGPT
  - [ ] Configurar ngrok (o deployment temporal)
  - [ ] Registrar connector
  - [ ] Testing end-to-end
  
- [ ] **Testing automatizado**
  - [ ] Unit tests para handlers
  - [ ] Integration tests para tools
  - [ ] Snapshot tests para widgets

### Deployment (Producción)

- [ ] **Backend**
  - [ ] Elegir hosting (Render, Railway, Fly.io)
  - [ ] Configurar variables de entorno
  - [ ] Setup monitoring (Sentry, Datadog)
  - [ ] Health checks
  
- [ ] **Frontend (CDN)**
  - [ ] Deploy de bundles
  - [ ] Configurar cache invalidation
  - [ ] Testing de assets en producción
  
- [ ] **Database**
  - [ ] Elegir managed DB (PostgreSQL en Render, MongoDB Atlas)
  - [ ] Backups automáticos
  - [ ] Connection pooling

### Publicación en Directorio

- [ ] **Documentación**
  - [ ] README con setup instructions
  - [ ] API documentation
  - [ ] Privacy policy
  - [ ] Terms of service
  
- [ ] **Verificación**
  - [ ] Cuenta OpenAI verificada
  - [ ] Dominio verificado (OAuth)
  - [ ] Compliance con políticas
  
- [ ] **Postular**
  - [ ] Completar formulario de postulación
  - [ ] Testing con equipo de OpenAI
  - [ ] Aprobación y publicación

---

## Referencias y Recursos

### Documentación Oficial

- **OpenAI Apps SDK Docs**: [platform.openai.com/docs/guides/apps-sdk](https://platform.openai.com/docs/guides/apps-sdk)
- **MCP Specification**: [modelcontextprotocol.io/specification](https://modelcontextprotocol.io/specification)
- **Developer Mode Guide**: [platform.openai.com/docs/guides/developer-mode](https://platform.openai.com/docs/guides/developer-mode)

### Repositorios de GitHub

- **openai/openai-apps-sdk-examples** (1.4K⭐): [github.com/openai/openai-apps-sdk-examples](https://github.com/openai/openai-apps-sdk-examples)
- **modelcontextprotocol/typescript-sdk** (10K⭐): [github.com/modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk)

### Starters y Templates

- **Vercel Labs Next.js Starter**: Buscar "vercel openai apps sdk nextjs starter" en GitHub
- **LastMile Examples**: Demos hosteados para probar en Dev Mode

### Herramientas

- **ngrok**: [ngrok.com](https://ngrok.com) - Exponer localhost a internet
- **MCP Inspector**: `npx @modelcontextprotocol/inspector` - Testing de servidores MCP
- **Vite**: [vitejs.dev](https://vitejs.dev) - Build tool para widgets
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com) - Framework de estilos

### Community & Support

- **OpenAI Community Forum**: [community.openai.com](https://community.openai.com)
- **MCP Discord**: (buscar invitación en la página oficial de MCP)
- **Stack Overflow**: Tag `openai-apps-sdk`

### Accesibilidad y Compliance

- **WebAIM Contrast Checker**: [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker)
- **WCAG Guidelines**: [w3.org/WAI/WCAG21/quickref](https://w3.org/WAI/WCAG21/quickref)
- **HIPAA Compliance**: [hhs.gov/hipaa](https://hhs.gov/hipaa)

---

## Conclusión

El OpenAI Apps SDK representa una **oportunidad única** de llevar servicios especializados directamente a millones de usuarios de ChatGPT. Para **ATLAS**, esto significa:

✅ **Acceso a adultos mayores** que ya usan ChatGPT para consultas cotidianas  
✅ **Interfaz conversacional natural** que reduce barreras tecnológicas  
✅ **Widgets adaptados** con tipografía grande, contraste alto, y diseño simple  
✅ **Monitoreo continuo** de salud y progreso con dashboards interactivos  
✅ **Seguridad y compliance** con cifrado, OAuth, disclaimers y derivación médica apropiada  

Este documento ha cubierto desde los fundamentos del SDK hasta la implementación específica de ATLAS. Usa esta guía como referencia durante todo el ciclo de desarrollo y manteniéndola actualizada conforme el SDK evoluciona.

¡Éxito construyendo ATLAS! 💪🏠🌟
