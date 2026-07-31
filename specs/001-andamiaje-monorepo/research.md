# Research — Andamiaje Base del Monorepo

**Feature**: `001-andamiaje-monorepo` | **Date**: 2026-07-27

Consolida las decisiones técnicas para materializar el andamiaje. Todas las tecnologías provienen del stack fijado por la constitución (Principio I); aquí se decide **cómo** se organizan, no **qué** stack se usa.

---

## D1 — Estructura de build: `build-logic/` (composite build) + version catalog

- **Decisión**: Gradle 9.x con Kotlin DSL. Versiones centralizadas en `gradle/libs.versions.toml` (*version catalog*). La configuración común se factoriza en *convention plugins* alojados en un *composite build* `build-logic/`.
- **Rationale**:
  - El *version catalog* cumple FR-009 (única fuente de verdad para versiones) de forma nativa en Gradle.
  - `build-logic/` como build compuesto evita que un cambio en la lógica de build invalide la caché de compilación de todos los módulos (problema conocido de `buildSrc/`), y escala mejor con 13+ módulos.
  - Los convention plugins cumplen FR-010 (configuración reutilizable sin duplicación): cada módulo aplica un plugin (`ccb.pure-java`, `ccb.spring-service`) en vez de repetir bloques.
- **Alternativas consideradas**:
  - `buildSrc/`: más simple pero invalida caché global ante cualquier cambio de build; descartado por escala.
  - Repetir configuración por módulo: viola FR-010; descartado.
  - Maven: fuera del stack (Principio I); descartado.

## D2 — Toolchain Java 25

- **Decisión**: Fijar la *Java toolchain* de Gradle a Java 25 (vendor Eclipse Temurin) en el convention plugin base `ccb.java-base`. Gradle descarga/gestiona el JDK si no está presente.
- **Rationale**: Reproducibilidad entre máquinas y CI sin depender del JDK del sistema; alineado con Principio I (Java 25 LTS Temurin).
- **Alternativas**: Depender del `JAVA_HOME` del desarrollador → no reproducible; descartado.

## D3 — Verificación de capas con ArchUnit

- **Decisión**: Incluir pruebas ArchUnit que verifiquen las reglas de dependencia entre capas. Se aplican desde el convention plugin base para que todo módulo con tests las herede, y una regla global valida que `domain` y `application` no importen paquetes de framework (`org.springframework..`, `jakarta.persistence..`, etc.). Una violación rompe el build (Principio II).
- **Rationale**: Cumple FR-008 y SC-006 (separación verificable automáticamente) desde el día cero, antes de que exista lógica de negocio que pueda violarla.
- **Ubicación**: pruebas de arquitectura por servicio en el módulo `-api` (que ve todas sus capas) o en un módulo de test dedicado. Se decide colocarlas en cada `-api` para mantener el grafo simple.
- **Alternativas**: Confiar en revisión manual → frágil; descartado. Añadir ArchUnit al final del proyecto → tardío; descartado.

## D4 — `descargas` y `verificacion` sin módulo `domain` separado

- **Decisión**: Solo `solicitudes` tiene módulo `domain`. `descargas` y `verificacion` tienen `application`, `infrastructure`, `api`. Su lógica de dominio (mínima) vive en `application` y los tipos base comunes en `shared-kernel`.
- **Rationale**: Coincide con la arquitectura ratificada (docs/ARQUITECTURA_PROPUESTA_JAVA.md) y con el alcance del proyecto: `descargas` es orquestación de historial + S3, y `verificacion` es una única operación pública; su dominio no justifica un módulo aparte. Se preserva la pureza (application sin framework, verificada por ArchUnit).
- **Alternativas**: Forzar 4 capas en los tres servicios → módulos `domain` casi vacíos, complejidad sin valor; descartado.

## D5 — Health checks `/health` y `/health/readiness`

- **Decisión**: Usar Spring Boot Actuator en cada módulo `-api`. Exponer liveness en `/health` y readiness en `/health/readiness` mediante `management.endpoints.web.base-path` y los *health groups* de Actuator (liveness/readiness).
- **Rationale**: Cumple Principio X (health checks) y da soporte a US2/FR-006 con un mínimo esqueleto ejecutable, sin escribir endpoints de negocio.
- **Alternativas**: Endpoint de salud casero → reinventa Actuator; descartado.

## D6 — Gestión de secretos y configuración por ambiente

- **Decisión**: `application.yml` por servicio referencia variables de entorno con marcadores `${VAR}`; no contiene secretos en texto claro. Perfiles `application-local.yml` quedan fuera de control de versiones (`.gitignore`).
- **Rationale**: Cumple Principio VII y FR-012.
- **Alternativas**: Valores por defecto embebidos con secretos → prohibido por la constitución; descartado.

## D7 — Logging estructurado baseline

- **Decisión**: Configuración Logback baseline con codificación JSON y `correlationId` en MDC lista en los módulos `-api` (sin instrumentar aún requests de negocio). Micrometer/OpenTelemetry hacia Dynatrace se cablean en features posteriores.
- **Rationale**: Deja el terreno listo para Principio X sin sobrecargar el andamiaje.
- **Alternativas**: Diferir todo el logging → obligaría a retocar los 3 servicios luego; se prefiere baseline mínimo.

## D8 — Frontends Angular independientes del build Gradle

- **Decisión**: `portal-certificados` y `portal-verificacion` se generan con Angular CLI 22 como proyectos npm independientes bajo `frontend/`, cada uno con su `package.json` y build propio. No se acoplan al ciclo de Gradle en esta feature.
- **Rationale**: Cumple FR-003 y SC-007 (compilan de forma independiente); mantiene separación de responsabilidades backend/frontend y evita complejidad de plugins Node-Gradle en el arranque.
- **Alternativas**: Integrar Angular al build de Gradle (plugin node) → acoplamiento innecesario para el andamiaje; se puede añadir después si CI lo requiere.

## D9 — Carpeta `deploy/` con estructura base

- **Decisión**: Crear `deploy/docker/` y `deploy/scripts/` con estructura base (placeholders documentados), sin Dockerfiles funcionales completos.
- **Rationale**: Cumple FR-004; el contenido real de despliegue se define en su propia feature.
- **Alternativas**: Omitir `deploy/` → incumpliría FR-004; descartado.

---

## Resumen de resolución

No quedan marcadores `NEEDS CLARIFICATION`. Todas las incógnitas del *Technical Context* quedaron resueltas con las decisiones D1–D9, alineadas con la constitución y el documento de arquitectura.
