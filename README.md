# BPMN Modeler

Aplicación web de modelado BPMN 2.0 con generación de código por IA, control de versiones, colaboración en tiempo real y sincronización con GitHub.

**URL:** [sdd-ia.com](https://sdd-ia.com)

- Email: support@sdd-ia.com
- Contraseña: Support2026!
- Rol: admin

Probá login en https://sdd-ia.com/login

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 (CRA + CRACO), Tailwind CSS, shadcn/ui (Radix), bpmn-js |
| Backend | FastAPI (Python 3.11), uvicorn |
| Base de datos | MongoDB (Motor async), Redis (caché opcional) |
| IA | DeepSeek, MiniMax, MIMO, Gemini, OpenAI, Claude (via litellm) |
| Infra | Nginx, Supervisor, Ubuntu 24.04 VPS |
| Pagos | Stripe (suscripciones) |
| Email | Resend |

## Funcionalidades principales

- **Editor BPMN 2.0** — Modelado visual de diagramas con bpmn-js, panel de propiedades, comentarios y componentes reutilizables
- **Generación con IA** — Crear diagramas BPMN desde descripciones en lenguaje natural y generar código (SudoLang, Python, Node.js, Java, C#, Go) desde procesos de negocio
- **Control de versiones** — Historial tipo Git con ramas, merge y diff entre versiones de diagramas
- **Colaboración en tiempo real** — WebSockets para presencia de cursores, bloqueo de elementos y sincronización de XML
- **Vinculación GitHub** — Sincronizar proyectos con repositorios GitHub (push/pull de archivos BPMN y documentación)
- **Proyectos y equipos** — Gestión de proyectos con fases (análisis, diseño, implementación), equipos, y compartición de recursos
- **Especificaciones** — Documentos de requisitos con versionado y diff
- **Plantillas** — Proyectos predefinidos (orden de compra, onboarding de empleados, etc.)
- **Multi-idioma** — Interfaz en español e inglés
- **Planes** — Free, Pro (19€/mes) y Team (49€/mes) con trial de 14 días

## Estructura del proyecto

```
├── backend/
│   ├── server.py              # App FastAPI principal
│   ├── database.py            # Conexión MongoDB (Motor)
│   ├── models.py              # Modelos Pydantic
│   ├── limits.py              # Límites del plan gratuito
│   ├── cache.py               # Caché TTL (Redis/memoria)
│   ├── email_service.py       # Email transaccional (Resend)
│   ├── templates.py           # Plantillas de proyectos
│   ├── routers/               # 30+ módulos de rutas API
│   │   ├── auth.py            # Autenticación JWT + Google + SAML
│   │   ├── diagrams.py        # CRUD de diagramas BPMN
│   │   ├── projects.py        # CRUD de proyectos + GitHub link
│   │   ├── ai.py              # Chat IA y generación BPMN
│   │   ├── ai_codegen.py      # Generación de código desde diagramas
│   │   ├── git.py             # Sincronización con repos Git
│   │   ├── payments.py        # Stripe
│   │   ├── specs.py           # Especificaciones con versionado
│   │   └── ...
│   └── tests/                 # Tests con pytest
├── frontend/
│   ├── src/
│   │   ├── App.js             # Componente raíz, rutas, AuthContext
│   │   ├── pages/             # Páginas (BpmnEditor, Projects, Admin...)
│   │   ├── components/        # Componentes reutilizables y UI
│   │   │   ├── ui/            # Componentes shadcn/ui (Radix)
│   │   │   └── editor-panels/ # Paneles del editor BPMN
│   │   ├── hooks/             # Hooks personalizados
│   │   ├── contexts/          # Contextos (i18n, UpgradeModal)
│   │   └── lib/               # Utilidades
│   └── build/                 # Build de producción
├── scripts/                   # Scripts de utilidad y deploy
├── update.sh                  # Actualización en producción (main)
└── design_guidelines.json     # Guía de diseño visual
```

## Desarrollo local

### Requisitos

- Python 3.11+
- Node.js 18+
- MongoDB (local o remoto)
- Redis (opcional, para caché)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

pip install -r requirements.txt

# Configurar variables de entorno en backend/.env
cp .env.example .env

# Iniciar servidor (dev)
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend

```bash
cd frontend
yarn install
yarn start  # Dev server en puerto 3000
```

### Tests

```bash
# Backend
cd backend && pytest -v

# Frontend
cd frontend && yarn test
```

## Despliegue

El servidor de producción está en **sdd-ia.com** (Ubuntu 24.04, Nginx, Supervisor).

```bash
# La aplicación se actualiza desde la rama 'dev' con:
/home/ubuntu/update-dev.sh

# O desde 'main':
sudo ./update.sh main
```

Ver [`CLAUDE.md`](CLAUDE.md) para más detalles de arquitectura y configuración del servidor.

## Licencia

Copyright (c) 2026 sdd-ia, LLC. Todos los derechos reservados.
