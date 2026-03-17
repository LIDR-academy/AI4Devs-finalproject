# Plantilla de Historia de Usuario

## Título de la Historia de Usuario: [US-XX: Título descriptivo]

### Historia de Usuario
**Como** [rol del usuario],  
**quiero** [acción que desea realizar el usuario],  
**para que** [beneficio que espera obtener el usuario].

### Criterios de Aceptación
- [Detalle específico de funcionalidad]
- [Detalle específico de funcionalidad]
- [Detalle específico de funcionalidad]

### Notas Adicionales
- [Cualquier consideración adicional]

### Historias de Usuario Relacionadas
- [Relaciones con otras historias de usuario]

### Tareas
- [Lista de tareas y subtareas para que esta historia pueda ser completada]

## Estimación

| Item | Impacto en usuario/negocio | Urgencia | Complejidad/Esfuerzo | Riesgos/Dependencias |
|------|----------------------------|----------|----------------------|----------------------|
| [US-XX: Título] | [Alto/Medio/Bajo] | [Alta/Media/Baja] | [Alta (8+)/Media (5)/Baja (2)] | [Alto/Medio/Bajo/N/A - Descripción] |

---

# Ejemplo de Historia de Usuario Completada

## US-01: Creación de tarea por usuario de negocio

### Historia de Usuario
**Como** usuario de negocio,  
**quiero** crear una nueva tarea en el sistema,  
**para que** pueda solicitar desarrollos al departamento de tecnología.

### Criterios de Aceptación
- El formulario debe incluir todos los campos obligatorios (asunto, descripción, prioridad)
- Al crear la tarea, debe sincronizarse automáticamente con Redmine
- El usuario debe recibir confirmación visual de que la tarea se ha creado correctamente

### Notas Adicionales
- La interfaz debe seguir las guías de diseño establecidas para TaskDistributor
- El rendimiento de creación no debe superar los 2 segundos

### Historias de Usuario Relacionadas
- US-02: Edición de tarea
- US-08: Visualización de tareas pendientes

### Tareas
- Diseñar interfaz de formulario de creación
- Implementar validaciones de campos
- Desarrollar integración con API de Redmine
- Implementar almacenamiento en base de datos local
- Crear pruebas unitarias y de integración

## Estimación

| Item | Impacto en usuario/negocio | Urgencia | Complejidad/Esfuerzo | Riesgos/Dependencias |
|------|----------------------------|----------|----------------------|----------------------|
| US-01: Creación de tarea | Alto | Alta | Media (5) | Medio - Depende de disponibilidad de API Redmine | 