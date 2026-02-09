# Sagrada Família Parts Manager (SF-PM)

> **Digital Twin Activo para Gestión de Inventario de Piezas CAD con Validación Inteligente**

[![Status](https://img.shields.io/badge/Status-In%20Development-yellow)](./docs/00-index.md)
[![Documentation](https://img.shields.io/badge/Docs-100%25-green)](./docs/)
[![License](https://img.shields.io/badge/License-MIT-blue)](./LICENSE)

---

## 🎯 Descripción

Sistema enterprise que transforma archivos CAD estáticos (Rhino .3dm) en un **gemelo digital activo** para la gestión integral del inventario de decenas de miles de piezas únicas de la Sagrada Família de Barcelona.

**Características clave:**
- ✅ Búsquedas instantáneas (de 3 horas a 10 minutos)
- ✅ Validación automática con IA ("The Librarian" Agent)
- ✅ Trazabilidad completa del ciclo de vida
- ✅ Visualización 3D en navegador (Three.js)
- ✅ Eliminación de errores logísticos (40% → 0%)

---

## 📚 Documentación

**Documentación completa disponible en [`/docs`](./docs/)**

### Índice de Documentación Técnica

| Fase | Documento | Descripción |
|------|-----------|-------------|
| **Índice** | [📑 00-index.md](./docs/00-index.md) | Índice general del proyecto y guía de navegación |
| **Fase 1** | [📘 01-strategy.md](./docs/01-strategy.md) | Análisis del problema y propuesta de valor |
| **Fase 2** | [📘 02-prd.md](./docs/02-prd.md) | Product Requirements Document (PRD) completo |
| **Fase 3** | [📘 03-service-model.md](./docs/03-service-model.md) | Lean Canvas y modelo de negocio |
| **Fase 4** | [📘 04-use-cases.md](./docs/04-use-cases.md) | Casos de uso maestros y diagramas de flujo |
| **Fase 5** | [📘 05-data-model.md](./docs/05-data-model.md) | Modelo de datos PostgreSQL/Supabase |
| **Fase 6** | [📘 06-architecture.md](./docs/06-architecture.md) | Arquitectura Cloud-Native (C4 Model) |
| **Fase 7** | [📘 07-agent-design.md](./docs/07-agent-design.md) | Diseño del agente IA "The Librarian" |
| **Fase 8** | [📘 08-roadmap.md](./docs/08-roadmap.md) | Roadmap de implementación |

---

## 🛠️ Stack Tecnológico

```yaml
Frontend:  React 18 + TypeScript + Three.js + Zustand + Vite
Backend:   FastAPI + Celery Workers + Redis Queue
AI/ML:     LangGraph + OpenAI GPT-4 Turbo
Database:  Supabase (PostgreSQL 15 + Auth + Realtime)
Storage:   S3-compatible buckets
CAD:       rhino3dm + glTF/GLB conversion
```

---

## 🚀 Quick Start

### Prerrequisitos

- Docker (Engine) & Docker Compose
- GNU Make (o `make` compatible). En Windows puede usarse `test.bat` o WSL.
- Variables de entorno configuradas en `.env` (ver `.env.example`)

### Quick Start (Docker + Make)

1. Clonar repositorio y preparar `.env`:

```bash
git clone https://github.com/sagrada-familia/parts-manager.git
cd parts-manager
cp .env.example .env
# Edita .env con los valores reales (SUPABASE_URL, SUPABASE_KEY, SUPABASE_DATABASE_URL, OPENAI_API_KEY, etc.)
```

2. Levantar servicios en contenedores (dev):

```bash
make up
```

3. Inicializar infra (crear buckets / semillas necesarias):

```bash
make init-db
```

4. Ejecutar solo backend (para desarrollo local sin Docker):

```bash
cd src/backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### Testing

Ejecutar la suite de tests:

**Backend:**
```bash
make test        # Ejecuta todos los tests backend (unit + integration)
make test-infra  # Ejecuta tests de infraestructura / integración
make test-storage # Ejecuta test específico de storage
```

**Frontend:**
```bash
make front-install # Instala dependencias npm dentro de Docker
make test-front    # Ejecuta tests de frontend (Vitest)
make front-dev     # Inicia servidor de desarrollo Vite
make front-shell   # Abre shell en contenedor frontend
```

### Desarrollo Frontend

Para trabajar con el frontend (React + TypeScript + Vite):

1. Instalar dependencias (primera vez):
```bash
make front-install
```

2. Iniciar servidor de desarrollo:
```bash
make front-dev
# Accede a http://localhost:5173
```

3. Ejecutar tests en modo watch:
```bash
make test-front
```

### Notas rápidas

- **Node.js NO requerido en el host**: Todo el desarrollo frontend se ejecuta dentro de Docker.
- Volumen anónimo `/app/node_modules` evita conflictos entre Windows y contenedor.
- Para crear o resetear la infraestructura de storage use `make init-db`.
- Las pruebas de integración requieren que las variables `SUPABASE_URL` y `SUPABASE_KEY` estén disponibles en el entorno donde se ejecutan.

**Más información**: Ver [Documentación técnica](./docs)

---

## 🤖 Desarrollo Asistido por IA

Este proyecto utiliza **GitHub Copilot** (Claude Sonnet 4.5) como asistente de desarrollo. 

### Guías de Trabajo
- **[AGENTS.MD](./AGENTS.md)**: Reglas globales del AI Assistant (logging, workflow, definition of done)
- **[AI Best Practices](./.github/AI-BEST-PRACTICES.md)**: Guía de mejores prácticas para trabajo eficiente con el AI
- **[prompts.md](./prompts.md)**: Registro completo de todos los prompts utilizados (trazabilidad)

### Memory Bank
Sistema de estado compartido para trabajo multi-agente:
- **[memory-bank/activeContext.md](./memory-bank/activeContext.md)**: Contexto actual y tareas activas
- **[memory-bank/systemPatterns.md](./memory-bank/systemPatterns.md)**: Patrones arquitectónicos
- **[memory-bank/techContext.md](./memory-bank/techContext.md)**: Stack tecnológico completo
- **[memory-bank/decisions.md](./memory-bank/decisions.md)**: ADRs (Architecture Decision Records)

---

## 📊 Estado del Proyecto

✅ **Completado**: Documentación técnica completa (Fases 1-7)  
🚧 **En Desarrollo**: Implementación del MVP (Fase 8)

---

## 📄 Licencia

Proyecto académico (TFM) con código open-source bajo [MIT License](./LICENSE).  
Datos reales de la Sagrada Família no incluidos por confidencialidad.

---

## 📞 Contacto

- **Documentación**: [`/docs`](./docs/)
- **Email**: [Ver repositorio oficial]
- **GitHub**: [@pedrocortesark](https://github.com/pedrocortesark)

---

<p align="center">
  <i>Construido con ❤️ para la gestión del patrimonio arquitectónico mundial</i>
</p>
