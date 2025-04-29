# Ticket: TK-094

## Título
FE: Renderizar Columnas (Etapas) y Tarjetas (Candidatos) en Kanban

## Descripción
Implementar la lógica en el componente Kanban (TK-092) o en su contenedor para: 1) Tomar la lista de etapas (obtenida por TK-093) y renderizar las columnas del tablero en el orden correcto. 2) Tomar los datos de candidaturas agrupadas (obtenidos por TK-093) y renderizar las tarjetas correspondientes dentro de cada columna/etapa.

## User Story Relacionada
US-030: Visualizar Pipeline de Selección en Tablero Kanban

## Criterios de Aceptación Técnicos (Verificables)
1.  El componente Kanban recibe la lista ordenada de etapas (`stages`) y el objeto de candidaturas agrupadas (`groupedApplications`).
2.  Itera sobre la lista `stages` para crear cada columna del Kanban, usando `stage.nombre` como título de columna y `stage.id` como identificador. Las columnas se renderizan en el orden de `stages`.
3.  Para cada `stage.id`, busca las candidaturas correspondientes en `groupedApplications[stage.id]`.
4.  Itera sobre las candidaturas encontradas para esa etapa y renderiza una tarjeta (`KanbanCard`) por cada una dentro de esa columna.
5.  Pasa los datos necesarios de la candidatura a cada componente `KanbanCard` (ver TK-095).
6.  Si una etapa no tiene candidaturas, la columna se muestra vacía.

## Solución Técnica Propuesta (Opcional)
Lógica de renderizado estándar usando bucles/map sobre los datos recibidos como props en el componente Kanban.

## Dependencias Técnicas (Directas)
* TK-092 (Componente Kanban base)
* TK-093 (Lógica que proporciona los datos)
* TK-095 (Componente que renderiza el contenido de cada tarjeta)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-030)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Implementación lógica de renderizado dinámico de columnas y tarjetas basado en datos]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, render, kanban, stage, application, card, loop

## Comentarios
Lógica central de pintado del tablero.

## Enlaces o Referencias
[Documentación del framework sobre renderizado condicional y listas]