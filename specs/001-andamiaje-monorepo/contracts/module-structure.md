# Contract — Estructura de Módulos y Build

**Feature**: `001-andamiaje-monorepo`

Este contrato define la estructura que el andamiaje DEBE cumplir. Es verificable por inspección de `settings.gradle.kts`, por la compilación y por las pruebas ArchUnit.

## C1 — Módulos declarados

`settings.gradle.kts` DEBE incluir exactamente estos 13 módulos backend:

```text
:shared:shared-kernel
:shared:shared-contracts
:shared:shared-auth
:solicitudes:solicitudes-domain
:solicitudes:solicitudes-application
:solicitudes:solicitudes-infrastructure
:solicitudes:solicitudes-api
:descargas:descargas-application
:descargas:descargas-infrastructure
:descargas:descargas-api
:verificacion:verificacion-application
:verificacion:verificacion-infrastructure
:verificacion:verificacion-api
```

Y el build compuesto `build-logic` incluido vía `includeBuild("build-logic")`.

## C2 — Comando de build

- **Entrada**: `./gradlew build` ejecutado desde la raíz.
- **Salida esperada**: `BUILD SUCCESSFUL`; todos los módulos compilan y sus pruebas (incluidas ArchUnit) pasan.

## C3 — Comandos de arranque

| Servicio | Comando | Puerto |
|---|---|---|
| solicitudes | `./gradlew :solicitudes:solicitudes-api:bootRun` | 8081 |
| descargas | `./gradlew :descargas:descargas-api:bootRun` | 8082 |
| verificacion | `./gradlew :verificacion:verificacion-api:bootRun` | 8083 |

Cada servicio DEBE arrancar de forma independiente (sin requerir que los otros estén levantados).

## C4 — Version catalog

- **Ubicación**: `gradle/libs.versions.toml`.
- **Contrato**: toda dependencia externa usada por cualquier módulo se declara aquí; ningún módulo fija versiones literales de dependencias externas en su `build.gradle.kts`.

## C5 — Convention plugins

`build-logic` DEBE proveer, como mínimo:
- `ccb.pure-java` — módulos Java puro (`domain`, `application`, `shared-kernel`, `shared-contracts`): toolchain Java 25, JUnit 5 + AssertJ, ArchUnit; sin dependencias de framework.
- `ccb.spring-service` — módulos `-api`: Spring Boot 4.1 + Actuator + configuración de aplicación ejecutable.
- (base común) toolchain Java 25 y configuración de test compartida.

## C6 — Reglas ArchUnit (ver data-model.md INV-1..INV-5)

Las pruebas ArchUnit DEBEN fallar el build si se violan las invariantes INV-1 a INV-5.
