# Ticket: TK-113

## Título
FE-UI: Hacer Clickable Cabecera Columna Score IA para Ordenar

## Descripción
Modificar el componente UI de la tabla/lista de candidatos (TK-087) para que la cabecera de la columna "Score IA" sea interactiva (ej. cambie el cursor, muestre iconos de ordenación) e invoque la lógica de ordenación (TK-114) al hacer clic.

## User Story Relacionada
US-034: Ordenar y Filtrar Lista de Candidatos por Score IA

## Criterios de Aceptación Técnicos (Verificables)
1.  La cabecera de la columna "Score IA" en la tabla (TK-087) tiene estilos CSS que indican interactividad (ej. `cursor: pointer`).
2.  Muestra un icono indicando el estado actual de ordenación para esa columna (sin ordenar, asc, desc).
3.  Al hacer clic en la cabecera, se dispara la función/evento proporcionado por TK-114.

## Solución Técnica Propuesta (Opcional)
Añadir un manejador `onClick` a la cabecera (`<th>`). Usar iconos de librerías UI (FontAwesome, etc.) para indicar ordenación.

## Dependencias Técnicas (Directas)
* TK-087 (Componente UI de la tabla/lista)
* TK-114 (Lógica Frontend que se invoca)

## Prioridad (Heredada/Ajustada)
Should Have (Heredada de US-034)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Modificación UI cabecera, añadir estilos/iconos, añadir onClick]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, component, table, header, sort, interaction, click

## Comentarios
Cambio visual y de interacción en la tabla.

## Enlaces o Referencias
[Documentación librería UI/iconos]