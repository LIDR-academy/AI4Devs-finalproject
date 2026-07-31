# Research — Infraestructura, Configuración por Ambiente y CI/CD

**Feature**: `004-infraestructura-config-cicd` | **Date**: 2026-07-28

Decisiones técnicas. El stack proviene de la constitución (Principios I, VII, X); aquí se decide **cómo** se organiza la entrega.

---

## D1 — Datasource/Redis: config declarativa, autoconfiguración diferida

- **Decisión**: `application.yml` base declara `spring.datasource.*` y `spring.data.redis.*` como placeholders `${ENV}`, pero los servicios del andamiaje **no** añaden aún el starter JDBC/Redis ni activan su autoconfiguración; siguen arrancando sin BD. La activación ocurre por servicio en su feature de persistencia (p. ej. 005 para verificación).
- **Rationale**: Cumple FR-006 (config declarada) sin romper el arranque actual (SC-001/health) ni forzar conexiones a BD inexistentes.
- **Alternativas**: Activar datasource ya → obligaría a levantar SQL Server para cualquier arranque y añadir drivers sin uso; descartado.

## D2 — Imágenes Docker y parámetros JVM por servicio

- **Decisión**: Base `eclipse-temurin:25-jre-alpine`. `solicitudes` `-Xmx1024m` + G1GC (mayor carga); `descargas` `-Xmx512m` + ZGC; `verificacion` `-Xmx512m` + G1GC. Perfil `production`/imagen sin herramientas de build (multi-stage: build con JDK, runtime con JRE).
- **Rationale**: Cumple TKT-004; dimensiona recursos por perfil de carga esperado.
- **Alternativas**: Imagen única genérica → no optimiza memoria por servicio; descartado.

## D3 — Docker Compose con dependencias y health checks

- **Decisión**: `docker-compose.yml` con servicios `solicitudes`(8081), `descargas`(8082), `verificacion`(8083), `sql-server`(1433, `mcr.microsoft.com/mssql/server:2022-latest`), `redis`(6379, `redis:7-alpine`); health checks para SQL Server y Redis; `depends_on` con condición de salud. `docker-compose.override.yml` para desarrollo (bind mounts, puertos de debug).
- **Rationale**: Cumple FR-002/FR-003 y SC-001 (< 3 min, health 200).
- **Alternativas**: Scripts ad-hoc por servicio → menos reproducible; descartado.

## D4 — Perfiles Spring por ambiente

- **Decisión**: Perfiles `dev`/`qas`/`stg`/`prd` que solo sobrescriben lo variable: URLs de integraciones, nivel de log (`dev` DEBUG, `qas`/`stg` INFO, `prd` WARN), detalle de health (`dev` always, `qas` when-authorized, `stg`/`prd` never) y observabilidad (Dynatrace activo en `stg`/`prd`). El perfil por defecto (`local`) apunta a Docker Compose.
- **Rationale**: Cumple FR-007/FR-008 y Principio X.
- **Alternativas**: Un solo YAML con condicionales → difícil de auditar; descartado.

## D5 — Gestión de secretos (Variable Groups + `.env.example`)

- **Decisión**: Ningún secreto en archivos versionados. En Azure DevOps, 4 Variable Groups (`vg-dev`/`vg-qas`/`vg-stg`/`vg-prd`) inyectan credenciales en deploy. Para local, `.env.example` documenta todas las variables (sin valores) y el desarrollador crea su `.env` (ignorado por git).
- **Rationale**: Cumple FR-009/FR-015 y Principio VII.
- **Alternativas**: Secrets en el YAML del pipeline → prohibido; descartado.

## D6 — Estructura del pipeline Azure DevOps

- **Decisión**: `azure-pipelines.yml` (raíz) + templates reutilizables. CI: compilar → tests + JaCoCo (gate ≥ 80% en `*-domain`/`*-application`) → tests de integración → OWASP Dependency-Check (falla en Critical) → build+push de imágenes a Amazon ECR (`{servicio}:{SHA}` y `{rama}-latest`; login vía `aws ecr get-login-password`). CD: DEV y QAS automáticos en `develop`; STG y PRD manuales en `main` (STG 1 aprobador, PRD 2 aprobadores), rolling (una instancia), smoke test post-deploy y rollback automático ante fallo; notificación a Teams/email en PRD.
- **Rationale**: Cumple FR-011..FR-018 y Principios VII/IX/X/XI.
- **Nota**: La ejecución real del pipeline y la creación de Variable Groups/Environments ocurren en Azure DevOps (fuera del repositorio); en el repo se entregan los YAML y la documentación.

## D7 — JaCoCo y gate de cobertura

- **Decisión**: Añadir JaCoCo al convention plugin `ccb.java-base` (reporte para todos los módulos) y una verificación de cobertura ≥ 80% aplicada a los módulos de capa pura de negocio (`*-domain`, `*-application`). Se excluyen `package-info` y clases sin lógica; los módulos sin clases ejecutables no rompen el gate.
- **Rationale**: Cumple FR-012, SC-006 y Principio VIII; centraliza la config (single source).
- **Alternativas**: Gate global al 80% en todos los módulos → rompe módulos de solo configuración/infraestructura; descartado. Medir cobertura solo en CI sin gate local → menos preventivo; se deja el gate en el build.

## D8 — Alcance de validación local vs plataforma

- **Decisión**: Validable localmente: `docker compose up` + health (requiere Docker), arranque por perfil, ausencia de secretos, gate JaCoCo. No validable localmente: ejecución del pipeline Azure DevOps, push a Amazon ECR y despliegues a los 4 ambientes (dependen de la plataforma); se validan por estructura/lint del YAML y revisión.
- **Rationale**: Transparencia sobre qué se prueba con evidencia real y qué queda a cargo de plataforma.

---

## Resumen de resolución

Sin marcadores `NEEDS CLARIFICATION`. Decisiones D1–D8 alineadas con la constitución. Dependencias externas (organización Azure DevOps, Amazon ECR, ambientes, Docker local) documentadas como supuestos.
