## 8. Buscar especialistas y ver perfiles [US-4]

**Historia de usuario relacionada:**  
- **ID:** 4  
- **Título:** Buscar especialistas y ver perfiles  
- **Descripción:** Como paciente, quiero buscar especialistas y ver sus perfiles, para comparar opciones y tomar decisiones informadas.

### 8.1 [Backend] Diseñar el endpoint de búsqueda de especialistas para pacientes (con filtros avanzados y acceso autenticado)

**Descripción detallada:**  
- **Propósito:**  
Definir la estructura y parámetros del endpoint que permitirá a los pacientes buscar especialistas médicos utilizando filtros avanzados y acceso autenticado.
- **Detalle específico:**  
Diseñar el endpoint REST (por ejemplo, `GET /api/patient/doctors/search`) que acepte los siguientes parámetros de consulta:
  - `specialty_id` (ID de la especialidad)
  - `city_id` (ID de la ciudad)
  - `state_id` (ID del estado)
  - Filtros adicionales: valoración mínima, disponibilidad, etc.
El endpoint debe requerir autenticación y retornar información detallada del especialista para comparación.

**Criterios de aceptación:**  
- El endpoint está definido y documentado en el backend.
- Los parámetros de consulta permiten filtrar por especialidad, ubicación y otros criterios relevantes.
- El endpoint requiere autenticación de paciente.
- **Pruebas de validación:**  
  - Revisar la definición del endpoint y sus parámetros en el código y documentación.
  - Probar acceso con usuario autenticado y verificar los filtros avanzados.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Documentación, Seguridad

**Comentarios y Notas:**  
Asegurarse de que el endpoint cumpla con los criterios de aceptación del Product Backlog y modelo de datos. Considerar dependencias con el catálogo de especialidades y gestión de ciudades/estados.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para diseño de endpoint de búsqueda de especialistas para pacientes.

### 8.2 [Backend] Implementar la lógica de consulta en el backend para búsqueda y comparación de especialistas (usando Prisma y PostgreSQL)

**Descripción detallada:**  
- **Propósito:**  
Desarrollar la funcionalidad backend que permita a pacientes autenticados buscar y comparar especialistas utilizando filtros avanzados, mostrando información relevante para la toma de decisiones.
- **Detalle específico:**  
Implementar la lógica en el controlador para el endpoint `GET /api/patient/doctors/search`:
  - Consultar las entidades DOCTOR, DOCTOR_SPECIALTY, SPECIALTY, LOCATION, CITY, STATE y RATING.
  - Permitir filtrar por especialidad, ciudad, estado, valoración mínima y disponibilidad.
  - Retornar información detallada del especialista (nombre, especialidad, biografía, foto, ciudad, estado, valoración promedio).
  - Solo mostrar especialistas activos.
  - Optimizar la consulta para responder en menos de 2 segundos.

**Criterios de aceptación:**  
- La consulta retorna especialistas activos que cumplen con los filtros avanzados.
- La información relevante para comparación se incluye en la respuesta.
- El endpoint responde en menos de 2 segundos con datos simulados.
- **Pruebas de validación:**  
  - Probar la consulta con diferentes combinaciones de filtros y verificar los resultados.
  - Medir el tiempo de respuesta y validar los datos retornados.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Core de Dominio

**Comentarios y Notas:**  
Revisar el modelo de datos y criterios de aceptación del Product Backlog y PRD para asegurar la correcta relación entre entidades y cumplimiento de requisitos.

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para implementación de lógica de búsqueda y comparación de especialistas para pacientes.

### 8.3 [Backend] Diseñar el endpoint para consultar el perfil completo de especialista (acceso autenticado)

**Descripción detallada:**  
- **Propósito:**  
Definir la estructura y parámetros del endpoint que permitirá a los pacientes autenticados consultar el perfil completo de un especialista, incluyendo información adicional relevante para la comparación y agendamiento.
- **Detalle específico:**  
Diseñar el endpoint REST (por ejemplo, `GET /api/patient/doctors/:id`) que reciba el identificador del especialista y retorne:
  - Información profesional (nombre, especialidad, biografía, foto, cédula profesional, título).
  - Ubicación completa (ciudad, estado, dirección profesional).
  - Valoración promedio y comentarios de pacientes.
  - Disponibilidad para agendar cita.
El endpoint debe requerir autenticación de paciente y mostrar información adicional respecto al endpoint público.

**Criterios de aceptación:**  
- El endpoint está definido y documentado en el backend.
- El paciente autenticado puede acceder al perfil completo desde los resultados de búsqueda.
- Se muestran datos adicionales permitidos para pacientes registrados.
- **Pruebas de validación:**  
  - Revisar la definición del endpoint y sus parámetros en el código y documentación.
  - Probar acceso con usuario autenticado y verificar que se muestran los datos completos.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Documentación, Seguridad

**Comentarios y Notas:**  
Asegurarse de cumplir con la LFPDPPP y mostrar únicamente datos permitidos para pacientes autenticados.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para diseño de endpoint de perfil completo de especialista para pacientes.


### 8.4 [Backend] Implementar la lógica de consulta del perfil completo en el backend, mostrando información adicional para pacientes registrados

**Descripción detallada:**  
- **Propósito:**  
Desarrollar la funcionalidad backend que permita a pacientes autenticados consultar el perfil completo de un especialista, mostrando información adicional relevante para la comparación y agendamiento.
- **Detalle específico:**  
Implementar la lógica en el controlador para el endpoint `GET /api/patient/doctors/:id`:
  - Consultar las entidades DOCTOR, USER, DOCTOR_SPECIALTY, SPECIALTY, LOCATION, CITY, STATE y RATING.
  - Retornar: nombre, apellidos, especialidad, biografía, foto, cédula profesional, título, ciudad, estado, dirección profesional, valoración promedio y comentarios de pacientes, disponibilidad para agendar cita.
  - Validar que el especialista esté activo.
  - Mostrar información adicional solo si el usuario está autenticado como paciente.

**Criterios de aceptación:**  
- El endpoint retorna el perfil completo del especialista para pacientes autenticados.
- Se incluyen datos adicionales respecto al endpoint público.
- El especialista debe estar activo para mostrar su perfil.
- **Pruebas de validación:**  
  - Probar el endpoint con un paciente autenticado y verificar que se muestran los datos completos.
  - Probar con un especialista inactivo y validar que no se muestra el perfil.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Core de Dominio, Seguridad

**Comentarios y Notas:**  
Revisar el modelo de datos y criterios de aceptación del Product Backlog y PRD para asegurar el cumplimiento normativo y la correcta relación entre entidades.

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para implementación de lógica de consulta de perfil completo de especialista para pacientes.

### 8.5 [Backend] Agregar validaciones y controles de acceso para mostrar información sensible solo a pacientes autenticados

**Descripción detallada:**  
- **Propósito:**  
Garantizar que solo los pacientes autenticados puedan acceder a información sensible y completa del perfil de especialista, cumpliendo con la LFPDPPP y los criterios del PRD.
- **Detalle específico:**  
Implementar validaciones en el controlador del endpoint `GET /api/patient/doctors/:id` para:
  - Verificar que el usuario esté autenticado como paciente antes de mostrar datos sensibles (dirección profesional, teléfono, comentarios de pacientes).
  - Ocultar información sensible para usuarios no autenticados o con roles distintos.
  - Registrar intentos de acceso no autorizado para auditoría.

**Criterios de aceptación:**  
- Solo pacientes autenticados pueden ver información sensible del perfil de especialista.
- Los datos sensibles no se incluyen en la respuesta para usuarios no autorizados.
- El endpoint cumple con la normativa LFPDPPP.
- **Pruebas de validación:**  
  - Probar el endpoint como paciente autenticado y como visitante/no autenticado, verificando los datos retornados.
  - Revisar la respuesta y asegurar que solo se incluyen los campos permitidos según el rol.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Seguridad, Validación

**Comentarios y Notas:**  
Revisar el modelo de datos y criterios legales en el PRD para asegurar el cumplimiento normativo y correcto control de acceso.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para validaciones y controles de acceso en perfil completo de especialista.

### 8.6 [Backend] Documentar los endpoints de búsqueda y perfil de especialista para pacientes (Swagger o README)

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración y el mantenimiento del sistema documentando los endpoints de búsqueda y perfil completo de especialista para pacientes autenticados.
- **Detalle específico:**  
Documentar los endpoints:
  - `GET /api/patient/doctors/search`
  - `GET /api/patient/doctors/:id`
Incluyendo:
  - Descripción de la funcionalidad y requisitos de autenticación.
  - Parámetros de consulta y ruta (especialidad, ubicación, valoración, disponibilidad, id).
  - Ejemplo de petición y respuesta.
  - Estructura de los datos retornados (incluyendo información adicional para pacientes).
  - Campos sensibles y controles de acceso.
  - Posibles errores y mensajes de validación.

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y respuesta.
- Los parámetros y mensajes de error están descritos.
- Se especifica el acceso autenticado y los datos adicionales para pacientes.
- **Pruebas de validación:**  
  - Revisar la documentación y verificar que cubre todos los aspectos funcionales de los endpoints.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Documentación  
- Característica del producto: Backend, API REST, Documentación, Seguridad

**Comentarios y Notas:**  
Actualizar la documentación si los endpoints cambian en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para documentación de endpoints de búsqueda y perfil de especialista para pacientes.

### 8.7 [Backend] Crear pruebas unitarias para los endpoints de búsqueda y perfil de especialista para pacientes

**Descripción detallada:**  
- **Propósito:**  
Asegurar la calidad y correcto funcionamiento de los endpoints de búsqueda y perfil completo de especialista para pacientes mediante pruebas unitarias que validen los casos principales y los posibles errores.
- **Detalle específico:**  
Desarrollar pruebas unitarias para los endpoints:
  - `GET /api/patient/doctors/search`
  - `GET /api/patient/doctors/:id`
Las pruebas deben cubrir:
  - Búsqueda exitosa con filtros avanzados y usuario autenticado.
  - Consulta exitosa de perfil completo con usuario autenticado.
  - Ocultamiento de información sensible para usuarios no autenticados.
  - Manejo de especialistas inactivos y errores por ID inexistente o formato incorrecto.
  - Validación de paginación y tiempos de respuesta.
Utilizar el framework de pruebas definido en el backend (por ejemplo, Jest o Mocha).

**Criterios de aceptación:**  
- Las pruebas unitarias cubren los casos principales y errores de ambos endpoints.
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
Actualizar las pruebas si los endpoints cambian en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para pruebas unitarias de endpoints de búsqueda y perfil de especialista para pacientes.