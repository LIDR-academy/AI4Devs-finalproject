# Implementation Plan: Servicio Público de Verificación de Certificados

**Branch**: `006-servicio-publico-verificacion` | **Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-servicio-publico-verificacion/spec.md`

## Summary

Implementar el API público del microservicio `verificacion` (puerto 8083) para HU-14 / EPIC-02 (TKT-010..013): validar código de 14 caracteres `A–Z0–9`, entregar PDF en Base64 desde S3, registrar auditoría solo vía `POST` explícito, y rate limit compartido 100 req/s por IP (Bucket4j + Redis) con fallback permisivo. Se apoya en el esquema Liquibase de `005-modelo-datos-verificaciones`, en `shared-kernel` / `shared-auth` / `shared-contracts`, y en Clean Architecture + CQRS + TDD. Sin frontend, sin PUP/TiendaWS/SHD, sin cambios de DDL.

## Technical Context

**Language/Version**: Java 25 LTS (Eclipse Temurin); Spring Boot 4.1.x; Gradle 9.x (Kotlin DSL).

**Primary Dependencies**: Spring Web / Validation / JDBC / Security OAuth2 Resource Server (`shared-auth`), AWS SDK v2 S3, Spring Data Redis (Lettuce), Bucket4j (+ extensión Redis), JUnit 5, Mockito, AssertJ, ArchUnit, MockMvc, Testcontainers (SQL Server, Redis, LocalStack S3).

**Storage**: SQL Server 2022 — esquema `verificaciones` (tablas ya creadas en 005). Amazon S3 — objetos PDF por `nombre_archivo`. Redis 7 — buckets de rate limit (`rate:verificacion:{ip}`).

**Testing**: TDD obligatorio (Red → Green → Refactor) por capa: domain/application unitarios → JDBC IT → S3 IT (LocalStack) → MockMvc / SpringBootTest rate limit. Cobertura ≥ 80% en lógica de aplicación/dominio. ArchUnit: application no depende de Spring ni de infrastructure.

**Target Platform**: JVM en contenedores Linux; servicio `verificacion-api` en 8083; Compose local (SQL Server + Redis + LocalStack opcional).

**Project Type**: Microservicio REST público dentro del monorepo Gradle (módulos existentes `verificacion-application` / `verificacion-infrastructure` / `verificacion-api` — sin módulo `verificacion-domain` separado; VO/excepciones de dominio viven en `application` + `shared-kernel`).

**Performance Goals**: Validación P95 < 500 ms (SC-001 / RNF-03). Rate limit 100 req/s por IP compartido entre las 3 operaciones.

**Constraints**: Endpoints públicos sin JWT; código solo `^[A-Z0-9]{14}$`; vigencia 60 días calendario en `America/Bogota`; PDF solo Base64 (no URL pre-firmada en este flujo); audit solo vía POST tras código vigente; fallback permisivo si Redis cae; sin secretos en YAML; CORS `*.ccb.org.co`; sin PUP/TiendaWS/SHD; sin frontend (TKT-067).

**Scale/Scope**: 3 endpoints REST + filter de rate limit + adaptadores JDBC/S3/Redis; excepciones de dominio y mapeo HTTP (400/404/410/429/503); wiring `shared-auth` en `verificacion-api`.

## Constitution Check

*GATE: Debe pasar antes de Phase 0. Re-evaluado tras Phase 1.*

| Principio | Aplicabilidad | Cumplimiento del plan |
|---|---|---|
| I. Stack Tecnológico Fijo | Alta | Java 25, Spring Boot 4.1, SQL Server, Redis 7, AWS SDK v2. Bucket4j justificado por constitución XI / RNF-15. ✅ |
| II. Clean Architecture + CQRS | Alta | Queries/handlers en `application`; ports; JDBC/S3/Redis en `infrastructure`; controllers en `api`. ArchUnit. ✅ |
| III. Base de Datos | Alta | Solo `NamedParameterJdbcTemplate` sobre tablas existentes; sin JPA; sin nuevos changelogs DDL en esta feature. ✅ |
| IV. Integraciones SOAP | N/A | Explicitamente fuera de alcance. ✅ |
| V. Resiliencia e Idempotencia | Alta | Fallback permisivo si Redis no disponible; S3 `NoSuchKey` → dominio; timeouts S3 explícitos. ✅ |
| VI. Auth y CORS | **Central** | Extender `SecurityConfig`: `permitAll` en `/api/v1/verificaciones/**`; cablear `shared-auth` en `verificacion-api`. CORS centralizado. ✅ |
| VII. Seguridad y Protección de Datos | Alta | Sin secretos en repo; IP en auditoría (no en logs como PII cruda); PDF no público en bucket. **Excepción documentada**: entrega Base64 (clarificación) vs RNF-19 (URLs pre-firmadas del canal descargas). ✅ |
| VIII. TDD — NO NEGOCIABLE | Alta | Tests primero por capa según tickets TKT-010..013. ✅ |
| IX. Calidad | Alta | Dominio en español; infra/config en inglés; Jakarta Validation en borde. ✅ |
| X. Observabilidad | Media | `correlationId` vía filter existente; logs estructurados; alerta interna FR-010 = log WARN/ERROR + counter Micrometer `verificacion.archivo_ausente` (Dynatrace) cuando código vigente sin archivo S3. ✅ |
| XI. Rendimiento y Capacidad | Alta | P95 < 500 ms validación; Bucket4j + Redis 100 req/s por IP cupo compartido. ✅ |

**Resultado del gate (pre-Phase 0)**: PASS con excepción Base64 vs RNF-19 en Complexity Tracking.

**Re-evaluación post-Phase 1**: PASS. Contratos y data-model no introducen JPA, SOAP, DDL nuevo ni frontend. La excepción Base64 permanece acotada al flujo público de verificación (canal descargas sigue con URLs pre-firmadas).

## Project Structure

### Documentation (this feature)

```text
specs/006-servicio-publico-verificacion/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-verificaciones.md
│   ├── rate-limit.md
│   └── error-mapping.md
├── checklists/
│   └── requirements.md
└── tasks.md             # /speckit-tasks — NO creado aquí
```

### Source Code (repository root)

```text
shared/
├── shared-kernel/          # + CodigoExpiradoException (o subclase DomainException) si se centraliza 410
├── shared-auth/            # SecurityConfig.permitAll(/api/v1/verificaciones/**); GlobalExceptionHandler → 410/429/503
└── shared-contracts/       # StorageService (port): descargarComoBase64(nombreArchivo)

verificacion/
├── verificacion-application/     # pure Java (ccb.pure-java)
│   └── .../application/
│       ├── domain/               # CodigoVerificacion VO, reglas estaVigente(ZoneId)
│       ├── ports/                # CodigoVerificacionRepository, RegistroVerificacionRepository, StorageService (reexport/use shared)
│       ├── ValidarCodigoQuery + ValidarCodigoHandler
│       ├── ObtenerDocumentoQuery + ObtenerDocumentoHandler
│       └── RegistrarVerificacionCommand + RegistrarVerificacionHandler
├── verificacion-infrastructure/
│   └── .../infrastructure/
│       ├── persistence/          # JDBC repos NamedParameterJdbcTemplate
│       ├── storage/              # S3StorageService (AWS SDK v2)
│       └── ratelimit/            # RateLimitFilter, RateLimitConfig (Bucket4j + Redis)
└── verificacion-api/
    ├── build.gradle.kts          # + shared-auth, redis, aws, bucket4j, validation
    └── .../api/
        ├── VerificacionApplication.java   # @Import / scan shared.auth + shared.web
        └── VerificacionesController.java  # GET /{codigo}, GET /{codigo}/documento, POST /{codigo}/registros

gradle/libs.versions.toml         # + aws-sdk, bucket4j, spring-data-redis (si faltan)
```

**Structure Decision**: Seguir el monorepo real de 3 módulos `verificacion-*` (no crear `verificacion-domain` salvo decisión futura de settings). Dominio de verificación como paquete `application.domain` (Java puro, verificado por ArchUnit). Port S3 en `shared-contracts` para reutilizar en `descargas`. Rate limit como filter en infrastructure registrado desde api. Extender `shared-auth` para el `permitAll` público (única fuente de SecurityFilterChain).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Entrega PDF en Base64 en verificación vs RNF-19 / constitución VII (URLs pre-firmadas S3) | Justificado por [ADR-0002](../../docs/adr/ADR-0002-entrega-pdf-base64-verificacion-publica.md) (Aceptada 2026-07-29): clarificación Q2:A + TKT-011; portal pdf.js con Base64; bucket sigue no público; sin URL S3 al cliente anónimo | URL pre-firmada ampliaría localizadores S3 en canal anónimo y rompe el contrato del portal; RNF-19 permanece intacto en `descargas` |
