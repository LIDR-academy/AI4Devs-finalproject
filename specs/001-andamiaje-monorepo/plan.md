# Implementation Plan: Andamiaje Base del Monorepo

**Branch**: `001-andamiaje-monorepo` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-andamiaje-monorepo/spec.md`

## Summary

Crear el esqueleto del monorepo del sistema de Certificados Electrónicos CCB: un proyecto Gradle 9 multi-módulo (Kotlin DSL) con tres microservicios backend (solicitudes con 4 módulos; descargas y verificacion con 3 cada uno), tres módulos compartidos (`shared-kernel`, `shared-auth`, `shared-contracts`), dos aplicaciones Angular 22 independientes y una carpeta de despliegue. El enfoque técnico centraliza versiones en un *version catalog* (`gradle/libs.versions.toml`), factoriza la configuración común en *convention plugins* dentro de un build compuesto `build-logic/`, y verifica la separación de capas con ArchUnit. Cada microservicio arranca de forma independiente (Spring Boot 4.1) exponiendo health checks. No se implementa lógica de negocio, integraciones ni esquema de BD.

## Technical Context

**Language/Version**: Java 25 LTS (Eclipse Temurin) para el backend; TypeScript / Angular 22 para los frontends.

**Primary Dependencies**: Spring Boot 4.1.x, Spring Framework 7.x, Spring Boot Actuator (health checks); Gradle 9.x (Kotlin DSL) con *version catalog*; ArchUnit (verificación de capas); JUnit 5 + Mockito + AssertJ (test); Logback + codificador JSON (logging estructurado baseline); Angular CLI 22.

**Storage**: N/A en esta feature (SQL Server 2022 + Liquibase se introducen en features posteriores; no hay esquema ni acceso a datos en el andamiaje).

**Testing**: JUnit 5 + AssertJ para pruebas de módulo; ArchUnit para pruebas de arquitectura (reglas de capas); Karma/Jasmine (default Angular) para los frontends. Cada módulo con capacidad de lógica (`domain`, `application`) incluye su carpeta `src/test/java` lista para TDD.

**Target Platform**: Backend sobre JVM en contenedores Linux (puertos 8081/8082/8083); frontends servidos como SPA en navegadores modernos.

**Project Type**: Monorepo de aplicación web — backend multi-módulo Gradle + 2 SPAs Angular independientes + artefactos de despliegue.

**Performance Goals**: N/A en el andamiaje (los SLAs de liquidación P95 < 10 s y verificación P95 < 500 ms aplican a features de negocio posteriores). Meta operativa de esta feature: build completo reproducible y onboarding < 15 min.

**Constraints**: `domain` y `application` sin dependencias de framework (Java puro, verificado por ArchUnit); secretos solo por variables de entorno (nada en texto claro); paquete raíz `co.org.ccb.certificados`; versiones de dependencias en una única fuente de verdad; configuración de build sin duplicación (convention plugins).

**Scale/Scope**: 13 módulos backend (solicitudes ×4, descargas ×3, verificacion ×3, shared ×3) + `build-logic` + 2 apps Angular + carpeta `deploy/`.

## Constitution Check

*GATE: Debe pasar antes de la investigación (Phase 0). Re-evaluado tras el diseño (Phase 1).*

| Principio | Aplicabilidad al andamiaje | Cumplimiento del plan |
|---|---|---|
| I. Stack Tecnológico Fijo | Alta | Usa exclusivamente el stack ratificado (Java 25, Spring Boot 4.1, Gradle 9 Kotlin DSL, Angular 22). Sin dependencias fuera del catálogo. ✅ |
| II. Clean Architecture + CQRS + ArchUnit | Alta | La estructura de módulos materializa las capas; ArchUnit se configura desde el día cero para romper el build ante violaciones. CQRS es estructural (se habilita en features de negocio). ✅ |
| III. Base de Datos (JDBC, Liquibase, sin lógica en SP) | Diferida | No hay acceso a datos ni esquema en el andamiaje. Se deja la ubicación preparada; Liquibase y `NamedParameterJdbcTemplate` se introducen con la primera feature de persistencia. ✅ (N/A justificado) |
| IV. Integraciones SOAP Legacy | Diferida | Sin integraciones en esta feature. La carpeta `wsdl/` se reubicará a `solicitudes-infrastructure/src/main/resources/wsdl/` en su feature. ✅ (N/A) |
| V. Resiliencia e Idempotencia | Diferida | No hay operaciones de negocio. N/A. ✅ |
| VI. Autenticación y CORS | Parcial | `shared-auth` se crea como módulo esqueleto; la config concreta de Cognito Resource Server y CORS centralizado se implementa cuando existan endpoints. Sin secretos en config. ✅ (estructura lista) |
| VII. Seguridad y Protección de Datos | Alta | Secretos por variables de entorno desde el arranque; `.gitignore` excluye `application-local` y credenciales; sin PII en logs (no hay logs de negocio aún). ✅ |
| VIII. TDD — NO NEGOCIABLE | Media | El andamiaje no introduce lógica de negocio (no hay ciclo Red-Green de negocio). Se entrega la estructura de test por módulo y las pruebas de arquitectura (ArchUnit) que fallan si la estructura es incorrecta. La cobertura ≥80% en `domain` aplica cuando se añada lógica. ✅ |
| IX. Calidad | Alta | ArchUnit configurado; nomenclatura (dominio en español, infra/config en inglés); commits convencionales. Linter/format se configuran como convention plugin. ✅ |
| X. Observabilidad | Parcial | Health checks `/health` y `/health/readiness` por servicio (Actuator); baseline de logging JSON con MDC `correlationId`. Métricas/trazas a Dynatrace se cablean con las features de negocio. ✅ (baseline) |
| XI. Rendimiento y Capacidad | Diferida | Sin carga de negocio. N/A. ✅ |

**Resultado del gate**: PASS. Las áreas marcadas como "Diferida/N/A" corresponden a capacidades de negocio que, por definición de alcance (FR-013), no pertenecen al andamiaje; no constituyen violaciones. No se requiere entrada en *Complexity Tracking*.

## Project Structure

### Documentation (this feature)

```text
specs/001-andamiaje-monorepo/
├── plan.md              # Este archivo
├── research.md          # Phase 0 — decisiones técnicas
├── data-model.md        # Phase 1 — grafo de módulos y reglas de dependencia
├── quickstart.md        # Phase 1 — guía de validación (build + run)
├── contracts/           # Phase 1 — contratos estructurales y de health
│   ├── module-structure.md
│   └── health-endpoint.md
├── checklists/
│   └── requirements.md  # Checklist de calidad de la spec
└── tasks.md             # Phase 2 (generado por /speckit.tasks — NO por /speckit.plan)
```

### Source Code (repository root)

```text
certificados-electronicos/                # (raíz actual del repositorio)
├── settings.gradle.kts                    # Declara todos los módulos + build-logic
├── build.gradle.kts                       # Root build (plugins base, versión Gradle)
├── gradle.properties                      # JVM args, flags de build
├── gradle/
│   ├── libs.versions.toml                 # Version catalog centralizado (única fuente de verdad)
│   └── wrapper/                           # Gradle wrapper 9.x
├── build-logic/                           # Composite build — convention plugins
│   ├── settings.gradle.kts
│   └── src/main/kotlin/
│       ├── ccb.java-base.gradle.kts       # Toolchain Java 25, test (JUnit5/AssertJ), ArchUnit
│       ├── ccb.spring-service.gradle.kts  # Spring Boot app + Actuator (para módulos -api)
│       └── ccb.pure-java.gradle.kts       # domain/application sin framework
│
├── solicitudes/                           # 4 módulos
│   ├── solicitudes-domain/                # Java puro
│   ├── solicitudes-application/           # Java puro (use cases, ports)
│   ├── solicitudes-infrastructure/
│   └── solicitudes-api/                   # Spring Boot app :8081
│
├── descargas/                             # 3 módulos (sin domain propio)
│   ├── descargas-application/             # Java puro
│   ├── descargas-infrastructure/
│   └── descargas-api/                     # Spring Boot app :8082
│
├── verificacion/                          # 3 módulos (sin domain propio)
│   ├── verificacion-application/          # Java puro
│   ├── verificacion-infrastructure/
│   └── verificacion-api/                  # Spring Boot app :8083
│
├── shared/                                # 3 módulos
│   ├── shared-kernel/                     # Result<T>, DomainException, base de entidades (Java puro)
│   ├── shared-auth/                       # Esqueleto SecurityConfig (Cognito) + login MAUC
│   └── shared-contracts/                  # DTOs compartidos, interfaces S3
│
├── frontend/                              # 2 apps Angular 22 independientes
│   ├── portal-certificados/
│   └── portal-verificacion/
│
└── deploy/                                # Artefactos de despliegue (estructura base)
    ├── docker/
    └── scripts/
```

Cada módulo backend usa el paquete raíz `co.org.ccb.certificados.<servicio>.<capa>` (p. ej. `co.org.ccb.certificados.solicitudes.domain`). Los frontends se construyen con Angular CLI de forma independiente del build de Gradle.

**Structure Decision**: Monorepo Gradle multi-módulo con *composite build* `build-logic/` para convention plugins y *version catalog* central. Se elige `build-logic/` (build compuesto) sobre `buildSrc/` para evitar invalidaciones de caché de todo el proyecto ante cambios en la lógica de build y para escalar mejor con 13+ módulos (ver `research.md`). `descargas` y `verificacion` no tienen módulo `domain` separado: su lógica de dominio (mínima) reside en la capa `application` y/o en `shared-kernel`, conforme a la arquitectura ratificada.

## Complexity Tracking

> No aplica. El Constitution Check pasó sin violaciones; las áreas diferidas son alcance de features posteriores, no desviaciones de la constitución.
