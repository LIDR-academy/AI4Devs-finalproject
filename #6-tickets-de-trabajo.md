**Ticket 1**: LOG-US1-DB-01: Modelo de Persistencia Relacional y Restricciones Defensivas
Descripción: Crear la tabla física incidents en PostgreSQL implementando restricciones duras a nivel de esquema para evitar datos corruptos.

Criterios de Aceptación Técnicos:

* Generar un script de migración (Flyway/Liquibase) para la tabla incidents (id, system_name, urgency, raw_logs, status, created_at).

* Incluir CHECK CONSTRAINTS en la base de datos para asegurar que la columna urgency solo acepte valores válidos ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').


**Ticket 2**: API Rest de Ingesta y Controlador Global de Excepciones
Descripción: Desarrollar el endpoint REST POST /api/v1/incidents blindado contra payloads inválidos o maliciosos.

Criterios de Aceptación Técnicos:

* Implementar validación de datos en el controlador mediante anotaciones JSR-380 (@NotNull, @NotBlank, @Size).

* Desarrollar un @ControllerAdvice global para interceptar fallos de validación y transformarlos en respuestas limpias (HTTP 400 Bad Request).

* Diseñar algoritmos estrictamente lineales en el backend para mitigar vectores de ataques de denegación de servicio (DoS) al parsear logs masivos.


**Ticket 3**: LOG-US1-BE-02B: Capa de Servicios Inmutables y DTOs de Desacoplamiento
Descripción: Introducir una arquitectura limpia desacoplando por completo el frontend y el transporte de datos de las entidades de persistencia de la base de datos.

Criterios de Aceptación Técnicos:

* Crear clases de transferencia de datos de entrada (IncidentRequest) y salida (IncidentResponse) inmutables.

* Garantizar mediante pruebas unitarias que el controlador web nunca interactúe o exponga la entidad JPA pura de base de datos.


**Ticket 4**: LOG-US1-BE-02B: Capa de Servicios Inmutables y DTOs de Desacoplamiento
Descripción: Introducir una arquitectura limpia desacoplando por completo el frontend y el transporte de datos de las entidades de persistencia de la base de datos.

Criterios de Aceptación Técnicos:

* Crear clases de transferencia de datos de entrada (IncidentRequest) y salida (IncidentResponse) inmutables.

* Garantizar mediante pruebas unitarias que el controlador web nunca interactúe o exponga la entidad JPA pura de base de datos.