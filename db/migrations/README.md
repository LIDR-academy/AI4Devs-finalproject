# Migraciones de Base de Datos

## Cómo aplicar migraciones en Railway

1. Conectarse a la base de datos MySQL en Railway
2. Ejecutar los scripts SQL en orden cronológico

## Migración: add_fecha_solicitud_fin.sql (2025-11-01)

### Objetivo
Agregar columna `fecha_solicitud_fin` para guardar la fecha estimada de finalización que el operario indica al usar una herramienta.

### Comando
```bash
mysql -h <RAILWAY_HOST> -u root -p railway < db/migrations/add_fecha_solicitud_fin.sql
```

O desde Railway MySQL CLI:
```sql
source /path/to/add_fecha_solicitud_fin.sql
```

### Verificación
```sql
DESCRIBE movimientos_herramienta;
```

Debe mostrar la columna `fecha_solicitud_fin DATETIME NULL` después de `fecha_fin`.

### Rollback (si es necesario)
```sql
ALTER TABLE movimientos_herramienta DROP COLUMN fecha_solicitud_fin;
```
