# 08 · Plan Futuro

## Prioridad alta
- Añadir tests unitarios e integración para GEO (repositorio, usecase, controller) para igualar cobertura de CIIU.
- Incorporar auditoría y trazas en GEO y CIIU (campos audit, logger).
- Aplicar guards de roles ADMIN en endpoints de escritura GEO/CIIU.

## Prioridad media
- Revisar y unificar estrategia de soft delete y flags de activación en todos los catálogos parameter/.
- Revisar modules management/operation/search para documentar y cubrir con tests.

## Prioridad baja
- Evaluar migrar repositorios GEO a TypeORM o mantener PgService con patrones consistentes.
- Añadir ejemplos extendidos en Swagger para GEO (hoy cubierto en guía markdown, no en swagger doc).

## Definición de listo
- Swagger: 100% endpoints y DTOs documentados (incluyendo GEO).
- Tests: ≥80% cobertura en GEO; CIIU se mantiene en ~75%+.
- Seguridad: endpoints de escritura protegidos por roles y auditoría habilitada.
