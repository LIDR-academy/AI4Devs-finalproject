# Research — Servicio Público de Verificación

**Feature**: `006-servicio-publico-verificacion` | **Date**: 2026-07-29

## R1 — Layout de módulos (domain vs application)

**Decision**: No crear `verificacion-domain` como módulo Gradle. Colocar VO/reglas (`CodigoVerificacion`, `estaVigente`) en `verificacion-application` (paquete `domain` o raíz application), con `shared-kernel` para excepciones base. ArchUnit verifica que application no depende de Spring ni de infrastructure.

**Rationale**: El monorepo actual solo declara tres módulos `verificacion-*` (confirmado en settings / scaffold 001). Los tickets TKT-010 nombran `verificacion-domain`, pero eso no existe en código.

**Alternatives considered**: Añadir módulo `verificacion-domain` al settings — más alineado a solicitudes futuro, pero cambia el andamiaje fuera del alcance mínimo y duplica trabajo de settings/ArchUnit.

## R2 — Endpoints públicos y SecurityConfig

**Decision**: Extender `SecurityConfig` en `shared-auth` con `.requestMatchers("/api/v1/verificaciones/**").permitAll()` antes de `.anyRequest().authenticated()`. Añadir dependencia `shared-auth` a `verificacion-api` e importar/scanear `co.org.ccb.certificados.shared.auth` y `...shared.web` para cargar `SecurityConfig` + `GlobalExceptionHandler` + `CorrelationIdFilter`.

**Rationale**: Constitución VI exige verificación pública; hoy solo health es público y `verificacion-api` no depende de `shared-auth`.

**Alternatives considered**: SecurityFilterChain local solo en verificacion-api — viola “política CORS/security centralizada”; duplicaría Cognito/CORS.

## R3 — Mapeo HTTP de errores (410 / 429 / 503)

**Decision**:
| Caso | HTTP | Mecanismo |
|---|---|---|
| Formato inválido | 400 `VALIDACION` | Jakarta / assert en controller |
| Código no encontrado | 404 `RECURSO_NO_ENCONTRADO` o `CODIGO_NO_ENCONTRADO` | `CodigoNoEncontradoException` → handler |
| Código expirado | 410 `CODIGO_EXPIRADO` | `CodigoExpiradoException` → extender `GlobalExceptionHandler` |
| Archivo S3 ausente | 404 `ARCHIVO_NO_ENCONTRADO` | `ArchivoNoEncontradoException` |
| S3 no disponible | 503 `SERVICIO_NO_DISPONIBLE` | `AlmacenamientoNoDisponibleException` (shared-kernel; handler en `GlobalExceptionHandler`) |
| Rate limit | 429 + `Retry-After: 1` | `RateLimitFilter` (no pasa por advice) |

**Rationale**: HU-14 / TKT-010 exigen 410; el contrato 002 solo tenía 404/409/422/400/500.

**Alternatives considered**: Mapear expirado a 422 `REGLA_NEGOCIO` — pierde semántica HTTP de Gone y rompe CA-14.2.

## R4 — Vigencia 60 días en `America/Bogota`

**Decision**: `CodigoVerificacion.estaVigente(Clock)` compara `LocalDate.now(ZoneId.of("America/Bogota"))` con `fecha_vencimiento` (tipo `DATE` en BD). Vigente si `hoy <= fecha_vencimiento`.

**Rationale**: Clarificación Q4:A; columna ya es `DATE` (fin de vigencia materializado al emitir el certificado).

**Alternatives considered**: Recalcular siempre expedición+60 desde `fecha_cargue` — ambiguo si `fecha_vencimiento` ya está persistida; usar el campo de BD es la fuente de verdad.

## R5 — Formato de código `^[A-Z0-9]{14}$`

**Decision**: Validar en el borde (controller / `@Pattern`) y en el VO. Minúsculas = 400 sin hit a BD. Lookup JDBC con igualdad exacta sobre `codigo`.

**Rationale**: Clarificación Q3:C.

**Alternatives considered**: Normalizar a mayúsculas — ocultaría errores de captura y contradice la decisión.

## R6 — Entrega PDF Base64 (no URL pre-firmada)

**Decision**: `StorageService.descargarComoBase64(String nombreArchivo)` en `shared-contracts`; impl `S3StorageService` con AWS SDK v2 `GetObject`. Respuesta API `{ contenido: "<base64>", tipo: "application/pdf" }` (envuelta en `ApiResponse` si el estándar del proyecto lo exige de forma uniforme — ver contrato API). Desviación respecto a constitución VII / RNF-19 **justificada por** [ADR-0002](../../docs/adr/ADR-0002-entrega-pdf-base64-verificacion-publica.md).

**Rationale**: Clarificación Q2:A + TKT-011 + PRD. RNF-19 permanece para `descargas`. Bucket S3 no público; sin URL pre-firmada en el canal anónimo.

**Alternatives considered**: Presigned URL — rechazada en clarify y en ADR-0002; stream `application/pdf` — aplazado.

## R6b — Alerta interna FR-010 (código vigente sin archivo)

**Decision**: “Alerta interna” = (1) log estructurado WARN/ERROR con `correlationId` + código + `nombreArchivo`, y (2) counter Micrometer `verificacion.archivo_ausente`. Sin configuración de alarmas/pager Dynatrace en el código de 006 (responsabilidad de operación).

**Rationale**: Constitución X (logs + Micrometer → Dynatrace); FR-010 no exige ticket automático. Evita acoplar el microservicio a un canal de paging concreto.

**Alternatives considered**: Solo log — insuficiente para dashboards/alertas operativas; webhook a pager — fuera de alcance y frágil por ambiente.

## R7 — Audit trail solo con POST explícito

**Decision**: `RegistrarVerificacionHandler` revalida que el código existe y está vigente; inserta `RegistroVerificacion` con IP + `GETDATE()`. `ValidarCodigoHandler` y `ObtenerDocumentoHandler` no escriben auditoría.

**Rationale**: Clarificación Q1:B + FR-012a.

**Alternatives considered**: Auto-registro en GET — más seguro ante cliente olvidadizo, pero desalinea TKT-012/067.

## R8 — Extracción de IP

**Decision**: Utilidad compartida (p. ej. `IpExtractor`): si existe `X-Forwarded-For`, tomar la primera IP de la lista (cliente original); si no, `request.getRemoteAddr()`. Usar la misma lógica en `POST .../registros` y en `RateLimitFilter`.

**Rationale**: Spec US3 / edge cases; load balancer CCB.

**Alternatives considered**: Última IP de la cadena — sería el proxy más cercano, incorrecto para auditoría.

## R9 — Rate limiting Bucket4j + Redis

**Decision**: `OncePerRequestFilter` sobre `/api/v1/verificaciones/**` (excluir `/health**`). Capacidad 100 tokens, refill 100/s, key Redis `rate:verificacion:{ip}`, cupo único para GET validate + GET documento + POST registros. Si Redis/Bucket falla: **permitir** request + log WARN (fallback permisivo). Respuesta 429 con header `Retry-After: 1`.

**Rationale**: Constitución XI, RNF-15, clarificación Q5:A, TKT-013.

**Alternatives considered**: Cupos por endpoint — rechazado en clarify; fail-closed si Redis cae — bloquearía el canal público entero.

## R10 — Dependencias Gradle faltantes

**Decision**: Añadir al version catalog (si no existen): AWS SDK v2 S3, Spring Data Redis / Lettuce, Bucket4j (+ `bucket4j-redis` o equivalente compatible con Lettuce). `verificacion-api` / `verificacion-infrastructure` consumen según capa. Justificado por [ADR-0003](../../docs/adr/ADR-0003-dependencias-verificacion-publica.md).

**Rationale**: Exploración del repo: catalog actual sin redis/aws/bucket4j en uso Java. Constitución I + XI.

**Alternatives considered**: Rate limit in-memory solo — incorrecto con múltiples réplicas (detalle en ADR-0003).

## R11 — Envelope `ApiResponse` vs cuerpo plano de tickets

**Decision**: Preferir envelope `ApiResponse<T>` de `shared-kernel` (contrato 002) para éxito/error uniforme, con `data` conteniendo `{ valido, archivo }` o `{ contenido, tipo }`. Documentar en contrato API; si tests de contrato del frontend futuro esperan cuerpo plano, adaptar en plan de FE (TKT-067), no aquí.

**Rationale**: Consistencia con `GlobalExceptionHandler` y correlationId.

**Alternatives considered**: Cuerpos planos solo en verificación — rompe estándar compartido.
