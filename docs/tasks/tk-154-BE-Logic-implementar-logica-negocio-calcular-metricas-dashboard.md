# Ticket: TK-154

## Título
BE-Logic: Implementar Lógica de Negocio para Calcular Métricas del Dashboard

## Descripción
Desarrollar la lógica en la capa de servicio/negocio del backend ATS para calcular las métricas requeridas por el dashboard básico: contar vacantes publicadas, contar candidaturas en los últimos 7 días, y contar candidaturas agrupadas por etapa actual.

## User Story Relacionada
US-043: Visualizar Dashboard con Métricas Básicas

## Criterios de Aceptación Técnicos (Verificables)
1.  La función/método de servicio calcula:
    * `published_vacancies_count`: `COUNT(*)` de `Vacante` WHERE `estado = 'PUBLICADA'`.
    * `recent_applications_count`: `COUNT(*)` de `Candidatura` WHERE `fecha_aplicacion >= NOW() - INTERVAL '7 days'`.
    * `applications_by_stage`: Realiza un `GROUP BY Candidatura.etapa_pipeline_actual_id`, cuenta (`COUNT(*)`) los registros en cada grupo, y hace join con `EtapaPipeline` para obtener el `nombre` de la etapa.
2.  La función devuelve un objeto estructurado con estas métricas calculadas para la API (TK-153).
3.  Las consultas están razonablemente optimizadas (especialmente la de agrupación por etapa).
4.  Maneja errores de BBDD.

## Solución Técnica Propuesta (Opcional)
Implementar en capa de Servicios. Usar ORM/SQL para las consultas de agregación (`COUNT`, `GROUP BY`, filtrado por fecha).

## Dependencias Técnicas (Directas)
* Esquemas BBDD: `Vacante`, `Candidatura`, `EtapaPipeline`.
* TK-153 (API que invoca esta lógica)

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-043)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Implementación lógica servicio, 3 consultas BBDD de agregación/filtrado]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, dashboard, metrics, query, database, aggregate, count, group-by

## Comentarios
La consulta de agrupación por etapa puede ser la más costosa; evaluar índices.

## Enlaces o Referencias
[Documentación ORM/SQL sobre agregaciones]