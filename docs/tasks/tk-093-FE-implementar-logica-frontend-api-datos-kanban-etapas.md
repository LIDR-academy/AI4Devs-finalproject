# Ticket: TK-093

## Título
FE: Implementar Lógica Frontend para API Datos Kanban y Etapas

## Descripción
Desarrollar la lógica en el frontend para: 1) Llamar a la API para obtener la definición de las etapas del pipeline (TK-015, necesario para las columnas). 2) Llamar a la API específica para obtener los datos de candidaturas agrupadas para el Kanban (TK-090). Manejar el estado y proporcionar los datos a los componentes UI.

## User Story Relacionada
US-030: Visualizar Pipeline de Selección en Tablero Kanban

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una función para llamar a `GET /api/v1/pipeline/stages` (ya implementada en TK-015) para obtener la lista ordenada de etapas (columnas).
2.  Existe una función para llamar al nuevo endpoint `GET /api/v1/jobs/{jobId}/applications/kanban` (TK-090) para obtener los datos de las candidaturas agrupadas.
3.  Ambas llamadas incluyen el token de autenticación.
4.  Se manejan los estados de carga para ambas llamadas (podrían ser simultáneas o secuenciales).
5.  Si ambas llamadas son exitosas, los datos (lista de etapas, objeto de candidaturas agrupadas) se almacenan en el estado/store.
6.  Si alguna llamada falla, se maneja el error adecuadamente.
7.  Los datos preparados están disponibles para el componente Kanban (TK-092/TK-094).

## Solución Técnica Propuesta (Opcional)
Usar `Promise.all` si se quieren lanzar ambas llamadas en paralelo. Manejar el estado combinado para indicar cuándo todos los datos necesarios están listos.

## Dependencias Técnicas (Directas)
* TK-015 (Lógica API Etapas)
* TK-090 (Endpoint Backend API Kanban)
* TK-094 (Componente UI que consume estos datos)
* Mecanismo de autenticación frontend (TK-002).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-030)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Implementación nueva llamada API Kanban, coordinación con llamada API Etapas, manejo estado combinado]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, kanban, stage, application

## Comentarios
Coordina la obtención de todos los datos necesarios para pintar el Kanban.

## Enlaces o Referencias
[TK-001 - Especificación API]