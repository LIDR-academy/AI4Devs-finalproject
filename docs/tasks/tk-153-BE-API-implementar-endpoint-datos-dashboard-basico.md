# Ticket: TK-153

## Título
BE-API: Implementar Endpoint API para Datos del Dashboard Básico

## Descripción
Crear y exponer un endpoint en el backend ATS (ej. `GET /api/v1/dashboard/summary`) que devuelva los datos agregados necesarios para el dashboard básico (nº vacantes publicadas, nº candidaturas recientes, distribución por etapa). Protegido por autenticación.

## User Story Relacionada
US-043: Visualizar Dashboard con Métricas Básicas

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un endpoint `GET /api/v1/dashboard/summary`.
2.  El endpoint está protegido por autenticación (TK-005).
3.  Invoca la lógica de negocio (TK-154) para calcular las métricas.
4.  Devuelve 200 OK con una estructura JSON que contiene las métricas calculadas, por ejemplo:
    ```json
    {
      "published_vacancies_count": 15,
      "recent_applications_count": 52, // (last 7 days)
      "applications_by_stage": [
        { "stage_name": "Nuevo", "count": 150 },
        { "stage_name": "Revisión", "count": 80 },
        // ...
      ]
    }
    ```
5.  Maneja errores de la lógica de negocio (500).

## Solución Técnica Propuesta (Opcional)
Endpoint GET simple que devuelve un objeto JSON con todos los datos agregados.

## Dependencias Técnicas (Directas)
* TK-001 (Definición API)
* TK-005 (Middleware Autenticación)
* TK-154 (Lógica de Negocio Dashboard)

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-043)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Creación ruta/controlador, integración middleware, llamada a servicio]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, dashboard, summary, metrics

## Comentarios
Define la interfaz para obtener los datos del dashboard.

## Enlaces o Referencias
[TK-001 - Especificación API]