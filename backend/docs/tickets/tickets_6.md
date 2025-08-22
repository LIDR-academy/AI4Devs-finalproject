## 6. Tickets Buscar especialistas por especialidad y ubicación [US-1]

**Historia de usuario relacionada:**  
- **ID:** 1  
- **Título:** Buscar especialistas por especialidad y ubicación  
- **Descripción:** Como visitante, quiero buscar especialistas por especialidad y ubicación (ciudad y estado), para encontrar médicos adecuados a mis necesidades sin necesidad de registrarme.

### 6.1 [Backend] Diseñar el endpoint de búsqueda de especialistas por especialidad y ubicación (ciudad y estado)

**Descripción detallada:**  
- **Propósito:**  
Definir la estructura y parámetros del endpoint que permitirá a los visitantes buscar especialistas médicos filtrando por especialidad, ciudad y estado, cumpliendo los criterios del Product Backlog y modelo de datos.
- **Detalle específico:**  
Diseñar el endpoint REST (por ejemplo, `GET /api/doctors/search`) que acepte los siguientes parámetros de consulta:
  - `specialty_id` (ID de la especialidad)
  - `city_id` (ID de la ciudad)
  - `state_id` (ID del estado)
El endpoint debe estar accesible sin autenticación y retornar información básica del especialista y su ubicación general.

**Criterios de aceptación:**  
- El endpoint está definido y documentado en el backend.
- Los parámetros de consulta permiten filtrar por especialidad, ciudad y estado.
- El endpoint está accesible para usuarios no autenticados.
- **Pruebas de validación:**  
  - Revisar la definición del endpoint y sus parámetros en el código y documentación.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Documentación

**Comentarios y Notas:**  
Asegurarse de que el endpoint cumpla con los criterios de aceptación del Product Backlog y modelo de datos.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [14/08/2025] [GitHub Copilot] Ticket creado para diseño de endpoint de búsqueda de especialistas.


### 6.2 [Backend] Implementar la lógica de consulta para búsqueda de especialistas por especialidad y ubicación

**Descripción detallada:**  
- **Propósito:**  
Desarrollar la funcionalidad backend que permita consultar la base de datos y retornar especialistas filtrados por especialidad, ciudad y estado, utilizando Prisma y PostgreSQL.
- **Detalle específico:**  
Implementar la lógica en el controlador correspondiente para el endpoint `GET /api/doctors/search`. La consulta debe:
  - Unir las tablas DOCTOR, DOCTOR_SPECIALTY, SPECIALTY, LOCATION, CITY y STATE según el modelo de datos.
  - Permitir filtrar por `specialty_id`, `city_id` y `state_id`.
  - Retornar información básica del especialista (nombre, especialidad, ciudad, estado, foto, biografía).
  - Solo mostrar especialistas activos.
  - Optimizar la consulta para responder en menos de 2 segundos.

**Criterios de aceptación:**  
- La consulta retorna solo especialistas activos que cumplen con los filtros.
- La información básica del especialista y su ubicación general se incluye en la respuesta.
- El endpoint responde en menos de 2 segundos con datos de prueba.
- **Pruebas de validación:**  
  - Probar la consulta con diferentes combinaciones de filtros y verificar los resultados.
  - Medir el tiempo de respuesta con datos simulados.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Core de Dominio

**Comentarios y Notas:**  
Revisar el modelo de datos para asegurar la correcta relación entre entidades. Optimizar la consulta para evitar sobrecarga y asegurar tiempos de respuesta.

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [14/08/2025] [GitHub Copilot] Ticket creado para implementación de lógica de consulta de especialistas.


### 6.3 [Backend] Agregar validaciones de entrada para filtros de especialidad, ciudad y estado

**Descripción detallada:**  
- **Propósito:**  
Garantizar que los parámetros recibidos en el endpoint de búsqueda sean válidos y seguros, evitando consultas erróneas o maliciosas.
- **Detalle específico:**  
Implementar validaciones en el controlador del endpoint para:
  - Verificar que `specialty_id`, `city_id` y `state_id` sean enteros positivos.
  - Validar que los IDs existan en la base de datos antes de ejecutar la consulta.
  - Retornar errores claros en caso de parámetros inválidos o inexistentes.

**Criterios de aceptación:**  
- El endpoint rechaza parámetros inválidos y retorna mensajes de error claros.
- Solo se ejecutan consultas con parámetros válidos y existentes.
- Las validaciones no afectan el tiempo de respuesta (<2 segundos).
- **Pruebas de validación:**  
  - Probar el endpoint con parámetros válidos e inválidos y verificar las respuestas.
  - Intentar consultas con IDs inexistentes y validar el manejo de errores.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Validación

**Comentarios y Notas:**  
Utilizar librerías como Joi, Zod o validaciones propias según el stack. Documentar los mensajes de error en la documentación técnica.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [14/08/2025] [GitHub Copilot] Ticket creado para validaciones de entrada en búsqueda de especialistas.

### 6.4 [Backend] Configurar paginación y tiempos de respuesta óptimos en el endpoint de búsqueda de especialistas

**Descripción detallada:**  
- **Propósito:**  
Mejorar la experiencia de usuario y el rendimiento del sistema asegurando que el endpoint de búsqueda devuelva resultados paginados y responda en menos de 2 segundos.
- **Detalle específico:**  
Implementar paginación en el endpoint (`GET /api/doctors/search`) usando parámetros como `page` y `limit`. Optimizar la consulta con Prisma para que el tiempo de respuesta sea menor a 2 segundos, incluso con grandes volúmenes de datos. Retornar metadatos de paginación (total de resultados, página actual, total de páginas).

**Criterios de aceptación:**  
- El endpoint acepta y procesa correctamente los parámetros de paginación.
- La respuesta incluye metadatos de paginación.
- El tiempo de respuesta es menor a 2 segundos con datos simulados.
- **Pruebas de validación:**  
  - Probar el endpoint con diferentes valores de `page` y `limit`.
  - Medir el tiempo de respuesta y validar los metadatos.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Rendimiento

**Comentarios y Notas:**  
Asegurarse de que la paginación sea compatible con los filtros de búsqueda y que los metadatos sean claros para el frontend.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [14/08/2025] [GitHub Copilot] Ticket creado para paginación y optimización de tiempos de respuesta en búsqueda de especialistas.


### 6.5 [Backend] Documentar el endpoint de búsqueda de especialistas por especialidad y ubicación

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración y el mantenimiento del sistema documentando el endpoint de búsqueda para que otros desarrolladores y el frontend puedan consumirlo correctamente.
- **Detalle específico:**  
Documentar el endpoint `GET /api/doctors/search` en Swagger o README, incluyendo:
  - Descripción de la funcionalidad.
  - Parámetros de consulta (`specialty_id`, `city_id`, `state_id`, `page`, `limit`).
  - Ejemplo de petición y respuesta.
  - Estructura de los datos retornados (nombre, especialidad, ciudad, estado, foto, biografía).
  - Posibles errores y mensajes de validación.

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y respuesta.
- Los parámetros y mensajes de error están descritos.
- **Pruebas de validación:**  
  - Revisar la documentación y verificar que cubre todos los aspectos funcionales del endpoint.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Documentación  
- Característica del producto: Backend, API REST, Documentación

**Comentarios y Notas:**  
Actualizar la documentación si el endpoint cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [14/08/2025] [GitHub Copilot] Ticket creado para documentación de endpoint de búsqueda de especialistas.

### 6.6 [Backend] Crear pruebas unitarias para el endpoint de búsqueda de especialistas por especialidad y ubicación

**Descripción detallada:**  
- **Propósito:**  
Asegurar la calidad y correcto funcionamiento del endpoint de búsqueda mediante pruebas unitarias que validen los casos principales y los posibles errores.
- **Detalle específico:**  
Desarrollar pruebas unitarias para el endpoint `GET /api/doctors/search` que cubran:
  - Búsqueda exitosa con filtros válidos.
  - Respuesta vacía cuando no hay especialistas que cumplan los filtros.
  - Manejo de parámetros inválidos (IDs inexistentes, tipos incorrectos).
  - Validación de paginación y tiempos de respuesta.
Utilizar el framework de pruebas definido en el backend (por ejemplo, Jest o Mocha).

**Criterios de aceptación:**  
- Las pruebas unitarias cubren los casos principales y errores del endpoint.
- Todas las pruebas pasan correctamente en el entorno de desarrollo.
- Las pruebas pueden ejecutarse automáticamente.
- **Pruebas de validación:**  
  - Ejecutar el comando de pruebas y verificar que todas pasan.

**Prioridad:**  
Baja

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Backend, Pruebas Unitarias

**Comentarios y Notas:**  
Actualizar las pruebas si el endpoint cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [14/08/2025] [GitHub Copilot] Ticket creado para pruebas unitarias del endpoint de búsqueda de especialistas.