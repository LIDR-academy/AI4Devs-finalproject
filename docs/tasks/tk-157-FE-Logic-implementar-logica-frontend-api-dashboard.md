# Ticket: TK-157

## Título
FE-Logic: Implementar Lógica Frontend para API del Dashboard

## Descripción
Desarrollar la lógica en el frontend (servicio/store) para llamar al endpoint de la API del backend (`GET /api/v1/dashboard/summary`, TK-153), manejar la respuesta (objeto con las métricas), el estado de carga y los errores, y proporcionar los datos a la página del dashboard (TK-155).

## User Story Relacionada
US-043: Visualizar Dashboard con Métricas Básicas

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una función para llamar a `GET /api/v1/dashboard/summary`.
2.  La llamada incluye el token de autenticación.
3.  Se maneja el estado de carga.
4.  Si la respuesta es 200 OK, se extrae el objeto con las métricas (`published_vacancies_count`, `recent_applications_count`, `applications_by_stage`).
5.  Estos datos se almacenan en el estado local o store para que TK-155/TK-156 los consuman.
6.  Si la llamada API falla, se maneja el error.

## Solución Técnica Propuesta (Opcional)
Añadir función al servicio API existente o a un nuevo servicio de Dashboard.

## Dependencias Técnicas (Directas)
* TK-153 (Endpoint Backend API)
* TK-155 (Página/Componente que invoca esta lógica)
* Mecanismo de autenticación frontend.

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-043)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Implementación llamada API GET, manejo estado simple, parseo respuesta]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, dashboard, metrics

## Comentarios
Lógica API estándar para obtener los datos del dashboard.

## Enlaces o Referencias
[TK-001 - Especificación API]