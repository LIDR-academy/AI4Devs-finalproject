# 01 - Microservice Overview (MS-PERSO)

## Propósito
Microservicio de gestión de Personas/Clientes/Socios para FINANTIX. Expone REST y NATS para operaciones CRUD y una transacción unificada de alta de cliente completo.

## Stack y runtime
- NestJS 10, Node 20+, PostgreSQL 15+, NATS.
- Configuración env: ver [README.md](3.%20desarrollo/backend/ms-perso/README.md).
- Arquitectura: hexagonal (domain → application → infrastructure → interface).

## Dominios clave
- Módulo único `clien` (persona + cliente) unificado. Ref: [clientes.md](3.%20desarrollo/backend/ms-perso/clientes.md).
- Módulos auxiliares (11) integrados en la transacción CU-01: domicilio, actividad económica, representante, cónyuge, laboral, beneficiarios, referencias, información financiera, residencia fiscal, asamblea, banca digital.
- Catálogos del dominio persona/cliente: ver [PLAN_CATALOGOS.md](3.%20desarrollo/backend/ms-perso/PLAN_CATALOGOS.md).

## Capacidades principales
- CRUD Persona y Cliente con soft delete.
- Búsquedas por identificación y filtros con paginación.
- Transacción `registrarClienteCompleto` que crea persona + cliente + módulos auxiliares en una sola operación con rollback.
- Banca digital (clbnc): login, changePassword, recuperación, bloqueo/desbloqueo.
- Respuestas normalizadas vía ApiResponse/ApiResponses.

## Estado actual (2025-01-28)
- Refactor completado: `perso` y `clien` unificados. Ver [VALIDACION_ESTRUCTURA.md](3.%20desarrollo/backend/ms-perso/VALIDACION_ESTRUCTURA.md).
- Backend ~100% según [clientes.md](3.%20desarrollo/backend/ms-perso/clientes.md).
- Tests unitarios e integración: 267 pasando. Ver [TESTS_RESUMEN.md](3.%20desarrollo/backend/ms-perso/TESTS_RESUMEN.md).
- Plan de catálogos faltantes documentado. Ver [PLAN_CATALOGOS.md](3.%20desarrollo/backend/ms-perso/PLAN_CATALOGOS.md).
- Plan de pruebas detallado. Ver [PLAN_PRUEBAS.md](3.%20desarrollo/backend/ms-perso/PLAN_PRUEBAS.md).

## Qué falta / riesgos
- Validaciones especializadas (cédula/RUC, hashids) y UX pendientes (según clientes.md).
- Catálogos: 12 faltantes listados en el plan.
- E2E requieren base de datos de prueba activa.

## Archivos útiles
- Config Nest: [src/app.module.ts](3.%20desarrollo/backend/ms-perso/src/app.module.ts)
- Config DB/PG: [src/common/database/pg.config.ts](3.%20desarrollo/backend/ms-perso/src/common/database/pg.config.ts)
- Health: [src/common/health/health.controller.ts](3.%20desarrollo/backend/ms-perso/src/common/health/health.controller.ts)
- Módulos: [src/module/management](3.%20desarrollo/backend/ms-perso/src/module/management)
- Tests E2E: [test/e2e](3.%20desarrollo/backend/ms-perso/test/e2e)
