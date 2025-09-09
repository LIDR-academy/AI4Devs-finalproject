## 9. Agendar cita con especialista [US-5]

- **ID:** 5  
- **Título:** Agendar cita con especialista  
- **Descripción:** Como paciente, quiero agendar una cita con un especialista, para reservar una consulta de manera sencilla.

### 9.1 [Backend] Diseñar el endpoint para agendar cita con especialista

**Descripción detallada:**  
- **Propósito:**  
Definir la estructura y parámetros del endpoint que permitirá a los pacientes agendar una cita con un especialista, seleccionando fecha y hora disponibles.
- **Detalle específico:**  
Diseñar el endpoint REST (por ejemplo, `POST /api/appointments`) que reciba:
  - `doctor_id` (ID del especialista)
  - `patient_id` (ID del paciente, obtenido del token de autenticación)
  - `appointment_date` (fecha y hora solicitada)
  - `reason` (motivo de la consulta, opcional)
El endpoint debe validar que el paciente esté autenticado y que la fecha/hora estén disponibles en la agenda del especialista.

**Criterios de aceptación:**  
- El endpoint está definido y documentado en el backend.
- Los parámetros permiten seleccionar especialista, fecha y hora.
- El endpoint requiere autenticación de paciente.
- **Pruebas de validación:**  
  - Revisar la definición del endpoint y sus parámetros en el código y documentación.
  - Probar acceso con usuario autenticado y verificar la validación de disponibilidad.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Documentación, Seguridad

**Comentarios y Notas:**  
Asegurarse de que el endpoint cumpla con los criterios de aceptación del Product Backlog y modelo de datos. Considerar dependencias con la gestión de agenda y disponibilidad del especialista.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para diseño de endpoint para agendar cita con especialista.

### 9.2 [Backend] Implementar la lógica de agendamiento de cita con especialista

**Descripción detallada:**  
- **Propósito:**  
Desarrollar la funcionalidad backend que permita a pacientes autenticados agendar una cita con un especialista, validando disponibilidad y evitando conflictos de horario.
- **Detalle específico:**  
Implementar la lógica en el controlador para el endpoint `POST /api/appointments`:
  - Validar autenticación del paciente.
  - Verificar que la fecha y hora solicitadas (`appointment_date`) estén disponibles en la agenda del especialista.
  - Validar que no existan citas duplicadas o conflictos de horario para el especialista y el paciente.
  - Registrar la cita en la entidad APPOINTMENT con estado "pending".
  - Retornar confirmación de la cita agendada.

**Criterios de aceptación:**  
- El paciente autenticado puede agendar una cita solo en horarios disponibles.
- No se permite agendar citas duplicadas o en horarios ocupados.
- La cita se registra correctamente en la base de datos con estado "pending".
- El sistema retorna confirmación de la cita.
- **Pruebas de validación:**  
  - Probar agendamiento con horarios disponibles y ocupados.
  - Verificar que no se permiten duplicados ni conflictos de horario.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Core de Dominio, Seguridad

**Comentarios y Notas:**  
Revisar el modelo de datos (APPOINTMENT, DOCTOR, PATIENT) y dependencias con la gestión de agenda y disponibilidad. Considerar futuras extensiones para cancelación y reprogramación.

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para implementación de lógica de agendamiento de cita con especialista.

### 9.3 [Backend] Validar disponibilidad y conflictos de horario al agendar cita

**Historia de usuario relacionada:**  
- **ID:** 5  
- **Título:** Agendar cita con especialista  
- **Descripción:** Como paciente, quiero agendar una cita con un especialista, para reservar una consulta de manera sencilla.

**Descripción detallada:**  
- **Propósito:**  
Asegurar que la fecha y hora seleccionadas por el paciente estén disponibles en la agenda del especialista y que no existan conflictos de horario antes de registrar la cita.
- **Detalle específico:**  
Implementar validaciones en el controlador del endpoint `POST /api/appointments` para:
  - Consultar la agenda del especialista y verificar disponibilidad en la fecha/hora solicitada.
  - Validar que el paciente no tenga otra cita en el mismo horario.
  - Retornar un error claro si la fecha/hora no está disponible o existe conflicto.
  - Permitir agendar solo si no hay conflictos.

**Criterios de aceptación:**  
- El sistema valida disponibilidad y evita conflictos de horario.
- El paciente recibe mensajes claros en caso de conflicto o falta de disponibilidad.
- Solo se permite agendar citas en horarios libres.
- **Pruebas de validación:**  
  - Probar agendamiento en horarios ocupados y libres.
  - Verificar que no se permiten duplicados ni conflictos para paciente y especialista.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Validación, Seguridad

**Comentarios y Notas:**  
Revisar el modelo de datos (APPOINTMENT, DOCTOR, PATIENT) y dependencias con la gestión de agenda y disponibilidad.

**Enlaces o Referencias:**  
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para validación de disponibilidad y conflictos de horario al agendar cita.

### 9.4 [Backend] Documentar el endpoint para agendar cita con especialista

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración y el mantenimiento del sistema documentando el endpoint de agendamiento de citas para que otros desarrolladores y el frontend puedan consumirlo correctamente.
- **Detalle específico:**  
Documentar el endpoint `POST /api/appointments` en Swagger o README, incluyendo:
  - Descripción de la funcionalidad y requisitos de autenticación.
  - Parámetros de entrada (`doctor_id`, `appointment_date`, `reason`).
  - Ejemplo de petición y respuesta.
  - Validaciones de disponibilidad y conflictos de horario.
  - Posibles errores y mensajes de validación.

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y respuesta.
- Los parámetros y mensajes de error están descritos.
- Se especifica el acceso autenticado y las validaciones de disponibilidad.
- **Pruebas de validación:**  
  - Revisar la documentación y verificar que cubre todos los aspectos funcionales del endpoint.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Documentación  
- Característica del producto: Backend, API REST, Documentación, Seguridad

**Comentarios y Notas:**  
Actualizar la documentación si el endpoint cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para documentación de endpoint para agendar cita con especialista.

### 9.5 [Backend] Documentar el endpoint para agendar cita con especialista

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración y el mantenimiento del sistema documentando el endpoint de agendamiento de citas para que otros desarrolladores y el frontend puedan consumirlo correctamente.
- **Detalle específico:**  
Documentar el endpoint `POST /api/appointments` en Swagger o README, incluyendo:
  - Descripción de la funcionalidad y requisitos de autenticación.
  - Parámetros de entrada (`doctor_id`, `appointment_date`, `reason`).
  - Ejemplo de petición y respuesta.
  - Validaciones de disponibilidad y conflictos de horario.
  - Posibles errores y mensajes de validación.

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y respuesta.
- Los parámetros y mensajes de error están descritos.
- Se especifica el acceso autenticado y las validaciones de disponibilidad.
- **Pruebas de validación:**  
  - Revisar la documentación y verificar que cubre todos los aspectos funcionales del endpoint.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Documentación  
- Característica del producto: Backend, API REST, Documentación, Seguridad

**Comentarios y Notas:**  
Actualizar la documentación si el endpoint cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para documentación de endpoint para agendar cita con especialista.

### 9.6 [Backend] Crear pruebas unitarias para el endpoint de agendar cita con especialista

**Descripción detallada:**  
- **Propósito:**  
Asegurar la calidad y correcto funcionamiento del endpoint de agendamiento de citas mediante pruebas unitarias que validen los casos principales y los posibles errores.
- **Detalle específico:**  
Desarrollar pruebas unitarias para el endpoint `POST /api/appointments` que cubran:
  - Agendamiento exitoso con horarios disponibles y usuario autenticado.
  - Manejo de conflictos de horario y disponibilidad.
  - Validación de parámetros obligatorios y opcionales.
  - Manejo de errores por especialista/paciente inactivo o IDs inexistentes.
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
- [17/08/2025] [GitHub Copilot] Ticket creado para pruebas unitarias del endpoint de agendar cita con especialista.