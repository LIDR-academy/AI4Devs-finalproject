# Ticket: TK-156

## Título
FE-UI: Implementar Widgets de Métricas (Números y Gráfico Básico)

## Descripción
Desarrollar los componentes UI reutilizables o específicos para mostrar las métricas del dashboard: 1) Widgets para mostrar números simples (ej. nº vacantes publicadas, nº candidaturas recientes). 2) Un widget que muestre un gráfico de barras básico para la distribución de candidaturas por etapa.

## User Story Relacionada
US-043: Visualizar Dashboard con Métricas Básicas

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un componente (ej. `MetricCard`) que recibe un título y un valor numérico y lo muestra de forma clara.
2.  Existe un componente (ej. `StageDistributionChart`) que recibe los datos de `applications_by_stage` (array de {stage_name, count}) y renderiza un gráfico de barras simple mostrando la distribución.
3.  Los componentes reciben los datos como props desde el contenedor del dashboard (TK-155).
4.  El gráfico de barras es legible y representa correctamente los datos.
5.  Los widgets tienen un diseño consistente.

## Solución Técnica Propuesta (Opcional)
Para el gráfico de barras, integrar una librería de gráficos simple para el framework frontend (ej. Chart.js, Recharts, Nivo).

## Dependencias Técnicas (Directas)
* TK-155 (Componente Dashboard que usa estos widgets)
* TK-157 (Lógica que proporciona los datos)
* (Opcional) Librería de gráficos.

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-043)

## Estimación Técnica Preliminar
[ 5 ] [horas] - [Desarrollo widget numérico, investigación/integración librería gráficos, desarrollo componente gráfico]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, component, widget, dashboard, chart, metric, visualization

## Comentarios
La complejidad principal está en la integración y configuración de la librería de gráficos.

## Enlaces o Referencias
[Documentación librería de gráficos elegida]