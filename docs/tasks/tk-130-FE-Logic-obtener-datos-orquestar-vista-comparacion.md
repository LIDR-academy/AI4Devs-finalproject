# Ticket: TK-130

## Título
FE-Logic: Obtener Datos y Orquestar Vista Comparación

## Descripción
Implementar la lógica en el frontend que se activa al hacer clic en el botón "Comparar Seleccionados" (TK-127). Debe: 1) Obtener la lista de IDs de candidatos seleccionados (desde TK-128). 2) Obtener los datos detallados necesarios (Nombre, Score, Resumen) para cada candidato seleccionado (puede requerir múltiples llamadas a la API de detalle o una API de batch si existe). 3) Pasar los datos recopilados al componente de vista de comparación (TK-129) para mostrarlo (ej. abriendo un modal).

## User Story Relacionada
US-036: Comparar Perfiles de Candidatos Lado a Lado

## Criterios de Aceptación Técnicos (Verificables)
1.  Se implementa una función (ej. `handleCompareCandidates`) que es llamada por el botón en TK-127.
2.  Obtiene la lista de `candidaturaId` seleccionados del estado (TK-128).
3.  Para cada `candidaturaId` seleccionado, realiza una llamada a la API de detalle (`GET /api/v1/applications/{applicationId}`) para obtener Nombre, Score IA y Resumen IA. *(Nota: Esto puede ser ineficiente; considerar si una API de batch sería necesaria para mejor performance, aunque fuera de scope MVP)*.
4.  Maneja el estado de carga mientras se obtienen los datos de todos los candidatos.
5.  Una vez obtenidos todos los datos, estructura la información en un array de objetos.
6.  Muestra el componente de vista de comparación (TK-129), pasándole el array de datos como prop.
7.  Maneja errores si alguna de las llamadas API falla.

## Solución Técnica Propuesta (Opcional)
Usar `Promise.all` para lanzar las llamadas de detalle en paralelo. Mostrar un indicador de carga global.

## Dependencias Técnicas (Directas)
* TK-127 (Botón UI que invoca esta lógica)
* TK-128 (Estado que proporciona los IDs seleccionados)
* TK-129 (Componente UI que se muestra)
* API de detalle de candidatura (para obtener Nombre, Score, Resumen).

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-036)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Lógica para múltiples llamadas API, manejo de promesas, estructuración datos, orquestación UI (modal)]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, compare, orchestration, state-management

## Comentarios
La obtención de datos para múltiples candidatos puede ser un cuello de botella de rendimiento si no se optimiza (pero se acepta para MVP 'Could Have').

## Enlaces o Referencias
[Documentación sobre Promise.all]