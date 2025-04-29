# Ticket: TK-048

## Título
FE: Añadir Campos de Configuración IA a UI Edición Vacante

## Descripción
Modificar el componente de UI del formulario de edición de vacantes (TK-024) para incluir los campos necesarios para configurar los parámetros de evaluación IA: un campo numérico para "Score de Corte IA" y dos selectores para "Etapa Sugerida (Aceptación)" y "Etapa Sugerida (Rechazo)".

## User Story Relacionada
US-013: Configurar Parámetros de Evaluación IA para la Vacante

## Criterios de Aceptación Técnicos (Verificables)
1.  En la interfaz de usuario de edición de vacante (TK-024), se añaden los siguientes campos:
    * Input numérico para "Score de Corte IA" (con validación 0-100).
    * Dropdown/Selector para "Etapa Sugerida (Aceptación)".
    * Dropdown/Selector para "Etapa Sugerida (Rechazo)".
2.  Los selectores de etapa se pueblan con las etapas marcadas como "seleccionable_ia" (obtenidas de la lógica de US-002/TK-015).
3.  Los campos muestran los valores actuales si ya fueron configurados previamente para esa vacante (requiere lógica de carga en TK-025 adaptada).
4.  Los campos están agrupados de forma lógica (ej. en una sección "Configuración IA").

## Solución Técnica Propuesta (Opcional)
Usar componentes estándar del framework UI (input number, select/dropdown). Obtener la lista de etapas seleccionables desde el estado/store poblado por TK-015.

## Dependencias Técnicas (Directas)
* TK-024 (Interfaz Edición Vacante donde se añaden los campos)
* Lógica para obtener etapas configuradas (TK-015)
* TK-049 (Lógica Frontend que envía estos datos)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-013)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Añadir campos a UI, poblar selectores, validación básica score]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, form, vacancy, job, edit, ai-config, input, select

## Comentarios
Asegurar que los selectores de etapa se carguen correctamente.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]