-- Script para configurar particionamiento en la tabla historial_estimaciones
-- Este script debe ejecutarse después de que Prisma haya creado las tablas

-- 1. Crear tabla temporal para migrar los datos existentes (si los hubiera)
CREATE TABLE temp_historial_estimaciones (LIKE historial_estimaciones INCLUDING ALL);

-- 2. Copiar datos existentes a la tabla temporal (si los hubiera)
INSERT INTO temp_historial_estimaciones SELECT * FROM historial_estimaciones;

-- 3. Eliminar restricciones e índices para permitir la conversión a tabla particionada
ALTER TABLE historial_estimaciones DROP CONSTRAINT historial_estimaciones_pkey CASCADE;
DROP INDEX IF EXISTS historial_estimaciones_tarea_id_idx;
DROP INDEX IF EXISTS historial_estimaciones_usuario_id_idx;
DROP INDEX IF EXISTS historial_estimaciones_fecha_cambio_idx;

-- 4. Eliminar la tabla original
DROP TABLE historial_estimaciones;

-- 5. Recrear la tabla como particionada por rango sobre fecha_cambio
CREATE TABLE historial_estimaciones (
    id SERIAL,
    tarea_id INTEGER NOT NULL,
    estimacion_anterior INTEGER,
    estimacion_nueva INTEGER,
    factor_carga_anterior FLOAT,
    factor_carga_nueva FLOAT,
    usuario_id INTEGER NOT NULL,
    fecha_cambio TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (fecha_cambio);

-- 6. Crear particiones para diferentes rangos de tiempo
-- Partición para datos antiguos (ajusta las fechas según necesites)
CREATE TABLE historial_estimaciones_y2023 PARTITION OF historial_estimaciones
    FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

-- Partición para el año actual
CREATE TABLE historial_estimaciones_y2024 PARTITION OF historial_estimaciones
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Partición para el próximo año
CREATE TABLE historial_estimaciones_y2025 PARTITION OF historial_estimaciones
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- 7. Añadir clave primaria y restricciones
ALTER TABLE historial_estimaciones ADD PRIMARY KEY (id, fecha_cambio);

-- 8. Recrear índices en la tabla particionada
CREATE INDEX ON historial_estimaciones (tarea_id, fecha_cambio);
CREATE INDEX ON historial_estimaciones (usuario_id, fecha_cambio);
CREATE INDEX ON historial_estimaciones (fecha_cambio);

-- 9. Restaurar datos desde la tabla temporal
INSERT INTO historial_estimaciones SELECT * FROM temp_historial_estimaciones;

-- 10. Eliminar tabla temporal
DROP TABLE temp_historial_estimaciones;

-- 11. Añadir restricción de clave externa a la tabla particionada
ALTER TABLE historial_estimaciones ADD CONSTRAINT fk_historial_estimaciones_tarea
    FOREIGN KEY (tarea_id) REFERENCES tareas_extended (id);

-- 12. Crear función para añadir automáticamente nuevas particiones (mantenimiento)
CREATE OR REPLACE FUNCTION crear_particion_historial_estimaciones(
    año INTEGER
)
RETURNS VOID AS $$
DECLARE
    particion_nombre TEXT;
    fecha_inicio TEXT;
    fecha_fin TEXT;
BEGIN
    particion_nombre := 'historial_estimaciones_y' || año;
    fecha_inicio := año || '-01-01';
    fecha_fin := (año + 1) || '-01-01';
    
    -- Verificar si la partición ya existe
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE tablename = particion_nombre
    ) THEN
        EXECUTE format(
            'CREATE TABLE %I PARTITION OF historial_estimaciones
             FOR VALUES FROM (%L) TO (%L)',
            particion_nombre, fecha_inicio, fecha_fin
        );
        
        RAISE NOTICE 'Partición % creada exitosamente para el año %', particion_nombre, año;
    ELSE
        RAISE NOTICE 'La partición % ya existe para el año %', particion_nombre, año;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de uso:
-- SELECT crear_particion_historial_estimaciones(2026); 