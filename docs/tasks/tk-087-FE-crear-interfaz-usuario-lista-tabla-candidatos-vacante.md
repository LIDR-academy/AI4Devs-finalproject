# Ticket: TK-087

## Título
FE: Crear Interfaz de Usuario Lista/Tabla de Candidatos por Vacante

## Descripción
Desarrollar el componente UI en el frontend del ATS MVP que muestra la lista paginada de candidatos para una vacante seleccionada. Debe presentar la información clave (Nombre, Fecha Aplicación, Etapa Actual, Score IA, Etapa Sugerida IA) en formato de tabla o lista clara.

## User Story Relacionada
US-029: Visualizar Lista de Candidatos por Vacante

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un componente UI (ej. `CandidateListTable`) que recibe la lista de datos de candidaturas como props.
2.  Renderiza una tabla (o lista) con columnas/campos para: Nombre Candidato, Fecha Aplicación, Etapa Actual, Score IA (mostrando N/A o similar si es null), Etapa Sugerida IA (mostrando N/A o similar si es null).
3.  La tabla muestra los datos de la página actual.
4.  Incluye controles de paginación (ej. botones "Anterior"/"Siguiente", números de página) si el total de items supera el tamaño de página.
5.  Cada fila es interactiva (ej. clickeable) para disparar la navegación al detalle (TK-089).
6.  Muestra un estado de carga mientras los datos se obtienen (controlado por TK-088).
7.  Muestra un mensaje apropiado si no hay candidatos para esa vacante.

## Solución Técnica Propuesta (Opcional)
Usar componentes de tabla/lista y paginación del framework UI o librería de componentes.

## Dependencias Técnicas (Directas)
* TK-088 (Lógica Frontend que proporciona los datos y estado de carga/paginación)
* TK-089 (Lógica de Navegación al hacer clic)
* Diseño de UI/Mockups.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-029)

## Estimación Técnica Preliminar
[ 5 ] [horas] - [Desarrollo componente tabla/lista, integración paginación, formateo datos (fechas, scores), manejo estados (carga, vacío)]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, component, table, list, candidate, application, vacancy, job, pagination

## Comentarios
La claridad y usabilidad de esta tabla son importantes para el reclutador.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI, Documentación componentes UI]