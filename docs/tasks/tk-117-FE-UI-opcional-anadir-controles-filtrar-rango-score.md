# Ticket: TK-117

## Título
FE-UI: (Opcional) Añadir Controles UI para Filtrar por Rango de Score

## Descripción
**(Funcionalidad Opcional)** Añadir controles de interfaz de usuario (ej. inputs numéricos para Mín/Máx, o un slider de rango) a la vista de lista de candidatos (TK-087) para permitir al usuario especificar un rango de Score IA para filtrar.

## User Story Relacionada
US-034: Ordenar y Filtrar Lista de Candidatos por Score IA

## Criterios de Aceptación Técnicos (Verificables)
1.  En la UI de lista de candidatos (TK-087), se añaden controles para introducir `score_min` y `score_max`.
2.  Los controles permiten introducir valores numéricos (ej. 0-100).
3.  Existe un botón "Aplicar Filtro" o la lógica se dispara al cambiar los valores (con debounce).
4.  Al aplicar, se invoca la lógica frontend (TK-118).

## Solución Técnica Propuesta (Opcional)
Usar inputs numéricos o librerías de sliders.

## Dependencias Técnicas (Directas)
* TK-087 (Componente UI de la lista/tabla)
* TK-118 (Lógica Frontend que se invoca)

## Prioridad (Heredada/Ajustada)
Should Have (pero parte opcional de US-034)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Añadir controles UI, validación básica input]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, component, table, filter, score, input, slider

## Comentarios
Extensión opcional de la UI.

## Enlaces o Referencias
[Documentación librería UI]