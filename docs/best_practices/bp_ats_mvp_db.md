# Mejores Prácticas de Base de Datos - ATS MVP (PostgreSQL con Prisma)

Este documento detalla las mejores prácticas para el diseño, implementación y gestión de la base de datos del ATS MVP, que utiliza PostgreSQL como sistema de gestión y Prisma como ORM, basándose en el esquema definido.

## 1. Diseño del Esquema

- **Alineación con el Modelo de Datos:** Mantener el esquema de la base de datos (definido en `db-overview.md`) sincronizado con el modelo conceptual y lógico del ATS MVP .
- **Uso de UUIDs:** Utilizar UUIDs como claves primarias para todas las tablas principales. Esto facilita la generación de IDs en el cliente o servicio y previene colisiones en arquitecturas distribuidas futuras .
- **Tipos de Datos Apropiados:** Seleccionar los tipos de datos de PostgreSQL más adecuados para cada campo (ej. `VARCHAR` con longitud razonable para strings cortas, `TEXT` para textos largos, `BOOLEAN` para flags, `INTEGER`/`FLOAT` para números) .
- **Tipos Nativos de PostgreSQL:** Aprovechar tipos de datos nativos de PostgreSQL como `UUID`, `JSONB` y `Arrays` cuando sean apropiados para la estructura de los datos (ej. `tags`, `datos_extraidos_cv` si se copian, `scores_parciales` si se copian) .
- **`TIMESTAMP WITH TIME ZONE`:** Utilizar `TIMESTAMP WITH TIME ZONE` para todas las columnas de fecha y hora para evitar problemas de zonas horarias y ambigüedades .
- **Constraints:** Definir constraints a nivel de base de datos (`NOT NULL`, `UNIQUE`, `CHECK`, `PRIMARY KEY`, `FOREIGN KEY`) para asegurar la integridad de los datos según las reglas de negocio .
- **Claves Foráneas (FKs):** Definir explícitamente las relaciones entre tablas utilizando Claves Foráneas. Establecer políticas `ON DELETE` y `ON UPDATE` (ej. `RESTRICT`, `SET NULL`, `CASCADE`) de forma coherente con las reglas de negocio del dominio . `RESTRICT` suele ser un buen valor por defecto para prevenir borrados accidentales de datos referenciados.
- **Índices:** Definir índices (IDX, UNIQUE, GIN) en las columnas utilizadas frecuentemente en cláusulas `WHERE`, `ORDER BY` o `JOIN` para optimizar el rendimiento de las consultas . Recomendar índices GIN para campos `JSONB` y `Arrays` si se realizan consultas frecuentes sobre su contenido . Validar la efectividad de los índices con `EXPLAIN ANALYZE`.

## 2. Implementación con Prisma

- **`schema.prisma` como Fuente de Verdad:** El archivo `schema.prisma` debe ser la representación fiel del esquema de la base de datos y utilizar las características de modelado de Prisma .
- **Prisma Migrate:** Utilizar `prisma migrate` como herramienta principal para gestionar la evolución del esquema de la base de datos de forma controlada y versionada . Seguir un flujo de trabajo claro para crear, revisar y aplicar migraciones.
- **Prisma Client en Repositorios:** La interacción con la base de datos debe realizarse exclusivamente a través de Prisma Client dentro de la capa de Repositorios .
- **Uso Eficiente de Prisma Client:** Escribir consultas utilizando la API de Prisma Client de forma eficiente (seleccionar solo campos necesarios, usar `where`, `orderBy`, `skip`, `take`, `include` para relaciones) .

## 3. Rendimiento

- **Optimización de Consultas:** Analizar el rendimiento de las consultas críticas utilizando `EXPLAIN ANALYZE` y optimizarlas si es necesario mediante índices, ajustes de consulta o desnormalización estratégica .
- **Paginación:** Implementar paginación en las listas y consultas que puedan devolver un gran número de resultados para evitar cargar todos los datos en memoria .
- **Carga de Relaciones:** Utilizar `include` en Prisma de forma consciente para cargar datos relacionados solo cuando sean necesarios, evitando el problema de N+1 queries.

## 4. Seguridad

- **Cifrado en Reposo:** Asegurar que los datos sensibles (PII de candidatos, credenciales de usuario) se almacenen cifrados en la base de datos (RNF-10). Esto puede requerir configuración a nivel del servicio de base de datos o cifrado a nivel de aplicación para campos específicos.
- **Control de Acceso:** Las credenciales de acceso a la base de datos deben gestionarse de forma segura y con privilegios mínimos necesarios para la aplicación (RNF-13).
- **Auditoría:** Habilitar logging de auditoría a nivel de base de datos para registrar accesos y cambios sensibles (RNF-14).
- **Validación a Nivel de DB:** Complementar la validación a nivel de aplicación con constraints a nivel de base de datos para una capa extra de seguridad de los datos.

## 5. Fiabilidad y Consistencia

- **Transacciones:** Utilizar transacciones de base de datos (vía Prisma Client) para operaciones que implican múltiples escrituras relacionadas, asegurando la atomicidad (RNF-21, RNF-23B).
- **Backups y Recuperación:** Implementar una política de copias de seguridad automáticas y probar el proceso de recuperación regularmente (RNF-22).
- **Consistencia Referencial:** Las Claves Foráneas con políticas `ON DELETE` apropiadas ayudan a mantener la consistencia entre tablas relacionadas (RNF-23B).

## 6. Mantenibilidad

- **Migraciones Claras y Reversibles:** Escribir scripts de migración claros, concisos y, si es posible, reversibles. Documentar los cambios de esquema importantes (RNF-24, RNF-26).
- **Documentación del Esquema:** Mantener la documentación del esquema de la base de datos actualizada.

Al aplicar estas mejores prácticas, se construirá una base de datos para el ATS MVP que sea robusta, segura, escalable y fácil de mantener.