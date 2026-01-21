# 05 - Diseño y Arquitectura (MS-PERSO)

## Diseño lógico
- Módulo único `clien` agrupa persona+cliente y orquesta 11 módulos auxiliares (domicilio, actividad económica, representante, cónyuge, laboral, referencias, beneficiarios, información financiera, residencia fiscal, asamblea, banca digital).
- Parámetros y catálogos viven en `parameter/*` siguiendo patrón común.
- Exposición dual: REST + NATS contexts con paridad de métodos CRUD y transaccionales.

## Arquitectura interna
- Hexagonal / Ports & Adapters:
  - **domain**: entidades, value objects, ports.
  - **application**: usecases (uno por módulo, con transacción unificada en `clien`).
  - **infrastructure**: repos (PgService), services (ApiResponse), DTOs, enums.
  - **interface**: controllers REST, contexts NATS, módulos Nest.
- Transacciones: `PgService.transaction` para `registrarClienteCompleto` y operaciones compuestas.

## Flujos de negocio clave
1) Alta de cliente completo: Persona → Cliente → Domicilio → Actividad Económica → (Representante/Cónyuge/Laboral opcionales) → Referencias → Info Financiera → Residencia Fiscal → Asamblea → Banca Digital → Beneficiarios, todo en una transacción.
2) Autenticación banca digital: login, changePassword, recuperar password, bloqueo/desbloqueo, verificación de token.
3) CRUD y búsquedas paginadas por identificación o filtros de estado/fecha.

## Decisiones técnicas
- Unificar persona+cliente en `clien` para cohesión y transacción única (ver `VALIDACION_ESTRUCTURA.md`).
- Soft delete en CRUD; normalización de datos vía value objects.
- Respuestas estandarizadas con ApiResponse/ApiResponses.
- Catálogos con estructura repetible (`parameter/{catalogo}/`), tomando `tiden` como patrón.

## Patrones
- Hexagonal, DTO mapeados a value objects, Service Layer, Repository pattern con PgService, ApiResponse wrapper.

## Contratos expuestos
- REST: controllers por módulo bajo `module/management/{modulo}/interface/controller` (rutas anidadas estándar Nest).
- NATS: contexts equivalentes en `interface/context` por módulo, mismos métodos CRUD/transaccionales.
- Health: `/health` (REST) en `common/health`.

## Notas de consistencia
- No existe módulo `perso`; todo el dominio persona/cliente está en `clien`.
- Catálogos faltantes deben replicar exactamente el patrón de `tiden`.
