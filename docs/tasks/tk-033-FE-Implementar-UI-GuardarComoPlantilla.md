# Ticket: TK-033

## Título
FE: Implementar UI y Acción "Guardar como Plantilla"

## Descripción
Añadir un botón/acción "Guardar como Plantilla" en la interfaz de edición de vacantes (TK-024). Al activarlo, debe mostrar un diálogo/modal para que el usuario introduzca el nombre deseado para la plantilla y confirmar la acción, que luego llamará a la API correspondiente (TK-031).

## User Story Relacionada
US-008: Utilizar Plantillas para Crear Vacantes

## Criterios de Aceptación Técnicos (Verificables)
1.  En la vista de edición de vacante (TK-024), existe un botón "Guardar como Plantilla".
2.  Al hacer clic, se abre un modal/prompt pidiendo el "Nombre de la Plantilla".
3.  El modal tiene botones "Guardar" y "Cancelar".
4.  Si se introduce un nombre no vacío y se hace clic en "Guardar", se invoca la lógica (TK-035) para llamar a `POST /api/v1/job-templates` pasando el nombre y el ID de la vacante actual.
5.  Si la llamada API es exitosa, se cierra el modal y se muestra un mensaje de confirmación.
6.  Si la llamada API falla (ej. nombre duplicado), se muestra el error en el modal.
7.  Al hacer clic en "Cancelar" o cerrar el modal, no se realiza ninguna acción.

## Solución Técnica Propuesta (Opcional)
Usar componentes modales del framework UI.

## Dependencias Técnicas (Directas)
* TK-024 (Interfaz Edición Vacante)
* TK-035 (Lógica Frontend API Plantillas)

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-008)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Añadir botón UI, crear componente modal/prompt, validación básica nombre]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, vacancy, job, template, save, modal

## Comentarios
Interacción de usuario relativamente simple.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]