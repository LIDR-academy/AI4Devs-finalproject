# Mejores Prácticas de Base de Datos - TalentIA Core AI (Políglota con PostgreSQL y/o MongoDB)

Este documento detalla las mejores prácticas para el diseño, implementación y gestión de las bases de datos utilizadas por los microservicios de TalentIA Core AI, considerando un posible enfoque de persistencia políglota con PostgreSQL y/o MongoDB, basándose en el esquema definido.

## 1. Diseño del Esquema

- **Alineación con Bounded Contexts:** El modelo de datos de cada base de datos debe estar alineado con el Bounded Context del microservicio que la utiliza . Evitar acoplamientos fuertes a nivel de base de datos entre microservicios.
- **Persistencia Políglota:** Elegir el tipo de base de datos más adecuado para el tipo de datos y patrones de acceso de cada servicio .
    - **PostgreSQL:** Ideal para datos estructurados con relaciones claras (ej. metadatos de evaluaciones, registros de feedback, entidad `DescripcionPuestoGenerada` con parámetros IA) .
    - **MongoDB (Opcional):** Adecuado para datos semi-estructurados o variables (ej. `datos_extraidos_cv`, `perfil_enriquecido`) donde el esquema puede evolucionar más frecuentemente .
- **Uso de UUIDs:** Utilizar UUIDs como identificadores principales para facilitar referencias consistentes entre servicios y con el ATS MVP .
- **Modelado en PostgreSQL:**
    - Definir tablas, columnas y constraints (PK, FK, NOT NULL, UNIQUE, CHECK) según las reglas de negocio para datos estructurados .
    - Utilizar tipos nativos como `UUID`, `JSONB` y `Arrays` donde sea apropiado . `JSONB` es flexible para almacenar estructuras variables como `metadata_ia` o `scores_parciales`.
    - Utilizar `TIMESTAMP WITH TIME ZONE` para fechas .
- **Modelado en MongoDB (Opcional):**
    - Diseñar la estructura de documentos (`CandidatoIA`, `EvaluacionCandidatoIA` para `datos_extraidos_cv`) pensando en los patrones de lectura y escritura del servicio.
    - Aprovechar la flexibilidad de los documentos incrustados y arrays para representar relaciones uno-a-muchos o datos complejos.
- **Referencias entre Bases de Datos:** Las referencias entre entidades que residen en bases de datos diferentes (ej. `evaluacion_ia_id` en `RegistroFeedbackIA` referenciando `EvaluacionCandidatoIA`, `candidato_ia_id` en `EvaluacionCandidatoIA` referenciando `CandidatoIA`) se realizarán a través de los identificadores (UUIDs) a nivel de aplicación, no con Claves Foráneas de base de datos .

## 2. Implementación y Acceso a Datos

- **ORM/ODM Apropiado:** Utilizar el ORM (ej. Spring Data JPA) o ODM (ej. Spring Data MongoDB) correspondiente a la tecnología de base de datos en cada servicio .
- **Encapsulamiento en Repositorios:** La lógica de acceso a datos debe estar encapsulada en la capa de Repositorios dentro de cada microservicio, utilizando el ORM/ODM correspondiente .
- **Migraciones:**
    - **PostgreSQL:** Utilizar herramientas de migración de esquema (ej. Flyway, Liquibase) para gestionar los cambios en la base de datos relacional .
    - **MongoDB (Opcional):** Gestionar los cambios de esquema (si son necesarios) a nivel de aplicación o utilizar herramientas de migración para bases de datos NoSQL si aplica.
- **Transacciones:**
    - **PostgreSQL:** Utilizar transacciones de base de datos (vía ORM/JDBC) para asegurar la atomicidad de las operaciones dentro de un único servicio y base de datos .
    - **Entre Servicios/Bases de Datos:** Las transacciones que abarcan múltiples servicios o bases de datos requerirán estrategias de consistencia eventual o patrones de transacciones distribuidas (ej. Saga), lo cual es avanzado y probablemente fuera del alcance de la Fase 1.

## 3. Rendimiento

- **Indexación:** Definir índices adecuados en las columnas o campos utilizados para búsquedas y ordenaciones frecuentes en cada base de datos . Validar su efectividad.
- **Optimización de Consultas:** Escribir consultas (SQL o a través del ORM/ODM) que sean eficientes y recuperen solo los datos necesarios. Analizar el rendimiento.
- **Diseño de Esquema para Consultas:** Para bases de datos documentales (MongoDB), diseñar la estructura del documento pensando en los patrones de consulta para minimizar joins o lookups.

## 4. Seguridad

- **Cifrado en Reposo:** Cifrar los datos sensibles (PII de candidatos en `CandidatoIA`, `EvaluacionCandidatoIA`, `RegistroFeedbackIA`) en reposo en todas las bases de datos (RNF-10, RNF-29).
- **Control de Acceso:** Configurar credenciales de base de datos específicas para cada microservicio con los permisos mínimos necesarios. Gestionar estas credenciales de forma segura (RNF-13).
- **Auditoría:** Configurar logging de auditoría a nivel de base de datos para monitorizar accesos y cambios (RNF-14).

## 5. Fiabilidad y Consistencia

- **Backups y Recuperación:** Implementar políticas de backup y recuperación para todas las bases de datos de Core AI, alineadas con los RPO/RTO definidos (RNF-22).
- **Consistencia de Datos entre Componentes:** Implementar mecanismos (ej. validación de IDs al recibir datos, manejo de borrados lógicos) para mantener la consistencia de los datos referenciados entre el ATS MVP y Core AI, y entre los propios microservicios de Core AI (RNF-23B). La consistencia eventual puede ser aceptable en algunos casos.

## 6. Mantenibilidad

- **Documentación del Esquema:** Mantener la documentación del esquema de cada base de datos actualizada .
- **Migraciones Claras:** Escribir scripts de migración claros y gestionarlos a través de herramientas automatizadas.

Al seguir estas mejores prácticas, se construirán y gestionarán las bases de datos de TalentIA Core AI de forma robusta, segura y mantenible, soportando la arquitectura de microservicios.