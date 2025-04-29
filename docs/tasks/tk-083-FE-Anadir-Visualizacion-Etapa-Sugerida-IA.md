# Ticket: TK-083

## Título
FE: Añadir Visualización de Etapa Sugerida IA a UI Candidatura

## Descripción
Modificar los componentes de UI del frontend del ATS MVP que muestran información de candidaturas (vista de detalle, vista de lista/Kanban) para incluir una indicación clara de la `etapa_sugerida` por la IA, si está disponible. Debe diferenciarse visualmente de la etapa actual.

## User Story Relacionada
US-028: Mostrar Etapa de Pipeline Sugerida por IA

## Criterios de Aceptación Técnicos (Verificables)
1.  En la vista de detalle de una candidatura evaluada, se muestra el texto de la `etapa_sugerida` (ej. "Sugerencia IA: Mover a Entrevista").
2.  En la vista de lista/tabla de candidatos (TK-029), se añade una columna o indicador que muestra la `etapa_sugerida`.
3.  En la vista Kanban (TK-030), la tarjeta del candidato incluye una indicación de la `etapa_sugerida`.
4.  La visualización de la etapa sugerida es claramente distinguible de la etapa actual en la que se encuentra el candidato.
5.  Si la candidatura no tiene etapa sugerida, no se muestra este elemento o indica "N/A".

## Solución Técnica Propuesta (Opcional)
Añadir un campo de texto o un badge/tag a los componentes existentes. Usar estilos CSS para diferenciarla de la etapa actual.

## Dependencias Técnicas (Directas)
* Componente UI Detalle Candidatura.
* Componente UI Lista/Tabla Candidatos (TK-029).
* Componente UI Kanban (TK-030).
* TK-084 (Lógica Frontend para obtener la etapa sugerida).
* Diseño de UI/Mockups.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-028)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Modificación UI en 3 lugares (detalle, lista, kanban), manejo condicional]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, component, candidate, detail, list, kanban, stage-suggestion, display

## Comentarios
Asegurar consistencia visual en las diferentes vistas.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]