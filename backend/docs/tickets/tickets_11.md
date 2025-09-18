## 11. Ver listado de próximas citas [US-9]

**Historia de usuario relacionada:**  
- **ID:** 9  
- **Título:** Ver listado de próximas citas  
- **Descripción:** Como médico especialista, quiero ver el listado de mis próximas citas, para planificar mi día de trabajo.

### 11.1 [Backend] Diseñar el endpoint para ver listado de próximas citas del médico especialista

**Descripción detallada:**  
- **Propósito:**  
Definir la estructura y parámetros del endpoint que permitirá a los médicos especialistas consultar el listado actualizado de sus próximas citas.
- **Detalle específico:**  
Diseñar el endpoint REST (por ejemplo, `GET /api/doctor/upcoming-appointments`) que:
  - Requiera autenticación de médico especialista.
  - Retorne el listado de citas futuras (estado: pending/confirmed) ordenadas por fecha.
  - Incluya información relevante del paciente (nombre, teléfono, motivo de consulta) y detalles de la cita (fecha, hora, estado).
  - Permita filtrar por fecha y estado si es necesario.
  - Cumpla con la normativa de protección de datos personales (LFPDPPP).

**Criterios de aceptación:**  
- El endpoint está definido y documentado en el backend.
- El médico puede consultar el listado de próximas citas con información relevante.
- El acceso requiere autenticación y respeta la privacidad de los datos.
- **Pruebas de validación:**  
  - Revisar la definición del endpoint y sus parámetros en el código y documentación.
  - Probar acceso con usuario autenticado y verificar la información retornada.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Documentación, Seguridad

**Comentarios y Notas:**  
Asegurarse de que el endpoint cumpla con los criterios de aceptación del Product Backlog, modelo de datos y normativas de privacidad.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para diseño de endpoint para ver próximas citas del médico especialista.

### 11.2 [Backend] Implementar la lógica para consultar el listado de próximas citas del médico especialista

**Descripción detallada:**  
- **Propósito:**  
Desarrollar la funcionalidad backend que permita a los médicos especialistas consultar el listado actualizado de sus próximas citas, mostrando información relevante y cumpliendo con la normativa de protección de datos personales.
- **Detalle específico:**  
Implementar la lógica en el controlador para el endpoint `GET /api/doctor/upcoming-appointments`:
  - Validar autenticación y rol de médico especialista.
  - Consultar la entidad APPOINTMENT filtrando por `doctor_id`, estado ("pending", "confirmed") y fecha futura.
  - Incluir información relevante del paciente (nombre, teléfono, motivo de consulta) y detalles de la cita (fecha, hora, estado).
  - Permitir filtrar por fecha y estado si es necesario.
  - Cumplir con la LFPDPPP ocultando datos sensibles según permisos.

**Criterios de aceptación:**  
- El médico puede consultar el listado de próximas citas con información relevante y actualizada.
- El acceso requiere autenticación y respeta la privacidad de los datos personales.
- El sistema permite filtrar citas por fecha y estado.
- **Pruebas de validación:**  
  - Probar la consulta con usuario autenticado y verificar la información retornada.
  - Validar el filtrado por fecha y estado.

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
- [17/08/2025] [GitHub Copilot] Ticket creado para lógica de consulta de próximas citas del médico especialista.

### 11.3 [Backend] Documentar el endpoint para ver próximas citas del médico especialista

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración y el mantenimiento del sistema documentando el endpoint para consultar próximas citas, permitiendo que el frontend y otros desarrolladores lo consuman correctamente.
- **Detalle específico:**  
Documentar el endpoint `GET /api/doctor/upcoming-appointments` en Swagger o README, incluyendo:
  - Descripción de la funcionalidad y requisitos de autenticación.
  - Parámetros de consulta y posibles filtros (fecha, estado).
  - Ejemplo de petición y respuesta.
  - Estructura de los datos retornados (información relevante del paciente y cita).
  - Campos sensibles y controles de acceso conforme a la LFPDPPP.
  - Posibles errores y mensajes de validación.

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y respuesta.
- Los parámetros y mensajes de error están descritos.
- Se especifica el acceso autenticado y las restricciones de privacidad.
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
- [17/08/2025] [GitHub Copilot] Ticket creado para documentación de endpoint de próximas citas del médico especialista.

### 11.4 [Backend] Crear pruebas unitarias para el endpoint de próximas citas del médico especialista

**Descripción detallada:**  
- **Propósito:**  
Asegurar la calidad y correcto funcionamiento del endpoint de próximas citas mediante pruebas unitarias que validen los casos principales y los posibles errores.
- **Detalle específico:**  
Desarrollar pruebas unitarias para el endpoint `GET /api/doctor/upcoming-appointments` que cubran:
  - Consulta exitosa de próximas citas con usuario autenticado.
  - Filtrado por fecha y estado.
  - Validación de permisos y control de acceso.
  - Manejo de errores por citas inexistentes, estados inválidos o datos sensibles.
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
- [17/08/2025] [GitHub Copilot] Ticket creado para pruebas unitarias del endpoint de próximas citas del médico especialista.

### 11.5 [Backend] Ticket de despliegue inicial del sistema Buscadoc

**Descripción detallada:**  
- **Propósito:**  
Preparar y ejecutar el despliegue inicial del sistema Buscadoc, asegurando que el backend esté disponible para pruebas y uso real.
- **Detalle específico:**  
- Configurar el entorno de producción (variables de entorno, base de datos PostgreSQL, almacenamiento de archivos).
- Generar build de backend y frontend.
- Desplegar el backend en el servidor o plataforma seleccionada (Heroku, Vercel, AWS, etc.).
- Verificar la conectividad con la base de datos y el correcto funcionamiento de los endpoints principales.
- Documentar el proceso de despliegue y los pasos para futuras actualizaciones.

**Criterios de aceptación:**  
- El sistema está desplegado y accesible desde el frontend y herramientas de prueba.
- El backend responde correctamente a los endpoints principales.
- La base de datos está conectada y operativa.
- El proceso de despliegue está documentado y reproducible.
- **Pruebas de validación:**  
  - Acceder al sistema desde el frontend y probar los endpoints principales.
  - Verificar logs y monitoreo básico del sistema en producción.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Backend, Despliegue, Documentación

**Comentarios y Notas:**  
Asegurarse de que las variables de entorno y credenciales estén protegidas. Documentar cualquier incidencia o ajuste realizado durante el despliegue.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para despliegue inicial del sistema Buscadoc.