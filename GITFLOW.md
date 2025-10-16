# GITFLOW – Estrategia de Branches y Releases

Este documento define el flujo de trabajo de ramas (GitFlow ligero) para ATLAS.

---

## Ramas Principales

- main: Producción (protegida, tags de releases)
- staging: Pre-producción/QA (protegida)
- develop: Integración de desarrollo (ci corre aquí)

## Ramas de Trabajo

- feature/*: Nuevas funcionalidades (desde develop)
- hotfix/*: Fixes urgentes en producción (desde main)
- release/*: Estabilización previa a release (desde develop)

---

## Reglas de Protección (recomendadas)

- main y staging: requieren checks de CI exitosos; auto-merge permitido; revisiones opcionales si trabajas solo.
- develop: CI obligatorio en PRs; merge preferente por squash.

---

## Flujo de Trabajo Diario

1. Actualiza develop
```bash
git checkout develop && git pull --ff-only
```
2. Crea la rama de feature
```bash
git checkout -b feature/nombre-descriptivo
```
3. Commits con Conventional Commits
```text
feat(session-checkin): add accessible sliders and safety notice
fix(ci): use pnpm v10 and disable frozen lockfile
```
4. Abre PR → base develop (auto-merge cuando CI pase)
5. Al mergear, borra la rama remota

---

## Releases

1. Crea rama release desde develop
```bash
git checkout develop && git pull --ff-only
git checkout -b release/v0.2.0
```
2. Actualiza version y CHANGELOG.md
3. PR a staging → validar en QA
4. PR a main → crear tag
```bash
git tag -a v0.2.0 -m "v0.2.0"
git push origin v0.2.0
```
5. Haz merge back a develop (si difiere)

---

## Hotfixes

1. Rama desde main
```bash
git checkout main && git pull --ff-only
git checkout -b hotfix/critico-500
```
2. PR a main (tag patch, p.ej. v0.2.1)
3. Cherrypick o merge a develop/staging para mantener paridad

---

## CI/CD

- CI se ejecuta en PRs y pushes a develop, staging, main.
- Requisitos mínimos para merge: build, typecheck, lint, tests.

---

## Convenciones

- Commits: Conventional Commits
- Merge: Squash por defecto
- Versionado: SemVer (MAJOR.MINOR.PATCH)
- Changelog: Keep a Changelog

---

## Comandos Útiles

```bash
# Sincronizar feature con develop
git fetch origin && git rebase origin/develop

# Resolver PRs locales para ver cambios
git --no-pager log --oneline --graph --decorate -20

# Deshacer último merge (si no se ha pusheado)
git reset --hard HEAD~1
```

---

Nota: Si eres único developer, puedes desactivar la revisión obligatoria y mantener solo el check de CI como requisito de merge en ramas protegidas.
