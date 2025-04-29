# Ticket: TK-034

## Título
FE: Implementar UI y Acción "Cargar desde Plantilla"

## Descripción
Añadir una opción/botón "Cargar desde Plantilla" en la interfaz de creación de vacantes (TK-019). Al activarlo, debe obtener la lista de plantillas disponibles de la API (TK-031), permitir al usuario seleccionar una, obtener los detalles de esa plantilla y pre-rellenar los campos del formulario de creación con esos datos.

## User Story Relacionada
US-008: Utilizar Plantillas para Crear Vacantes

## Criterios de Aceptación Técnicos (Verificables)
1.  En la vista de creación de vacante (TK-019), existe un botón/enlace "Cargar desde Plantilla".
2.  Al hacer clic, se invoca la lógica (TK-035) para llamar a `GET /api/v1/job-templates` y obtener la lista de plantillas (id, nombre).
3.  Se muestra un selector (ej. dropdown, modal con lista) con los nombres de las plantillas disponibles.
4.  Al seleccionar una plantilla, se invoca la lógica (TK-035) para llamar a `GET /api/v1/job-templates/{templateId}` para obtener los `datos_vacante` de esa plantilla.
5.  Los campos del formulario de creación (Título, Depto, Ubic, Reqs, Descripción, etc.) se rellenan automáticamente con los valores recibidos en `datos_vacante`.
6.  El usuario puede entonces editar los campos pre-rellenados antes de guardar la nueva vacante (US-005 / TK-020).

## Solución Técnica Propuesta (Opcional)
Usar un dropdown o un modal para la selección de plantillas. La lógica de pre-rellenado actualizará el estado del formulario.

## Dependencias Técnicas (Directas)
* TK-019 (Interfaz Creación Vacante)
* TK-035 (Lógica Frontend API Plantillas)

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-008)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Añadir botón/selector UI, lógica para listar y seleccionar, lógica para pre-rellenar formulario]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, vacancy, job, template, load, form

## Comentarios
La clave es mapear correctamente los `datos_vacante` JSON a los campos del formulario.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]