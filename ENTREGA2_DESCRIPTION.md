# ENTREGA 2

## 🎯 HITOS

- ✅ **Estabilización del proyecto** y descripción técnica de infraestructura (carpeta `techdesign`)
  - 📋 [README.md](techdesign/README.md) - Documentación general de la arquitectura
  - 🏗️ [01-arquitectura-datos-persistencia.md](techdesign/01-arquitectura-datos-persistencia.md) - Arquitectura de datos y persistencia
  - ⚙️ [02-configuracion-devops-entornos.md](techdesign/02-configuracion-devops-entornos.md) - Configuración DevOps y entornos
  - 🔧 [03-capas-servicio-backend-worker.md](techdesign/03-capas-servicio-backend-worker.md) - Capas de servicio, backend y worker
  - 🎨 [04-frontend-contenedores.md](techdesign/04-frontend-contenedores.md) - Frontend y contenedores
  - 📊 [database_schema.md](techdesign/database_schema.md) - Esquema de base de datos
  - 💡 [05-recomendacion-alto-nivel.md](techdesign/05-recomendacion-alto-nivel.md) - Recomendaciones de alto nivel
- ✅ **Desarrollo de la primera funcionalidad**: analizar documentos acroform y visualizar en pantalla
  - 📄 [prompts/prompt-analyze-pdf-backend.md](prompts/prompt-analyze-pdf-backend.md) - Prompt para análisis de PDF en backend
    - 📋 Creación de specs y tasks con agent-os en: [specs/2025-10-05-pdf-template-analysis](specs/2025-10-05-pdf-template-analysis)
  - 📄 [prompts/prompt-analyze-pdf-frontend.md](prompts/prompt-analyze-pdf-frontend.md) - Prompt para análisis de PDF en frontend
    - 📋 Creación de specs y tasks con agent-os en: [specs/2025-10-05-frontend-template-analyzer](specs/2025-10-05-frontend-template-analyzer)
  - 🎥 [demo/acroformAnalysis.mp4](demo/acroformAnalysis.mp4) - Video demostrativo del análisis de acroform

## 🎯 Objetivos para la Entrega Final

### 🚀 Funcionalidades Principales

- **📊 Comparador de documentos** e historificación en base de datos _(objetivo principal del proyecto)_
- **🤖 Integración con LLM** para detectar el texto próximo a un input
- **👥 Gestión de usuarios y permisos** - Sistema de autenticación y autorización

### 🐛 Mejoras Técnicas

- **🔧 Bugfixing**: Resolver problemas de UX (ej: seleccionar documento dos veces)
- **🐳 Containerización completa**: Arrancar todas las capas en contenedores
  ```
  postgres → redis → backend → frontend
  ```

### 📚 Documentación

- **📖 Completar/organizar documentación** del proyecto _(hay un poco de caos 😅)_

## 🚀 1. Secuencia de Arranque Completa (`STARTUP`)

|  No.  | Comando                                                         | Ubicación de Ejecución       | Propósito                                                                                                                                                                                                                       |
| :---: | :-------------------------------------------------------------- | :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1** | `podman-compose -f docker-compose.dev.yml up -d postgres redis` | Raíz del Proyecto            | Arranca los contenedores **Postgres** y **Redis** en segundo plano (infraestructura)                                                                                                                                            |
| **2** | `cd backend`                                                    | Carpeta `/backend`           | Navega al directorio del backend                                                                                                                                                                                                |
| **3** | `source venv/bin/activate`                                      | Carpeta `/backend`           | Activa el entorno virtual de Python                                                                                                                                                                                             |
| **4** | `alembic upgrade head`                                          | Carpeta `/backend`           | Ejecuta las migraciones de base de datos pendientes (asegura que el esquema esté actualizado)<br/>_Ver nuestra bbdd si la hemos limpiado/actualizado:_<br/>`podman exec -it sepe-postgres psql -U sepe_user -d sepe_comparator` |
| **5** | `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`      | Terminal nueva (`/backend`)  | Arranca el servicio **Backend** (FastAPI) con _hot-reload_                                                                                                                                                                      |
| **6** | `cd ../frontend`                                                | Terminal nueva (`/frontend`) | Navega al directorio del frontend                                                                                                                                                                                               |
| **7** | `npm install` _(Solo si hay cambios)_                           | Carpeta `/frontend`          | Instala nuevas dependencias de Node.js, si el `package.json` ha cambiado                                                                                                                                                        |
| **8** | `npm run dev`                                                   | Carpeta `/frontend`          | Arranca el servicio **Frontend** (Vite/React)                                                                                                                                                                                   |

## 🛑 2. Secuencia de Parada Segura (`SHUTDOWN`)

> **Objetivo:** Liberar los puertos y detener los procesos de forma limpia (con `Ctrl + C` para procesos nativos y `down` para contenedores)

|  No.  | Comando                                                        | Ubicación de Ejecución       | Propósito                                                                   |
| :---: | :------------------------------------------------------------- | :--------------------------- | :-------------------------------------------------------------------------- |
| **1** | `Ctrl + C`                                                     | Terminal de `uvicorn`        | Detiene el servicio **Backend** (FastAPI) de forma elegante                 |
| **2** | `Ctrl + C`                                                     | Terminal de `npm run dev`    | Detiene el servicio **Frontend** (Vite/React) de forma elegante             |
| **3** | `Ctrl + C`                                                     | Terminal del `worker` Celery | Detiene el proceso **Worker** (si lo tienes activo)                         |
| **4** | `podman-compose -f docker-compose.dev.yml down postgres redis` | Raíz del Proyecto            | Detiene y elimina los contenedores **Postgres** y **Redis** de forma segura |
| **5** | `deactivate`                                                   | Terminal(es) con `(venv)`    | Desactiva el entorno virtual de Python                                      |

## 🌐 URLs de Acceso

### Backend

- **Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
- **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend

- **Análisis de Documentos:** [http://localhost:3000/analyze](http://localhost:3000/analyze)
