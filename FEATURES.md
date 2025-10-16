# Nuevas Características de ATLAS - Seguridad Clínica

Esta guía documenta las nuevas características de seguridad clínica implementadas en ATLAS.

---

## 🛡️ Sistema de Seguridad Clínica

### Overview

ATLAS ahora incluye un sistema robusto de guardarraíles clínicos (clinical guardrails) que protege a los usuarios de entrenamientos potencialmente peligrosos basándose en sus reportes de dolor, energía y esfuerzo percibido (RPE).

### Componentes Principales

#### 1. **Clinical Guardrails** (`packages/mcp-node/src/utils/clinical-guardrails.ts`)

Función principal: `triageCheckin(input: CheckinData)`

**Entrada:**
```typescript
{
  pain: number;      // 0-10
  energy: number;    // 0-10
  rpe: number;       // 1-10
  notes?: string;    // Notas del usuario
}
```

**Salida:**
```typescript
{
  risk: 'low' | 'moderate' | 'high';
  recommendations: string[];
  disclaimer: string;
  triggers: string[];  // Red flags detectados
}
```

**Lógica de Clasificación de Riesgo:**

- **RIESGO ALTO (HIGH):**
  - Dolor ≥ 8
  - Energía ≤ 2
  - RPE ≥ 9
  - Red flags en notas (dolor de pecho, mareo, dificultad respirar)

- **RIESGO MODERADO (MODERATE):**
  - Dolor 6-7
  - Energía 3-4
  - RPE 8

- **RIESGO BAJO (LOW):**
  - Dolor ≤ 5
  - Energía ≥ 5
  - RPE ≤ 7

**Red Flags (Palabras Clave):**
- Dolor de pecho
- Mareo/mareos
- Dificultad para respirar/disnea
- Palpitaciones
- Náusea
- Visión borrosa

---

#### 2. **Safety Policy Middleware** (`packages/mcp-node/src/middleware/safety-policy.ts`)

Función: `applySafetyPolicy(toolName, args, handler)`

**Características:**

1. **Bloqueo de Tools en Riesgo Alto:**
   - Si se detecta riesgo alto + red flags, bloquea tools NO "core-safe"
   - Tools core-safe: `atlas_dashboard`, `atlas_session_checkin`, `atlas_safety_review`

2. **Requisito de Check-in:**
   - Tools como `atlas_adaptive_plan` requieren check-in reciente
   - Si no hay check-in, retorna mensaje pidiendo al usuario que haga check-in primero

3. **Adjuntar Safety Data:**
   - Todos los responses incluyen `structuredContent.safety` para que widgets muestren avisos

**Flujo:**
```
Usuario invoca tool
    ↓
Safety Policy intercepta
    ↓
¿Tiene datos de check-in? → NO → Pide check-in
    ↓ SÍ
¿Riesgo alto + red flags? → SÍ → Bloquea (si NO es core-safe)
    ↓ NO
Ejecuta tool normalmente + adjunta safety data
```

---

#### 3. **Safety Review Tool** (`packages/mcp-node/src/tools/atlas-safety-review.ts`)

Tool MCP: `atlas_safety_review`

**Propósito:** Revisión manual de seguridad cuando el asistente tiene dudas.

**Input:**
```typescript
{
  pain: number;
  energy: number;
  rpe: number;
  notes?: string;
  proposedActivity: string;  // Ej: "Sesión de sentadillas"
}
```

**Output:**
```typescript
{
  gate: 'allow' | 'defer' | 'block';
  message: string;  // Explicación educativa
  alternatives?: string[];  // Opciones más seguras
}
```

**Lógica de Gates:**

- **ALLOW:** Riesgo bajo, actividad apropiada
- **DEFER:** Riesgo moderado, reducir intensidad o consultar fisioterapeuta
- **BLOCK:** Riesgo alto, solo descanso/movilidad suave

---

#### 4. **Adaptive Plan Generator** (`packages/mcp-node/src/utils/adaptive-plan.ts`)

Función: `generateAdaptivePlan(input)`

**Características:**

- Genera plan semanal de ejercicios basado en objetivo y nivel de riesgo
- Ajusta automáticamente volumen e intensidad según seguridad
- 3 tipos de planes: fuerza, equilibrio, movilidad

**Ajustes por Riesgo:**

| Riesgo | Sesiones/semana | Duración | Intensidad |
|--------|----------------|----------|------------|
| **Bajo** | 3 | 30 min | Moderada |
| **Moderado** | 2 | 20 min | Baja |
| **Alto** | 1 | 15 min | Muy baja (movilidad) |

---

## 🎨 Componentes UI de Seguridad

### 1. **SafetyNotice** (`packages/widgets/src/components/SafetyNotice.tsx`)

Widget que muestra avisos de seguridad con códigos de color:

- **Verde:** Riesgo bajo - "Todo bien, ¡adelante!"
- **Amarillo:** Riesgo moderado - Advertencias + recomendaciones
- **Rojo:** Riesgo alto - STOP + instrucciones de descanso

**Props:**
```typescript
{
  risk?: 'low' | 'moderate' | 'high';
  recommendations?: string[];
  disclaimer?: string;
}
```

**Características:**
- Botón "Leer en voz" para accesibilidad
- Animaciones suaves
- Iconos claros (✅ ⚠️ 🛑)

### 2. **ConsentBanner** (`packages/widgets/src/components/ConsentBanner.tsx`)

Banner informativo que aparece en check-ins:

- Disclaimer médico ("No reemplaza consulta médica")
- Link a términos de servicio
- Solo se muestra una vez por sesión (localStorage)

### 3. **DailyNudge** (`packages/widgets/src/components/DailyNudge.tsx`)

Recordatorio de check-in diario:

- Se muestra si no se ha hecho check-in hoy
- Guarda timestamp en localStorage
- Mensaje amigable: "¿Cómo te sientes hoy?"

---

## 🔧 Configuración Centralizada

**Archivo:** `packages/mcp-node/src/config.ts`

```typescript
export const WIDGET_BASE_URL =
  process.env.WIDGET_BASE_URL?.trim() || 'http://localhost:4444';
```

**Uso:**

```bash
# Desarrollo local
WIDGET_BASE_URL=http://localhost:4444 pnpm dev

# Con ngrok
WIDGET_BASE_URL=https://abc123.ngrok.app pnpm dev

# Producción
WIDGET_BASE_URL=https://atlas-widgets.vercel.app node dist/index.js
```

---

## 📋 Flujos de Usuario

### Flujo 1: Check-in con Riesgo Bajo

```
Usuario: "Hacer check-in con dolor 3, energía 8, RPE 5"
    ↓
Tool: atlas_session_checkin
    ↓
Clinical Guardrails: → RIESGO BAJO
    ↓
Widget muestra:
  - ✅ Aviso verde "¡Listo para entrenar!"
  - Recomendaciones: "Enfócate en técnica, respira correctamente"
    ↓
Usuario puede continuar con atlas_adaptive_plan
```

### Flujo 2: Check-in con Riesgo Alto + Red Flags

```
Usuario: "Hacer check-in con dolor 9, energía 2, RPE 9, notas: dolor de pecho"
    ↓
Tool: atlas_session_checkin
    ↓
Clinical Guardrails: → RIESGO ALTO + red flag "dolor de pecho"
    ↓
Widget muestra:
  - 🛑 Aviso rojo "DETÉN EJERCICIO"
  - Recomendaciones:
    * "Descansa hoy y mañana"
    * "Consulta a tu médico sobre dolor de pecho"
    * "Solo movilidad suave está permitida"
    ↓
Usuario intenta: "Dame un plan de fuerza"
    ↓
Safety Policy BLOQUEA:
  - Mensaje: "Por tu seguridad, solo check-ins están disponibles ahora.
             Necesitas descanso y consulta médica."
```

### Flujo 3: Solicitud Sin Check-in

```
Usuario: "Dame un plan de ejercicios de equilibrio"
    ↓
Tool: atlas_adaptive_plan
    ↓
Safety Policy detecta: NO hay check-in reciente
    ↓
Response:
  "Necesito saber cómo te sientes primero. Por favor haz check-in:
   - ¿Cuál es tu nivel de dolor (0-10)?
   - ¿Cuál es tu nivel de energía (0-10)?
   - ¿Cómo calificas tu esfuerzo reciente (RPE 1-10)?"
```

---

## 🧪 Testing

### Tests Implementados

#### Clinical Guardrails (`clinical-guardrails.test.ts`)
- ✅ Clasifica riesgo bajo correctamente
- ✅ Clasifica riesgo moderado correctamente
- ✅ Clasifica riesgo alto correctamente
- ✅ Detecta red flags en notas

#### Safety Policy (`safety-policy.test.ts`)
- ✅ Bloquea tools en riesgo alto con triggers
- ✅ Requiere check-in para tools específicos

#### Adaptive Plan (`adaptive-plan.test.ts`)
- ✅ Genera planes apropiados por riesgo
- ✅ Reduce volumen en riesgo moderado
- ✅ Limita a movilidad en riesgo alto

#### Widget Props (`useWidgetProps.test.tsx`)
- ✅ Retorna defaults cuando no hay props del host
- ✅ Merge props del host correctamente

**Ejecutar tests:**
```bash
pnpm test              # Todos los tests
pnpm -w test          # Desde raíz
pnpm typecheck        # Verificar tipos
pnpm lint             # Verificar estilo
```

---

## 📖 Uso en ChatGPT

### Prompts de Ejemplo

**Check-in normal:**
```
Hacer check-in: dolor 4, energía 7, RPE 6
```

**Safety review antes de actividad:**
```
Revisar seguridad: dolor 6, energía 5, RPE 7,
actividad propuesta "Sesión de sentadillas con peso"
```

**Solicitar plan adaptativo:**
```
Dame un plan semanal de equilibrio
```

**Ver dashboard:**
```
Muestra mi progreso semanal
```

---

## 🎯 Próximos Pasos Sugeridos

1. **Persistencia de Datos:**
   - Conectar a base de datos (PostgreSQL/Supabase)
   - Guardar histórico de check-ins
   - Tracking de progreso real

2. **Notificaciones:**
   - Recordatorios de check-in vía email/SMS
   - Alertas cuando usuario reporta riesgo alto

3. **Analytics:**
   - Dashboard de métricas agregadas
   - Identificar patrones de dolor/fatiga

4. **Integración Médica:**
   - Exportar reportes PDF para médicos
   - API para compartir datos con fisioterapeutas

---

## 📞 Soporte

Para preguntas o problemas:
- Revisa `DEVELOPMENT.md` para setup local
- Revisa tests para ejemplos de uso
- Consulta `CLAUDE.md` para arquitectura general

---

**Última actualización:** 2025-10-15
