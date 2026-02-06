# Product Context (Docs)

Este documento resume el contexto del producto con foco técnico y operativo.

## Tech Stack
- Frontend: React 18 + TypeScript + Three.js + Vite
- Backend: FastAPI (Python 3.11) + Celery workers (opcional)
- Database: Supabase (PostgreSQL) — Auth, Realtime
- Storage: Supabase Storage (S3-compatible buckets) — integrado para `raw-uploads` and `quality-control`
- AI: LangGraph + OpenAI (integraciones controladas)
- Dev tooling: Docker, docker-compose, Makefile

## DevOps / Workflow
- El proyecto está dockerizado; los desarrolladores usan `make` para tareas comunes:
  - `make up` : Levanta servicios via docker-compose
  - `make init-db` : Inicializa infraestructura necesaria (crea buckets/semillas)
  - `make test` : Ejecuta la suite de pruebas
  - `make test-infra` / `make test-storage` : Ejecuta pruebas de integración relacionadas con storage

- Las variables sensibles se gestionan mediante `.env` y se inyectan en los contenedores en tiempo de ejecución.

## Notas de Integración
- Supabase Storage está integrado mediante un script de inicialización (`infra/init_db.py`) que usa la API oficial de Supabase para crear buckets y configurar opciones.
- Intentos previos de crear `storage.buckets` vía conexión directa PostgreSQL se descartaron (no disponible directamente desde psql). Se eligió usar la Storage API para mantener compatibilidad y seguridad.

## Estado Actual (Sprint 1)
- T-002-BACK: [DONE] - Endpoint para generar presigned URLs implementado y verificado.
- T-005-INFRA: [DONE] - Bucket `raw-uploads` provisionado y tests de integración pasando.
- Repositorio reorganizado: `/infra` contiene scripts de mantenimiento e IaC auxiliares.

## Recomendaciones
- Mantener `infra/` como la única fuente para scripts de provisioning y migrations.
- Documentar cualquier cambio de infra en `docs/` y en `prompts.md` para trazabilidad.
