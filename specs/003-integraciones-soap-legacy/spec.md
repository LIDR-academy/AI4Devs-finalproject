# Feature Specification: Integraciones SOAP Legacy (PUP, TiendaWS, SHD)

**Feature Branch**: `003-integraciones-soap-legacy`

**Created**: 2026-07-28

**Status**: Draft

**Input**: EPIC-01 / TKT-003 — Obtener y versionar los WSDLs de los servicios WCF legacy (PUP, TiendaWS, SHD), generar clientes tipados y construir adaptadores con timeout y circuit breaker por integración.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cliente de liquidación PUP resiliente (Priority: P1) 🎯 MVP

Como desarrollador del servicio de solicitudes, quiero un adaptador tipado hacia el servicio PUP con timeout y circuit breaker, para poder liquidar solicitudes de forma resiliente sin acoplar la lógica de negocio al detalle SOAP.

**Why this priority**: La liquidación PUP es el corazón del flujo de solicitudes; sin este cliente resiliente no puede construirse el core de negocio (EPIC-04).

**Independent Test**: Con un doble de servicio (WireMock SOAP), verificar que una liquidación exitosa mapea a un DTO de dominio, que un timeout a los 10 s produce un error controlado y que tras 5 fallos consecutivos el circuit breaker corta las llamadas sin request real.

**Acceptance Scenarios**:

1. **Given** un servicio PUP simulado que responde correctamente, **When** se invoca la liquidación, **Then** la respuesta SOAP se mapea a un DTO de dominio.
2. **Given** un servicio PUP que no responde en 10 s, **When** se invoca la liquidación, **Then** se produce un error de timeout controlado.
3. **Given** 5 fallos consecutivos, **When** se realiza la siguiente llamada, **Then** el circuit breaker falla rápido sin request real y ofrece el comportamiento de fallback definido.

---

### User Story 2 - Cliente TiendaWS para catálogo y representantes (Priority: P2)

Como desarrollador del servicio de solicitudes, quiero un adaptador tipado hacia TiendaWS (catálogo de certificados, precios, saldo de afiliado y representantes legales) con timeout 8 s y circuit breaker, para consumir el catálogo y validar afiliados de forma resiliente.

**Why this priority**: Habilita el catálogo (HU-02) y la validación de afiliados; depende del patrón resiliente establecido en US1.

**Independent Test**: Con WireMock, verificar operaciones de catálogo y de representantes legales, el timeout a 8 s y la apertura del circuit breaker.

**Acceptance Scenarios**:

1. **Given** TiendaWS simulado, **When** se consulta el catálogo o los representantes legales, **Then** la respuesta se mapea a DTOs de dominio.
2. **Given** TiendaWS que excede 8 s, **When** se invoca, **Then** se produce un error de timeout controlado.

---

### User Story 3 - Cliente SHD para matrícula principal (Priority: P3)

Como desarrollador del servicio de solicitudes, quiero un adaptador tipado hacia SHD (matrícula principal de establecimientos) con timeout 8 s y circuit breaker, para resolver la matrícula principal de forma resiliente.

**Why this priority**: Requerido por módulos especiales (HU-05); es el de menor prioridad relativa dentro de las integraciones.

**Independent Test**: Con WireMock, verificar la consulta de matrícula principal, el timeout a 8 s y el circuit breaker.

**Acceptance Scenarios**:

1. **Given** SHD simulado, **When** se consulta la matrícula principal, **Then** la respuesta se mapea a un DTO de dominio.
2. **Given** SHD que excede 8 s, **When** se invoca, **Then** se produce un error de timeout controlado.

---

### Edge Cases

- ¿Qué ocurre si el WSDL cambia en el ambiente legacy? → Los WSDLs versionados en el repositorio son la fuente de generación; un cambio requiere re-versionar y regenerar, no modificar el servicio legacy.
- ¿Qué ocurre cuando una respuesta SOAP trae un fault de negocio? → Se traduce a la excepción de dominio correcta, no se propaga la excepción SOAP cruda.
- ¿Qué ocurre mientras el circuit breaker está abierto? → Las llamadas fallan rápido con el fallback definido, sin contactar el servicio real, hasta el periodo de recuperación.
- ¿Qué ocurre si el servicio legacy responde lento pero dentro del timeout? → Se procesa normalmente; la latencia se observa vía métricas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Los WSDLs de PUP (`ModuloPrincipal`), TiendaWS y SHD MUST versionarse en `solicitudes-infrastructure/src/main/resources/wsdl/`.
- **FR-002**: El sistema MUST generar clientes tipados a partir de los WSDLs mediante generación de código (wsdl2java / Apache CXF), incluyendo las operaciones de liquidación, catálogo, saldo de afiliación, representantes legales y matrícula principal.
- **FR-003**: Cada integración MUST definir un timeout explícito: PUP 10 s, TiendaWS 8 s, SHD 8 s; el timeout infinito queda prohibido.
- **FR-004**: Cada integración MUST proteger las llamadas con un circuit breaker que se abra tras 5 fallos consecutivos y falle rápido con un fallback en lugar de propagar el error.
- **FR-005**: La configuración de resiliencia (umbral de fallos, ventana, timeout de recuperación y timeouts) MUST ser externalizable por ambiente (no hardcodeada).
- **FR-006**: Las respuestas SOAP MUST mapearse a DTOs/objetos de dominio; los faults SOAP MUST traducirse a excepciones de dominio.
- **FR-007**: Los servicios WCF legacy MUST NOT modificarse; el sistema se adapta a sus interfaces.
- **FR-008**: Cada adaptador MUST contar con pruebas de integración con un doble de servicio (p. ej. WireMock) que cubran éxito, timeout, apertura de circuit breaker y fault SOAP, ejecutables en CI sin depender de servicios reales.
- **FR-009**: La lógica de los adaptadores reside en la capa `infrastructure`; la capa `application`/`domain` solo conoce los ports (interfaces), preservando la separación de capas.

### Key Entities

- **DTO de liquidación**: representa la orden de pago/resultado de liquidación devuelto por PUP.
- **DTO de catálogo de certificados**: tipo de certificado, precio y atributos, desde TiendaWS.
- **DTO de representante legal / saldo de afiliación**: desde TiendaWS.
- **DTO de matrícula principal**: desde SHD.

(Se modelan como contratos de infraestructura; las entidades ricas de dominio pertenecen a las features de negocio que los consumen.)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los clientes SOAP tipados se generan correctamente desde los WSDLs versionados.
- **SC-002**: Cada cliente respeta su timeout configurado (PUP 10 s, TiendaWS 8 s, SHD 8 s).
- **SC-003**: El circuit breaker se abre tras 5 fallos consecutivos y responde con fallback en lugar de propagar el error.
- **SC-004**: Las pruebas de integración con el doble de servicio pasan en CI sin ninguna dependencia de servicios reales.
- **SC-005**: La capa `application`/`domain` no depende de clases SOAP generadas (verificable por reglas de arquitectura).

## Assumptions

- Se construye sobre el andamiaje `001-andamiaje-monorepo` (existe `solicitudes-infrastructure`).
- El stack de integración (Apache CXF 4.x + wsdl2java, Resilience4j) está fijado por la constitución (Principio IV); las versiones concretas se detallan en `/speckit.plan` y se añaden al version catalog.
- Se dispone de acceso a los WSDLs desde un ambiente de QA/DEV para descargarlos y versionarlos.
- Los timeouts provienen de la tabla de integraciones del PRD (§8) y son invariantes de la constitución.
