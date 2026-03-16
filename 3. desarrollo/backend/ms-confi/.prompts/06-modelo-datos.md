# 06 · Modelo de Datos

## Geo Catálogo (según IMPLEMENTACION-GEO-RESUMEN.md)
- rrfprovi (provincias)
  - PK: provi_cod_provi (SERIAL)
  - Código SEPS: provi_cod_prov (CHAR(2) UNIQUE)
- rrfcanto (cantones)
  - PK: canto_cod_canto (SERIAL)
  - FK: provi_cod_provi (INTEGER)
  - Código SEPS: canto_cod_cant (CHAR(2); UNIQUE por provincia)
- rrfparro (parroquias)
  - PK: parro_cod_parro (SERIAL)
  - FK: canto_cod_canto (INTEGER)
  - Código SEPS: parro_cod_parr (CHAR(2); UNIQUE por cantón)
  - Tipo área: parro_tip_area ('R' | 'U' | NULL)
- Soft delete: campo de fecha fec_elimi.

## CIIU (resumen desde Swagger)
- Entidades expuestas: SeccionEntity, ActividadEntity, ActividadCompletaEntity, ArbolCiiuEntity.
- Relaciones jerárquicas en árbol (niveles 1-6). Detalles de columnas no documentados en los archivos de referencia; revisar código si se requiere precisión.

## Observaciones
- Scripts SQL disponibles para GEO: database/scripts/001-CreateGeoCatalog.sql.
- TypeORM está disponible en dependencias; implementación actual de GEO usa PgService y repositorio manual.
