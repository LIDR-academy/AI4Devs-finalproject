# 04 · Análisis

## Dominios cubiertos
- Geografía: provincias, cantones, parroquias con jerarquía y búsqueda.
- Actividades económicas (CIIU): secciones, actividades, árbol jerárquico y búsqueda/selector.
- Parámetros adicionales: color, icons, opcio, perfi, tofic (estructuras en carpeta parameter/; detalle pendiente de explorar en código).
- Gestión y operación: módulos management/ y operation/ presentes (detalle aún no documentado en archivos anexos).

## Actores y consumidores
- Otros microservicios que necesitan catálogos de referencia vía REST o NATS.
- Operadores con rol ADMIN para operaciones de escritura (según guías de prueba GEO y autenticación mencionada).

## Reglas y políticas observadas
- Soft delete usando campo de fecha (no eliminación física) para GEO.
- Códigos SEPS se mantienen con ceros a la izquierda (ej: "01").
- Límites de búsqueda CIIU: mínimo 3 caracteres sugeridos y límite 50 resultados por default 20.
- Autenticación vía bearer; escritura exige permisos elevados según guías.

## Integraciones
- REST expuesto (Swagger /doc). Base path observada /api/v1 para CIIU.
- NATS: context handlers en módulos (ej. GeoContext), símbolo de inyección por puerto en GEO.
- BD PostgreSQL con script SQL para catálogos GEO.
