# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Middleware de seguridad clínica (safety-policy) con guardrails y evaluación de riesgo
- Utilidades de plan adaptativo (adaptive-plan) con tests
- Recurso MCP: weekly-plan
- Widgets: ConsentBanner, SafetyNotice, ReadAloudButton, DailyNudge, WeeklyPlan
- Documentación: WARP.md, QUICKSTART.md
- Script de desarrollo: start-atlas.sh
- Config centralizada de WIDGET_BASE_URL en mcp-node

### Changed

- Dashboard y WeeklyBoard actualizados con nuevos componentes
- Recursos MCP ahora usan configuración centralizada para URLs de widgets
- Actualizados README, CONTRIBUTING, GITFLOW, TESTING y templates de issues

### Tests

- Tests para middleware de seguridad
- Tests para utilidades de adaptive-plan
- Tests para hook useWidgetProps en widgets

### Chore

- Actualizado pnpm-lock.yaml
- Mejora de scripts/update-widget-urls.sh
- Nuevos utilitarios: server-http.ts y resolve-widget-assets.ts

---

## [0.1.0] - 2025-10-14

### Added

- ✅ Inicialización del repositorio Git
- ✅ Creación de `.gitignore` profesional
- ✅ Documentación de referencia:
  - `OpenAI_Apps_SDK_Reference.md` (2,732 líneas)
  - `MCP_SDK_Guide.md` (1,530 líneas)
  - `Apps_SDK_Documentation.md` (544 líneas)
  - `README.md` índice en `/Refs`
  - `VALIDATION_REPORT.md`
- ✅ Archivos de políticas y guías:
  - `README.md` principal del proyecto
  - `CONTRIBUTING.md`
  - `CODE_OF_CONDUCT.md`
  - `CHANGELOG.md` (este archivo)
- ✅ Configuración de branches: `main`, `staging`, `develop`
- ✅ Templates de GitHub para PRs e issues

### Documentation

- Documentación exhaustiva del Apps SDK con foco en ATLAS
- Sección específica para adultos mayores con métricas de longevidad
- Guías de compliance y seguridad para salud/fitness
- Ejemplos de código completos para tools MCP y widgets

---

## Tipos de Cambios

- **Added** - Nueva funcionalidad
- **Changed** - Cambios en funcionalidad existente
- **Deprecated** - Funcionalidad que será removida
- **Removed** - Funcionalidad removida
- **Fixed** - Corrección de bugs
- **Security** - Vulnerabilidades de seguridad

---

[Unreleased]: https://github.com/aldoolivas/atlas_app_chatgpt/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/aldoolivas/atlas_app_chatgpt/releases/tag/v0.1.0
