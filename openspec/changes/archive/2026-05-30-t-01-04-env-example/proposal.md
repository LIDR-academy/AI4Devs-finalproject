# Proposal — T-01-04 · Crear .env.example con todas las variables documentadas

**Ticket:** T-01-04  
**User Stories:** US-01 — Configurar repositorio, herramientas de desarrollo y estructura del proyecto · US-23 — [NFR] Entorno de producción y pipeline CI/CD  
**Sprint:** 0 · Scaffolding e Infraestructura

## Why

Los desarrolladores que clonan ConRutina deben saber qué variables de entorno configurar antes de levantar Docker, Prisma y el API. Hoy el repositorio documenta variables en `README.md` y `docs/development_guide.md`, pero **no existe** un `.env.example` versionado; el propio README advierte de esa ausencia. Sin una plantilla única y comentada, el onboarding depende de copiar fragmentos dispersos y aumenta el riesgo de omitir claves obligatorias como `DATABASE_URL`.

## What Changes

- Crear `.env.example` en la raíz con las ocho variables exigidas por el DoD del ticket, cada una con un comentario de una línea y valores de ejemplo **no secretos** alineados con `docker-compose.yml` y el código actual.
- Verificar que `.gitignore` sigue excluyendo `.env` (valores reales) y permitiendo `.env.example` (ya configurado con `!.env.example`).
- Actualizar `README.md` — sección **Instalación** — para indicar explícitamente copiar `.env.example` → `.env` en lugar de inferir variables desde la tabla de configuración.
- Ajustar `docs/development_guide.md` para referenciar `.env.example` como fuente canónica de variables (sin duplicar secretos).

## Capabilities

### New Capabilities

- `env-example`: Plantilla versionada `.env.example` con variables documentadas, coherencia con Docker Compose y referencias en documentación de instalación.

### Modified Capabilities

_(Ninguna — no se alteran requisitos normativos de specs existentes en `openspec/specs/`; el `.gitignore` que excluye `.env` ya está cubierto por `monorepo-scaffold`.)_

## Impact

- **Raíz:** nuevo fichero `.env.example`; posibles ajustes menores en `README.md` y `docs/development_guide.md`.
- **Runtime:** sin cambios en código de aplicación; el API sigue cargando `.env` real vía `backend/src/loadEnv.ts`.
- **Dependencias:** ninguna npm nueva.
- **Tickets posteriores:** T-02-01 y validación Zod de env (T-06-01) consumirán la misma plantilla como referencia.

## Non-goals

- Implementar validación Zod de variables al arranque (T-06-01).
- Añadir variables no listadas en el DoD de T-01-04 (p. ej. secrets de CI, tokens de terceros).
- Crear o modificar `docker-compose.yml` (T-02-01 ya parcialmente presente; fuera del alcance de este ticket).
- Commitear ficheros `.env` con credenciales reales.
- Cambiar el comportamiento del backend cuando falta `.env` (mensaje Zod citando `.env.example` queda para tickets de backend config).

## Criterios de aceptación (US-01 / US-23 — alcance T-01-04)

| Escenario | Aplicabilidad en T-01-04 |
|-----------|---------------------------|
| US-01 Scenario 2 — `.gitignore` excluye `.env` | **Verificar** — ya implementado; no reintroducir `.env` al repo |
| US-01 Scenario 4 — Edge case `.env` faltante con mensaje claro | **Fuera de scope** — validación explícita en T-06-01; este ticket solo entrega la plantilla |
| US-02 Scenario 2 — Variables `POSTGRES_*` en `.env` para Docker | **Parcial** — `.env.example` documenta las claves; el arranque de Docker sigue siendo US-02/T-02-01 |
| US-23 — Entorno reproducible / CI | **Parcial** — la plantilla es prerequisito documental para pipelines y despliegues; Dockerfiles y GitHub Actions quedan en US-23 |
