# Guía de Desarrollo Local - ATLAS ChatGPT App

Esta guía te ayudará a probar ATLAS localmente en ChatGPT usando ngrok.

---

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener:

- ✅ Node.js 20+ instalado
- ✅ pnpm instalado globalmente
- ✅ ngrok instalado y autenticado
- ✅ Cuenta de ChatGPT con acceso a Developer Mode

### Verificar instalaciones:

```bash
node --version   # Debe ser >= 20
pnpm --version   # Cualquier versión reciente
ngrok version    # Debe mostrar la versión instalada
```

### Configurar ngrok (solo una vez):

1. Crea cuenta en https://ngrok.com/signup
2. Copia tu authtoken desde https://dashboard.ngrok.com/get-started/your-authtoken
3. Ejecuta:
   ```bash
   ngrok config add-authtoken <TU_TOKEN>
   ```

---

## 🔍 Verificación del Proyecto

Antes de iniciar el desarrollo, verifica que todo esté correctamente instalado:

```bash
# Instalar dependencias
pnpm install

# Verificar tipos
pnpm typecheck

# Ejecutar tests
pnpm test

# Verificar linting
pnpm lint

# Compilar proyecto
pnpm build
```

**Todos los comandos deben pasar sin errores** antes de continuar.

---

## 🚀 Proceso de Testing Local (3 Terminales)

### Terminal 1: Servidor de Widgets (Vite)

Sirve los widgets React con hot reload en puerto 4444:

```bash
cd /Users/aldoolivas/atlas_app_chatgpt
pnpm --filter @atlas/widgets dev
```

**Salida esperada:**
```
VITE v5.1.0  ready in XXX ms

➜  Local:   http://localhost:4444/
➜  Network: use --host to expose
```

**Dejar corriendo** - Este terminal sirve los archivos `.tsx` directamente.

---

### Terminal 2: Túnel ngrok

Expone el puerto 4444 a Internet con HTTPS:

```bash
ngrok http 4444
```

**Salida esperada:**
```
Session Status                online
Account                       tu@email.com
Forwarding                    https://abc123.ngrok.app -> http://localhost:4444
```

**¡IMPORTANTE!** Copia la URL de ngrok (ej: `https://abc123.ngrok.app`)

**Dejar corriendo** - Este terminal crea el túnel HTTPS público.

---

### Terminal 3: Servidor MCP con Variable de Entorno

Una vez que tengas la URL de ngrok del Terminal 2:

```bash
# Iniciar MCP server con WIDGET_BASE_URL configurado
WIDGET_BASE_URL=https://abc123.ngrok.app pnpm --filter @atlas/mcp-node dev
```

**Salida esperada:**
```
ATLAS MCP Server running on stdio
```

**Nota:** La variable `WIDGET_BASE_URL` le dice al MCP server dónde encontrar los widgets.

**Dejar corriendo** - El MCP server procesa las peticiones de ChatGPT.

---

## 🔗 Conectar a ChatGPT

### Método 1: Como Connector HTTP (Recomendado para Testing Rápido)

⚠️ **Nota:** Este método NO funciona con stdio transport. Necesitas un servidor HTTP.

### Método 2: Como MCP Server Local (Recomendado)

1. Compila el proyecto:
   ```bash
   pnpm build
   ```

2. En ChatGPT, ve a **Settings → Connectors → Create MCP Server**

3. Configuración:
   - **Command:** `node`
   - **Args:** `/ruta/completa/atlas_app_chatgpt/packages/mcp-node/dist/index.js`
   - **Environment Variables:**
     ```
     WIDGET_BASE_URL=https://abc123.ngrok.app
     ```

4. Guarda y prueba

---

## 🧪 Prompts de Prueba

### 1. Check-in Básico (Riesgo Bajo)

```
Hacer check-in: dolor 3, energía 8, RPE 5
```

**Esperado:** Widget verde con mensaje "¡Listo para entrenar!"

### 2. Check-in con Riesgo Moderado

```
Hacer check-in: dolor 6, energía 4, RPE 8
```

**Esperado:** Widget amarillo con advertencias moderadas

### 3. Check-in con Riesgo Alto

```
Hacer check-in: dolor 9, energía 2, RPE 9, notas: "dolor de pecho"
```

**Esperado:**
- Widget rojo con STOP
- Bloqueo de tools no esenciales
- Recomendación de consulta médica

### 4. Safety Review

```
Revisar seguridad: dolor 7, energía 4, RPE 8,
actividad propuesta "Sesión de sentadillas con peso"
```

**Esperado:** Gate = "defer" con recomendaciones de reducir intensidad

### 5. Plan Adaptativo

```
Dame un plan semanal de equilibrio
```

**Esperado:**
- Si NO hay check-in previo: Solicita check-in primero
- Si HAY check-in: Genera plan ajustado al riesgo actual

### 6. Dashboard

```
Muestra mi progreso semanal
```

**Esperado:** Widget con progreso + avisos de seguridad si aplica

---

## 🔄 Workflow Diario de Desarrollo

### Al Iniciar Cada Día:

1. **Terminal 1**: `pnpm --filter @atlas/widgets dev`
2. **Terminal 2**: `ngrok http 4444` → Copia nueva URL
3. **Terminal 3**:
   ```bash
   WIDGET_BASE_URL=https://NUEVA_URL.ngrok.app pnpm --filter @atlas/mcp-node dev
   ```
4. **ChatGPT**: Settings → Connectors → **Refresh** (para sincronizar cambios)

### Si Cambias Código:

- **Widgets React**: Se actualizan automáticamente (HMR de Vite) ✅
- **MCP Tools/Resources**: Reinicia Terminal 3 (`Ctrl+C` y vuelve a ejecutar)
- **ChatGPT**: Usa **Refresh** en Settings → Connectors

---

## 🆕 Nuevas Características de Seguridad

ATLAS ahora incluye un sistema robusto de seguridad clínica. Ver **[FEATURES.md](./FEATURES.md)** para documentación completa.

### Componentes de Seguridad:

1. **Clinical Guardrails** - Clasifica riesgo (bajo/moderado/alto)
2. **Safety Policy Middleware** - Bloquea tools peligrosos en riesgo alto
3. **Safety Review Tool** - Revisión manual de seguridad
4. **Adaptive Plan** - Genera planes ajustados al riesgo

### Red Flags Detectados:

- Dolor de pecho
- Mareo/mareos
- Dificultad para respirar
- Palpitaciones
- Náusea
- Visión borrosa

---

## 🐛 Troubleshooting

### Error: "Failed to connect to MCP server"

**Causa**: ChatGPT no puede alcanzar tu servidor.

**Solución**:
1. Verifica que ngrok esté corriendo (Terminal 2)
2. Verifica que WIDGET_BASE_URL esté configurado correctamente
3. Prueba abrir `https://TU_URL.ngrok.app/src/entrypoints/atlas-dashboard.tsx` en un navegador
   - Deberías ver el widget renderizado

### Error: "Widget not rendering"

**Causa**: URLs incorrectas o WIDGET_BASE_URL no configurado.

**Solución**:
```bash
# Verifica que la variable esté configurada
echo $WIDGET_BASE_URL

# Reinicia con la variable correcta
WIDGET_BASE_URL=https://TU_URL_CORRECTA.ngrok.app pnpm --filter @atlas/mcp-node dev
```

### ngrok URL cambia cada vez

**Causa**: El plan gratuito de ngrok genera URLs aleatorias.

**Soluciones**:
- **Opción 1 (gratis)**: Actualiza WIDGET_BASE_URL cada vez que cambies la URL
- **Opción 2 (pagado $8/mes)**: Upgrade a ngrok Pro para URLs fijas

### Widgets muestran datos por defecto en lugar de dinámicos

**Causa**: `structuredContent` no se está pasando correctamente.

**Solución**:
1. Verifica en Chrome DevTools (en ChatGPT):
   ```javascript
   window.openai
   // Debe tener: { toolOutput: { weekData: {...} } }
   ```
2. Si es `undefined`, verifica que el tool esté retornando `structuredContent`

### Tests fallan

**Solución**:
```bash
# Reinstalar dependencias
pnpm install

# Ejecutar tests individuales
pnpm --filter @atlas/widgets test
pnpm --filter @atlas/mcp-node test
```

---

## 📝 Checklist de Verificación

Antes de probar en ChatGPT, asegúrate de que:

- [ ] Todas las dependencias instaladas (`pnpm install`)
- [ ] Tests pasan (`pnpm test`)
- [ ] Typecheck pasa (`pnpm typecheck`)
- [ ] Build funciona (`pnpm build`)
- [ ] Terminal 1 muestra "ready in XXX ms" (Vite corriendo)
- [ ] Terminal 2 muestra "Forwarding https://..." (ngrok corriendo)
- [ ] Terminal 3 con WIDGET_BASE_URL correcta
- [ ] Terminal 3 muestra "ATLAS MCP Server running" (MCP corriendo)
- [ ] ChatGPT Developer Mode está activado
- [ ] MCP Server configurado correctamente en ChatGPT

---

## 🎯 Próximos Pasos

Una vez que funcione localmente:

1. **Deploy a producción**:
   - Widgets → Vercel (`https://atlas-widgets.vercel.app`)
   - MCP Server → Render/Railway (`https://atlas-mcp.onrender.com`)

2. **Publicar en ChatGPT App Directory**:
   - Solicitar verificación a OpenAI
   - Completar formulario de publicación

3. **Iterar**:
   - Agregar más tools (atlas_intake_screen)
   - Mejorar dashboards con datos reales
   - Conectar a base de datos PostgreSQL

---

## 📞 Recursos

- **Documentación OpenAI Apps SDK**: https://developers.openai.com/apps-sdk/
- **Ngrok Docs**: https://ngrok.com/docs
- **Refs locales**: `/Users/aldoolivas/atlas_app_chatgpt/Refs/`
- **Nuevas características**: `FEATURES.md`
- **Arquitectura**: `CLAUDE.md`

---

**¡Listo para desarrollar! 🚀**

**Nota sobre Seguridad:** ATLAS ahora incluye guardarraíles clínicos robustos. Siempre prueba con diferentes niveles de riesgo para verificar que las protecciones funcionen correctamente.
