# 02 - Prompt Library (MS-PERSO)

Plantillas breves listas para usar con LLMs al trabajar en MS-PERSO. Ajusta nombres de métodos/archivos según necesites.

## A. Feature principal (CU-01 Registrar Cliente Completo)
"Eres dev NestJS. Implementa en `clien` la transacción registrarClienteCompleto que inserta persona, cliente, domicilio, actividad económica, representante (si aplica), cónyuge (si aplica), laboral (si aplica), referencias, información financiera, residencia fiscal, asamblea, banca digital y beneficiarios en una sola transacción con rollback. Usa PgService.transaction, DTOs unificados y value objects. Mantén contratos de ApiResponse. No dupliques módulo perso, todo vive en clien."

## B. Catálogos faltantes (12)
"Genera módulo de catálogo `{catalogo}` siguiendo el patrón de `tiden` en parameter/{catalogo}. Incluye entity, port, value, usecase, repository, service, controller, context, dto, enum. Agrega seeds iniciales según PLAN_CATALOGOS. Mantén nomenclatura NATS/REST consistente."

## C. Tests unitarios
"Escribe specs para `{modulo}`: usecase, value objects, service, repository, controller. Cobertura objetivo: UseCase ≥90%, Services ≥85%, Repos ≥80%, Controllers ≥75%. Mock PgService para repos. Usa fixtures mínimos y valida normalización de value objects."

## D. Tests E2E
"Crea tests E2E en `test/e2e/{modulo}/` que cubran flujos felices y errores 400/404/409. Levanta app con TestingModule, usa supertest, prepara datos en PostgreSQL test, limpia con transactions."

## E. NATS handlers
"Ajusta contexts NATS en `{modulo}/interface/context` para que expongan los mismos métodos que los controllers REST. Normaliza nombres `findAll{Mod}`, `findById{Mod}`, `create{Mod}`, etc. Reutiliza Services, no dupliques lógica."

## F. Seguridad y validaciones
"Agrega validaciones de cédula/RUC y longitud en DTOs y value objects. Campos sensibles en lowercase/uppercase según reglas. Asegura soft delete y paginación."

## G. Deploy/Infra
"Genera instrucciones de deploy para MS-PERSO: env vars descritas en README, Dockerfile.prod, docker-compose.yml, NATS y PostgreSQL. Incluye health check y readiness en `/health`."

## H. Refactor de estructura (si aplica)
"Verifica que solo exista módulo `clien` para persona/cliente. No crear módulo `perso`. Si encuentras `perso`, migra entidades y casos de uso a `clien` y elimina `perso`."

## I. Observabilidad y logging
"Configura logger service para trazabilidad por request. Añade metadatos de tenant/usuario si aplica. Exponer métricas básicas (pendiente según alcance)."

Referencias: [PLAN_CATALOGOS.md](3.%20desarrollo/backend/ms-perso/PLAN_CATALOGOS.md), [PLAN_PRUEBAS.md](3.%20desarrollo/backend/ms-perso/PLAN_PRUEBAS.md), [TESTS_RESUMEN.md](3.%20desarrollo/backend/ms-perso/TESTS_RESUMEN.md), [VALIDACION_ESTRUCTURA.md](3.%20desarrollo/backend/ms-perso/VALIDACION_ESTRUCTURA.md).
