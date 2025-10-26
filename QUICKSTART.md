# Guía Rápida: Probar ATLAS en ChatGPT Developer Mode

Esta guía te llevará paso a paso para hacer funcionar ATLAS localmente y probarlo en ChatGPT.

---

## ✅ Prerrequisitos

Antes de comenzar, verifica que tengas instalado:

```bash
# Verificar Node.js (debe ser >= 20)
node --version

# Verificar pnpm
pnpm --version

# Verificar ngrok
ngrok version
```

### Si falta algo:

**Node.js 20+:**
```bash
# macOS (usando nvm recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

**pnpm:**
```bash
corepack enable
corepack prepare pnpm@latest --activate
```

**ngrok:**
```bash
# macOS con Homebrew
brew install ngrok/ngrok/ngrok

# Registrarse en https://dashboard.ngrok.com/signup
# Obtener authtoken de https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken TU_TOKEN_AQUI
```

**ChatGPT Plus/Pro con Developer Mode:**
- Ve a https://chatgpt.com/
- Inicia sesión
- Settings → Features → Developer Mode (debe estar habilitado)

---

## 📦 Paso 1: Instalar Dependencias

```bash
cd /Users/aldoolivas/atlas_app_chatgpt

# Instalar todas las dependencias
pnpm install
```

**Salida esperada:**
```
Scope: 2 of 3 workspace projects
...
Done in XXs
```

---

## 🔍 Paso 2: Verificar que Todo Funciona

```bash
# Verificar tipos
pnpm -w typecheck

# Verificar linting
pnpm -w lint

# Ejecutar tests
pnpm -w test

# Compilar proyecto
pnpm build
```

**Todos los comandos deben terminar sin errores.**

Si ves errores, detente aquí y revisa los mensajes.

---

## 🚀 Paso 3: Iniciar Entorno de Desarrollo (3 Terminales)

### Terminal 1: Servidor de Widgets (Vite)

```bash
cd /Users/aldoolivas/atlas_app_chatgpt
pnpm --filter @atlas/widgets dev
```

**Salida esperada:**
```
VITE v5.1.0  ready in XXX ms

➜  Local:   http://localhost:4444/
➜  Network: use --host to expose
➜  press h + enter to show help
```

✅ **DEJAR CORRIENDO** - Este servidor sirve los widgets React con hot-reload.

---

### Terminal 2: Túnel ngrok

**Abrir una nueva terminal:**

```bash
ngrok http 4444
```

**Salida esperada:**
```
ngrok

Session Status                online
Account                       tu@email.com (Plan: Free)
Forwarding                    https://abc123def456.ngrok.app -> http://localhost:4444

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

🔴 **IMPORTANTE: Copia la URL de ngrok** (ejemplo: `https://abc123def456.ngrok.app`)

Esta URL cambia cada vez que reinicias ngrok (en el plan gratuito).

✅ **DEJAR CORRIENDO** - Este túnel expone tus widgets a Internet vía HTTPS.

---

### Terminal 3: Servidor MCP con Variable de Entorno

**Abrir una nueva terminal:**

```bash
cd /Users/aldoolivas/atlas_app_chatgpt

# Reemplaza la URL con la que copiaste de ngrok
WIDGET_BASE_URL=https://abc123def456.ngrok.app pnpm --filter @atlas/mcp-node dev
```

**Salida esperada:**
```
ATLAS MCP Server running on stdio
```

✅ **DEJAR CORRIENDO** - Este servidor procesa las peticiones de ChatGPT.

---

## 🔗 Paso 4: Compilar para ChatGPT (Modo Stdio)

ChatGPT Developer Mode ejecuta el servidor MCP como proceso local usando **stdio** (entrada/salida estándar).

Para esto, necesitas compilar el servidor:

```bash
# En una nueva terminal (o usa Ctrl+C en Terminal 3 temporalmente)
cd /Users/aldoolivas/atlas_app_chatgpt
pnpm --filter @atlas/mcp-node build
```

**Salida esperada:**
```
@atlas/mcp-node build$ tsc
Done in XXms
```

Esto genera `packages/mcp-node/dist/index.js`.

---

## ⚙️ Paso 5: Configurar en ChatGPT

### 5.1 Abrir ChatGPT Settings

1. Ve a https://chatgpt.com/
2. Click en tu perfil (esquina inferior izquierda)
3. Settings → Features → **Developer Mode**
4. Asegúrate que esté **habilitado** (toggle en verde)

### 5.2 Crear MCP Connector

1. En Developer Mode, click en **"+ Create MCP Server"** o **"Manage Connectors"**
2. Click en **"Add Local MCP Server"** o botón similar

### 5.3 Configurar el Servidor ATLAS

Llena los campos así:

**Name:**
```
ATLAS Fitness
```

**Command:**
```
node
```

**Arguments (lista, un item por línea):**
```
/Users/aldoolivas/atlas_app_chatgpt/packages/mcp-node/dist/index.js
```

**Environment Variables (formato JSON):**
```json
{
  "WIDGET_BASE_URL": "https://abc123def456.ngrok.app"
}
```

🔴 **IMPORTANTE:** Reemplaza `abc123def456.ngrok.app` con TU URL de ngrok del paso 3.

**Working Directory (opcional):**
```
/Users/aldoolivas/atlas_app_chatgpt
```

### 5.4 Guardar y Probar Conexión

1. Click **"Save"** o **"Create"**
2. Debe aparecer un indicador verde o mensaje de éxito
3. Si falla, verifica:
   - ✅ Ruta completa al archivo `index.js` es correcta
   - ✅ URL de ngrok está actualizada
   - ✅ Los tres terminales siguen corriendo

---

## 🧪 Paso 6: Probar en ChatGPT

Ahora puedes probar ATLAS en el chat.

### Test 1: Listar Tools Disponibles

**Prompt:**
```
Lista los tools disponibles de ATLAS
```

**Respuesta esperada:**
ChatGPT debe listar:
- `atlas_dashboard` - Dashboard semanal de progreso
- `atlas_weekly_board` - Plan semanal
- `atlas_session_checkin` - Check-in de sesión
- `atlas_adaptive_plan` - Generación de plan adaptativo
- `atlas_safety_review` - Revisión de seguridad clínica

---

### Test 2: Dashboard (Sin Check-in)

**Prompt:**
```
Muestra mi dashboard de ATLAS
```

**Resultado esperado:**
- Widget renderizado inline con:
  - Título "ATLAS Dashboard"
  - Semana actual
  - Progreso de sesiones (datos de ejemplo)
  - Racha de días

📸 **Verifica que el widget se vea correctamente** (colores Electric Violet, tema dark).

---

### Test 3: Check-in con Riesgo Bajo

**Prompt:**
```
Hacer check-in: dolor 2, energía 8, RPE 4
```

**Resultado esperado:**
- Widget de check-in con:
  - ✅ Aviso **VERDE** "Riesgo bajo"
  - Recomendaciones positivas
  - Valores reportados (dolor 2, energía 8, RPE 4)

---

### Test 4: Check-in con Riesgo Moderado

**Prompt:**
```
Hacer check-in: dolor 5, energía 4, RPE 7
```

**Resultado esperado:**
- Widget de check-in con:
  - ⚠️ Aviso **AMARILLO** "Riesgo moderado"
  - Recomendaciones de precaución
  - Sugerencia de reducir intensidad

---

### Test 5: Check-in con Riesgo Alto (Red Flags)

**Prompt:**
```
Hacer check-in: dolor 9, energía 1, RPE 10, notas: "dolor de pecho y mareo"
```

**Resultado esperado:**
- Widget de check-in con:
  - 🛑 Aviso **ROJO** "Riesgo alto"
  - Instrucciones de **DETENER EJERCICIO**
  - Recomendación de consulta médica inmediata
  - Red flags detectados: "dolor de pecho", "mareo"

---

### Test 6: Bloqueo de Tools por Seguridad

Después del check-in de riesgo alto anterior, intenta:

**Prompt:**
```
Dame un plan de fuerza intenso
```

**Resultado esperado:**
- ChatGPT debe **bloquear** la generación del plan
- Mensaje de seguridad:
  - "Por tu seguridad, solo check-ins están disponibles ahora"
  - Recomendación de descanso
  - Sugerencia de consulta médica

---

### Test 7: Plan Adaptativo (Riesgo Bajo)

Primero haz un check-in seguro:

**Prompt:**
```
Check-in: dolor 2, energía 8, RPE 4
```

Luego solicita el plan:

**Prompt:**
```
Dame un plan adaptativo semanal con objetivo de equilibrio
```

**Resultado esperado:**
- Widget con plan de 7 días
- Cada día con:
  - Título del entrenamiento
  - Intensidad (baja/moderada)
  - Foco (equilibrio, movilidad, etc.)
  - Detalles breves
- Ajustado al riesgo bajo (más volumen e intensidad)

---

### Test 8: Safety Review

**Prompt:**
```
Revisar seguridad: dolor 7, energía 3, RPE 8, actividad propuesta "Sentadillas con peso"
```

**Resultado esperado:**
- ChatGPT analiza el riesgo
- Gate: **"defer"** (posponer/reducir)
- Recomendaciones:
  - Reducir peso al 50-70%
  - Enfocarse en técnica
  - Considerar consultar fisioterapeuta

---

### Test 9: Weekly Board

**Prompt:**
```
Muestra mi plan semanal
```

**Resultado esperado:**
- Widget con calendario/plan semanal
- Vista de sesiones programadas
- Indicadores visuales

---

## 🔄 Flujo Normal de Uso

1. Usuario inicia con check-in diario
2. Sistema clasifica riesgo (bajo/moderado/alto)
3. Si riesgo bajo: puede generar planes y entrenar
4. Si riesgo moderado: recomendaciones de precaución
5. Si riesgo alto: bloqueo de tools intensas, solo descanso

---

## 🐛 Troubleshooting

### Problema: "MCP Server connection failed"

**Causa:** ChatGPT no puede ejecutar el servidor.

**Solución:**
1. Verifica ruta completa al archivo:
   ```bash
   ls -la /Users/aldoolivas/atlas_app_chatgpt/packages/mcp-node/dist/index.js
   ```
   Debe existir. Si no, ejecuta `pnpm --filter @atlas/mcp-node build`.

2. Prueba ejecutar manualmente:
   ```bash
   WIDGET_BASE_URL=https://tu-url.ngrok.app node /Users/aldoolivas/atlas_app_chatgpt/packages/mcp-node/dist/index.js
   ```
   Debe imprimir "ATLAS MCP Server running on stdio".

3. En ChatGPT Settings → Connectors → Click en "Refresh" o "Reconnect".

---

### Problema: "Widget not rendering" o pantalla en blanco

**Causa:** URL de ngrok incorrecta o expirada.

**Solución:**
1. Verifica que ngrok siga corriendo (Terminal 2).
2. Copia la URL actual de ngrok.
3. Actualiza WIDGET_BASE_URL en ChatGPT Settings → Connectors → Edit → Environment Variables.
4. Guarda y haz "Refresh" del conector.
5. Prueba abrir en tu navegador:
   ```
   https://tu-url.ngrok.app/src/entrypoints/atlas-dashboard.tsx
   ```
   Debes ver el widget renderizado.

---

### Problema: ngrok URL cambia cada reinicio

**Causa:** Plan gratuito de ngrok genera URLs aleatorias.

**Opciones:**
1. **Opción gratuita:** Actualiza WIDGET_BASE_URL cada vez (pasos anteriores).
2. **Opción de pago ($8/mes):** Ngrok Pro te da URL fija tipo `https://atlas-aldo.ngrok.app`.

---

### Problema: Widgets muestran datos por defecto en lugar de dinámicos

**Causa:** `structuredContent` no se está pasando correctamente.

**Solución:**
1. Abre Chrome DevTools en ChatGPT (F12 o Cmd+Option+I).
2. En Console, escribe:
   ```javascript
   window.openai.widget.getProps()
   ```
3. Debe retornar un objeto con datos. Si retorna `undefined` o está vacío, el problema está en el servidor MCP.
4. Verifica que los handlers de tools incluyan `structuredContent` en la respuesta.

---

### Problema: "Tool requires check-in data"

**Causa:** Intentas usar `atlas_adaptive_plan` sin hacer check-in primero.

**Solución esperada:**
- Esto es correcto. El sistema pide check-in por seguridad.
- Haz un check-in primero y luego vuelve a intentar.

---

### Problema: Tests pasan pero widgets no cargan en ChatGPT

**Causa:** CORS o URL de recursos incorrecta.

**Solución:**
1. Verifica CORS en Vite (ya está habilitado en `vite.config.ts`).
2. Prueba cargar directamente el widget en tu navegador:
   ```
   https://tu-url.ngrok.app/src/entrypoints/atlas-dashboard.tsx
   ```
3. Abre Chrome DevTools → Network → Verifica headers CORS:
   - `Access-Control-Allow-Origin: *` debe estar presente.

---

## 🔄 Workflow Diario (Desarrollo)

**Cada vez que inicies desarrollo:**

1. **Terminal 1:**
   ```bash
   pnpm --filter @atlas/widgets dev
   ```

2. **Terminal 2:**
   ```bash
   ngrok http 4444
   # Copia la nueva URL
   ```

3. **Terminal 3:**
   ```bash
   WIDGET_BASE_URL=https://NUEVA_URL.ngrok.app pnpm --filter @atlas/mcp-node dev
   ```

4. **ChatGPT:**
   - Settings → Connectors → Edit "ATLAS Fitness"
   - Actualiza `WIDGET_BASE_URL` con nueva URL de ngrok
   - Save → Refresh

---

## 📝 Comandos Rápidos de Referencia

```bash
# Instalar
pnpm install

# Verificar
pnpm -w typecheck && pnpm -w lint && pnpm -w test

# Build
pnpm build

# Dev (widgets)
pnpm --filter @atlas/widgets dev

# Dev (MCP con ngrok)
WIDGET_BASE_URL=https://tu-url.ngrok.app pnpm --filter @atlas/mcp-node dev

# Build solo MCP
pnpm --filter @atlas/mcp-node build
```

---

## 🎯 Próximos Pasos

Una vez que ATLAS funcione correctamente:

1. ✅ Probar todos los flows de seguridad
2. ✅ Validar UX de widgets (colores, accesibilidad)
3. ✅ Iterar en diseño según feedback
4. 🔜 Agregar persistencia de datos (check-ins, planes)
5. 🔜 Integrar con base de datos real
6. 🔜 Deployment a producción (Vercel + Railway/Render)

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa logs en las 3 terminales
2. Verifica Chrome DevTools → Console en ChatGPT
3. Asegúrate que ngrok siga corriendo
4. Ejecuta `pnpm -w typecheck && pnpm -w test` para descartar errores de código

---

**¡Listo para probar ATLAS! 🏋️💪**
