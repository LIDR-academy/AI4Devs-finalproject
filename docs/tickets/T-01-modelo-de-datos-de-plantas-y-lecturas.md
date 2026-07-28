# T-01 - Modelo de datos de plantas y lecturas

**Área:** Base de datos
**Historias relacionadas:** [0.1](../user-stories/0.1-registrar-cactus.md), [0.2](../user-stories/0.2-registrar-condiciones-de-cultivo.md), [0.6](../user-stories/0.6-registrar-especie-y-cuidados-recomendados.md), [0.8](../user-stories/0.8-registrar-mezcla-de-tierra.md), [0.9](../user-stories/0.9-registrar-localizacion.md), [0.10](../user-stories/0.10-etiquetar-cactus-con-tags.md)

## Descripción

Diseñar e implementar las tablas necesarias para soportar el catálogo de especies, el inventario de plantas y las lecturas de cuidado, según el modelo descrito en el [README](../../README.md#3-modelo-de-datos) y el [diagrama de modelo de datos](../diagramas/modelo-datos.md).

## Alcance

* Migración de base de datos (PostgreSQL) con las tablas: `soil_mix`, `species`, `location`, `plant`, `tag`, `plant_tag`, `care_record`, `ai_recommendation`.
* Claves primarias (UUID) y claves foráneas correspondientes (incluidas `species.soil_mix_id` → `soil_mix.id`, `plant.location_id` → `location.id`, y `plant_tag.plant_id`/`plant_tag.tag_id` con clave primaria compuesta).
* Restricciones `NOT NULL` en los campos obligatorios (nombre de especie, especie de la planta, fecha de lectura).
* Restricción a nivel de aplicación (o `CHECK` en base de datos) que garantice que `soil_mix.organic_percentage + soil_mix.mineral_percentage = 100`.
* Restricción a nivel de aplicación (o `CHECK` en base de datos) que garantice que `soil_mix.ph_min <= soil_mix.ph_max`.
* Restricción `UNIQUE` en `tag.name` (comparación insensible a mayúsculas/espacios a nivel de aplicación).
* Datos semilla (seed) con 2-3 especies de ejemplo (p. ej. Ariocarpus retusus, Astrophytum asterias), 2-3 mezclas de tierra (p. ej. "Mineral drenaje rápido" 20/80, "Mixta vivero" 40/60), 2-3 localizaciones y algunos tags de ejemplo, para poder probar el flujo E2E sin depender de introducir datos manualmente en cada prueba.

## Fuera de alcance de este ticket

* Campos de override individual de cuidados (pendiente de decisión, ver [0.7](../user-stories/0.7-personalizar-cuidados-de-un-ejemplar.md)).

## Criterios de aceptación

* Las migraciones se ejecutan sin error sobre una base de datos limpia.
* Existe al menos una especie sembrada con todos sus rangos de cuidado.
* Las claves foráneas impiden crear una planta con una especie inexistente, o una lectura con una planta inexistente.
