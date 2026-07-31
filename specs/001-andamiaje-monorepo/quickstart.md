# Quickstart — Validación del Andamiaje del Monorepo

**Feature**: `001-andamiaje-monorepo` | **Date**: 2026-07-27

Guía para validar que el andamiaje cumple la especificación. No contiene código de implementación; describe cómo comprobar que la estructura compila y arranca.

## Prerrequisitos

- **JDK 25** (Eclipse Temurin) — o dejar que la *Java toolchain* de Gradle lo gestione.
- **Node.js LTS** compatible con Angular 22 (para los frontends).
- **Git** con el repositorio clonado; rama por defecto `DEV`.
- No se requiere SQL Server, Redis ni credenciales AWS para esta feature.

## Escenario 1 — Build backend completo (valida US1, SC-001, SC-005)

```bash
# Desde la raíz del repositorio
./gradlew build
```

**Resultado esperado**: `BUILD SUCCESSFUL`. Compilan los 13 módulos backend y pasan las pruebas ArchUnit.

Verificación de módulos declarados:

```bash
./gradlew projects
```

**Resultado esperado**: la lista incluye los 3 servicios con sus módulos (solicitudes ×4, descargas ×3, verificacion ×3) y `shared` ×3.

## Escenario 2 — Separación de capas (valida US1 escenario 3, SC-006)

- Intentar (temporalmente) importar una clase de `org.springframework` en un módulo `*-application` o `solicitudes-domain` y ejecutar `./gradlew build`.

**Resultado esperado**: el build **falla** por violación de regla ArchUnit (INV-1). Revertir el cambio de prueba.

## Escenario 3 — Arranque independiente de cada servicio (valida US2, SC-002)

En terminales separadas:

```bash
./gradlew :solicitudes:solicitudes-api:bootRun
./gradlew :descargas:descargas-api:bootRun
./gradlew :verificacion:verificacion-api:bootRun
```

Comprobar los health checks:

```bash
curl http://localhost:8081/health            # solicitudes
curl http://localhost:8081/health/readiness
curl http://localhost:8082/health            # descargas
curl http://localhost:8083/health            # verificacion
```

**Resultado esperado**: cada llamada responde `200 OK` con `{"status":"UP"}`. Cada servicio arranca sin depender de los otros.

## Escenario 4 — Frontends compilan (valida US3, SC-007)

```bash
cd frontend/portal-certificados && npm install && npm run build
cd ../portal-verificacion && npm install && npm run build
```

**Resultado esperado**: ambas compilaciones terminan con éxito de forma independiente.

## Escenario 5 — Estructura de despliegue (valida US3 escenario 3, FR-004)

- Verificar que existe la carpeta `deploy/` con `deploy/docker/` y `deploy/scripts/`.

**Resultado esperado**: la estructura base existe.

## Escenario 6 — Onboarding (valida SC-003)

- En una máquina limpia con los prerrequisitos instalados: clonar → `./gradlew build`.

**Resultado esperado**: build exitoso en menos de 15 minutos sin pasos manuales adicionales (más allá de los prerrequisitos documentados en el README).

## Referencias

- Estructura y comandos: [contracts/module-structure.md](./contracts/module-structure.md)
- Health checks: [contracts/health-endpoint.md](./contracts/health-endpoint.md)
- Grafo de módulos y reglas: [data-model.md](./data-model.md)
- Decisiones técnicas: [research.md](./research.md)
