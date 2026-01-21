# 07 - Estado de Desarrollo (Sprint Actual)

## Implementado
- Refactor: módulo único `clien` (persona+cliente), `perso/` eliminado.
- Transacción `registrarClienteCompleto` con 11 módulos auxiliares integrados.
- CRUD Persona y Cliente con soft delete y búsquedas por identificación/filtros.
- Banca digital (clbnc): login, cambio/recuperación de contraseña, bloqueo/desbloqueo, verificación de token.
- Estructura hexagonal completa (domain/application/infrastructure/interface).
- Respuestas ApiResponse/ApiResponses; logger y health check.
- Tests unitarios/integración: 267 pasando (usecases, value objects, services, repos, controllers). Ver `TESTS_RESUMEN.md`.

## Parcialmente implementado
- E2E: suites creadas para clien/clbnc, requieren BD de prueba activa.
- Catálogos: solo `tiden` listo; 12 catálogos pendientes según plan.

## Pendiente
- Validaciones especializadas cédula/RUC y hashids.
- Completar catálogos faltantes (`PLAN_CATALOGOS.md`).
- Paridad final REST/NATS en todos los catálogos nuevos una vez creados.
- Mejoras de UX/validaciones frontend (según `clientes.md`).

## Deuda técnica
- Falta de E2E ejecutables en pipeline (bloqueado por entorno de BD).
- Validaciones de identificación aún no centralizadas.
- Catálogos pendientes generan riesgo de datos incompletos en formularios.

## Riesgos
- Integridad de datos si se usa la transacción sin catálogos completos.
- Autenticación banca digital depende de almacenamiento seguro de contraseñas (verificar hash y política al cerrar sprint).
- Dependencia de NATS/DB: sin ellos no hay fallback.
