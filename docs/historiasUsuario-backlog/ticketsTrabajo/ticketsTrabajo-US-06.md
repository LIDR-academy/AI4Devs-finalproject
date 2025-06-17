# Tickets de Trabajo - US-06: Asignación de equipo y planificación de tarea

## Ticket US-06-01: Implementación de algoritmo de recomendación

### Descripción
Desarrollar el algoritmo que recomendará equipos para cada tarea basándose en múltiples factores como matriz de afinidad, capacidad actual y factor de carga, proporcionando una clasificación ordenada de los equipos más adecuados.

### Criterios de Aceptación
- El algoritmo debe considerar la matriz de afinidad entre equipos y departamentos
- Debe tener en cuenta la capacidad actual de cada equipo y su disponibilidad
- Debe considerar el factor de carga de la tarea
- Debe generar una lista ordenada de equipos recomendados
- Para cada equipo, debe proporcionar una puntuación y justificación de la recomendación
- El algoritmo debe ejecutarse en menos de 2 segundos para proporcionar resultados en tiempo real
- Debe ser configurable para ajustar los pesos de diferentes factores en la recomendación

### Detalles
**Prioridad**: Alta  
**Estimación**: 8 puntos de historia  
**Asignado a**: Equipo Backend  
**Etiquetas**: Backend, Algoritmo, IA, Sprint 3  

### Comentarios
Considerar la posibilidad de implementar un sistema basado en reglas con capacidad de aprendizaje para mejorar las recomendaciones con el tiempo. Documentar los factores y su ponderación para garantizar la transparencia del algoritmo.

### Enlaces
- Documento de diseño del algoritmo de recomendación
- Especificación de la matriz de afinidad
- Datos históricos de asignaciones previas para entrenamiento

### Historial de Cambios
- 2025-05-10 - Creación del ticket

---

## Ticket US-06-02: Desarrollo de interfaz de visualización de recomendaciones

### Descripción
Implementar la interfaz de usuario que mostrará las recomendaciones de equipos para cada tarea, permitiendo al usuario comprender y seleccionar entre las diferentes opciones propuestas por el algoritmo.

### Criterios de Aceptación
- La interfaz debe mostrar una lista ordenada de equipos recomendados
- Para cada equipo debe mostrar: puntuación, razones de la recomendación, carga actual y disponibilidad
- Debe incluir filtros para refinar la lista de recomendaciones
- La interfaz debe ser clara y facilitar la comparación entre diferentes opciones
- Debe incluir visualizaciones (gráficos, iconos) para facilitar la comprensión
- Debe ser accesible según los estándares WCAG 2.1
- Debe permitir seleccionar un equipo para continuar con el proceso de planificación

### Detalles
**Prioridad**: Alta  
**Estimación**: 5 puntos de historia  
**Asignado a**: Equipo Frontend  
**Etiquetas**: Frontend, UI/UX, Accesibilidad, Sprint 4  

### Comentarios
Utilizar elementos visuales como barras de progreso, códigos de colores y tooltips para facilitar la interpretación de la información. Considerar realizar pruebas de usabilidad para optimizar la experiencia.

### Enlaces
- Mockups de la interfaz de recomendaciones
- Guía de estilo de UI de TaskDistributor
- Documento de especificación de US-06

### Historial de Cambios
- 2025-05-10 - Creación del ticket

---

## Ticket US-06-03: Implementación de selector de fechas con validaciones

### Descripción
Desarrollar el componente que permitirá a los usuarios seleccionar las fechas de inicio y fin para la planificación de una tarea, incluyendo validaciones y verificación de conflictos de disponibilidad.

### Criterios de Aceptación
- El componente debe permitir seleccionar fechas de inicio y fin para la tarea
- Debe validar que la fecha fin sea posterior a la fecha inicio
- Debe mostrar advertencias si hay conflictos con otras tareas del mismo equipo
- La interfaz debe incluir un calendario visual para facilitar la selección
- Debe respetar la disponibilidad del equipo seleccionado
- Debe calcular y mostrar la duración en sprints basada en las fechas seleccionadas
- Debe ser accesible y funcionar con teclado además del ratón

### Detalles
**Prioridad**: Alta  
**Estimación**: 5 puntos de historia  
**Asignado a**: Equipo Frontend  
**Etiquetas**: Frontend, UI/UX, Validación, Sprint 4  

### Comentarios
Integrar este componente con la visualización de capacidad de equipos para mostrar la ocupación actual durante la selección de fechas. Considerar la posibilidad de implementar un sistema de sugerencia de fechas basado en la disponibilidad.

### Enlaces
- Mockups del selector de fechas
- Documento de diseño de la lógica de validación
- Especificación de integración con el calendario de equipos

### Historial de Cambios
- 2025-05-10 - Creación del ticket

---

## Ticket US-06-04: Desarrollo de lógica de verificación de conflictos

### Descripción
Implementar la lógica que detectará y gestionará conflictos potenciales en la planificación de tareas, como sobrecargas de equipos, solapamientos o inconsistencias.

### Criterios de Aceptación
- El sistema debe detectar si un equipo estaría sobrecargado en el periodo seleccionado
- Debe identificar solapamientos con otras tareas de alta prioridad
- Debe verificar la disponibilidad del equipo (periodos vacacionales, días festivos)
- Debe generar advertencias claras y específicas sobre los conflictos detectados
- Debe proporcionar recomendaciones alternativas cuando sea posible
- La verificación debe ejecutarse tanto en tiempo real como al confirmar la asignación
- Debe permitir forzar la asignación a pesar de los conflictos con la autorización adecuada

### Detalles
**Prioridad**: Alta  
**Estimación**: 6 puntos de historia  
**Asignado a**: Equipo Backend  
**Etiquetas**: Backend, Lógica de negocio, Validación, Sprint 4  

### Comentarios
Implementar diferentes niveles de advertencia según la gravedad del conflicto. Considerar la posibilidad de integrar un sistema de aprobaciones para casos en que se fuercen asignaciones con conflictos graves.

### Enlaces
- Documento de reglas de negocio para conflictos
- Diagrama de flujo del proceso de verificación
- Especificación de niveles de advertencia

### Historial de Cambios
- 2025-05-10 - Creación del ticket

---

## Ticket US-06-05: Integración con API de Redmine para planificación

### Descripción
Implementar la sincronización bidireccional de asignaciones de equipos y fechas de planificación entre TaskDistributor y Redmine, asegurando la consistencia entre ambos sistemas.

### Criterios de Aceptación
- Las asignaciones y fechas deben sincronizarse automáticamente con Redmine
- Se debe implementar un mecanismo de reintentos en caso de fallos de comunicación
- El sistema debe manejar adecuadamente los errores de la API de Redmine
- Se debe mantener un registro de las sincronizaciones para auditoría
- La sincronización no debe bloquear la interfaz de usuario durante su ejecución
- Debe implementarse validación para asegurar la consistencia de datos entre ambos sistemas
- Debe soportar sincronización en ambas direcciones (cambios en Redmine deben reflejarse en TaskDistributor)

### Detalles
**Prioridad**: Alta  
**Estimación**: 5 puntos de historia  
**Asignado a**: Equipo Backend  
**Etiquetas**: Backend, Integración, API, Sprint 5  

### Comentarios
Realizar las sincronizaciones de manera síncrona para evitar complejizar el sistema.

### Enlaces
- Documentación de la API de Redmine
- Especificación de integración con sistemas externos
- Diagrama de secuencia para sincronización

### Historial de Cambios
- 2025-05-10 - Creación del ticket 