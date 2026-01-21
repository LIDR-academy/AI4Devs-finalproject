# 04 - Análisis del Microservicio MS-PERSO

## Propósito
Gestionar Personas/Clientes/Socios dentro del ecosistema FINANTIX, incluyendo alta, consulta, actualización y baja lógica, más una transacción unificada de registro de cliente completo con sus relaciones auxiliares.

## Problema que resuelve
Centraliza la creación y mantenimiento de clientes, evitando duplicidad de datos de persona y asegurando integridad transaccional al registrar todas las relaciones (domicilio, actividad económica, representante, cónyuge, laboral, referencias, información financiera, residencia fiscal, asamblea, banca digital, beneficiarios).

## Alcance funcional
- CRUD de Persona y Cliente (soft delete).
- Búsqueda por identificación y filtros paginados.
- Transacción `registrarClienteCompleto` (Persona + Cliente + 11 módulos auxiliares).
- Banca digital (login, cambio/recuperación de contraseña, bloqueo/desbloqueo, verificación de token).
- Exposición vía REST y NATS (paridad de métodos por módulo).
- Catálogos de soporte del dominio persona/cliente (ver plan de catálogos).

## Alcance no funcional
- Arquitectura hexagonal (domain → application → infrastructure → interface).
- PostgreSQL 15+, NATS, NestJS 10, Node 20.
- Logging a través de `logger.service.ts`; health checks en `/health`.
- Soft delete y transacciones con `PgService.transaction`.

## Supuestos y restricciones
- DB PostgreSQL disponible; NATS operativo para mensajería.
- Un solo módulo `clien` gestiona persona+cliente (no existe módulo `perso`).
- Transacciones requieren esquema consistente con tablas rrf* existentes.
- Validaciones de cédula/RUC pendientes (ver estado de desarrollo).

## Relaciones con otros microservicios
- Autenticación/Banca digital interna al propio módulo `clbnc` (banca digital) dentro de MS-PERSO; no se documentan dependencias externas adicionales en el repo actual.

## Estado de desarrollo (real)
- Refactor completado: módulo único `clien`; `perso/` eliminado.
- Backend ~100% según `clientes.md`.
- 267 tests unitarios/integración pasando (ver `TESTS_RESUMEN.md`).
- Catálogos: `tiden` listo; 12 catálogos faltantes planificados.
- E2E creados pero requieren BD de prueba activa.
- Pendientes: validaciones especializadas cédula/RUC y hashids; cierre de catálogos.
