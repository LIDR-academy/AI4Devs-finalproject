## 10. Gestionar agenda y disponibilidad [US-8]

**Historia de usuario relacionada:**  
- **ID:** 8  
- **Título:** Gestionar agenda y disponibilidad  
- **Descripción:** Como médico especialista, quiero gestionar mi agenda y disponibilidad, para organizar mis consultas y confirmar o rechazar citas.

### 10.1 [Backend] Diseñar el endpoint para gestionar agenda y disponibilidad del médico especialista

**Descripción detallada:**  
- **Propósito:**  
Definir la estructura y parámetros del endpoint que permitirá a los médicos especialistas gestionar su agenda, definir disponibilidad y administrar citas.
- **Detalle específico:**  
Diseñar los siguientes endpoints REST:
  - `GET /api/doctor/availability` (consultar disponibilidad actual)
  - `POST /api/doctor/availability` (definir o modificar disponibilidad)
  - `GET /api/doctor/appointments` (consultar citas agendadas)
  - `PATCH /api/doctor/appointments/:id` (confirmar o rechazar cita)
Los endpoints deben requerir autenticación de médico y permitir bloquear fechas por motivos personales.

**Criterios de aceptación:**  
- Los endpoints están definidos y documentados en el backend.
- Permiten consultar, definir y modificar disponibilidad.
- Permiten consultar citas y confirmar/rechazar citas.
- Requieren autenticación de médico especialista.
- **Pruebas de validación:**  
  - Revisar la definición de los endpoints y sus parámetros en el código y documentación.
  - Probar acceso con usuario autenticado y verificar las operaciones permitidas.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Documentación, Seguridad

**Comentarios y Notas:**  
Asegurarse de que los endpoints cumplan con los criterios de aceptación del Product Backlog y modelo de datos. Considerar dependencias con la gestión de citas y notificaciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para diseño de endpoint para gestionar agenda y disponibilidad del médico especialista.

### 10.2 [Backend] Implementar la lógica para definir y modificar disponibilidad del médico especialista

**Descripción detallada:**  
- **Propósito:**  
Permitir que el médico especialista defina y modifique sus horarios disponibles para consultas, bloqueando fechas por motivos personales y actualizando la agenda en tiempo real.
- **Detalle específico:**  
Implementar la lógica en el controlador para los endpoints:
  - `POST /api/doctor/availability` (definir/modificar disponibilidad)
  - Validar autenticación y rol de médico especialista.
  - Registrar rangos de fechas y horas disponibles en la base de datos.
  - Permitir bloquear fechas específicas por motivos personales.
  - Actualizar la disponibilidad en tiempo real para reflejar cambios en la agenda.

**Criterios de aceptación:**  
- El médico puede definir y modificar su disponibilidad de manera flexible.
- Las fechas bloqueadas no aparecen como disponibles para agendar citas.
- La disponibilidad se actualiza correctamente en la base de datos.
- **Pruebas de validación:**  
  - Probar la definición y modificación de disponibilidad con diferentes rangos de fechas y horas.
  - Verificar que las fechas bloqueadas no permiten agendar citas.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Core de Dominio, Seguridad

**Comentarios y Notas:**  
Revisar el modelo de datos (DOCTOR, APPOINTMENT) y dependencias con la gestión de citas y notificaciones.

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para implementación de lógica de disponibilidad del médico especialista.

### 10.3 [Backend] Implementar la lógica para consultar citas agendadas y disponibilidad actual del médico especialista

**Descripción detallada:**  
- **Propósito:**  
Permitir que el médico especialista consulte su agenda de citas y su disponibilidad actual, facilitando la organización y planificación de sus consultas.
- **Detalle específico:**  
Implementar la lógica en los controladores para los endpoints:
  - `GET /api/doctor/availability`: Retornar los rangos de fechas y horas disponibles del médico.
  - `GET /api/doctor/appointments`: Retornar el listado de citas agendadas, incluyendo información relevante del paciente y estado de la cita.
  - Validar autenticación y rol de médico especialista.
  - Filtrar citas por fecha y estado si se requiere.
  - Asegurar que la información cumpla con la normativa de protección de datos personales.

**Criterios de aceptación:**  
- El médico puede consultar su disponibilidad y el listado de citas agendadas.
- La información de citas incluye datos relevantes del paciente y estado de la cita.
- El sistema permite filtrar citas por fecha y estado.
- Cumple con la normativa LFPDPPP.
- **Pruebas de validación:**  
  - Probar la consulta de disponibilidad y citas con diferentes filtros.
  - Verificar que los datos personales del paciente se muestran solo según permisos.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Core de Dominio, Seguridad

**Comentarios y Notas:**  
Revisar el modelo de datos (APPOINTMENT, PATIENT, DOCTOR) y dependencias con la gestión de agenda y protección de datos.

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para lógica de consulta de citas y disponibilidad del médico especialista.

### 10.4 [Backend] Implementar la lógica para confirmar o rechazar citas agendadas por el médico especialista

**Descripción detallada:**  
- **Propósito:**  
Permitir que el médico especialista confirme o rechace citas agendadas, actualizando el estado de la cita y notificando al paciente sobre el cambio.
- **Detalle específico:**  
Implementar la lógica en el controlador para el endpoint `PATCH /api/doctor/appointments/:id`:
  - Validar autenticación y rol de médico especialista.
  - Permitir cambiar el estado de la cita a "confirmed" o "rejected".
  - Registrar la acción en la base de datos y actualizar la disponibilidad si la cita es rechazada.
  - Notificar al paciente sobre la confirmación o rechazo de la cita (puede ser por correo o notificación interna).

**Criterios de aceptación:**  
- El médico puede confirmar o rechazar citas agendadas desde su agenda.
- El estado de la cita se actualiza correctamente en la base de datos.
- El paciente recibe notificación sobre el cambio de estado.
- La disponibilidad se actualiza si la cita es rechazada.
- **Pruebas de validación:**  
  - Probar la confirmación y rechazo de citas con diferentes estados.
  - Verificar que el paciente recibe la notificación correspondiente.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Core de Dominio, Seguridad, Notificaciones

**Comentarios y Notas:**  
Revisar el modelo de datos (APPOINTMENT, NOTIFICATION) y dependencias con la gestión de agenda y notificaciones.

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para lógica de confirmación/rechazo de citas por el médico especialista.

### 10.5 [Backend] Documentar los endpoints para gestión de agenda y disponibilidad del médico especialista

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración y el mantenimiento del sistema documentando los endpoints de gestión de agenda y disponibilidad para médicos especialistas.
- **Detalle específico:**  
Documentar los endpoints:
  - `GET /api/doctor/availability`
  - `POST /api/doctor/availability`
  - `GET /api/doctor/appointments`
  - `PATCH /api/doctor/appointments/:id`
Incluyendo:
  - Descripción de la funcionalidad y requisitos de autenticación.
  - Parámetros de consulta, entrada y ruta.
  - Ejemplo de petición y respuesta.
  - Estructura de los datos retornados (disponibilidad, citas, estado de cita).
  - Campos sensibles y controles de acceso.
  - Posibles errores y mensajes de validación.

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y respuesta.
- Los parámetros y mensajes de error están descritos.
- Se especifica el acceso autenticado y las operaciones permitidas para médicos.
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
- [17/08/2025] [GitHub Copilot] Ticket creado para documentación de endpoints de gestión de agenda y disponibilidad del médico especialista.

### 10.6 [Backend] Crear pruebas unitarias para los endpoints de gestión de agenda y disponibilidad del médico especialista

**Descripción detallada:**  
- **Propósito:**  
Asegurar la calidad y correcto funcionamiento de los endpoints de gestión de agenda y disponibilidad mediante pruebas unitarias que validen los casos principales y los posibles errores.
- **Detalle específico:**  
Desarrollar pruebas unitarias para los endpoints:
  - `GET /api/doctor/availability`
  - `POST /api/doctor/availability`
  - `GET /api/doctor/appointments`
  - `PATCH /api/doctor/appointments/:id`
Las pruebas deben cubrir:
  - Definición y modificación exitosa de disponibilidad.
  - Consulta de citas y disponibilidad con usuario autenticado.
  - Confirmación y rechazo de citas.
  - Validación de permisos y control de acceso.
  - Manejo de errores por fechas bloqueadas, citas inexistentes o estados inválidos.
Utilizar el framework de pruebas definido en el backend (por ejemplo, Jest o Mocha).

**Criterios de aceptación:**  
- Las pruebas unitarias cubren los casos principales y errores de los endpoints.
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
- [17/08/2025] [GitHub Copilot] Ticket creado para pruebas unitarias de endpoints de gestión de agenda y disponibilidad del médico especialista.