# Quickstart — Validación de Núcleo Compartido y Seguridad

**Feature**: `002-nucleo-compartido-seguridad` | **Date**: 2026-07-28

Guía para validar la feature. No contiene código de implementación.

## Prerrequisitos

- Andamiaje `001` compilando (`./gradlew build` verde).
- JDK 25; no se requiere Cognito real (las pruebas usan `spring-security-test`).

## Escenario 1 — `Result<T>` y jerarquía de errores (valida US1, SC-001)

```bash
./gradlew :shared:shared-kernel:test
```

**Esperado**: `ResultTest` verde (éxito/fallo sin excepciones verificadas); pruebas de la jerarquía `DomainException` verdes.

## Escenario 2 — Mapeo de errores a HTTP (valida US1, SC-002)

```bash
./gradlew :shared:shared-auth:test --tests "*GlobalExceptionHandlerTest"
```

**Esperado**: 404 para `RecursoNoEncontrado`, 409 para `ConflictoEstado`, 422 para `ReglaNegocio`, 400 para validación, 500 para inesperada; cuerpo con `ApiResponse` (ver `contracts/error-handling.md`).

## Escenario 3 — Seguridad Cognito y CORS (valida US2, SC-004, SC-005)

```bash
./gradlew :shared:shared-auth:test --tests "*SecurityConfigTest"
```

**Esperado**: health sin token → 200; `/api/**` sin token o con JWT inválido → 401; CORS desde `https://portal.ccb.org.co` permitido y desde `https://malicio.so` rechazado (ver `contracts/security-cors.md`).

## Escenario 4 — Correlation ID (valida US3, SC-003)

```bash
./gradlew :shared:shared-auth:test --tests "*CorrelationIdFilterTest"
```

**Esperado**: sin header → se genera UUID en MDC y en header de respuesta; con header → se propaga el mismo valor (ver `contracts/correlation-id.md`).

## Escenario 5 — Separación de capas (valida INV-B)

```bash
./gradlew build
```

**Esperado**: `BUILD SUCCESSFUL`; las reglas ArchUnit fallan si `domain`/`application` dependen de `shared-auth`/`shared-web`.

## Escenario 6 — Sin secretos en texto claro (valida SC-007)

- Buscar credenciales/parámetros de Cognito en el código y configuración versionada.

**Esperado**: no se encuentran valores sensibles; toda la config de Cognito se resuelve por variables de entorno.

## Referencias

- [contracts/error-handling.md](./contracts/error-handling.md)
- [contracts/security-cors.md](./contracts/security-cors.md)
- [contracts/correlation-id.md](./contracts/correlation-id.md)
- [data-model.md](./data-model.md) · [research.md](./research.md)
