# Feature Specification: Núcleo Compartido y Seguridad

**Feature Branch**: `002-nucleo-compartido-seguridad`

**Created**: 2026-07-28

**Status**: Draft

**Input**: EPIC-01 / TKT-002 — Implementar los módulos `shared-kernel` y `shared-auth`: manejo de resultados y errores uniforme, filtro de Correlation ID, protección de endpoints como OAuth2 Resource Server con AWS Cognito y política CORS.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manejo uniforme de resultados y errores (Priority: P1) 🎯 MVP

Como desarrollador de cualquiera de los microservicios, quiero un mecanismo compartido para representar resultados de operaciones y traducir los errores de dominio a respuestas HTTP consistentes, para no reinventar el manejo de errores en cada servicio y garantizar contratos de error homogéneos.

**Why this priority**: Todos los casos de uso de negocio dependen de `Result<T>`, de la jerarquía de excepciones y del manejador global. Es el cimiento transversal reutilizado por solicitudes, descargas y verificacion.

**Independent Test**: Provocar cada tipo de error de dominio desde un endpoint de prueba y verificar que el manejador global devuelve el código HTTP correcto (404/409/422/400/500) con el envoltorio de respuesta estándar.

**Acceptance Scenarios**:

1. **Given** una operación de dominio exitosa, **When** se envuelve en `Result`, **Then** el resultado indica éxito y expone el valor sin lanzar excepciones verificadas.
2. **Given** una operación que falla con una regla de negocio, **When** se envuelve en `Result`, **Then** el resultado indica fallo y expone el error asociado.
3. **Given** una petición que dispara `RecursoNoEncontrado`, `ConflictoEstado`, `ReglaNegocio`, un error de validación o una excepción inesperada, **When** llega al manejador global, **Then** responde 404, 409, 422, 400 y 500 respectivamente, con el envoltorio de respuesta estándar.

---

### User Story 2 - Protección de endpoints con AWS Cognito y CORS (Priority: P2)

Como responsable de seguridad de la plataforma, quiero que los endpoints protegidos exijan un JWT válido de AWS Cognito (modelo Resource Server) y que la política CORS sea centralizada y restringida a los dominios de la CCB, para cumplir la constitución y reducir la superficie de ataque.

**Why this priority**: Es obligatorio por constitución (Principio VI) para todos los endpoints excepto la verificación pública. Habilita el desarrollo seguro de los servicios de negocio.

**Independent Test**: Llamar a un endpoint de salud sin token (200), a un endpoint protegido sin token (401), con token inválido (401), y verificar que CORS permite orígenes `*.ccb.org.co` y rechaza otros. Estos criterios (códigos HTTP y CORS) son verificables de forma independiente; el cuerpo de error reutiliza `ApiResponse` de US1 (acoplamiento suave: implementar US1 antes que US2).

**Acceptance Scenarios**:

1. **Given** la configuración de seguridad activa, **When** se llama al health check sin token, **Then** responde 200; **When** se llama a un endpoint protegido sin token o con token inválido, **Then** responde 401.
2. **Given** la configuración del User Pool de Cognito por variables de entorno, **When** el servicio valida un JWT, **Then** verifica firma contra el JWKS del User Pool, emisor (issuer) y audiencia (client-id).
3. **Given** la política CORS, **When** un origen `https://portal.ccb.org.co` hace una petición, **Then** se permite; **When** el origen es `https://malicio.so`, **Then** se rechaza; y nunca se combina comodín de origen con credenciales.

---

### User Story 3 - Trazabilidad con Correlation ID (Priority: P3)

Como operador de la plataforma, quiero que cada petición tenga un identificador de correlación propagado en logs y respuestas, para poder rastrear una transacción de extremo a extremo en la observabilidad corporativa.

**Why this priority**: Soporta la observabilidad (Principio X) y el diagnóstico de incidentes. Es transversal pero no bloquea la lógica de negocio.

**Independent Test**: Enviar una petición sin el header de correlación y verificar que se genera uno y aparece en el log (MDC) y en el header de respuesta; enviar una con header y verificar que se propaga sin cambios.

**Acceptance Scenarios**:

1. **Given** una petición sin header `X-Correlation-Id`, **When** se procesa, **Then** se genera un identificador único, se coloca en el MDC durante todo el request y se devuelve en el header de respuesta.
2. **Given** una petición con `X-Correlation-Id`, **When** se procesa, **Then** ese mismo valor se propaga en MDC y en la respuesta.

---

### Edge Cases

- ¿Qué ocurre si el JWKS del User Pool no está disponible temporalmente? → El servicio rechaza el token (401) sin exponer detalles internos; el evento queda registrado sin PII ni el token.
- ¿Qué ocurre si un error inesperado ocurre fuera de un caso de uso? → El manejador global responde 500 con un mensaje genérico, sin filtrar trazas ni datos sensibles.
- ¿Qué ocurre con un `X-Correlation-Id` extremadamente largo o malformado? → Se acota/normaliza a un valor seguro para logging.
- ¿Qué ocurre si el token es válido pero la audiencia no corresponde? → 401 (no 403), sin revelar el motivo exacto.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `shared-kernel` MUST proveer `Result<T>` que represente éxito o fallo, con consultas de estado (éxito/fallo) y acceso al valor o al error, sin usar excepciones verificadas para el flujo esperado.
- **FR-002**: `shared-kernel` MUST proveer una jerarquía de excepciones de dominio con, al menos, `RecursoNoEncontradoException`, `ConflictoEstadoException` y `ReglaNegocioException`, derivadas de una excepción base de dominio.
- **FR-003**: `shared-kernel` MUST proveer un envoltorio de respuesta estándar (`ApiResponse<T>`) usado por todos los servicios para éxito y error.
- **FR-004**: El sistema MUST proveer un manejador global de excepciones que traduzca: recurso no encontrado → 404, conflicto de estado → 409, regla de negocio → 422, error de validación → 400, excepción inesperada → 500.
- **FR-005**: `shared-auth` MUST proveer un filtro de Correlation ID que genere un identificador si no viene en el header `X-Correlation-Id`, lo propague en el MDC durante el request y lo devuelva en el header de respuesta.
- **FR-006**: `shared-auth` MUST proveer la configuración de seguridad como OAuth2 Resource Server que permita el acceso público a los health checks y exija un JWT válido de AWS Cognito para los endpoints protegidos (401 en ausencia o invalidez del token).
- **FR-007**: La configuración del User Pool de Cognito (region, user pool id, issuer, JWKS uri, client-id/audiencia, scopes) MUST ser parametrizable por ambiente vía variables de entorno; nunca codificada en texto claro.
- **FR-008**: La validación del JWT MUST verificar la firma contra el JWKS del User Pool de Cognito, el emisor (issuer) y la audiencia (client-id).
- **FR-009**: La política CORS MUST ser centralizada por microservicio y permitir exclusivamente orígenes `https://*.ccb.org.co` (con orígenes de desarrollo solo en perfiles no productivos); métodos GET, POST, PUT, DELETE, OPTIONS; headers `Authorization`, `Content-Type`, `X-Correlation-Id`; exponer `X-Correlation-Id`; `allowCredentials=true`; `maxAge=3600`; y MUST NOT combinar credenciales con origen comodín.
- **FR-010**: MAUC SSO MUST NOT intervenir en la protección de endpoints en esta feature (el login del afiliado se aborda por separado, TKT-040).
- **FR-011**: Cada unidad de lógica nueva en `shared-kernel`/`shared-auth` MUST desarrollarse con TDD (prueba que falla primero), conforme al Principio VIII.

### Key Entities

No aplica: esta feature entrega componentes transversales de plataforma, no entidades de datos de negocio.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `Result<T>` encapsula éxito/error sin exponer excepciones verificadas en su API pública.
- **SC-002**: El manejador global devuelve el código HTTP correcto para cada tipo de error (404/409/422/400/500) en el 100% de los casos probados.
- **SC-003**: Una petición sin header de correlación produce un identificador que aparece tanto en el log (MDC) como en el header de respuesta.
- **SC-004**: Un JWT sin firma válida, con emisor o audiencia incorrectos, resulta en 401.
- **SC-005**: Una petición CORS desde un origen que no es `*.ccb.org.co` es rechazada; una desde `*.ccb.org.co` es permitida.
- **SC-006**: La cobertura de pruebas de la lógica de `shared-kernel`/`shared-auth` es ≥ 80% (Principio VIII).
- **SC-007**: Una búsqueda de secretos en el código/configuración versionada no encuentra credenciales ni parámetros de Cognito en texto claro.

## Assumptions

- Se construye sobre el andamiaje de la spec `001-andamiaje-monorepo` (módulos `shared-kernel` y `shared-auth` ya existen como esqueleto).
- El stack (Spring Security como Resource Server, AWS Cognito) está fijado por la constitución (Principio VI); las versiones concretas se detallan en `/speckit.plan`.
- El User Pool de Cognito de cada ambiente y sus credenciales se inyectan por variables de entorno (parametrizable por ambiente); su aprovisionamiento no es alcance de esta feature.
- MAUC SSO (login del afiliado) se implementa en una feature aparte y no protege endpoints.
- Los formateadores de dominio (`MatriculaFormatter`, `NitFormatter`) podrían ubicarse en `shared-kernel`; su decisión final se toma cuando los consuman las features de solicitudes/afiliados.
