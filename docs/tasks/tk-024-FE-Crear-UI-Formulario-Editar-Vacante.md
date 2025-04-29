# Ticket: TK-024

## Título
FE: Crear Interfaz de Usuario para Formulario "Editar Vacante"

## Descripción
Desarrollar el componente de UI en el frontend del ATS MVP que presenta el formulario para editar una vacante existente. Debe ser similar al formulario de creación (TK-019) pero pre-cargado con los datos actuales de la vacante obtenidos de la API. Permitir editar Título, Depto, Ubicación, Reqs Clave, Descripción (este último campo podría ser más complejo si es un editor enriquecido).

## User Story Relacionada
US-006: Editar Información de Vacante Existente

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una ruta/página accesible (ej. `/vacantes/{jobId}/editar`) que muestra el formulario de edición.
2.  Al cargar la página, se obtienen los datos de la vacante actual (vía TK-025) y los campos del formulario (Título, Depto, Ubic, Reqs, Descripción) se rellenan con estos datos.
3.  Los campos son editables por el usuario.
4.  Los campos Título y Ubicación mantienen la validación de obligatorios.
5.  Existen botones "Guardar Cambios" y "Cancelar".
6.  Al hacer clic en "Cancelar", se redirige al usuario a la vista de detalle de la vacante (sin guardar cambios).

## Solución Técnica Propuesta (Opcional)
Reutilizar componentes del formulario de creación (TK-019) si es posible. Usar el framework frontend y librerías UI. El campo Descripción puede requerir un componente de editor de texto enriquecido.

## Dependencias Técnicas (Directas)
* TK-025 (Lógica Frontend para obtener y enviar datos)
* Diseño de UI/Mockups para el formulario de edición.
* (Potencial) Componente de Editor de Texto Enriquecido (si se usa para Descripción).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-006)

## Estimación Técnica Preliminar
[ 5 ] [horas] - [Desarrollo componente formulario, lógica de pre-carga de datos, reutilización/adaptación de TK-019]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, vacancy, job, edit, form, component

## Comentarios
La complejidad puede aumentar si el campo "Descripción" usa un editor complejo.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]