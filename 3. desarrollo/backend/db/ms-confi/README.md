# MS-CONFI - Scripts y Notas de BD

## Script extraído
- `001-CreateGeoCatalog.sql` (copiado desde 3. desarrollo/backend/ms-confi/src/database/scripts/001-CreateGeoCatalog.sql)
  - Crea catálogos GEO: `rrfprovi`, `rrfcanto`, `rrfparro`
  - Incluye índices (búsqueda y flags), comentarios y fallback para pg_trgm
  - Soft delete vía campos `fec_elimi`

## Documentación relevante
- Implementación GEO: ../ms-confi/IMPLEMENTACION-GEO-RESUMEN.md
- Modelo de datos (prompts): ../ms-confi/.prompts/06-modelo-datos.md
- Estado y plan: ../ms-confi/.prompts/07-estado-desarrollo.md y ../ms-confi/.prompts/08-plan-futuro.md
- Swagger CIIU: ../ms-confi/SWAGGER-CIIU-VERIFICACION.md (CIIU no usa este script)

## Notas
- Extensiones recomendadas: `uuid-ossp`, `pg_trgm` (activadas al inicio del script si existen).
- Campos de código SEPS preservan ceros a la izquierda (CHAR(2)).
- Rollback incluido al final del script (DROP INDEX/TABLE secuencial).
