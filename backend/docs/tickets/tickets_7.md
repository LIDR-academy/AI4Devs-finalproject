## 7. Ver perfil de especialista [US-2]

**Historia de usuario relacionada:**  
- **ID:** 2  
- **Título:** Ver perfil de especialista  
- **Descripción:** Como visitante, quiero ver el perfil de un especialista, para conocer su información profesional y ubicación general antes de decidirme a agendar una cita.

### 7.1 [Backend] Diseñar el endpoint para consultar el perfil de especialista

**Descripción detallada:**  
- **Propósito:**  
Definir la estructura y parámetros del endpoint que permitirá a los visitantes consultar el perfil profesional y ubicación general de un especialista desde los resultados de búsqueda.
- **Detalle específico:**  
Diseñar el endpoint REST (por ejemplo, `GET /api/doctors/:id`) que reciba el identificador del especialista y retorne:
  - Información profesional (nombre, especialidad, biografía, foto, cédula profesional, título).
  - Ubicación general (ciudad y estado, sin mostrar dirección exacta).
  - Ocultar datos personales sensibles (correo, teléfono, dirección exacta) para visitantes no autenticados.

**Criterios de aceptación:**  
- El endpoint está definido y documentado en el backend.
- El visitante puede acceder al perfil desde los resultados de búsqueda.
- Solo se muestran datos permitidos según el PRD y criterios de aceptación.
- **Pruebas de validación:**  
  - Revisar la definición del endpoint y sus parámetros en el código y documentación.
  - Probar acceso con usuario no autenticado y verificar que no se muestran datos sensibles.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Documentación

**Comentarios y Notas:**  
Asegurarse de cumplir con la LFPDPPP y mostrar únicamente datos permitidos para visitantes.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para diseño de endpoint de perfil de especialista.


### 7.2 [Backend] Implementar la lógica de consulta del perfil de especialista

**Descripción detallada:**  
- **Propósito:**  
Desarrollar la funcionalidad backend que permita consultar y retornar la información profesional y ubicación general de un especialista, ocultando datos personales sensibles para visitantes no autenticados.
- **Detalle específico:**  
Implementar la lógica en el controlador para el endpoint `GET /api/doctors/:id`:
  - Consultar las entidades DOCTOR, USER, DOCTOR_SPECIALTY, SPECIALTY, LOCATION, CITY y STATE.
  - Retornar: nombre, apellidos, especialidad, biografía, foto, cédula profesional, título, ciudad y estado.
  - No incluir: correo, teléfono, dirección exacta, ni datos sensibles.
  - Validar que el especialista esté activo.

**Criterios de aceptación:**  
- El endpoint retorna la información profesional y ubicación general del especialista.
- Los datos personales sensibles no se incluyen en la respuesta para visitantes.
- El especialista debe estar activo para mostrar su perfil.
- **Pruebas de validación:**  
  - Probar el endpoint con un visitante y verificar que solo se muestran los datos permitidos.
  - Probar con un especialista inactivo y validar que no se muestra el perfil.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Core de Dominio

**Comentarios y Notas:**  
Revisar el modelo de datos y criterios de aceptación del Product Backlog y PRD para asegurar el cumplimiento normativo (LFPDPPP).

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para implementación de lógica de consulta de perfil de especialista.

### 7.3 [Backend] Agregar validaciones para ocultar datos personales sensibles a visitantes no autenticados en el perfil de especialista

**Descripción detallada:**  
- **Propósito:**  
Cumplir con la LFPDPPP y los criterios del PRD, asegurando que los visitantes solo puedan ver información profesional y ubicación general del especialista, ocultando datos personales sensibles.
- **Detalle específico:**  
Implementar validaciones en el controlador del endpoint `GET /api/doctors/:id` para:
  - Ocultar datos sensibles como correo electrónico, teléfono y dirección exacta.
  - Mostrar únicamente: nombre, apellidos, especialidad, biografía, foto, cédula profesional, título, ciudad y estado.
  - Validar el rol del usuario (visitante/no autenticado) antes de retornar la información.

**Criterios de aceptación:**  
- Los visitantes no autenticados solo ven información profesional y ubicación general.
- Los datos personales sensibles no se incluyen en la respuesta.
- El endpoint cumple con la normativa LFPDPPP.
- **Pruebas de validación:**  
  - Probar el endpoint como visitante y verificar que no se muestran datos sensibles.
  - Revisar la respuesta y asegurar que solo se incluyen los campos permitidos.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Seguridad, Validación

**Comentarios y Notas:**  
Revisar el modelo de datos y criterios legales en el PRD para asegurar el cumplimiento normativo.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para validaciones de privacidad en perfil de especialista.

### 7.4 [Backend] Documentar el endpoint de perfil de especialista

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración y el mantenimiento del sistema documentando el endpoint de perfil de especialista para que otros desarrolladores y el frontend puedan consumirlo correctamente.
- **Detalle específico:**  
Documentar el endpoint `GET /api/doctors/:id` en Swagger o README, incluyendo:
  - Descripción de la funcionalidad.
  - Parámetro de ruta (`id` del especialista).
  - Ejemplo de petición y respuesta.
  - Estructura de los datos retornados (nombre, apellidos, especialidad, biografía, foto, cédula profesional, título, ciudad y estado).
  - Campos ocultos para visitantes (correo, teléfono, dirección exacta).
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
- [17/08/2025] [GitHub Copilot] Ticket creado para documentación de endpoint de perfil de especialista.

### 7.5 [Backend] Crear pruebas unitarias para el endpoint de perfil de especialista

**Descripción detallada:**  
- **Propósito:**  
Asegurar la calidad y correcto funcionamiento del endpoint de perfil de especialista mediante pruebas unitarias que validen los casos principales y los posibles errores.
- **Detalle específico:**  
Desarrollar pruebas unitarias para el endpoint `GET /api/doctors/:id` que cubran:
  - Consulta exitosa de perfil con datos válidos.
  - Ocultamiento de datos personales sensibles para visitantes no autenticados.
  - Manejo de especialistas inactivos (no mostrar perfil).
  - Validación de errores por ID inexistente o formato incorrecto.
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
- [17/08/2025] [GitHub Copilot] Ticket creado para pruebas unitarias del endpoint de perfil de especialista.