# Ticket: TK-046

## Título
FE: Añadir Botón "Generar Descripción con IA" a UI Edición Vacante

## Descripción
Modificar el componente de UI del formulario de edición de vacantes (TK-024) para incluir un botón claramente identificable con el texto "Generar Descripción con IA", usualmente cerca o dentro del campo de edición de la descripción.

## User Story Relacionada
US-012: Solicitar Generación de Descripción de Puesto (JD) con IA

## Criterios de Aceptación Técnicos (Verificables)
1.  En la interfaz de usuario de edición de vacante (TK-024), existe un botón con el texto "Generar Descripción con IA" (o similar).
2.  El botón está posicionado de forma lógica cerca del campo de descripción de la vacante.
3.  El botón es interactivo (clickable).
4.  (Opcional) El botón puede estar deshabilitado si no se ha introducido información básica necesaria (ej. título) para la generación.

## Solución Técnica Propuesta (Opcional)
Añadir un componente de botón estándar del framework UI.

## Dependencias Técnicas (Directas)
* TK-024 (Interfaz Edición Vacante donde se añade el botón)
* TK-047 (Lógica que se ejecuta al hacer clic)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-012)

## Estimación Técnica Preliminar
[ 1 ] [hora] - [Añadir botón a UI existente, estilo básico]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, button, vacancy, job, edit, generate-jd, ai

## Comentarios
Cambio visual simple pero necesario para iniciar la acción.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]