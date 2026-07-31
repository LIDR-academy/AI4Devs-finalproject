# Implementation Plan: Núcleo Compartido y Seguridad

**Branch**: `002-nucleo-compartido-seguridad` | **Date**: 2026-07-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-nucleo-compartido-seguridad/spec.md`

## Summary

Completar los módulos compartidos `shared-kernel` y `shared-auth` sobre el andamiaje existente (spec 001). `shared-kernel` (Java puro) aporta el tipo `Result<T>`, la jerarquía de `DomainException` y el envoltorio `ApiResponse<T>`. `shared-auth` (con Spring) aporta las piezas web y de seguridad transversales: `CorrelationIdFilter`, `GlobalExceptionHandler`, la configuración OAuth2 Resource Server contra AWS Cognito (`SecurityConfig`, `CognitoProperties`, `JwtDecoder`) y la política CORS centralizada. Todo se desarrolla con TDD (prueba que falla primero) y respetando la separación de capas verificada por ArchUnit.

## Technical Context

**Language/Version**: Java 25 (Eclipse Temurin), toolchain gestionada por Gradle.

**Primary Dependencies**: Spring Boot 4.1.0 — `spring-boot-starter-web`, `spring-boot-starter-oauth2-resource-server`, `spring-boot-starter-validation`; Spring Security 7 (Resource Server, validación JWT contra JWKS de Cognito). Test: JUnit 5 + AssertJ + Mockito, `spring-boot-starter-test`, `spring-security-test`, ArchUnit. `shared-kernel` permanece **sin dependencias de framework**.

**Storage**: N/A (esta feature no persiste datos).

**Testing**: JUnit 5 + AssertJ (unidades de `shared-kernel`); `@WebMvcTest`/`MockMvc` + `spring-security-test` (jwt post-processor) para `GlobalExceptionHandler`, `SecurityConfig`, CORS y `CorrelationIdFilter`; ArchUnit para reglas de capas.

**Target Platform**: Módulos librería del monorepo, consumidos por los `*-api` (JVM en contenedores Linux).

**Project Type**: Librerías compartidas dentro del monorepo Gradle (multi-módulo).

**Performance Goals**: N/A específico; CORS `maxAge=3600` s (cache de preflight). Los SLAs de negocio aplican a features posteriores.

**Constraints**: `shared-kernel` MUST permanecer Java puro (usable por capas `domain`); configuración de Cognito y todo secreto vía variables de entorno; CORS exclusivamente `https://*.ccb.org.co`; `domain`/`application` NO deben depender de `shared-auth`.

**Scale/Scope**: 2 módulos (`shared-kernel`, `shared-auth`); ~6 clases de `shared-kernel` y ~5 de `shared-auth`, con sus pruebas.

## Constitution Check

*GATE: Debe pasar antes de Phase 0. Re-evaluado tras Phase 1.*

| Principio | Aplicabilidad | Cumplimiento del plan |
|---|---|---|
| I. Stack Fijo | Alta | Solo stack ratificado (Spring Boot 4.1, Spring Security 7). Nuevas dependencias (oauth2-resource-server, validation, spring-security-test) se añaden al version catalog. ✅ |
| II. Clean Architecture + ArchUnit | Alta | `shared-kernel` Java puro; `shared-auth` es transversal web/seguridad (no es `domain`/`application`). Se añade regla ArchUnit: `domain`/`application` NO dependen de `shared-auth`. ✅ |
| III. Base de Datos | N/A | Sin persistencia. ✅ |
| IV. SOAP | N/A | Sin integraciones SOAP. ✅ |
| V. Resiliencia/Idempotencia | N/A | Sin operaciones externas. ✅ |
| VI. Autenticación y CORS | **Central** | `SecurityConfig` como Resource Server Cognito; health público; `/api/**` con JWT; CORS central `*.ccb.org.co`; MAUC excluido. ✅ |
| VII. Seguridad y Datos | Alta | Config Cognito y secretos por variables de entorno; sin PII/tokens en logs. ✅ |
| VIII. TDD | **No negociable** | Cada clase se implementa tras una prueba que falla; cobertura ≥ 80% en la lógica nueva. ✅ |
| IX. Calidad | Alta | Jakarta Validation en el borde; `GlobalExceptionHandler`; nombres de dominio en español; commits convencionales. ✅ |
| X. Observabilidad | Media | `CorrelationIdFilter` coloca `correlationId` en MDC (base del logging JSON del andamiaje). ✅ |
| XI. Rendimiento | N/A | Sin carga de negocio. ✅ |

**Resultado del gate**: PASS. Única desviación de nota: el `GlobalExceptionHandler` y el `CorrelationIdFilter` (web) se ubican en `shared-auth` (módulo con Spring) en lugar de `shared-kernel` (que se mantiene puro), lo cual **refuerza** el Principio II. Ver `research.md` D1. Sin entradas en Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-nucleo-compartido-seguridad/
├── plan.md              # Este archivo
├── research.md          # Phase 0 — decisiones
├── data-model.md        # Phase 1 — taxonomía de errores y contrato de respuesta
├── quickstart.md        # Phase 1 — guía de validación
├── contracts/           # Phase 1 — contratos de error, seguridad/CORS y correlation-id
│   ├── error-handling.md
│   ├── security-cors.md
│   └── correlation-id.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
shared/shared-kernel/                         # Java puro (ccb.pure-java)
└── src/main/java/co/org/ccb/certificados/shared/kernel/
    ├── Result.java                           # (ampliar: isFailure, getValue, getError)
    ├── DomainException.java                   # (existe)
    ├── RecursoNoEncontradoException.java      # nuevo
    ├── ConflictoEstadoException.java          # nuevo
    ├── ReglaNegocioException.java             # nuevo
    └── ApiResponse.java                       # nuevo (record puro)

shared/shared-auth/                            # Spring (ccb.java-base + web + security)
├── src/main/java/co/org/ccb/certificados/shared/
│   ├── auth/
│   │   ├── SecurityConfig.java                # OAuth2 Resource Server + JwtDecoder + CORS + registro del filtro
│   │   └── CognitoProperties.java             # @ConfigurationProperties (env)
│   └── web/
│       ├── CorrelationIdFilter.java           # MDC + header
│       └── GlobalExceptionHandler.java        # @RestControllerAdvice → HTTP
└── src/test/java/co/org/ccb/certificados/shared/
    ├── kernel/ResultTest.java                 # (en shared-kernel test)
    ├── web/GlobalExceptionHandlerTest.java
    ├── web/CorrelationIdFilterTest.java
    └── auth/SecurityConfigTest.java
```

**Structure Decision**: Se conserva la división del andamiaje: `shared-kernel` permanece **Java puro** (tipos usables por las capas `domain`) y `shared-auth` concentra las piezas transversales que requieren Spring (web + seguridad). Se añaden a `shared-auth` las dependencias `spring-boot-starter-web`, `spring-boot-starter-oauth2-resource-server` y `spring-boot-starter-validation`. Se añade una regla ArchUnit (en los `*-api`) que prohíbe que `domain`/`application` dependan de `shared-auth`.

## Complexity Tracking

> No aplica. El Constitution Check pasó sin violaciones; la ubicación de las clases web en `shared-auth` refuerza la separación de capas.
