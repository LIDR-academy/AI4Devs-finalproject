# Data Model — Andamiaje Base del Monorepo

**Feature**: `001-andamiaje-monorepo` | **Date**: 2026-07-27

Esta feature es de infraestructura estructural: **no introduce entidades de datos de negocio**. El "modelo" relevante es el **grafo de módulos** del monorepo y sus reglas de dependencia, que ArchUnit y Gradle deben hacer cumplir.

## Módulos (nodos)

| Módulo | Tipo | Framework | Paquete raíz |
|---|---|---|---|
| `build-logic` | Composite build | Kotlin DSL | — |
| `shared-kernel` | Java puro | No | `co.org.ccb.certificados.shared.kernel` |
| `shared-contracts` | Java puro | No | `co.org.ccb.certificados.shared.contracts` |
| `shared-auth` | Spring | Sí (Security) | `co.org.ccb.certificados.shared.auth` |
| `solicitudes-domain` | Java puro | No | `co.org.ccb.certificados.solicitudes.domain` |
| `solicitudes-application` | Java puro | No | `co.org.ccb.certificados.solicitudes.application` |
| `solicitudes-infrastructure` | Spring | Sí | `co.org.ccb.certificados.solicitudes.infrastructure` |
| `solicitudes-api` | Spring Boot app | Sí | `co.org.ccb.certificados.solicitudes.api` |
| `descargas-application` | Java puro | No | `co.org.ccb.certificados.descargas.application` |
| `descargas-infrastructure` | Spring | Sí | `co.org.ccb.certificados.descargas.infrastructure` |
| `descargas-api` | Spring Boot app | Sí | `co.org.ccb.certificados.descargas.api` |
| `verificacion-application` | Java puro | No | `co.org.ccb.certificados.verificacion.application` |
| `verificacion-infrastructure` | Spring | Sí | `co.org.ccb.certificados.verificacion.infrastructure` |
| `verificacion-api` | Spring Boot app | Sí | `co.org.ccb.certificados.verificacion.api` |
| `portal-certificados` | Angular 22 app | Angular | — |
| `portal-verificacion` | Angular 22 app | Angular | — |

## Reglas de dependencia (aristas permitidas)

Las dependencias fluyen **solo hacia adentro** (Clean Architecture, Principio II):

```text
<servicio>-api            → <servicio>-application, <servicio>-infrastructure, shared-auth, shared-contracts
<servicio>-infrastructure → <servicio>-application, (solicitudes-domain), shared-contracts, shared-kernel
<servicio>-application    → (solicitudes-domain), shared-kernel        [Java puro]
solicitudes-domain        → shared-kernel                              [Java puro]
shared-kernel             → (nada)                                     [Java puro]
shared-contracts          → shared-kernel                              [Java puro]
shared-auth               → shared-contracts, shared-kernel
```

Para `descargas` y `verificacion` (sin módulo `domain`), la capa `application` referencia `shared-kernel` directamente.

## Invariantes estructurales (verificadas por ArchUnit / Gradle)

- **INV-1**: `*-domain` y `*-application` NO dependen de ningún paquete de framework (`org.springframework..`, `jakarta.persistence..`, `org.apache.cxf..`, `software.amazon.awssdk..`).
- **INV-2**: `*-domain`/`*-application` NO dependen de `*-infrastructure` ni de `*-api` (dependencia solo hacia adentro).
- **INV-3**: Ningún módulo de un servicio depende de módulos de otro servicio (aislamiento entre microservicios); la reutilización ocurre solo vía `shared/*`.
- **INV-4**: `shared-kernel` no depende de ningún otro módulo del monorepo.
- **INV-5**: Todo módulo backend declara el paquete raíz `co.org.ccb.certificados`.

## Transiciones de estado

No aplica: no hay entidades con ciclo de vida en esta feature.
