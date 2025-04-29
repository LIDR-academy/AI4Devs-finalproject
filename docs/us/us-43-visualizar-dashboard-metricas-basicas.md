# User Story: US-043

## Feature Asociada
Feature 8: Mejoras Adicionales de Usabilidad y Funcionalidad

## Título
Visualizar Dashboard con Métricas Básicas

## Narrativa
Como Reclutador/Manager/Admin
Quiero poder ver un dashboard simple con algunos indicadores clave del estado del reclutamiento
Para tener una visión general rápida de la actividad.

## Detalles
Muestra un resumen visual de datos agregados.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que he iniciado sesión, puedo acceder a una sección/página de "Dashboard".
2.  El dashboard muestra al menos los siguientes widgets/indicadores:
    * Número total de vacantes en estado "Publicada".
    * Número total de candidaturas recibidas en los últimos 7 días.
    * Distribución de candidaturas activas por etapa principal del pipeline (ej. gráfico de barras simple).
3.  Los datos mostrados son razonablemente actuales (ej. actualizados diariamente o bajo demanda).
4.  La presentación es clara y fácil de entender.

## Requisito(s) Funcional(es) Asociado(s)
RF-34

## Prioridad: Could Have
* **Justificación:** Ofrece una visión general útil, pero las operaciones se pueden realizar sin él.

## Estimación Preliminar (SP): 3
* **Justificación:** Requiere lógica de backend para realizar consultas agregadas sobre los datos existentes y desarrollo de UI para presentar estas métricas de forma visual (widgets, gráficos simples). Complejidad baja-moderada.