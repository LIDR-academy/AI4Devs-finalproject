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

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/sagrada-familia/parts-manager.git
cd parts-manager

# Instalar dependencias
cd frontend && npm install
cd ../backend && pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env

# Ejecutar en modo desarrollo
npm run dev  # Frontend (puerto 3000)
python -m uvicorn main:app --reload  # Backend (puerto 8000)
```

**Más información**: Ver [Getting Started](./docs/00-index.md#-getting-started) en la documentación completa.

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
- **Email**: [email@proyecto.com]
- **GitHub**: [@usuario](https://github.com/usuario)

---

<p align="center">
  <i>Construido con ❤️ para la gestión del patrimonio arquitectónico mundial</i>
</p>
