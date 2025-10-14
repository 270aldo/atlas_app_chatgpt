# Guía de Contribución – ATLAS

¡Gracias por tu interés en contribuir a ATLAS! Este documento te guiará a través del proceso de desarrollo y colaboración en el proyecto.

---

## 📋 Tabla de Contenido

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Desarrollo Local](#desarrollo-local)
- [Gitflow y Branches](#gitflow-y-branches)
- [Convenciones de Código](#convenciones-de-código)
- [Pull Requests](#pull-requests)
- [Testing](#testing)
- [Documentación](#documentación)

---

## Código de Conducta

Este proyecto se adhiere a nuestro [Código de Conducta](./CODE_OF_CONDUCT.md). Al participar, se espera que respetes estos lineamientos.

---

## Cómo Contribuir

### Reportar Bugs

1. **Busca** primero si el bug ya fue reportado en [Issues](https://github.com/aldoolivas/atlas_app_chatgpt/issues)
2. Si no existe, **crea un nuevo issue** usando el template de bug report
3. Incluye:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots (si aplica)
   - Entorno (OS, Node version, etc.)

### Proponer Features

1. **Abre un issue** usando el template de feature request
2. Describe:
   - El problema que resuelve
   - La solución propuesta
   - Alternativas consideradas
   - Impacto en adultos mayores (accesibilidad, UX)

---

## Desarrollo Local

### Setup Inicial

```bash
# Fork el repositorio en GitHub
# Clona tu fork
git clone https://github.com/TU_USUARIO/atlas_app_chatgpt.git
cd atlas_app_chatgpt

# Añade el repo original como upstream
git remote add upstream https://github.com/aldoolivas/atlas_app_chatgpt.git

# Instala dependencias
pnpm install

# Crea una rama para tu feature
git checkout -b feature/mi-nueva-feature
```

### Desarrollo

```bash
# Widgets (Vite dev server)
pnpm dev

# MCP Server (Node)
cd mcp/node
pnpm start

# MCP Server (Python)
cd mcp/python
uvicorn main:app --reload --port 3000
```

### Testing Local con ChatGPT

```bash
# Exponer servidor con ngrok
ngrok http 3000

# Registrar en ChatGPT Developer Mode
# Settings → Connectors → Add Connector
# URL: https://YOUR_NGROK_ID.ngrok.io/mcp
```

---

## Gitflow y Branches

### Estructura de Ramas

- **`main`**: Producción (protegida)
- **`staging`**: Pre-producción/QA (protegida)
- **`develop`**: Integración de desarrollo
- **`feature/*`**: Nuevas funcionalidades
- **`hotfix/*`**: Correcciones urgentes
- **`release/*`**: Preparación de releases

### Workflow

1. **Crea tu branch** desde `develop`:
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout -b feature/nombre-descriptivo
   ```

2. **Desarrolla** tu feature con commits frecuentes

3. **Mantén tu rama actualizada**:
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

4. **Push** a tu fork:
   ```bash
   git push origin feature/nombre-descriptivo
   ```

5. **Abre un Pull Request** a `develop`

Para más detalles, consulta [GITFLOW.md](./GITFLOW.md).

---

## Convenciones de Código

### Commits (Conventional Commits)

Formato: `tipo(scope): descripción`

**Tipos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato (sin cambio de lógica)
- `refactor`: Refactorización
- `test`: Agregar o modificar tests
- `chore`: Mantenimiento (deps, config)
- `perf`: Mejoras de performance

**Ejemplos:**
```
feat(dashboard): add weekly adherence metric widget
fix(mcp): correct CORS headers for widget assets
docs(readme): update setup instructions
chore(deps): upgrade @modelcontextprotocol/sdk to v0.6.0
```

### Código TypeScript/JavaScript

- **Formato**: Prettier (config en `.prettierrc`)
- **Linting**: ESLint (config en `.eslintrc`)
- **Naming**:
  - Variables/funciones: `camelCase`
  - Componentes React: `PascalCase`
  - Constantes: `UPPER_SNAKE_CASE`
  - Files: `kebab-case.tsx`

### Código Python

- **Formato**: Black (line length 100)
- **Linting**: Flake8, mypy
- **Naming**:
  - Variables/funciones: `snake_case`
  - Clases: `PascalCase`
  - Constantes: `UPPER_SNAKE_CASE`

### Accesibilidad (A11y)

- Usa roles ARIA apropiados
- Asegura contraste mínimo 4.5:1
- Navegación completa por teclado
- Tamaños de tipografía >= 16px (ideal 18-20px para adultos mayores)
- Objetivos táctiles >= 44x44px

---

## Pull Requests

### Checklist

Antes de abrir un PR, asegúrate de:

- [ ] El código compila sin errores
- [ ] Pasan todos los tests (`pnpm test`)
- [ ] Código formateado (`pnpm format`)
- [ ] Linting sin errores (`pnpm lint`)
- [ ] Commits siguen Conventional Commits
- [ ] Documentación actualizada (si aplica)
- [ ] Screenshots incluidos (para cambios UI)
- [ ] Probado en ChatGPT Developer Mode

### Template de PR

Usa el template automático que aparece al abrir un PR. Incluye:

- **Descripción**: Qué hace este PR
- **Motivación**: Por qué es necesario
- **Tipo de cambio**: Feature, bug fix, docs, etc.
- **Cómo probar**: Pasos para validar el cambio
- **Screenshots**: Si hay cambios visuales
- **Checklist**: Todos los items marcados

### Revisión

- Al menos 1 aprobación requerida para merge a `main` o `staging`
- Resuelve comentarios antes de merge
- Usa squash merge para mantener historia limpia

---

## Testing

### Unit Tests

```bash
# Correr tests
pnpm test

# Tests con coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

### Integration Tests

```bash
# Tests de integración (MCP + widgets)
pnpm test:integration
```

### Manual Testing

Siempre prueba manualmente en ChatGPT Developer Mode antes de abrir PR:

1. Activa Developer Mode
2. Registra tu servidor local con ngrok
3. Invoca tools y widgets
4. Verifica funcionalidad y UX

---

## Documentación

### Actualizar Docs

Si tu cambio afecta:
- **Funcionalidad**: Actualiza README.md y docs en `Refs/`
- **API/Tools**: Actualiza `OpenAI_Apps_SDK_Reference.md`
- **Workflow**: Actualiza `GITFLOW.md` o `CONTRIBUTING.md`

### Comentarios en Código

- Usa JSDoc para funciones/clases públicas
- Comenta lógica compleja o no obvia
- Evita comentarios redundantes

```typescript
/**
 * Calculates weekly adherence percentage for a user.
 * 
 * @param userId - The user's unique identifier
 * @param weekNumber - Week number (1-52)
 * @returns Adherence percentage (0-100)
 */
export async function calculateAdherence(
  userId: string,
  weekNumber: number
): Promise<number> {
  // Logic here
}
```

---

## Preguntas

Si tienes dudas:
- Abre un [Discussion](https://github.com/aldoolivas/atlas_app_chatgpt/discussions)
- Contacta al maintainer: [@aldoolivas](https://github.com/aldoolivas)

---

¡Gracias por contribuir a ATLAS! 🙌💪
