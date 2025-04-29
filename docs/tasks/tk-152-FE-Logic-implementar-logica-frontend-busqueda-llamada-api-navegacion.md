# Ticket: TK-152

## Título
FE-Logic: Implementar Lógica Frontend para Búsqueda (Llamada API y Navegación)

## Descripción
Desarrollar la lógica en el frontend que se activa al realizar una búsqueda desde el campo global (TK-150). Debe tomar el término de búsqueda, navegar a la página de resultados (TK-151), llamar a la API de búsqueda del backend (TK-148) con el término y parámetros de paginación, y manejar el estado (carga, resultados, errores) para la UI de resultados.

## User Story Relacionada
US-042: Buscar Candidatos por Nombre o Palabra Clave

## Criterios de Aceptación Técnicos (Verificables)
1.  Se implementa una función (ej. `handleSearchSubmit(query)`) que es llamada por TK-150.
2.  La función navega a la ruta de resultados de búsqueda (ej. `/buscar?q=query`).
3.  El componente de la página de resultados (TK-151), al cargar, extrae el `query` de la URL.
4.  Realiza una llamada `GET` a `/api/v1/search/applications?q={query}` (TK-148), incluyendo parámetros de paginación.
5.  La llamada incluye token de autenticación.
6.  Maneja el estado de carga.
7.  Si la respuesta es 200 OK, almacena los resultados y metadatos de paginación en el estado para que TK-151 los renderice.
8.  Permite cambiar de página, realizando nuevas llamadas API con los parámetros de paginación actualizados (manteniendo el `q`).
9.  Maneja errores de la API, actualizando el estado de error.

## Solución Técnica Propuesta (Opcional)
Usar el sistema de routing para pasar el término de búsqueda. La página de resultados se encarga de obtener los datos al cargar (basado en el query param). Usar servicio/store para la llamada API.

## Dependencias Técnicas (Directas)
* TK-150 (UI que inicia la búsqueda)
* TK-151 (UI que muestra los resultados)
* TK-148 (Endpoint Backend API)
* Sistema de Routing del Frontend.
* Mecanismo de autenticación frontend.

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-042)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Lógica de navegación post-búsqueda, llamada API, manejo estado resultados/paginación/errores]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, search, routing, navigation

## Comentarios
Orquesta la funcionalidad de búsqueda desde la interacción del usuario hasta la muestra de resultados.

## Enlaces o Referencias
[TK-001 - Especificación API], [Documentación Router]