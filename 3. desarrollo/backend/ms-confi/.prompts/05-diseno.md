# 05 · Diseño

## Arquitectura
- NestJS 11 con enfoque en módulos por dominio: parameter (ciiu, geo, color, icons, opcio, perfi, tofic), management (empre, ofici), operation, search.
- Capas por módulo (ej. GEO): domain (entities, value objects, ports), application (use case único), infrastructure (repository, dto, service), interface (controller REST, context NATS, module).
- Common: DatabaseModule, HealthModule, logger, config.

## Integraciones
- PostgreSQL vía DatabaseModule y PgService; script SQL para GEO en database/scripts/001-CreateGeoCatalog.sql.
- Swagger configurado en main.ts con DocumentBuilder, ruta /doc.
- NATS handlers en contexts de módulos (ej. GeoContext) usando tokens Symbol para inyección.

## Endpoints principales
- GEO (base http://localhost:8012): CRUD provincias, cantones, parroquias; búsqueda de parroquias; soft delete; queries por jerarquía.
- CIIU (base /api/v1, Swagger en /doc): CRUD secciones y actividades; búsqueda; obtención por código; árbol completo y por hijos.

## Validaciones y DTOs
- class-validator en DTOs; ejemplos y descriptions en Swagger para CIIU.
- Geo DTOs incluyen flags de activación y códigos SEPS.

## Observaciones de calidad
- Linter y compilación ok en GEO según implementación.
- Tests de CIIU cubren usecase, repository y service con moduleNameMapper para paths TS.
