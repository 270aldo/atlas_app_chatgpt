# Auditoría de Cumplimiento – OpenAI Apps SDK (ChatGPT)

**Fecha:** 2026-02-24  
**Ámbito:** Proyecto ATLAS (aplicación de fitness para adultos mayores dentro de ChatGPT)

## 1) Estado actual observado
- El repositorio sólo contiene documentación y archivos meta; no hay código fuente para widgets, servidores MCP o paquetes Node/Python. La estructura esperada en el README (carpetas `mcp/`, `widgets/`, `package.json`) no existe en el árbol real del proyecto.
- No se encuentra un manifiesto de aplicación (`app.json` o equivalente) ni configuraciones de OAuth/entitlements requeridas por el Apps SDK.
- No hay pipelines de CI/CD, tests automatizados, ni ejemplos de herramientas MCP con validaciones de esquema o metadatos `openai/*`.

## 2) Buenas prácticas clave del Apps SDK y brecha actual
| Área de buenas prácticas | Qué exige el Apps SDK | Evidencia en el repo | Estado |
| --- | --- | --- | --- |
| Manifiesto de la app | `app.json` con `name`, `description`, `capabilities` (tools/resources/widgets), políticas de datos, dominios permitidos, íconos y versionado semántico. | No hay manifiesto ni carpeta de app. | 🚫 Falta |
| Servidores MCP | Tools con esquemas estrictos (Zod/Pydantic), metadatos `openai/*`, manejo de errores y timeouts, transporte HTTPS accesible desde ChatGPT. | No existe carpeta `mcp/` ni código de servidor. | 🚫 Falta |
| Widgets/UI (Pizzaz) | Entrypoints Vite/Next, componentes accesibles (ARIA, focus ring, contraste), estados de carga/errores, saneamiento de HTML. | No existe carpeta `widgets/` ni configuración de build. | 🚫 Falta |
| Seguridad/OAuth | Flujo OAuth 2.1 PKCE, storage cifrado de tokens, rotación y revocación, scopes mínimos, separación de secretos (.env). | No hay `package.json`, `.env.example` ni código que consuma OAuth. | 🚫 Falta |
| Data handling | Declaración de retención y eliminación, anonimización, minimización de datos enviados a la API, logging depurado sin PII. | Sin implementación ni políticas visibles. | 🚫 Falta |
| Observabilidad y DX | Logging estructurado, métricas básicas (latencias, errores), plantillas de troubleshooting y scripts de verificación. | Solo documentación general; no hay scripts ni CI. | ⚠️ Parcial |
| Publicación y registro | URL pública HTTPS para widgets y MCP, registro en Developer Mode/Store con dominios verificados. | No hay configuraciones de despliegue ni instrucciones operativas concretas. | 🚫 Falta |

## 3) Plan mínimo para alinear con mejores prácticas
1) **Inicializar la app**
   - Crear `package.json`, `app.json` y estructura `/apps/atlas` o raíz con `widgets/` y `mcp/`.
   - Declarar capacidades (tools/resources/widgets), iconos, política de privacidad y términos en el manifiesto.
2) **Backend MCP con validación**
   - Implementar servidor MCP (TS o Python) con tools versionadas y esquemas estrictos; incluir metadatos `openai/outputTemplate`, `openai/sensitiveInputs`, `openai/maxDurationMs`.
   - Añadir pruebas unitarias/contratos para esquemas y manejo de errores.
3) **Widgets accesibles**
   - Configurar Vite/Next con entrypoints para widgets (Pizzaz); aplicar accesibilidad (roles ARIA, focus visible, contraste alto) y sanitización de HTML.
   - Implementar estados de carga/error y comprobación de origen/iframe según guía del SDK.
4) **Seguridad y datos**
   - Integrar OAuth 2.1 PKCE, almacenar secretos en `.env` y configurar rotación de tokens; documentar scopes mínimos.
   - Definir políticas de retención/eliminación y minimizar PII en logs y requests.
5) **Operación y publicación**
   - Añadir scripts de validación (lint, type-check, tests), CI para build/test, y guías de registro en Developer Mode con dominios HTTPS.
   - Preparar despliegue (CDN para widgets, hosting HTTPS para MCP) y monitoreo básico.

## 4) Próximos pasos recomendados
- Priorizar la creación del manifiesto y la estructura mínima (`mcp/`, `widgets/`, `package.json`) para habilitar la verificación automática del Apps SDK.
- Reutilizar las guías existentes en `Refs/` como base, pero acompañarlas con código funcional, pruebas y scripts de validación.
- Documentar políticas de datos y seguridad junto con los flujos OAuth reales usados por la app.
