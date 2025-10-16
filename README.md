# ATLAS – Fitness para Adultos Mayores

> **Aplicación de fitness especializada para adultos mayores que vive dentro de ChatGPT**, construida con OpenAI Apps SDK y Model Context Protocol (MCP).

[![License: Private](https://img.shields.io/badge/License-Private-red.svg)](LICENSE)
[![Status: Development](https://img.shields.io/badge/Status-Development-yellow.svg)]()

---

## 🎯 Misión

ATLAS ayuda a adultos mayores a mantenerse activos, fuertes y seguros mediante:

- 🏋️ **Programación adaptativa** de fuerza, balance y movilidad
- 🔍 **Screening de riesgos** personalizados (caídas, prótesis, dolor crónico)
- 📊 **Dashboards interactivos** con métricas de longevidad
- ✅ **Check-ins de salud** con ajustes automáticos seguros
- 🎓 **Educación integrada** con micro-videos y tips contextuales

---

## 🛠️ Stack Tecnológico

- **Frontend (Widgets):** React, TypeScript, Tailwind CSS, Vite
- **Backend (MCP Server):** Node.js / Python, Express, FastMCP
- **Apps SDK:** OpenAI Apps SDK (MCP + UI)
- **Deployment:** Vercel/Cloudflare (CDN), Render/Railway (Backend)
- **Database:** PostgreSQL / MongoDB (TBD)
- **Auth:** OAuth 2.1 con PKCE

---

## 📂 Estructura del Proyecto

```
atlas_app_chatgpt/
├── Refs/                      # Documentación de referencia (Apps SDK, MCP)
├── mcp/                       # Servidores MCP (Node y Python)
│   ├── node/
│   └── python/
├── widgets/                   # Widgets React (UI embebida en ChatGPT)
│   └── src/
├── .github/                   # Templates de issues, PRs, workflows
├── .gitignore
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── CHANGELOG.md
├── GITFLOW.md
└── package.json
```

---

## 🚀 Quick Start

### Prerrequisitos

- **Node.js** 18+ (recomendado 20+)
- **pnpm** instalado globalmente
- **Python** 3.10+ (para servidor MCP Python)
- **ngrok** (para testing local con ChatGPT)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/aldoolivas/atlas_app_chatgpt.git
cd atlas_app_chatgpt

# Instalar dependencias (cuando exista package.json)
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus keys
```

### Desarrollo

```bash
# Levantar servidor de widgets (Vite)
pnpm dev

# En otra terminal: servidor MCP (Node)
cd mcp/node
pnpm start

# O servidor MCP (Python)
cd mcp/python
uvicorn main:app --reload
```

### Testing en ChatGPT

1. Activar **Developer Mode** en ChatGPT (Settings → Connectors)
2. Exponer servidor local con ngrok:
   ```bash
   ngrok http 3000
   ```
3. Registrar connector en ChatGPT con URL de ngrok
4. Probar tools en chat: "Mostrar mi dashboard semanal de ATLAS"

---

## 📚 Documentación

- **[Refs/README.md](./Refs/README.md)** – Índice de toda la documentación del Apps SDK
- **[OpenAI_Apps_SDK_Reference.md](./Refs/OpenAI_Apps_SDK_Reference.md)** – Documento maestro completo
- **[MCP_SDK_Guide.md](./Refs/MCP_SDK_Guide.md)** – Deep dive técnico de MCP
- **[Apps_SDK_Documentation.md](./Refs/Apps_SDK_Documentation.md)** – Guía práctica paso a paso
- **[GITFLOW.md](./GITFLOW.md)** – Estrategia de branches y workflow
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** – Guía de contribución

---

## 🤝 Contribuir

Lee nuestra [guía de contribución](./CONTRIBUTING.md) para conocer el proceso de desarrollo, convenciones de código y cómo enviar pull requests.

---

## 🏥 Compliance y Seguridad

ATLAS maneja información de salud y fitness con estándares elevados:

- ⚠️ **No diagnóstico**: Información educativa, no reemplaza consulta médica
- 🔒 **Cifrado**: PHI no se almacena sin cifrado apropiado
- ✅ **Derivación médica**: Gatillos automáticos para consultar profesionales
- 📋 **Disclaimers**: Visibles en toda interacción de salud

---

## 🎨 Diseño ATLAS

- **Estilo visual:** Dark premium theme
- **Colores:** Electric Violet (#7C4DFF), Deep Purple (#512DA8)
- **Tipografías:** Josefin Sans (headings), Inter/Source Sans Pro (body)
- **Componentes:** shadcn/ui + customizaciones para adultos mayores
- **Accesibilidad:** Tipografías grandes, alto contraste, navegación por teclado

---

## 📊 Métricas Clave

- **Adherencia**: % sesiones completadas vs planificadas
- **Progresión**: % aumento en carga, repeticiones, tiempo sin dolor
- **Equilibrio**: Time Up & Go, One Leg Stand
- **Salud percibida**: Promedio dolor, fatiga, energía
- **Alertas**: Caídas, dolor agudo, omisiones

---

## 📝 Changelog

Ver [CHANGELOG.md](./CHANGELOG.md) para historial de versiones.

---

## 📄 Licencia

Este proyecto es **privado** y propietario. Todos los derechos reservados.

---

## 📞 Contacto

- **Proyecto**: ATLAS
- **Owner**: Aldo Olivas
- **Email**: [Tu email aquí]
- **GitHub**: [@aldoolivas](https://github.com/aldoolivas)

---

**¡Construyendo el futuro del fitness para adultos mayores! 💪🏠🌟**
