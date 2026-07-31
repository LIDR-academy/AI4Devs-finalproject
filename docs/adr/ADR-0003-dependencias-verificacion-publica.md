# ADR-0003 — Dependencias Gradle del servicio público de verificación

- **Estado:** Aceptada
- **Fecha:** 2026-07-29
- **Decisores:** Arquitectura de Software CCB
- **Ámbito:** `gradle/libs.versions.toml`; módulos `verificacion-*` (y consumo de `shared-*` ya existentes)
- **Relacionado con:** Constitución §I (stack fijo + ADR para deps nuevas), §XI (Bucket4j + Redis, P95 verificación); feature `006-servicio-publico-verificacion`; research R10; T001 de `tasks.md`

---

## Contexto

El microservicio `verificacion` (HU-14 / TKT-010..013) necesita:

- Leer PDFs desde Amazon S3 (entrega Base64 en API; ver [ADR-0002](./ADR-0002-entrega-pdf-base64-verificacion-publica.md)).
- Rate limiting compartido 100 req/s por IP con estado entre réplicas (constitución XI, RNF-15).
- Tests de integración con Redis y, opcionalmente, S3 local (LocalStack).

El catálogo `gradle/libs.versions.toml` del monorepo aún no declara AWS SDK S3, Spring Data Redis ni Bucket4j para uso Java. Constitución I exige que toda dependencia nueva (incluida transitiva relevante) se justifique con ADR aprobado.

## Decisión

Se autoriza añadir al version catalog (y consumir en `verificacion-infrastructure` / `verificacion-api` según capa) las siguientes dependencias:

| Área | Librería / artefacto | Uso |
| --- | --- | --- |
| Object storage | AWS SDK v2 `software.amazon.awssdk:s3` | `S3StorageService.GetObject` → Base64 |
| Cache / rate-limit store | `spring-boot-starter-data-redis` (Lettuce; versión vía BOM Spring Boot) | Backend Redis para Bucket4j |
| Rate limiting | Bucket4j + extensión Redis compatible con Lettuce | Cupo 100 req/s por IP, key `rate:verificacion:{ip}` |
| IT | Testcontainers Redis; LocalStack (o equivalente) para S3 si no está ya en catalog | IT de rate limit y storage |

Reglas de versionado:

- Preferir versiones gestionadas por el BOM de Spring Boot 4.1.x cuando existan.
- Solo fijar versión explícita en el catalog si el BOM no la gestiona (p. ej. Bucket4j / AWS SDK según disponibilidad del BOM).
- Secrets y endpoints Redis/S3 vía variables de entorno; nunca en YAML en claro.

Fuera de esta ADR: cambios de stack base (sustituir Redis, sustituir S3, cambiar de Bucket4j a otra librería de rate limit) requieren ADR nuevo.

## Alternativas consideradas

### Rate limit solo in-memory (rechazada)

Incorrecto con múltiples réplicas del servicio: cada instancia tendría su propio cupo y se violaría el límite efectivo de 100 req/s por IP.

### Otro cliente S3 / MinIO SDK dedicado (rechazada)

El stack institucional fija AWS SDK v2; S3 es el storage definitivo (restricciones constitucionales).

### Resilience4j RateLimiter u otro sin Redis compartido (rechazada)

No cumple el requisito de contador compartido entre nodos sin un store externo; Bucket4j + Redis está explícitamente citado en constitución XI.

## Consecuencias

**Positivas**
- Cumple constitución I (deps justificadas) y XI (Bucket4j + Redis).
- Desbloquea T001–T003 e IT de US2/US4.
- Una sola ADR cubre el conjunto de deps del canal de verificación pública.

**Negativas / riesgos**
- Superficie de supply-chain adicional (Bucket4j, AWS SDK). Mitigación: versiones en catalog centralizado + revisión en PR.
- Compatibilidad Bucket4j ↔ Lettuce/Redis debe validarse en IT (`RateLimitIntegrationTest`); si el artefacto de extensión concreto cambia de nombre entre versiones, actualizar catalog sin cambiar la decisión arquitectónica.

## Cumplimiento y trazabilidad

| Artefacto | Uso |
| --- | --- |
| `gradle/libs.versions.toml` | Declaración de librerías (T001) |
| `verificacion-*/build.gradle.kts` | Consumo por capa (T002–T003) |
| `specs/006-.../research.md` R10 | Enlace a esta ADR |
| Constitución 1.0.0 §I / §XI | Justificación normativa |

## Referencias

- Constitución §I, §XI
- `specs/006-servicio-publico-verificacion/research.md` (R9, R10)
- `specs/006-servicio-publico-verificacion/contracts/rate-limit.md`
- Hallazgo C3 — análisis `/speckit-analyze` de 2026-07-29
