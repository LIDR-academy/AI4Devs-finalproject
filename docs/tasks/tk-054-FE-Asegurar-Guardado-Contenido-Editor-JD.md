# Ticket: TK-054

## Título
FE: Asegurar Guardado de Contenido Editado del Editor de JD

## Descripción
Modificar la lógica frontend que guarda los cambios de una vacante (TK-025) para asegurar que obtiene correctamente el contenido actual del Editor de Texto Enriquecido (TK-053) y lo incluye en el campo `descripcion_html` (o similar) de los datos enviados a la API de actualización del backend (TK-022).

## User Story Relacionada
US-014: Recibir y Editar Descripción de Puesto (JD) Generada por IA (y US-006)

## Criterios de Aceptación Técnicos (Verificables)
1.  Al hacer clic en "Guardar Cambios" en el formulario de edición de vacante (TK-024).
2.  La lógica (TK-025) obtiene el contenido actual del componente RTE (TK-053), incluyendo el formato (ej. como HTML).
3.  Este contenido se incluye en el payload de la petición PATCH a `/api/v1/jobs/{jobId}` (TK-022), mapeado al campo correcto (ej. `descripcion_html`).
4.  El guardado funciona correctamente tanto si la descripción fue generada por IA y luego editada, como si fue escrita/editada manualmente.

## Solución Técnica Propuesta (Opcional)
Utilizar el método `getContent()` o similar proporcionado por la librería RTE integrada en TK-053 para obtener el contenido HTML/Markdown actual antes de enviar la petición API en TK-025.

## Dependencias Técnicas (Directas)
* TK-025 (Lógica existente de guardado/API de Vacante a modificar)
* TK-053 (Componente RTE del cual obtener el contenido)
* TK-022 (API Backend que recibe la descripción)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-014/US-006)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Modificar lógica existente para obtener contenido del RTE e incluirlo en la petición API]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, vacancy, job, edit, editor, rte, save

## Comentarios
Asegurar que el formato (HTML/Markdown) obtenido del RTE sea el esperado por el backend.

## Enlaces o Referencias
[Documentación de la librería RTE sobre cómo obtener contenido]