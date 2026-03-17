# Tickets de Trabajo - US-05: Estimación de tarea por tecnología

## Ticket US-05-01: Implementación de componente de entrada de estimación

### Descripción
Desarrollar el componente de interfaz de usuario que permita a los usuarios de tecnología ingresar y visualizar la estimación en sprints para las tareas asignadas.

### Criterios de Aceptación
- El componente debe permitir ingresar un número positivo para la estimación en sprints
- Debe incluir validaciones para asegurar que solo se acepten valores numéricos positivos
- Debe mostrar información contextual sobre el significado de la estimación (ejemplo: 1 sprint = 2 semanas)
- La interfaz debe ser intuitiva y consistente con el diseño general de la aplicación
- Debe ser accesible según los estándares WCAG 2.1
- Al guardar cambios, se debe mostrar una confirmación visual al usuario

### Detalles
**Prioridad**: Alta  
**Estimación**: 3 puntos de historia  
**Asignado a**: Equipo Frontend  
**Etiquetas**: Frontend, UI/UX, Accesibilidad, Sprint 2  

### Comentarios
Considerar implementar un selector numérico con valores predefinidos (0.5, 1, 2, 3, 5, 8) para facilitar la selección de estimaciones comunes según la escala de Fibonacci.

### Enlaces
- Mockups de la interfaz de estimación
- Guía de estilo de UI de TaskDistributor
- Documento de especificación de US-05

### Historial de Cambios
- 2025-05-10 - Creación del ticket

---

## Ticket US-05-02: Implementación de componente para factor de carga

### Descripción
Desarrollar el componente que permita a los usuarios de tecnología definir el factor de carga (1-5) para cada tarea, representando su complejidad o esfuerzo relativo.

### Criterios de Aceptación
- El componente debe permitir seleccionar un valor del 1 al 5 para el factor de carga
- Debe incluir una descripción o tooltip explicando qué representa cada nivel de factor de carga
- La selección debe ser visual e intuitiva (por ejemplo, estrellas o escala de colores)
- Debe validar que solo se seleccionen valores dentro del rango permitido
- La interfaz debe ser accesible y funcionar con teclado además del ratón
- Al guardar cambios, se debe mostrar una confirmación visual al usuario

### Detalles
**Prioridad**: Alta  
**Estimación**: 3 puntos de historia  
**Asignado a**: Equipo Frontend  
**Etiquetas**: Frontend, UI/UX, Accesibilidad, Sprint 2  

### Comentarios
Incluir una leyenda explicativa sobre qué representa cada nivel de factor de carga para ayudar a mantener la consistencia en las estimaciones entre diferentes miembros del equipo.

### Enlaces
- Mockups de la interfaz de factor de carga
- Guía de estilo de UI de TaskDistributor
- Documento de especificación de US-05

### Historial de Cambios
- 2025-05-10 - Creación del ticket

---

## Ticket US-05-03: Implementación de historial de estimaciones

### Descripción
Desarrollar la funcionalidad que permita almacenar y visualizar el historial de cambios en las estimaciones de las tareas, proporcionando trazabilidad y transparencia en el proceso de estimación.

### Criterios de Aceptación
- El sistema debe registrar cada cambio en la estimación, incluyendo valor anterior, nuevo valor, usuario y fecha/hora
- Se debe proporcionar una interfaz para visualizar el historial de cambios de una tarea específica
- El historial debe mostrar tanto los cambios en sprints como en factor de carga
- La visualización debe ser clara y cronológica, mostrando los cambios más recientes primero
- Se debe poder exportar el historial en formato CSV o similar
- Los administradores deben poder ver el historial completo de todas las tareas

### Detalles
**Prioridad**: Media  
**Estimación**: 4 puntos de historia  
**Asignado a**: Equipo Full Stack  
**Etiquetas**: Frontend, Backend, Base de datos, Sprint 3  

### Comentarios
Implementar un diseño de base de datos eficiente para el almacenamiento de los cambios históricos. Considerar la utilización de particionamiento de tablas si se espera un volumen alto de cambios.

### Enlaces
- Mockups de la interfaz de historial
- Modelo de datos del sistema
- Documento de especificación de US-05

### Historial de Cambios
- 2025-05-10 - Creación del ticket 