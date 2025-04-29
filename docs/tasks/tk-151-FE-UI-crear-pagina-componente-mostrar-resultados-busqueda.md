# Ticket: TK-151

## Título
FE-UI: Crear Página/Componente para Mostrar Resultados de Búsqueda

## Descripción
Desarrollar una nueva página o componente UI en el frontend para mostrar la lista de resultados de búsqueda de candidaturas obtenidos de la API (TK-148). Debe mostrar información relevante de cada candidatura encontrada y soportar paginación.

## User Story Relacionada
US-042: Buscar Candidatos por Nombre o Palabra Clave

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una ruta/página (ej. `/buscar?q=termino`) que renderiza el componente de resultados.
2.  El componente recibe la lista paginada de resultados de búsqueda (de TK-152).
3.  Muestra una tabla o lista con las candidaturas encontradas.
4.  Cada item muestra: Nombre Candidato, Título Vacante, Etapa Actual (y quizás fecha aplicación).
5.  Cada item es un enlace que navega al detalle de la candidatura correspondiente.
6.  Se muestran controles de paginación si hay múltiples páginas de resultados.
7.  Muestra un mensaje claro si la búsqueda no arrojó resultados.
8.  Muestra el término de búsqueda actual (ej. "Resultados para: 'termino'").

## Solución Técnica Propuesta (Opcional)
Componente similar a la lista de candidaturas por vacante (TK-087) pero adaptado para resultados de búsqueda (diferentes columnas/datos). Reutilizar componentes de tabla/lista y paginación.

## Dependencias Técnicas (Directas)
* TK-152 (Lógica Frontend que obtiene los datos y muestra esta UI)
* Sistema de Routing del Frontend.
* Diseño de UI/Mockups para la página de resultados.

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-042)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Desarrollo componente UI, renderizado tabla/lista, integración paginación, manejo estado vacío]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, component, page, search, results, list, table

## Comentarios
Presenta los resultados al usuario.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]