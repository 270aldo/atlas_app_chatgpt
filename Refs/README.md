# Referencias OpenAI Apps SDK - Proyecto ATLAS

Esta carpeta contiene documentación de referencia completa sobre el OpenAI Apps SDK para el desarrollo de ATLAS, una aplicación de fitness especializada en adultos mayores que vive dentro de ChatGPT.

---

## 📚 Documentos Disponibles

### 1. [OpenAI_Apps_SDK_Reference.md](./OpenAI_Apps_SDK_Reference.md)
**Documento maestro completo** (2,732 líneas) con toda la información sobre el Apps SDK, incluyendo:

- ✅ Resumen ejecutivo y base técnica (MCP)
- ✅ Anatomía de una app y widgets disponibles (Pizzaz)
- ✅ Autenticación OAuth 2.1, estado, y Developer Mode
- ✅ **Sección ATLAS completa**: Jobs-to-be-done, tools MCP especializados, componentes UI, y dashboards para adultos mayores
- ✅ Dashboards con métricas de longevidad (adherencia, equilibrio, fuerza, dolor)
- ✅ Arquitectura técnica de dashboards interactivos
- ✅ Compliance y seguridad para aplicaciones de salud/fitness
- ✅ Checklist de implementación y recursos

**Ideal para:** Contexto completo del SDK, diseño de features ATLAS, referencia de widgets y metadatos MCP.

---

### 2. [MCP_SDK_Guide.md](./MCP_SDK_Guide.md)
**Deep dive en Model Context Protocol** (1,530 líneas) con:

- ✅ Introducción a MCP y su importancia para Apps SDK
- ✅ Implementación en TypeScript (@modelcontextprotocol/sdk)
- ✅ Implementación en Python (FastMCP/Uvicorn)
- ✅ Estructura de servidores MCP (tools, resources, transporte)
- ✅ Metadatos específicos del Apps SDK (openai/outputTemplate, etc.)
- ✅ Ejemplos completos de código funcional
- ✅ Best practices, validación con Zod/Pydantic
- ✅ Debugging y troubleshooting

**Ideal para:** Implementación técnica de servidores MCP, entender el protocolo, desarrollo backend de tools.

---

### 3. [Apps_SDK_Documentation.md](./Apps_SDK_Documentation.md)
**Guía práctica paso a paso** (544 líneas) con:

- ✅ Setup completo del proyecto (Node, pnpm, Python, ngrok)
- ✅ Configuración de Vite para widgets con múltiples entrypoints
- ✅ Estructura de un widget React (hooks, estado, accesibilidad)
- ✅ Servidores MCP (Node y Python) con ejemplos de ejecución
- ✅ Testing en ChatGPT con Developer Mode activado
- ✅ Deployment (CDN para assets, hosting HTTPS para backend MCP)
- ✅ Starters de la comunidad (Vercel Labs, LastMile)
- ✅ Troubleshooting detallado (CORS, timeouts, validación, ngrok)
- ✅ Optimización de performance y seguridad

**Ideal para:** Implementación práctica, setup de entorno, pruebas locales, deployment a producción.

---

## 🎯 Uso de la Documentación

Estos documentos están diseñados para:

- **Servir como contexto para agentes de IA** durante el desarrollo (optimizado para prompts y RAG)
- **Referencia rápida** para desarrolladores del equipo humano
- **Onboarding** de nuevos colaboradores al proyecto ATLAS
- **Guía de implementación** de features específicas (dashboards, check-ins, widgets personalizados)

---

## 🏋️ Proyecto ATLAS

ATLAS es una aplicación especializada en **fitness para adultos mayores** que vive dentro de ChatGPT, ofreciendo:

### Jobs-to-be-done principales:

1. **Screening de riesgos y preferencias personalizadas**
   - Movilidad, historial de caídas, prótesis, dolor crónico
   - Generación de "banderas rojas" para ajustes seguros

2. **Programación adaptativa de fuerza, balance y movilidad**
   - Microciclos dinámicos con widgets interactivos
   - Ajustes automáticos basados en check-ins de salud

3. **Check-ins de salud con regresiones automáticas**
   - Dolor, energía, RPE (Rate of Perceived Exertion)
   - Algoritmos de ajuste conservador para seguridad

4. **Dashboards interactivos con métricas de longevidad**
   - Adherencia, progresión, equilibrio (Time Up & Go, One Leg Stand)
   - Comparación con cohortes similares, benchmarking

5. **Educación y micro-videos integrados**
   - Seguridad, técnica, respiración
   - Contenido contextual basado en plan actual

### Principios de diseño ATLAS:

- ♿ **Accesibilidad:** Tipografías grandes, alto contraste, navegación por teclado
- 🔒 **Seguridad:** No diagnóstico, disclaimers claros, flujos de derivación médica
- 🎨 **Estilo visual:** Dark premium theme con Electric Violet (#7C4DFF) y Deep Purple (#512DA8)
- 🖋️ **Tipografías:** Josefin Sans (headings), Inter/Source Sans Pro (body)
- 🧩 **Componentes:** shadcn/ui como base, personalizado para adultos mayores

---

## 🚀 Flujo de Trabajo Recomendado

### Para desarrollo de una nueva feature:

1. **Consultar OpenAI_Apps_SDK_Reference.md** → entender anatomía de apps, widgets disponibles, y sección ATLAS
2. **Diseñar tool MCP** → usar MCP_SDK_Guide.md para estructura, validación, metadatos
3. **Implementar backend** → Node (TypeScript + Zod) o Python (FastMCP + Pydantic)
4. **Crear widget UI** → Apps_SDK_Documentation.md para setup de Vite, hooks, Tailwind
5. **Probar localmente** → Developer Mode + ngrok (sección 8 de Apps_SDK_Documentation.md)
6. **Deployment** → CDN para assets, HTTPS para backend MCP (sección 9)

### Para troubleshooting:

- CORS issues → Apps_SDK_Documentation.md (sección 11.1)
- Validación de JSON Schema → MCP_SDK_Guide.md (sección 9)
- Widgets no renderizan → Apps_SDK_Documentation.md (sección 11.6)
- Debugging de tools → MCP_SDK_Guide.md (sección 11)

---

## 📊 Resumen de Contenido

| Documento | Líneas | Enfoque | Audiencia |
|-----------|--------|---------|-----------|
| **OpenAI_Apps_SDK_Reference.md** | 2,732 | Comprensivo, ATLAS-específico | Agentes IA, Product, Full-stack |
| **MCP_SDK_Guide.md** | 1,530 | Técnico profundo (MCP) | Backend devs, Arquitectos |
| **Apps_SDK_Documentation.md** | 544 | Práctico, paso a paso | Frontend/Full-stack, DevOps |
| **README.md** (este archivo) | ~200 | Índice y navegación | Todo el equipo |

**Total:** ~5,000 líneas de documentación técnica actualizada.

---

## 🔄 Mantenimiento

- **Última actualización:** 2025-10-14
- **Fuentes verificadas:**
  - Documentación oficial OpenAI Apps SDK
  - Repositorio github.com/openai/openai-apps-sdk-examples
  - Model Context Protocol (MCP) specification
  - @modelcontextprotocol/sdk (TypeScript)
  - Starters de la comunidad (Vercel Labs, LastMile)

Para actualizar esta documentación:
1. Verificar cambios en repos oficiales y anuncios de OpenAI
2. Actualizar ejemplos de código si hay breaking changes
3. Revisar nuevos widgets o metadatos MCP agregados
4. Actualizar fecha en cada documento

---

## 📞 Soporte y Recursos Externos

- **OpenAI Developers:** https://platform.openai.com/docs
- **MCP Protocol:** https://modelcontextprotocol.io
- **GitHub (ejemplos oficiales):** https://github.com/openai/openai-apps-sdk-examples
- **Vercel Next.js Starter:** https://github.com/vercel/openai-apps-sdk-nextjs-starter
- **Community Discord/Forums:** (consultar con equipo para enlaces actualizados)

---

**¿Listo para empezar?** 🚀  
Comienza con [OpenAI_Apps_SDK_Reference.md](./OpenAI_Apps_SDK_Reference.md) para una visión completa del SDK y la arquitectura de ATLAS.
